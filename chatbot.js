'use strict';
/* "I'am okay" helper: rule-based answers, works offline on GitHub Pages.
   To use a real AI later, host a small backend and set API_URL. Never put API keys in this file. */
(() => {
  const NAME = "IM!", API_URL = '';
  const KB = [
    {k:['hi','hello','hey','sawubona','molo','dumela','hallo'], a:`Hello, I'm ${NAME}. I can help with registering, ID, voting stations and how to vote.`},
    {k:['register','registration','sign up','enrol','enroll'], a:'Open Register to vote, enter your name, ID number and address, add any special vote request, then submit.', go:['#register','Open Register to vote']},
    {k:['id','identity','document','bring','smart card','green id'], a:'Bring your original Smart ID card, green ID book or valid temporary ID certificate.'},
    {k:['station','where','queue','wait','directions','near'], a:'The Voting stations page shows your assigned station, how far it is and how long the queue is.', go:['#stations','Open Voting stations']},
    {k:['how to vote','how do i vote','steps','tablet','guide'], a:"At your station: show your ID, get checked against the voters' roll, choose your option on the tablet, confirm, then see your confirmation screen.", go:['#guide/steps','Open the Voting guide']},
    {k:['video','sign language','sasl','deaf','hearing'], a:'The Voting guide has two videos: how to vote on the tablet, and how to vote in South African Sign Language.', go:['#guide/video','Watch the videos']},
    {k:['language','zulu','xhosa','afrikaans','sesotho','tswana','sepedi','venda','tsonga','swati','ndebele'], a:'Use the language menu at the top to pick any of the 11 spoken official languages or SA Sign Language. Some words are still being translated.'},
    {k:['paper','physical','digital','ballot paper'], a:'Voting is fully digital on a tablet. There are no paper ballots.'},
    {k:['practice','practise','try','demo'], a:'Try the practice ballot: tap an option, then tap Confirm vote.', go:['#guide/practice','Open the practice ballot']},
    {k:['secret','private','privacy','see how','who runs'], a:'Your vote is secret. This app never sees how you vote, and the voting tablets are managed only by the company.'},
    {k:['special','home visit','early','24a','outside my district'], a:'On the registration form, Step 4 lets you ask for a home visit, an early vote or to vote outside your district.', go:['#register','Open Register to vote']},
    {k:['contact','email','phone','call','social'], a:'You can email or phone us from the Contact us page.', go:['#contact','Open Contact us']},
    {k:['verify','results','binance','bnb','blockchain','audit','fingerprint'], a:'After the election, a fingerprint of the final results is published on BNB Chain. Paste the transaction hash on the Verify results page to check it. Only a fingerprint is published, never who you are or how you voted.', go:['#verify','Open Verify results']},
    {k:['read aloud','listen','blind','visual','accessib','disab','large text','contrast'], a:'Tap the Accessibility button (bottom left) to have any page read aloud, make text larger or use high contrast.'},
    {k:['hours','open','time','when'], a:'Voting hours are 07:00 to 21:00.'},
    {k:['thank','thanks','ngiyabonga','enkosi'], a:"You're welcome! Ask me anything else."}
  ];
  const FALLBACK = {a:"I'm not sure about that one. Try asking about registering, ID, stations, the videos or verifying results, or use the Contact us page.", go:['#contact','Open Contact us']};
  const CHIPS = ['How do I register?','What ID do I need?','Where do I vote?','How do I verify results?'];
  const log = $('#botLog');
  function add(who, text, go){
    const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text;
    if (go) { const a = document.createElement('a'); a.href = go[0]; a.textContent = go[1]; a.className = 'mt-1 block font-bold underline'; a.onclick = () => ($('#botBox').hidden = true); d.append(a); }
    log.append(d); log.scrollTop = log.scrollHeight;
  }
  function local(q){
    const l = q.toLowerCase(), hit = KB.map(e => [e.k.filter(w => new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(l)).length, e]).sort((a, b) => b[0] - a[0])[0];
    return hit[0] > 0 ? hit[1] : FALLBACK;
  }
  async function ask(q){
    add('me', q);
    if (API_URL) { try { const r = await fetch(API_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message:q, lang:$('#lang').value})}); const j = await r.json(); if (j.reply) return add('bot', j.reply); } catch (e) { /* fall back to local answers */ } }
    const e = local(q); setTimeout(() => add('bot', e.a, e.go), 350);
  }
  CHIPS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c; b.onclick = () => ask(c); $('#botChips').append(b); });
  $('#botForm').addEventListener('submit', e => { e.preventDefault(); const q = $('#botInput').value.trim(); if (q) { $('#botInput').value = ''; ask(q); } });
  const toggle = open => { $('#botBox').hidden = !open; $('#botBtn').setAttribute('aria-expanded', open); if (open) $('#botInput').focus(); };
  $('#botBtn').onclick = () => toggle($('#botBox').hidden);
  $('#botClose').onclick = () => toggle(false);
  addEventListener('keydown', e => e.key === 'Escape' && toggle(false));
  add('bot', `Hi, I'm ${NAME}. Ask me about registering, ID, stations or how to vote. Never type your ID number here.`);
})();
