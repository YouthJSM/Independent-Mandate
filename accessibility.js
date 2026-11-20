'use strict';
/* Accessibility panel: read aloud, reading speed, larger text, high contrast. Uses the browser's built-in speech (no server). */
(() => {
  const synth = window.speechSynthesis, html = document.documentElement;
  const LANG = {en:'en-ZA',zu:'zu-ZA',xh:'xh-ZA',af:'af-ZA',nso:'nso-ZA',tn:'tn-ZA',st:'st-ZA',ts:'ts-ZA',ss:'ss-ZA',ve:'ve-ZA',nr:'nr-ZA',sasl:'en-ZA'};
  const apply = () => { html.classList.toggle('big', $('#bigText').checked); html.classList.toggle('hc', $('#contrast').checked); };
  ['bigText','contrast','autoRead'].forEach(id => { const el = $('#' + id); el.checked = localStorage.getItem('im-' + id) === '1';
    el.addEventListener('change', () => { localStorage.setItem('im-' + id, el.checked ? '1' : '0'); apply(); }); });
  $('#rate').value = localStorage.getItem('im-rate') || '1';
  $('#rate').addEventListener('input', e => localStorage.setItem('im-rate', e.target.value));
  apply();

  const stop = () => synth && synth.cancel();
  function voiceFor(code){
    const v = synth.getVoices(), c = code.toLowerCase();
    return v.find(x => x.lang.replace('_','-').toLowerCase() === c) || v.find(x => x.lang.toLowerCase().startsWith(c.slice(0,2))) || v.find(x => x.lang.toLowerCase().startsWith('en'));
  }
  function read(){
    if (!synth) return toast('Reading aloud is not supported in this browser');
    stop();
    const code = LANG[$('#lang').value] || 'en-ZA', v = voiceFor(code);
    const el = document.querySelector('.screen:not([hidden])'), text = (el ? el.innerText : '').replace(/\s+/g, ' ');
    (text.match(/[^.!?]+[.!?]*/g) || []).forEach(s => { const u = new SpeechSynthesisUtterance(s.trim());
      if (v) { u.voice = v; u.lang = v.lang; } u.rate = +$('#rate').value; synth.speak(u); });
    if (v && !v.lang.toLowerCase().startsWith(code.slice(0,2))) toast('No voice for this language on your device. Reading in English.');
  }
  window.IMReader = { read, stop };
  $('#readPage').onclick = read; $('#stopRead').onclick = stop;
  $('#a11yBtn').onclick = () => { const open = $('#a11yPanel').hidden; $('#a11yPanel').hidden = !open; $('#a11yBtn').setAttribute('aria-expanded', open); };
  addEventListener('keydown', e => { if (e.key === 'Escape') { $('#a11yPanel').hidden = true; $('#a11yBtn').setAttribute('aria-expanded', false); } });
  addEventListener('hashchange', () => { stop(); if ($('#autoRead').checked) setTimeout(read, 500); });
})();
