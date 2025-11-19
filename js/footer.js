// footer.js - standardize bottom-nav across pages
(function(){
  function relPathToRoot(){
    // Determine depth by counting non-empty segments in pathname
    const path = (location.pathname || '').replace(/\\/g,'/');
    const segments = path.split('/').filter(Boolean);
    // If path ends with a filename, remove last segment
    if(segments.length && segments[segments.length-1].includes('.')) segments.pop();
    const depth = Math.max(0, segments.length);
    if(depth === 0) return '.'; // root
    return Array(depth).fill('..').join('/');
  }

  function buildFooter(base, variant){
    // base is relative path from current page to project root
    if(variant === 'pro'){
      return `
        <a class="nav-item" href="${base}/index.html"><span class="nav-ico">🏠</span><span class="nav-label">Home</span></a>
        <a class="nav-item" href="${base}/pages/gesture/gesture.html"><span class="nav-ico">📷</span><span class="nav-label">Camera</span></a>
        <a class="nav-item" href="${base}/education.html"><span class="nav-ico">📘</span><span class="nav-label">Learn</span></a>
        <a class="nav-item" href="${base}/dictionary.html"><span class="nav-ico">📖</span><span class="nav-label">Dictionary</span></a>
        <a class="nav-item" href="${base}/pages/schools.html"><span class="nav-ico">🏫</span><span class="nav-label">Schools</span></a>
        <a class="nav-item" href="${base}/pages/quiz.html"><span class="nav-ico">📝</span><span class="nav-label">Quiz</span></a>
      `;
    }
    return `
      <a href="${base}/index.html">🏠</a>
      <a href="${base}/pages/gesture/gesture.html">📷</a>
      <a href="${base}/education.html">📘</a>
      <a href="${base}/dictionary.html">📖</a>
      <a href="${base}/pages/schools.html">🏫</a>
      <a href="${base}/pages/quiz.html">📝</a>
    `;
  }

  document.addEventListener('DOMContentLoaded', function(){
    const base = relPathToRoot();
    const prefersPro = window.innerWidth >= 520; // use pro layout on wider screens
    document.querySelectorAll('footer.bottom-nav').forEach(f => {
      // allow explicit override via data-variant or .pro class
      const explicit = f.dataset.variant || (f.classList.contains('pro') ? 'pro' : null);
      const variant = explicit || (prefersPro ? 'pro' : 'compact');
      f.classList.toggle('pro', variant === 'pro');
      f.innerHTML = buildFooter(base, variant);
    });
    // ensure footer stays above other content
    window.addEventListener('resize', ()=>{
      const preferNow = window.innerWidth >= 520;
      document.querySelectorAll('footer.bottom-nav').forEach(f=> f.classList.toggle('pro', preferNow));
    });
    // Apply global theme preference (light-mode) across pages
    try{
      const root = document.documentElement;
      const saved = localStorage.getItem('chirovox:light');
      const initOn = saved === '1';
      if(initOn) root.classList.add('light-mode');

      // If page already has a theme-toggle (e.g., index), wire it to sync state
      const pageToggle = document.getElementById('theme-toggle');
      if(pageToggle){
        pageToggle.classList.toggle('active', initOn);
        pageToggle.setAttribute('aria-pressed', String(!!initOn));
        pageToggle.querySelector('.toggle-ico').textContent = initOn? '☀️':'🌙';
        pageToggle.addEventListener('click', ()=>{
          const on = root.classList.toggle('light-mode');
          localStorage.setItem('chirovox:light', on? '1':'0');
          pageToggle.classList.toggle('active', on);
          pageToggle.querySelector('.toggle-ico').textContent = on? '☀️':'🌙';
        });
      }

      // If no toggle exists on the page, create a small floating global toggle so user can switch theme
      if(!pageToggle && !document.getElementById('global-theme-toggle')){
        const b = document.createElement('button');
        b.id = 'global-theme-toggle';
        b.className = 'theme-toggle global-theme-toggle';
        b.setAttribute('title','Toggle light mode');
        b.setAttribute('aria-pressed', String(!!initOn));
        b.innerHTML = `<span class="toggle-ico">${initOn? '☀️':'🌙'}</span><span class="toggle-label">${initOn? 'Light':'Light'}</span>`;
        b.addEventListener('click', ()=>{
          const on = document.documentElement.classList.toggle('light-mode');
          localStorage.setItem('chirovox:light', on? '1':'0');
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', String(!!on));
          b.querySelector('.toggle-ico').textContent = on? '☀️':'🌙';
        });
        document.body.appendChild(b);
      }
    }catch(e){ console.warn('theme init failed', e) }
  });
})();
