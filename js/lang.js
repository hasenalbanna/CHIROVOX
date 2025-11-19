// lang.js
// Shared language selection helper. Keeps language choice in localStorage and notifies pages to translate.
(function(){
  const KEY = 'chirovox:lang';
  function setLang(lang){
    if(!lang) return;
    localStorage.setItem(KEY, lang);
    // dispatch event so pages can listen and update
    window.dispatchEvent(new CustomEvent('chirovox:langchange', { detail: { lang }}));
  }
  function getLang(){ return localStorage.getItem(KEY) || 'en'; }
  // expose API
  window.ChirovoxLang = { setLang, getLang };
  // initialize if not set
  if(!localStorage.getItem(KEY)) localStorage.setItem(KEY,'en');
})();
