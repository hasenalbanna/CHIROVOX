require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tf = require('@tensorflow/tfjs-node');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const API_KEY = process.env.API_KEY || '';
const PORT = process.env.PORT || 3000;

const signLabels = ["Hello", "I Love You", "No", "Sorry", "Thank You", "Understood", "We Are", "Yes"];

let model;
(async () => {
  try {
    const modelPath = `file://${path.join(__dirname, '..', 'model', 'model.json')}`;
    console.log('Loading model from', modelPath);
    model = await tf.loadLayersModel(modelPath);
    console.log('Model loaded');
  } catch (err) {
    console.error('Failed to load model:', err);
  }
})();

// simple health check
app.get('/health', (req, res) => {
  res.json({ ok: true, modelLoaded: !!model });
});

// Text-to-speech endpoint
// POST /tts { text, lang: 'en'|'si'|'ta', gender: 'male'|'female' }
app.post('/tts', async (req, res) => {
  try {
    const key = req.header('x-api-key') || req.query.api_key || '';
    if (!API_KEY || key !== API_KEY) {
      return res.status(401).json({ error: 'Unauthorized - invalid API key' });
    }

    const { text, lang = 'en', gender = 'female' } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });

    // If Google Cloud Text-to-Speech credentials are available, use it
    if (process.env.USE_GOOGLE_TTS === '1') {
      try {
        const textToSpeech = require('@google-cloud/text-to-speech');
        const client = new textToSpeech.TextToSpeechClient();

        // map short lang codes to proper language tags
        const langMap = { en: 'en-US', si: 'si-LK', ta: 'ta-IN' };
        const voiceLang = langMap[lang] || 'en-US';

        // select voice gender
        const ssmlGender = gender === 'male' ? 'MALE' : 'FEMALE';

        const request = {
          input: { text },
          // note: choose a compatible voice name if needed
          voice: { languageCode: voiceLang, ssmlGender },
          audioConfig: { audioEncoding: 'MP3' }
        };

        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent.toString('base64');
        return res.json({ audio: `data:audio/mp3;base64,${audioContent}` });
      } catch (err) {
        console.error('Google TTS error:', err);
        return res.status(500).json({ error: 'Google TTS failed', detail: String(err) });
      }
    }

    // If no TTS provider configured, return 501 Not Implemented
    return res.status(501).json({ error: 'TTS provider not configured on server' });
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: String(err) });
  }
});

// predict endpoint expects JSON { image: 'data:image/jpeg;base64,...' }
app.post('/predict', async (req, res) => {
  try {
    const key = req.header('x-api-key') || req.query.api_key || '';
    if (!API_KEY || key !== API_KEY) {
      return res.status(401).json({ error: 'Unauthorized - invalid API key' });
    }

    if (!model) return res.status(500).json({ error: 'Model not loaded' });

    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Extract base64 portion
    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : image.split(',')[1] || image;
    const buffer = Buffer.from(base64Data, 'base64');

    // decode image to tensor
    let inputTensor = tf.node.decodeImage(buffer, 3);
    // resize to model expected size (64x64)
    inputTensor = tf.image.resizeBilinear(inputTensor, [64, 64]).toFloat().div(255.0).expandDims(0);

    const prediction = model.predict(inputTensor);
    const predictedIndex = prediction.argMax(-1).dataSync()[0];
    tf.dispose([inputTensor, prediction]);

    const label = signLabels[predictedIndex] || 'Unknown';
    res.json({ index: predictedIndex, label });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Prediction server listening on port ${PORT}`);
});
