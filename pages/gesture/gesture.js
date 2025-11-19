
document.addEventListener('DOMContentLoaded', function(){
  // DOM elements
  const videoElement = document.getElementById('camera');
  const canvasElement = document.getElementById('output');
  const detectedSignElement = document.getElementById('detected-sign');
  const startBtn = document.getElementById('start-camera-btn');

  function showError(msg){
    console.error(msg);
    if(detectedSignElement) detectedSignElement.textContent = msg;
    else {
      const el = document.createElement('div');
      el.style.color = 'orangered';
      el.textContent = msg;
      document.body.insertBefore(el, document.body.firstChild);
    }
  }

  if(!videoElement || !canvasElement || !detectedSignElement || !startBtn){
    showError('Camera page missing required DOM elements. Check gesture.html for correct IDs.');
    return;
  }

  const canvasCtx = canvasElement.getContext('2d');
  canvasElement.width = 640;
  canvasElement.height = 480;

  // default fallback labels (used if labels.json not found)
  let signLabels = ["Hello", "I Love You", "No", "Sorry", "Thank You", "Understood", "We Are", "Yes"];
  let model;
  let lastDetected = "";
  let lastSpokenAt = 0; // timestamp to throttle speech
  let useHeuristic = true; // fallback when no TFJS model available (enabled by default for demo)
  let _previewHidden = false; // hide raw video after first results to avoid duplicate previews

  // disable start button until model is loaded
  try{ startBtn.disabled = true; startBtn.setAttribute('aria-disabled','true'); }catch(e){}
  startBtn.textContent = 'Loading model...';

  // Configuration: set to true to use server-side predictions (requires server + API key)
  const REMOTE_PREDICT = false; // change to true to enable server-side predictions
  const REMOTE_PREDICT_URL = 'http://localhost:3000/predict';
  const REMOTE_API_KEY = ''; // set your API key here or fetch from secure source

  // Load TensorFlow.js model (only when using client-side predictions)
  async function loadModel() {
    if (REMOTE_PREDICT) {
      // no client model needed
  startBtn.style.pointerEvents = '';
  startBtn.removeAttribute('aria-disabled');
  startBtn.textContent = 'Open';
      return;
    }

      // prefer the repository root model location
      const candidates = [
        '../../model/model.json', // repository root model
        '../model/model.json',
        './model/model.json',
        '/model/model.json'
      ];

    let lastErr = null;
    for(const p of candidates){
      try{
  model = await tf.loadLayersModel(p);
  console.log('✅ Model loaded from', p);
        // try to load labels.json from same directory as model.json
        try{
          const base = p.replace(/\/model.json$/, '').replace(/\/model.json$/, '').replace(/model.json$/, '');
          const labelsUrl = base + 'labels.json';
          const resp = await fetch(labelsUrl);
          if(resp.ok){
            const data = await resp.json();
            if(Array.isArray(data) && data.length>0){
              signLabels = data;
              console.log('✅ Loaded labels.json from', labelsUrl, 'labels=', signLabels);
            }
          }
        }catch(e){ /* ignore label load errors */ }
  startBtn.disabled = false;
  startBtn.removeAttribute('aria-disabled');
  startBtn.textContent = 'Open';
        return;
      }catch(err){
        lastErr = err;
        console.warn('Model load failed from', p, err && err.message);
        // try next
      }
  }
    console.error('All model load attempts failed', lastErr);
    // Try to load labels.json so the demo uses the real class names
    try{
      const labelCandidates = ['./model/labels.json','../model/labels.json','../../model/labels.json'];
      for(const u of labelCandidates){
        try{
          const r = await fetch(u);
          if(r.ok){
            const data = await r.json();
            if(Array.isArray(data) && data.length>0){ signLabels = data; console.log('Loaded labels.json from', u); break; }
          }
        }catch(e){/*ignore*/}
      }
    }catch(e){/* ignore */}

    // Create a tiny mock TFJS-compatible model so the client code path remains the same.
    // The mock model uses the image brightness mean to pick a class deterministically — demo only.
    model = {
      predict: function(tensor){
        // tensor shape expected: [1, H, W, 3]
        try{
          const mean = tf.tidy(()=>tensor.mean().dataSync()[0]);
          const idx = Math.floor(mean * signLabels.length) % signLabels.length;
          const arr = new Array(signLabels.length).fill(0);
          arr[idx] = 1;
          return tf.tensor([arr]);
        }catch(e){
          // fallback to first class
          const arr = new Array(signLabels.length).fill(0);
          arr[0] = 1;
          return tf.tensor([arr]);
        }
      }
    };
    console.warn('No TFJS model found — using demo mock model (brightness-based)');
    startBtn.disabled = false;
    startBtn.removeAttribute('aria-disabled');
    startBtn.textContent = 'Open (demo)';
  }
  // language mapping for labels
  const translations = {
    'en-US': {
      "Hello": "Hello",
      "I Love You": "I Love You",
      "No": "No",
      "Sorry": "Sorry",
      "Thank You": "Thank You",
      "Understood": "Understood",
      "We Are": "We Are",
      "Yes": "Yes"
    },
    'si-LK': {
      "Hello": "හෙලෝ",
      "I Love You": "මම ඔබට ආදරෙයි",
      "No": "නැහැ",
      "Sorry": "මට සමාවෙන්න",
      "Thank You": "බොහෝම ස්තුති",
      "Understood": "බැහැ",
      "We Are": "අපි",
      "Yes": "ඔව්"
    },
    'ta-IN': {
      "Hello": "வணக்கம்",
      "I Love You": "நான் உன்னை நேசிக்கிறேன்",
      "No": "இல்லை",
      "Sorry": "மன்னிக்கவும்",
      "Thank You": "நன்றி",
      "Understood": "புரிந்து கொண்டேன்",
      "We Are": "நாம்",
      "Yes": "ஆம்"
    }
  };

  // helper: speak with preferred language voice if available
  function speakWithLang(text, lang){
    if(!text) return;
    // try to pick a voice that matches requested language
    const synth = window.speechSynthesis;
    if(!synth){
      console.warn('Speech synthesis not available in this browser');
      return;
    }
    
    // Cancel any ongoing speech to avoid queue buildup
    if(synth.speaking) synth.cancel();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang || 'en-US';
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    
    // Add event listeners for debugging
    utter.onstart = function(){ console.log('🔊 Speaking:', text, 'in', lang); };
    utter.onerror = function(e){ console.error('Speech error:', e); };
    
    // Voice selection - wait for voices to load if needed
    function selectVoiceAndSpeak(){
      try{
        const voices = synth.getVoices() || [];
        if(voices.length === 0){
          console.warn('No voices loaded yet, using default');
        } else {
          const match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith((lang||'en').split('-')[0]));
          if(match) {
            utter.voice = match;
            console.log('Using voice:', match.name, match.lang);
          } else {
            console.log('No matching voice for', lang, '- using default');
          }
        }
      }catch(e){ console.warn('Voice selection error:', e); }
      
      // Speak with a small delay to ensure browser is ready
      setTimeout(() => synth.speak(utter), 50);
    }
    
    // Chrome/Edge sometimes need voices to load asynchronously
    if(synth.getVoices().length === 0){
      synth.onvoiceschanged = function(){
        synth.onvoiceschanged = null; // run once
        selectVoiceAndSpeak();
      };
    } else {
      selectVoiceAndSpeak();
    }
  }

  // --- language wiring: sync with shared ChirovoxLang and respond to global changes ---
  (function(){
    try{
      const sel = document.getElementById('lang-select');
      if(!sel) return;
      // map storage short codes to speech lang tags when necessary
      const storageToSpeech = { en: 'en-US', si: 'si-LK', ta: 'ta-IN' };
      // initialize from shared API when available
      if(window.ChirovoxLang){
        const cur = window.ChirovoxLang.getLang() || 'en';
        sel.value = storageToSpeech[cur] || cur;
      }
      // on direct change, update shared store (convert to short code)
      sel.addEventListener('change', (e)=>{
        const v = e.target.value;
        // try to store a short code: en/si/ta
        const short = v.split('-')[0];
        window.ChirovoxLang && window.ChirovoxLang.setLang(short);
      });
      // listen for global changes and update selector
      window.addEventListener('chirovox:langchange', (ev)=>{
        try{ const s = ev.detail.lang; sel.value = storageToSpeech[s] || s; }catch(e){}
      });
    }catch(e){/* ignore */}
  })();

    // Multilingual speech
    function speak(text, lang = "en-US") {
      const synth = window.speechSynthesis;
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.lang = lang;
      synth.speak(utterThis);
    }

    // Initialize MediaPipe Hands
    let hands;
      let mpCamera = null; // MediaPipe Camera helper instance
      let _fallbackStream = null; // for getUserMedia fallback
    try{
      if(typeof Hands === 'undefined') throw new Error('MediaPipe Hands not found');
      hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
    }catch(err){
      showError('MediaPipe Hands failed to initialize: ' + (err && err.message));
      console.error(err);
      return;
    }
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults(async (results) => {
      // hide the raw <video> element once we have the first processed frame
      if(!_previewHidden){
        try{ videoElement.style.display = 'none'; videoElement.classList.add('hidden'); }catch(e){}
        _previewHidden = true;
      }
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      // don't attempt prediction until model is ready
      if (!model) {
        detectedSignElement.textContent = 'Loading model...';
        canvasCtx.restore();
        return;
      }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
          drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });
        }

        // prediction: either remote API or client-side model
        let predictedSign = null;
        try {
            // If no model is available, use a crude heuristic based on finger count
            if (useHeuristic) {
              const landmarks = results.multiHandLandmarks[0];
              const count = countExtendedFingers(landmarks);
              const map = {
                0: 'No',        // fist
                1: 'Yes',       // one finger
                2: 'I Love You',
                3: 'Hello',
                4: 'We Are',
                5: 'Hello'
              };
              predictedSign = map[count] || 'Hello';
            } else {
          if (REMOTE_PREDICT) {
            // capture the canvas to a small JPEG dataURL and send
            const tinyCanvas = document.createElement('canvas');
            tinyCanvas.width = 64;
            tinyCanvas.height = 64;
            const tctx = tinyCanvas.getContext('2d');
            tctx.drawImage(results.image, 0, 0, 64, 64);
            const dataUrl = tinyCanvas.toDataURL('image/jpeg', 0.7);

            const resp = await fetch(REMOTE_PREDICT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': REMOTE_API_KEY
              },
              body: JSON.stringify({ image: dataUrl })
            });
            if (resp.ok) {
              const body = await resp.json();
              predictedSign = body.label;
            } else {
              console.error('Remote predict failed', resp.statusText);
            }
          } else {
            // do prediction inside tidy to avoid memory leaks
            const predictedIndex = tf.tidy(() => {
              const t = tf.browser.fromPixels(results.image)
                .resizeNearestNeighbor([64, 64])
                .toFloat()
                .expandDims(0)
                .div(255.0);
              const p = model.predict(t);
              const idx = p.argMax(-1);
              const val = idx.dataSync()[0];
              return val;
            });
            if (predictedIndex !== null && predictedIndex >= 0 && predictedIndex < signLabels.length) {
              predictedSign = signLabels[predictedIndex];
            }
          }
            }
        } catch (err) {
          console.error('Prediction error:', err);
        }

        if (predictedSign) {
          detectedSignElement.textContent = predictedSign;
          const selLang = document.getElementById('lang-select')?.value || 'en-US';
          const translated = (translations[selLang] && translations[selLang][predictedSign]) || predictedSign;
          const now = Date.now();
          if (predictedSign !== lastDetected && now - lastSpokenAt > 800) {
            lastDetected = predictedSign;
            lastSpokenAt = now;
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
            }
            speakWithLang(translated, selLang);
          }
        }

      } else {
        detectedSignElement.textContent = "None";
      }

      canvasCtx.restore();
    });

    // shared start function used by both buttons
    async function startCamera(){
      // hide the main button once pressed
      try{ startBtn.style.display = 'none'; }catch(e){}
      // show the canvas where we draw the results
      try{ canvasElement.classList.remove('hidden'); canvasElement.style.display = 'block'; }catch(e){}
      // show the detected-sign paragraph by removing the 'hidden' class (CSS uses !important)
      try{ if(detectedSignElement && detectedSignElement.parentElement) detectedSignElement.parentElement.classList.remove('hidden'); }catch(e){}
      // show the video preview so the browser permission prompt is visible
      try{ videoElement.classList.remove('hidden'); videoElement.style.display = 'block'; }catch(e){}

      // Check secure context: getUserMedia requires HTTPS or localhost in most browsers
      try{
        const host = (location.hostname || '');
        const isLocalhost = (host === 'localhost' || host === '127.0.0.1');
        // Private IPv4 ranges: 10.*, 192.168.*, 172.16-31.* and loopback 127.*
        const isPrivateIP = /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^127\./.test(host);
        if(location.protocol !== 'https:' && !isLocalhost && !isPrivateIP){
          const msg = 'Camera access requires a secure context (https) or localhost/private LAN. For development, serve from localhost or a LAN IP; for production use HTTPS.';
          console.warn(msg);
          showError(msg);
          return;
        } else {
          if(location.protocol !== 'https:') console.log('Non-HTTPS allowed for development host:', host);
        }
      }catch(e){ /* ignore */ }

      try{
        // Polyfill: support older prefixed getUserMedia implementations on some mobile browsers
        try{
          if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;
            if(getUserMedia){
              navigator.mediaDevices = navigator.mediaDevices || {};
              navigator.mediaDevices.getUserMedia = function(constraints){
                return new Promise(function(resolve, reject){
                  getUserMedia.call(navigator, constraints, resolve, reject);
                });
              };
              console.log('Applied legacy getUserMedia shim');
            }
          }
        }catch(e){ /* ignore shim failures */ }

        if(typeof Camera !== 'undefined'){
          // Prefer MediaPipe Camera helper when available
          mpCamera = new Camera(videoElement, {
            onFrame: async () => {
              try { await hands.send({ image: videoElement }); }catch(err){ console.error('Error sending frame to hands:', err); }
            },
            width: 640,
            height: 480
          });
          // start can return a promise that rejects if camera permission denied
          await mpCamera.start().catch(err => { throw err; });
        } else {
          // Fallback: use getUserMedia and a RAF loop to feed frames to MediaPipe
          if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            const msg = 'Camera is not available in this browser. Please use a modern browser (Chrome, Edge) and make sure camera permission is allowed.';
            throw new Error(msg);
          }
          let stream;
          try{ stream = await navigator.mediaDevices.getUserMedia({ video: { width:640, height:480 } }); }catch(gerr){ throw new Error('getUserMedia permission denied or not available: ' + (gerr && gerr.message)); }
          _fallbackStream = stream;
          videoElement.srcObject = stream;
          await videoElement.play();

          let stopped = false;
          const frameLoop = async () => {
            if(stopped) return;
            try{ await hands.send({ image: videoElement }); }catch(err){ console.error('hands.send error (fallback):', err); }
            requestAnimationFrame(frameLoop);
          };
          frameLoop();
          // store a stop function on the video element for future cleanup
          videoElement._stopStream = () => { stopped = true; stream.getTracks().forEach(t=>t.stop()); };
        }
      }catch(err){
        console.error('Failed to start camera:', err);
        showError('Failed to start camera — check permissions and allow camera access. ' + (err && err.message));
      }
    }

    // attach to existing button (enabled by model load or watchdog)
    startBtn.addEventListener('click', startCamera);
    // the force button always attempts to start camera immediately for testing
    const forceBtn = document.getElementById('force-camera-btn');
    // force button removed from UI; demo fallback is enabled automatically by watchdog

    // Stop camera helper / stream
    const stopBtn = document.getElementById('stop-camera-btn');
    async function stopCamera(){
      try{
        if(mpCamera && typeof mpCamera.stop === 'function'){
          mpCamera.stop();
          mpCamera = null;
        }
        if(_fallbackStream){
          _fallbackStream.getTracks().forEach(t=>t.stop());
          _fallbackStream = null;
        }
        // reset UI
        try{ startBtn.style.display = ''; startBtn.disabled = false; startBtn.textContent = 'Open Camera'; }catch(e){}
        try{ if(stopBtn) stopBtn.style.display = 'none'; }catch(e){}
        try{ if(forceBtn) forceBtn.style.display = ''; }catch(e){}
        // show video element hidden state removed so user sees it's stopped
        try{ videoElement.classList.remove('hidden'); videoElement.style.display = 'none'; }catch(e){}
      }catch(e){ console.error('Error stopping camera', e); }
    }
    if(stopBtn){ stopBtn.addEventListener('click', stopCamera); }

    loadModel();

    // Diagnostic overlay for troubleshooting camera availability (mobile help)
    (function createDiagnostics(){
      try{
        const diag = document.createElement('div');
        diag.id = 'camera-diagnostics';
        diag.style.position = 'fixed';
        diag.style.left = '12px';
        diag.style.bottom = '12px';
        diag.style.zIndex = 2000;
        diag.style.background = 'rgba(0,0,0,0.6)';
        diag.style.color = '#fff';
        diag.style.padding = '10px 12px';
        diag.style.borderRadius = '10px';
        diag.style.fontSize = '12px';
        diag.style.maxWidth = '320px';
        diag.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';

        const title = document.createElement('div');
        title.textContent = 'Camera diagnostics';
        title.style.fontWeight = '700';
        title.style.marginBottom = '6px';
        diag.appendChild(title);

        const info = document.createElement('div');
        info.id = 'camera-diag-info';
        info.style.lineHeight = '1.2';
        info.innerHTML = [
          'mediaDevices: ' + (!!window.navigator.mediaDevices),
          'getUserMedia: ' + (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)),
          'legacy API: ' + (!!(navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia))
        ].join('<br>');
        diag.appendChild(info);

        // Run camera test button removed to simplify UI; diagnostics remain read-only

        const close = document.createElement('button');
        close.textContent = '×';
        close.title = 'Close';
        close.style.position = 'absolute';
        close.style.top = '6px';
        close.style.right = '8px';
        close.style.background = 'transparent';
        close.style.border = 'none';
        close.style.color = '#fff';
        close.style.fontSize = '16px';
        close.style.cursor = 'pointer';
        close.addEventListener('click', ()=>diag.remove());
        diag.appendChild(close);

        document.body.appendChild(diag);
      }catch(e){/* ignore */}
    })();

    // Watchdog: if model hasn't loaded in X ms, enable demo fallback so user can open camera
    (function(){
  const WATCH_MS = 1500; // wait 1.5s for model load then fallback
      setTimeout(()=>{
        try{
          if(!model && !useHeuristic){
            console.warn('Model load timeout — enabling demo fallback');
            useHeuristic = true;
            if(startBtn){
              startBtn.disabled = false;
              startBtn.removeAttribute('aria-disabled');
              startBtn.textContent = 'Open (demo)';
            }
          }
        }catch(e){/* ignore */}
      }, WATCH_MS);
    })();

  // Heuristic: count extended fingers from landmarks (simple demo)
  function countExtendedFingers(landmarks){
    if(!landmarks || landmarks.length<21) return 0;
    // fingertips indices: thumb(4), index(8), middle(12), ring(16), pinky(20)
    const tips = [4,8,12,16,20];
    let count = 0;
    try{
      // wrist (0) y coordinate used as simple baseline
      const wristY = landmarks[0].y;
      for(const i of tips){
        const tip = landmarks[i];
        const pip = landmarks[i-2]; // approximate lower joint
        // if fingertip is above pip in image coordinates, consider it extended
        if(tip && pip && tip.y < pip.y) count++;
      }
    }catch(e){/* ignore */}
    return count;
  }

});


