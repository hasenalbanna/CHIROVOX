(function(){
  const container = document.getElementById('buttons');
  const languageSelect = document.getElementById('language');
  const genderSelect = document.getElementById('gender');
  const useServerTTSCheckbox = document.getElementById('useServerTTS');

  const SERVER_TTS_URL = 'http://localhost:3000/tts';
  const SERVER_API_KEY = ''; // set if using server TTS

  async function serverSpeak(text, lang, gender) {
    try {
      const resp = await fetch(SERVER_TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': SERVER_API_KEY },
        body: JSON.stringify({ text, lang, gender })
      });
      if (!resp.ok) throw new Error('Server TTS failed');
      const body = await resp.json();
      if (body.audio) {
        const audio = new Audio(body.audio);
        await audio.play();
      }
    } catch (err) {
      console.error('serverSpeak error:', err);
    }
  }

  function browserSpeak(text, lang, gender) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    // map language
    const langMap = { en: 'en-US', si: 'si-LK', ta: 'ta-IN' };
    utter.lang = langMap[lang] || 'en-US';
    // attempt to pick a voice matching gender
    const voices = synth.getVoices();
    if (voices && voices.length) {
      const targetBase = utter.lang.split('-')[0];
      const match = voices.find(v => v.lang && v.lang.startsWith(targetBase) && ((gender==='male' && /male|man/i.test(v.name)) || (gender==='female' && /female|woman/i.test(v.name))));
      if (match) utter.voice = match;
    }
    try{ synth.cancel(); }catch(e){}
    synth.speak(utter);
  }

  // Quick phrases (30 items)
  const quickPhrases = [
    {id:1, en: 'Yes', si: 'ඔව්', ta: 'ஆம்'},
    {id:2, en: 'No', si: 'නැහැ', ta: 'இல்லை'},
    {id:3, en: 'I understand', si: 'මට තේරෙනවා', ta: 'எனக்கு புரிந்தது'},
    {id:4, en: "I don't understand", si: 'මට තේරෙන්නේ නැහැ', ta: 'எனக்கு புரியவில்லை'},
    {id:5, en: 'Please', si: 'කරුණාකර', ta: 'தயவு செய்து'},
    {id:6, en: 'Thank you', si: 'ස්තුතියි', ta: 'நன்றி'},
    {id:7, en: 'Sorry', si: 'කණගාටුයි', ta: 'மன்னிக்கவும்'},
    {id:8, en: 'Excuse me', si: 'මට සමාවෙන්න', ta: 'மன்னிக்கவும்'},
    {id:9, en: 'I want a pen', si: 'මට පැනයක් ඕනේ', ta: 'எனக்கு பேனா வேண்டும்'},
    {id:10, en: 'I want a book', si: 'මට පොතක් ඕනේ', ta: 'எனக்கு ஒரு புத்தகம் வேண்டும்'},
    {id:11, en: 'Can I go to the toilet?', si: 'මට වැසිකිළියට යන්න පුළුවන්තික?', ta: 'நான் கழிப்பறைக்கு போயாள்லாமா?'},
    {id:12, en: 'I need help', si: 'මට උදව් අවශ්‍යයි', ta: 'எனக்கு உதவி வேண்டும்'},
    {id:13, en: 'I am fine', si: 'මම හොඳින් තියනවා', ta: 'நான் நலமாக இருக்கிறேன்'},
    {id:14, en: 'Please repeat', si: 'කරුණාකර නැවත කියන්න', ta: 'தயவு செய்து மீண்டும் கூறுங்கள்'},
    {id:15, en: 'Slow down please', si: 'සැහැල්ලුවෙන් කතා කරන්න', ta: 'மெல்ல பேசுங்கள்'},
    {id:16, en: 'Open the book', si: 'පොත විවෘත කරන්න', ta: 'புத்தகத்தை திறக்கவும்'},
    {id:17, en: 'Close the book', si: 'පොත වසන්න', ta: 'புத்தகத்தை மூடுங்கள்'},
    {id:18, en: 'Yes I understood', si: 'ඔව් මට තේරුණා', ta: 'ஆம், எனக்கு புரிந்தது'},
    {id:19, en: 'No I didn\'t understand', si: 'නැහැ, මට තේරෙන්නෙ නැහැ', ta: 'இல்லை, எனக்கு புரியவில்லை'},
    {id:20, en: 'I want to answer', si: 'මට පිළිතුර දෙන්න ඕනේ', ta: 'நான் பதில் சொல்ல விரும்புகிறேன்'},
    {id:21, en: 'I want to ask', si: 'මට ප්‍රශ්නයක් තියනවා', ta: 'என்னை ஒரு கேள்வி கேட்க விரும்புகிறேன்'},
    {id:22, en: 'Please help me', si: 'කරුණාකර මට උදව් කරන්න', ta: 'தயவு செய்து எனக்கு உதவி செய்யுங்கள்'},
    {id:23, en: 'I lost my pen', si: 'මගේ පැනය හොයාගන්නේ නෑ', ta: 'என் பேனா கிடைக்கவில்லை'},
    {id:24, en: 'Turn off the light', si: 'ලයිට් නිවා දමන්න', ta: 'விளக்கை அணைக்கவும்'},
    {id:25, en: 'Turn on the light', si: 'ලයිට් දැල්ල කරන්න', ta: 'விளக்கை ஏற்றவும்'},
    {id:26, en: 'Wait a moment', si: 'තත්පරයක් ඉන්න', ta: 'ஒரு நிமிடம் காத்திருக்கவும்'},
    {id:27, en: 'Sit down please', si: 'කරුණාකර නිවසේ ඉඳගෙනිහ', ta: 'தயவு செய்து உட்காருங்கள்'},
    {id:28, en: 'Stand up please', si: 'කරුණාකර ඉදිකරන්න', ta: 'தயவு செய்து நின்று நிற்பவாறு'},
    {id:29, en: 'Listen please', si: 'කරුණාකර මට අසාගන්න', ta: 'தயவு செய்து கேளுங்கள்'},
    {id:30, en: 'Repeat after me', si: 'මට පසුපස නැවත කියන්න', ta: 'என்னைப் பின்பற்றி மீண்டும் கூறுங்கள்'}
  ];

  // Render quick phrase buttons into the container
  function renderQuickPhrases(){
    if(!container) return;
    // keep existing static buttons, append new ones
    quickPhrases.forEach((p, idx)=>{
      // avoid duplicating if already rendered
      if(container.querySelector(`button[data-id=qp-${p.id}]`)) return;
      const btn = document.createElement('button');
      btn.className = 'sign-btn sign-btn--primary';
      btn.type = 'button';
      btn.setAttribute('data-id', `qp-${p.id}`);
      btn.innerHTML = `<span class="sign-icon">💬</span><span class="sign-label">${p.en}</span>`;
      container.appendChild(btn);
    });
  }

  // Localization map for the existing static words
  const localMap = {
    School: { en: 'School', si: 'පාසල', ta: 'பள்ளி' },
    Teacher: { en: 'Teacher', si: 'ගුරුවරයා', ta: 'ஆசிரியர்' },
    Student: { en: 'Student', si: 'ශිෂ්‍යයා', ta: 'மாணவர்' },
    Class: { en: 'Class', si: 'පංතිය', ta: 'வகுப்பு' },
    Book: { en: 'Book', si: 'පොත', ta: 'புத்தகம்' },
    Pencil: { en: 'Pencil', si: 'පැන්සල්', ta: 'பென்சில்' },
    Exam: { en: 'Exam', si: 'විභාගය', ta: 'தேர்வு' },
    Homework: { en: 'Homework', si: 'ගෙදර වැඩ', ta: 'வீட்டு வேலை' },
    Library: { en: 'Library', si: 'පුස්තකාලය', ta: 'நூலகம்' },
    Playground: { en: 'Playground', si: 'ඉදිරිංගන', ta: 'விளையாடும் மைதானம்' },
    Cafeteria: { en: 'Cafeteria', si: 'කෑමගෙය', ta: 'காபீடை' },
    Principal: { en: 'Principal', si: 'ප්‍රධානි', ta: 'பிரதமர்' },
    Nurse: { en: 'Nurse', si: 'මහ පොදු වෛද්‍ය', ta: 'நர்ஸ்' },
    Recess: { en: 'Recess', si: 'විවේකය', ta: 'விர休' },
    Bell: { en: 'Bell', si: 'බෙල්', ta: 'க்கொக்கு' },
    Desk: { en: 'Desk', si: 'මේසය', ta: 'டெஸ்க்' },
    Chair: { en: 'Chair', si: 'කුරSeats', ta: 'நாற்காலி' },
    Blackboard: { en: 'Blackboard', si: 'කියත්تاب', ta: 'கருத்துப்பலகை' },
    Locker: { en: 'Locker', si: 'ලොකර්', ta: 'அடுப்பு' },
    Uniform: { en: 'Uniform', si: 'සමය', ta: 'ஐக்கிய அணிகலன்' }
  };

  // Event delegation: handle clicks on any .sign-btn inside container
  if(container){
    container.addEventListener('click', async (ev)=>{
      const btn = ev.target.closest('.sign-btn');
      if(!btn) return;
      // If button has data-word, it's one of the statics
      const baseWord = btn.dataset.word;
      const id = btn.dataset.id; // e.g. qp-1
      const lang = languageSelect.value;
      const gender = genderSelect.value;
      let textToSpeak = '';

      if(baseWord){
        textToSpeak = (localMap[baseWord] && localMap[baseWord][lang]) || baseWord;
      } else if(id){
        const num = parseInt(id.replace('qp-',''));
        const pf = quickPhrases.find(p=> p.id === num);
        if(pf){
          textToSpeak = pf[lang] || pf.en;
        }
      }

      if(!textToSpeak) return;
      if(useServerTTSCheckbox.checked){
        await serverSpeak(textToSpeak, lang, gender);
      } else {
        browserSpeak(textToSpeak, lang, gender);
      }
    });
  }

  // re-render labels when language changes
  function updateStaticLabels(){
    const labels = container.querySelectorAll('.sign-btn .sign-label');
    labels.forEach(node=>{
      const btn = node.closest('.sign-btn');
      if(!btn) return;
      const baseWord = btn.dataset.word;
      const id = btn.dataset.id;
      if(baseWord && localMap[baseWord]){
        node.textContent = localMap[baseWord][languageSelect.value] || localMap[baseWord].en;
      } else if(id){
        const num = parseInt(id.replace('qp-',''));
        const pf = quickPhrases.find(p=> p.id === num);
        if(pf) node.textContent = pf[languageSelect.value] || pf.en;
      }
    });
  }

  // Listen for language selector changes
  languageSelect.addEventListener('change', ()=>{
    updateStaticLabels();
  });

  // Also listen to global language changes (if site uses ChirovoxLang)
  window.addEventListener('chirovox:langchange', (e)=>{
    if(e && e.detail && e.detail.lang){
      const newLang = e.detail.lang.split('-')[0];
      languageSelect.value = newLang;
      updateStaticLabels();
    }
  });

  // initial render
  renderQuickPhrases();
  // initial labels (in chosen language)
  setTimeout(updateStaticLabels, 50);

})();
