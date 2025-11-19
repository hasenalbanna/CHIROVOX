// js/global-lang.js

document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        en: {
            // Home Page
            home_title: "Your Hands<br>Speak Aloud",
            home_subtitle: "Point the camera to translate instantly!",
            home_scan: "Scan My<br>Hands!",
            home_practice: "Practice Signs",
            // Dictionary Page
            dict_title: "Sign Language Dictionary",
            dict_th_word: "Word / Phrase",
            dict_th_si: "Pronunciation (Sinhala)",
            dict_th_ta: "Pronunciation (Tamil)",
            dict_th_meaning: "Meaning / Notes",
            // Education Page
            edu_title: "Learn Sri Lankan Sign Language",
            // Gesture Page
            gesture_title: "Real-Time Sign Language Detection",
            gesture_help_text: "How can I help you today?",
            gesture_loading: "Loading model...",
            gesture_stop: "Stop",
            gesture_detected_sign: "Detected Sign:",
            // Quiz Page
        },
        si: {
            // Home Page
            home_title: "ඔබේ දෑත්<br>හඬ නඟා කතා කරයි",
            home_subtitle: "ක්ෂණිකව පරිවර්තනය කිරීමට කැමරාව යොමු කරන්න!",
            home_scan: "මගේ දෑත්<br>ස්කෑන් කරන්න!",
            home_practice: "සංඥා පුහුණු වන්න",
            // Dictionary Page
            dict_title: "සංඥා භාෂා ශබ්දකෝෂය",
            dict_th_word: "වචනය / වාක්‍යය",
            dict_th_si: "සිංහල උච්චාරණය",
            dict_th_ta: "දෙමළ උච්චාරණය",
            dict_th_meaning: "අර්ථය / සටහන්",
            // Education Page
            edu_title: "ශ්‍රී ලංකා සංඥා භාෂාව ඉගෙන ගන්න",
            // Gesture Page
            gesture_title: "තත්‍ය කාලීන සංඥා භාෂා හඳුනාගැනීම",
            gesture_help_text: "අද ඔබට උදව් කරන්නේ කෙසේද?",
            gesture_loading: "ආකෘතිය පූරණය වෙමින්...",
            gesture_stop: "නවත්වන්න",
            gesture_detected_sign: "හඳුනාගත් ලකුණ:",
            // Quiz Page
        },
        ta: {
            // Home Page
            home_title: "உங்கள் கைகள்<br>உரக்கப் பேசுகின்றன",
            home_subtitle: "உடனடியாக மொழிபெயர்க்க கேமராவைக் காட்டவும்!",
            home_scan: "என் கைகளை<br>ஸ்கேன் செய்!",
            home_practice: "சைகைகளைப் பயிற்சி செய்யுங்கள்",
            // Dictionary Page
            dict_title: "சைகை மொழி அகராதி",
            dict_th_word: "சொல் / சொற்றொடர்",
            dict_th_si: "சிங்கள உச்சரிப்பு",
            dict_th_ta: "தமிழ் உச்சரிப்பு",
            dict_th_meaning: "பொருள் / குறிப்புகள்",
            // Education Page
            edu_title: "இலங்கை சைகை மொழியைக் கற்றுக்கொள்ளுங்கள்",
            // Gesture Page
            gesture_title: "நிகழ்நேர சைகை மொழி கண்டறிதல்",
            gesture_help_text: "இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
            gesture_loading: "மாதிரி ஏற்றப்படுகிறது...",
            gesture_stop: "நிறுத்து",
            gesture_detected_sign: "கண்டறியப்பட்ட அடையாளம்:",
            // Quiz Page
        }
    };

    const applyLanguage = (lang) => {
        if (!translations[lang]) return;

        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (translations[lang][key]) {
                // Use innerHTML for keys that might contain <br> tags
                if (key.includes('title') || key.includes('scan')) {
                    el.innerHTML = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });

        // Store preference
        try {
            localStorage.setItem('chirovox-lang', lang);
        } catch (e) {
            console.warn('Could not save language preference.');
        }
    };

    const setupSwitcher = () => {
        const langSwitchers = document.querySelectorAll('.language-switcher');
        if (langSwitchers.length === 0) return;

        langSwitchers.forEach(switcher => {
            const langLinks = switcher.querySelectorAll('.language-dropdown a');
            langLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedLang = e.target.getAttribute('data-lang');
                    applyLanguage(selectedLang);
                });
            });
        });
    };

    // --- Initialization ---
    
    // 1. Set up the language switcher listeners
    setupSwitcher();

    // 2. Apply the saved language or default to 'en'
    let currentLang = 'en';
    try {
        const savedLang = localStorage.getItem('chirovox-lang');
        if (savedLang && translations[savedLang]) {
            currentLang = savedLang;
        }
    } catch (e) {
        // ignore
    }
    applyLanguage(currentLang);
});
