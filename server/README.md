# Sign Language Prediction Server

This small Express server loads the TensorFlow model from the project `model/` folder and exposes a `/predict` endpoint.

Quick start

1. Copy `.env.example` to `.env` and set `API_KEY`.

2. Install dependencies (from the `server` folder):

```powershell
cd server
npm install
```

3. Run the server:

```powershell
npm start
```

By default the server listens on port 3000. Use the `x-api-key` header to send your API key when calling `/predict`.

Client

- In `pages/gesture/gesture.js` set `REMOTE_PREDICT = true` and fill `REMOTE_PREDICT_URL` and `REMOTE_API_KEY` with your server URL and key.

Text-to-Speech (TTS)

- This server includes an optional `/tts` endpoint that uses Google Cloud Text-to-Speech when enabled.
- To enable Google Cloud TTS:

  1.  Create a Google Cloud project and enable the Text-to-Speech API.
  2.  Create a service account and download the JSON key file.
  3.  Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file.
  4.  In the server `.env`, set `USE_GOOGLE_TTS=1`.

- Example `.env`:

```
API_KEY=your_secret_api_key_here
PORT=3000
USE_GOOGLE_TTS=1
```

- Once enabled, client pages can call `POST /tts` with JSON { text, lang, gender } and the server will return a `data:audio/mp3;base64,...` audio string.

Schools quick-speak page

- There is a new page at `pages/schools.html` that provides quick buttons for school-related words and UI controls to choose language (English, Sinhala, Tamil) and voice gender (male/female). The page can either use browser `speechSynthesis` or call the server `/tts` endpoint when the "Use server TTS" checkbox is enabled.

Security

- Don't commit your `.env` with the real API key or Google credentials. Use server-side environment variables or secret managers in production.

Notes about Gemini / other APIs

- You specifically asked for Gemini voice options. As of this repository update, the server integrates with Google Cloud Text-to-Speech which supports multiple languages and voice genders and is straightforward to configure. If you prefer a different provider (for example a Gemini TTS endpoint when available), we can adapt the `/tts` endpoint to call that provider's API — you'll need API credentials and provider details.
