// Questions Array
const questions = [
  {
    question: "What does 'Hello' mean in sign language?",
    options: ["Greeting", "Yes", "Love", "No"],
    answer: "Greeting"
  },
  {
    question: "How do you say 'I Love You'?",
    options: ["Apology", "Expression of Love", "Thanks", "Yes"],
    answer: "Expression of Love"
  },
  {
    question: "What is the sign for 'No'?",
    options: ["Yes", "No", "Hello", "Understood"],
    answer: "No"
  },
  {
    question: "What is the meaning of 'Sorry'?",
    options: ["Thanks", "Love", "Apology", "Yes"],
    answer: "Apology"
  },
  {
    question: "What does 'Thank You' mean?",
    options: ["Gratitude", "Greeting", "Yes", "No"],
    answer: "Gratitude"
  },
  {
    question: "What does 'Understood' mean?",
    options: ["Confusion", "Agree", "Confirm understanding", "Sorry"],
    answer: "Confirm understanding"
  },
  {
    question: "We Are represents?",
    options: ["Singular", "Pronoun / group", "Greeting", "Love"],
    answer: "Pronoun / group"
  },
  {
    question: "Yes represents?",
    options: ["No", "Positive answer", "Hello", "Thanks"],
    answer: "Positive answer"
  },
  {
    question: "No represents?",
    options: ["Negative answer", "Greeting", "Love", "Yes"],
    answer: "Negative answer"
  },
  {
    question: "Thank You represents?",
    options: ["Love", "Gratitude", "Sorry", "Yes"],
    answer: "Gratitude"
  }
];

const startBtn = document.getElementById("start-btn");
const usernameInput = document.getElementById("username");
const nameSection = document.getElementById("name-section");
const quizSection = document.getElementById("quiz-section");
const quizContainer = document.getElementById("quiz-container");
const submitBtn = document.getElementById("submit-btn");
const resultSection = document.getElementById("result-section");
const scoreText = document.getElementById("score");
const certificateMsg = document.getElementById("certificate-msg");
const certificateCanvas = document.getElementById("certificate-canvas");

let username = "";
let score = 0;

// --- Quick phrases data (30 items) ---
// Each item: { id, en, si, ta }
const quickPhrases = [
  {id:1, en: "Yes", si: "ඔව්", ta: "ஆம்"},
  {id:2, en: "No", si: "නැහැ", ta: "இல்லை"},
  {id:3, en: "I understand", si: "මට තේරුණා", ta: "எனக்கு புரிந்தது"},
  {id:4, en: "I don't understand", si: "මට තේරෙන්නේ නෑ", ta: "எனக்கு புரியவில்லை"},
  {id:5, en: "Please", si: "කරුණාකර", ta: "தயவு செய்து"},
  {id:6, en: "Thank you", si: "ස්තුතියි", ta: "நன்றி"},
  {id:7, en: "Sorry", si: "කණගාටුයි", ta: "மன்னிக்கவும்"},
  {id:8, en: "Excuse me", si: "සමාන්‍ය වශයෙන්", ta: "மன்னிக்கவும்"},
  {id:9, en: "I want a pen", si: "මට පැන් එකක් ඕනෙ", ta: "எனக்கு ஒரு மறைவான் வேண்டும்"},
  {id:10, en: "I want a book", si: "මට පොතක් ඕනෙ", ta: "எனக்குச் புத்தகம் வேண்டும்"},
  {id:11, en: "Can I go to the toilet?", si: "මුත්‍රා ගෙට හැඬවෙන්න පුළුවන්ද?", ta: "நான் க probabilty "},
  {id:12, en: "I need help", si: "මට උදව් අවශ්යයි", ta: "எனக்கு உதவி வேண்டும்"},
  {id:13, en: "I am fine", si: "මම සෙසුයි", ta: "நான் நலமாக இருக்கிறேன்"},
  {id:14, en: "Please repeat", si: "කරුණාකර නැවත කියන්න", ta: "மீண்டும் சொல்க"},
  {id:15, en: "Slow down please", si: "පොඩ්ඩට කතා කරන්න", ta: "மெல்ல பேசுங்கள்"},
  {id:16, en: "Open the book", si: "පුස්තකය විවෘත කරන්න", ta: "புத்தகத்தை திறக்கவும்"},
  {id:17, en: "Close the book", si: "පුස්තකය වසන්න", ta: "புத்தகத்தை மூடவும்"},
  {id:18, en: "Yes I understood", si: "ඔව් මට තේරුණා", ta: "ஆம் எனக்கு புரிந்து கொண்டேன்"},
  {id:19, en: "No I didn't understand", si: "නැහැ මට තේරෙන්නේ නැහැ", ta: "இல்லை எனக்கு புரியவில்லை"},
  {id:20, en: "I want to answer", si: "මට පිළිතුරු දෙන්න ඕනෙ", ta: "நான் பதில் கூற விரும்புகிறேன்"},
  {id:21, en: "I want to ask", si: "මට ප්‍රශ්නයක් තියනවා", ta: "என்னை கேள்வி கேட்க விரும்புகிறேன்"},
  {id:22, en: "Please help me", si: "කරුණාකර මට උදව් කරන්න", ta: "தயவு செய்து எனக்கு உதவுங்கள்"},
  {id:23, en: "I lost my pen", si: "මට පැනය අහිමිවී ගියේ", ta: "என் பேன் கண்டு பிடிக்கவில்லை"},
  {id:24, en: "Turn off the light", si: "ලයිට් අක්රාවට දමන්න", ta: "விளக்கை அணை"},
  {id:25, en: "Turn on the light", si: "ලයිට් දමන්න", ta: "விளக்கை இயக்கவும்"},
  {id:26, en: "Wait a moment", si: "තත්පරයක් රැඳී සිටින්න", ta: "ஒரு நிமிடம் காத்திருக்கவும்"},
  {id:27, en: "Sit down please", si: "කරුණාකර වැටෙන්න", ta: "கீழே உட்காருங்கள்"},
  {id:28, en: "Stand up please", si: "කොටසට නැගී ඉදිරියට ආව", ta: "நின்று நிற்கவும்"},
  {id:29, en: "Listen please", si: "කරුණාකර ඇසන්න", ta: "கவனமாக கேளுங்கள்"},
  {id:30, en: "Repeat after me", si: "මට පසුපස නැවත කියන්න", ta: "என்னைப் பின்பற்றி உரையாடுங்கள்"}
];

// Render quick buttons and wire language switching + TTS
const quickButtonsContainer = document.getElementById('quick-buttons');
function speakText(text, lang){
  if(!window.speechSynthesis) return;
  try{ window.speechSynthesis.cancel(); }catch(e){}
  const utter = new SpeechSynthesisUtterance(text);
  // choose voice matching lang if available
  const voices = window.speechSynthesis.getVoices();
  if(voices && voices.length){
    let locale = (lang||window.ChirovoxLang?.getLang?.()||'en');
    // map stored short codes to best guess locales
    if(locale === 'si') locale = 'si-LK';
    if(locale === 'ta') locale = 'ta-IN';
    const match = voices.find(v=> v.lang && v.lang.toLowerCase().startsWith(locale.toLowerCase()));
    if(match) utter.voice = match;
  }
  window.speechSynthesis.speak(utter);
}

function renderQuickButtons(){
  quickButtonsContainer.innerHTML = '';
  const lang = (window.ChirovoxLang && window.ChirovoxLang.getLang) ? window.ChirovoxLang.getLang() : 'en';
  // map stored values like 'en' or 'si' or possibly 'en-US'
  const short = lang.split('-')[0];
  quickPhrases.forEach(item=>{
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    btn.type = 'button';
    btn.setAttribute('data-id', item.id);
    btn.setAttribute('aria-label', item.en);
    let label = item.en;
    if(short === 'si') label = item.si || item.en;
    if(short === 'ta') label = item.ta || item.en;
    btn.textContent = label;
    btn.addEventListener('click', ()=>{
      // speak the label in the selected language
      const speakLabel = (short==='si') ? item.si : (short==='ta') ? item.ta : item.en;
      speakText(speakLabel, short);
    });
    quickButtonsContainer.appendChild(btn);
  });
}

// ensure voices list is populated before first render
if(window.speechSynthesis && window.speechSynthesis.getVoices().length === 0){
  // some browsers load voices asynchronously
  window.speechSynthesis.addEventListener('voiceschanged', ()=> renderQuickButtons());
}

// render on load
renderQuickButtons();

// listen for language changes
window.addEventListener('chirovox:langchange', (e)=>{
  renderQuickButtons();
});

// Start Quiz
startBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (username === "") {
    alert("Please enter your full name!");
    return;
  }
  nameSection.style.display = "none";
  quizSection.style.display = "block";
  displayQuiz();
});

// Display Quiz Questions
function displayQuiz() {
  quizContainer.innerHTML = "";
  questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    const questionTitle = document.createElement("p");
    questionTitle.textContent = `${index + 1}. ${q.question}`;
    questionDiv.appendChild(questionTitle);

    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("options");

    q.options.forEach(option => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${index}`;
      radio.value = option;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      optionsDiv.appendChild(label);
    });

    questionDiv.appendChild(optionsDiv);
    quizContainer.appendChild(questionDiv);
  });
}

// Submit Quiz
submitBtn.addEventListener("click", () => {
  score = 0;
  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && selected.value === q.answer) {
      score++;
    }
  });

  quizSection.style.display = "none";
  resultSection.style.display = "block";
  scoreText.textContent = `You scored ${score} out of ${questions.length}!`;

  if (score >= 7) {
    certificateMsg.textContent = "Congratulations! Your certificate is being downloaded.";
    generateCertificate(username);
  } else {
    certificateMsg.textContent = "Sorry, you need at least 7/10 to get a certificate.";
  }
});

// Generate Certificate
function generateCertificate(name) {
  const ctx = certificateCanvas.getContext("2d");
  const certificateImg = new Image();
  certificateImg.src = "../assets/images/certificate.png"; // your certificate image
  certificateImg.onload = () => {
    certificateCanvas.width = certificateImg.width;
    certificateCanvas.height = certificateImg.height;
    ctx.drawImage(certificateImg, 0, 0);

    // Add name text
    ctx.font = "40px Poppins";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(name, certificateCanvas.width / 2, certificateCanvas.height / 2);

    // Download certificate
    const link = document.createElement("a");
    link.download = `${name}_certificate.png`;
    link.href = certificateCanvas.toDataURL("image/png");
    link.click();
  };
}
