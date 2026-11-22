/* ============================================================
   PFC SITE TRANSLATIONS — shared engine
   ------------------------------------------------------------
   Include this AFTER the page's own data file (i18n-index.js,
   i18n-about.js, i18n-privacy.js or i18n-terms.js), both with
   `defer` so they run in order once the DOM is parsed:

     <script src="i18n-index.js" defer></script>
     <script src="i18n.js" defer></script>

   The data file sets:
     window.PFC_I18N_DATA = { en:{key:'text',...}, nl:{...}, de:{...} }

   Elements are tagged in the HTML to say what gets translated:
     data-i18n="key"        -> sets textContent (plain text)
     data-i18n-html="key"   -> sets innerHTML (only for text that
                                legitimately contains inline markup,
                                e.g. '...With <span>Global Opportunities.</span>')
     data-i18n-ph="key"     -> sets the placeholder attribute
     data-i18n-title="key"  -> sets the title attribute
     data-i18n-aria="key"   -> sets the aria-label attribute

   A language switcher is auto-built into every element with class
   "pfcLangMount" (a page can have more than one, e.g. desktop nav
   + mobile menu — both stay in sync).

   Language choice is saved in localStorage and persists across
   every PFC public page (index/about/privacy/terms) since they
   share one origin. Switching language reloads the page so any of
   that page's own interactive JS (forms, tabs, carousels) starts
   fresh against the newly-translated markup instead of us trying
   to patch already-running state in place.

   window.pfcT(key) is also exposed so a page's own JS can pull a
   translated string at runtime — e.g. the contact form's success/
   error message after submit, which is set via JS, not raw HTML.
   ============================================================ */
(function(){
  const DICT = window.PFC_I18N_DATA || {};
  const LANGS = [['en','EN'],['nl','NL'],['de','DE'],['fr','FR'],['it','IT'],['es','ES']];
  const STORE_KEY = 'pfc_lang';

  function currentLang(){
    const saved = localStorage.getItem(STORE_KEY);
    return (saved && DICT[saved]) ? saved : 'en';
  }

  function lookup(lang,key){
    const table = DICT[lang] || DICT.en || {};
    const fallback = DICT.en || {};
    if(key in table) return table[key];
    if(key in fallback) return fallback[key];
    return null;
  }

  function applyLang(lang){
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const v = lookup(lang, el.getAttribute('data-i18n'));
      if(v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const v = lookup(lang, el.getAttribute('data-i18n-html'));
      if(v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      const v = lookup(lang, el.getAttribute('data-i18n-ph'));
      if(v !== null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el=>{
      const v = lookup(lang, el.getAttribute('data-i18n-title'));
      if(v !== null) el.setAttribute('title', v);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const v = lookup(lang, el.getAttribute('data-i18n-aria'));
      if(v !== null) el.setAttribute('aria-label', v);
    });
    document.querySelectorAll('.pfc-lang-switch [data-lang]').forEach(btn=>{
      btn.classList.toggle('active', btn.getAttribute('data-lang')===lang);
    });
  }

  function setLang(lang){
    if(!DICT[lang] || lang===currentLang()) return;
    localStorage.setItem(STORE_KEY, lang);
    location.reload();
  }
  window.pfcSetLang = setLang;
  window.pfcT = function(key){ const v = lookup(currentLang(), key); return v===null ? key : v; };
  window.pfcLang = currentLang;

  function buildSwitchers(){
    const mounts = document.querySelectorAll('.pfcLangMount');
    if(!mounts.length) return;
    const lang = currentLang();
    const html = '<div class="pfc-lang-switch">'+
      LANGS.filter(([code])=>DICT[code]).map(([code,short])=>
        `<button type="button" data-lang="${code}" class="${code===lang?'active':''}" onclick="pfcSetLang('${code}')">${short}</button>`
      ).join('')+
      '</div>';
    mounts.forEach(m=>{ m.innerHTML = html; });
  }

  function init(){
    buildSwitchers();
    applyLang(currentLang());
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
