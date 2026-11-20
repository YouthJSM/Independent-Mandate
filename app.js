'use strict';
/* Independent Mandate – voter app. Frontend only, mock data. */
const CONFIG = { electionIn: (14*24*60 + 8*60 + 42) * 60000 }; // demo countdown
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Languages: all 11 spoken official languages + SASL. Missing words fall back to English; add translations below. */
const I18N = {
  en:{home:'Home',guide:'Voting guide',stations:'Voting stations',register:'Register to vote',contact:'Contact us',days:'Days',hours:'Hours',mins:'Mins'},
  zu:{home:'Ikhaya',guide:'Umhlahlandlela wokuvota',stations:'Iziteshi zokuvota',register:'Bhalisela ukuvota',contact:'Xhumana nathi',days:'Izinsuku',hours:'Amahora',mins:'Imizuzu'},
  xh:{home:'Ikhaya',guide:'Isikhokelo sokuvota',stations:'Izikhululo zokuvota',register:'Bhalisela ukuvota',contact:'Qhagamshelana nathi',days:'Iintsuku',hours:'Iiyure',mins:'Imizuzu'},
  af:{home:'Tuis',guide:'Stemgids',stations:'Stemstasies',register:'Registreer om te stem',contact:'Kontak ons',days:'Dae',hours:'Ure',mins:'Min'},
  st:{home:'Lehae',guide:'Tataiso ya ho vouta',stations:'Diteishene tsa ho vouta',register:'Ngolisa ho vouta',contact:'Re ikopanye',days:'Matsatsi',hours:'Diura',mins:'Metsotso'},
  nso:{},tn:{},ts:{},ss:{},ve:{},nr:{},sasl:{}
};
$('#lang').addEventListener('change', e => {
  const l = e.target.value; localStorage.setItem('im-lang', l);
  $$('[data-i]').forEach(n => n.textContent = (I18N[l] || {})[n.dataset.i] || I18N.en[n.dataset.i]);
  if (l === 'sasl') location.hash = '#guide/video';
});
function toast(t){const n=$('#toast');n.textContent=t;n.classList.remove('opacity-0','translate-y-4');setTimeout(()=>n.classList.add('opacity-0','translate-y-4'),2500)}

/* Drawer + back button */
function drawer(open){$('#drawer').classList.toggle('-translate-x-full',!open);$('#scrim').classList.toggle('hidden',!open);$('#menuBtn').setAttribute('aria-expanded',open)}
$('#menuBtn').onclick = () => drawer(true);
$('#closeBtn').onclick = $('#scrim').onclick = () => drawer(false);
addEventListener('keydown', e => e.key === 'Escape' && drawer(false));
$('#backBtn').onclick = () => history.length > 1 ? history.back() : (location.hash = '#home');

/* Router: #home #status #register #stations #contact #guide[/steps|video|practice|faq] */
function route(){
  const [name, sub] = (location.hash.slice(1) || 'home').split('/');
  const el = document.getElementById(name), s = el && el.classList.contains('screen') ? name : 'home';
  $$('.screen').forEach(x => x.hidden = x.id !== s);
  $$('.bn').forEach(a => a.getAttribute('href').split('/')[0] === '#' + s ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current'));
  $('#title').textContent = $('#' + s).dataset.title;
  $('#backBtn').hidden = s === 'home';
  if (s === 'guide') showTab(sub || 'steps');
  drawer(false); scrollTo(0, 0);
}
addEventListener('hashchange', route);

/* Countdown + status */
const target = Date.now() + CONFIG.electionIn, pad = n => String(n).padStart(2,'0');
function tick(){const d=Math.max(0,target-Date.now());
  $('#cdD').textContent=pad(Math.floor(d/864e5));$('#cdH').textContent=pad(Math.floor(d%864e5/36e5));$('#cdM').textContent=pad(Math.floor(d%36e5/6e4))}
tick(); setInterval(tick, 15000);
$('#slipBtn').onclick = () => { $('#slipTxt').innerHTML = `Voter: ${$('#vName').textContent}<br>ID: ${$('#vId').textContent}<br>Station: Orlando West High School<br>VD: 32840192<br>Bring your original ID.`; $('#slip').showModal(); };
$('#passBtn').onclick = () => toast('Offline pass saved to this device');

/* Registration */
function validSAId(id){
  if(!/^\d{13}$/.test(id)) return 'Enter all 13 digits.';
  const mm=+id.slice(2,4), dd=+id.slice(4,6);
  if(mm<1||mm>12||dd<1||dd>31) return 'The birth date in this ID number is not valid.';
  let sum=0; for(let i=0;i<13;i++){let n=+id[12-i]; if(i%2){n*=2; if(n>9)n-=9} sum+=n}
  return sum%10===0 ? '' : 'This ID number failed the check digit. Re-enter it carefully.';
}
$('#idNum').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g,''));
$('#addr').addEventListener('input', e => $('#vd').textContent = e.target.value.length > 8 ? '32840192' : 'not assigned yet');
$('#disability').addEventListener('change', e => $('#signHint').hidden = e.target.value !== 'Hearing / Deaf');
$('#homeLang').addEventListener('change', e => { if (e.target.value.includes('Sign')) $('#signHint').hidden = false; });
$('#scanBtn').onclick = () => { $('#idNum').value = '9001015000089'; toast('ID scanned (demo)'); };
$('#regForm').addEventListener('submit', e => {
  e.preventDefault();
  const m = $('#regMsg'), fail = (t, f) => { m.className = 'min-h-6 font-semibold msg-err'; m.textContent = t; f.focus(); };
  if (!$('#fName').value.trim()) return fail('Enter your first name(s).', $('#fName'));
  if (!$('#sName').value.trim()) return fail('Enter your surname.', $('#sName'));
  const err = validSAId($('#idNum').value.trim()); if (err) return fail(err, $('#idNum'));
  if (!$('#addr').value.trim()) return fail('Enter your residential address.', $('#addr'));
  m.className = 'min-h-6 font-semibold msg-ok'; m.textContent = 'Registration submitted. You will be notified once verified.';
  toast('Registration submitted');
});

/* Stations: queue shown with shape + word, not colour alone */
const STATIONS = [
  {n:'Orlando West High School',d:'0.6 km (8 min walk)',q:'Low',w:10},
  {n:'Vilakazi Community Hall',d:'1.4 km',q:'Moderate',w:25},
  {n:'Phefeni Senior Secondary',d:'2.1 km',q:'Low',w:5}
];
const qIcon = q => ({Low:'▽ Low',Moderate:'◇ Moderate',High:'△ High'})[q];
function renderStations(f=''){
  const m = STATIONS[0];
  $('#myStation').innerHTML = `<b class="font-display text-wine">${m.n}</b> <small class="text-mute">(VD 32840192)</small>
    <p class="mt-2 text-sm">Distance: ${m.d}<br>Hours: 07:00–21:00<br>Queue: <b>${qIcon(m.q)}</b> (about ${m.w} min)</p>
    <p class="my-3 flex flex-wrap gap-2 text-xs"><span class="rounded-lg border border-line px-2 py-1">Ramp access</span><span class="rounded-lg border border-line px-2 py-1">Restrooms</span><span class="rounded-lg border border-line px-2 py-1">Parking</span></p>
    <div class="grid grid-cols-2 gap-2"><button class="btn" id="dirBtn">Get directions</button><button class="btn ghost" id="offMap">Offline map</button></div>`;
  $('#dirBtn').onclick = () => open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(m.n + ' Soweto'));
  $('#offMap').onclick = () => toast('Map saved for offline use');
  const rows = STATIONS.slice(1).filter(s => !f || s.n.toLowerCase().includes(f.toLowerCase()));
  $('#stList').innerHTML = rows.map(s => `<li class="card flex justify-between gap-2"><span><b>${s.n}</b><br><small class="text-mute">${s.d}</small></span><span class="text-right font-bold">${qIcon(s.q)}<br><small class="font-normal">~${s.w} min</small></span></li>`).join('') || '<li class="card">No stations match your search.</li>';
}
$('#stSearch').addEventListener('input', e => renderStations(e.target.value));
renderStations();

/* Guide tabs + video */
function showTab(t){
  $$('.tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
  $$('.panel').forEach(p => p.hidden = p.id !== 'tab-' + t);
  if (t !== 'video') $$('video').forEach(v => v.pause());
}
document.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { showTab(b.dataset.tab); history.replaceState(null,'','#guide/'+b.dataset.tab); } });
[1,2].forEach(n => $('#vid'+n+' source').addEventListener('error', () => $('#vidMsg'+n).hidden = false));

/* Practice ballot: digital (select, then confirm) */
let pick = null, done = false;
function renderBallot(){
  $('#ballot').innerHTML = ['A','B','C','D'].map(o => `<li><button class="opt ${pick===o?'sel':''}" data-o="${o}" aria-pressed="${pick===o}"><span>Candidate / Option ${o} (sample)</span><span>${pick===o?'✔ Selected':''}</span></button></li>`).join('');
  $('#confirm').disabled = !pick || done;
  $('#validity').textContent = done ? '✔ Practice vote recorded. On the real tablet you will see a confirmation screen.' : pick ? `You selected Option ${pick}. Tap Confirm vote, or choose another option.` : 'Tap an option to begin.';
}
$('#ballot').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b && !done) { pick = b.dataset.o; renderBallot(); } });
$('#confirm').onclick = () => { done = true; renderBallot(); };
$('#resetBallot').onclick = () => { pick = null; done = false; renderBallot(); };
$('#readBtn').onclick = () => 'speechSynthesis' in window && speechSynthesis.speak(new SpeechSynthesisUtterance('Practice ballot. Tap one option, then tap Confirm vote.'));
renderBallot();

const saved = localStorage.getItem('im-lang'); if (saved && saved !== 'sasl') { $('#lang').value = saved; $('#lang').dispatchEvent(new Event('change')); }
route();
