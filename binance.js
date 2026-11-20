'use strict';
/* Verify results on BNB Chain (the blockchain backed by Binance). Read-only: no wallet and no keys in the browser.
   The company's backend publishes a fingerprint (hash) of the final results in a transaction; this page checks it. */
(() => {
  const RPCS = ['https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.defibit.io']; // public BNB Chain nodes; swap for your own provider if needed
  const HASH = /^0x[0-9a-fA-F]{64}$/;
  async function rpc(method, params = []){
    let last;
    for (const u of RPCS) {
      try {
        const r = await fetch(u, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({jsonrpc:'2.0', id:1, method, params})});
        const j = await r.json(); if (j.error) throw new Error(j.error.message); return j.result;
      } catch (e) { last = e; }
    }
    throw last;
  }
  async function status(){
    const el = $('#bnbStatus');
    try { el.textContent = '✔ Connected to BNB Chain. Latest block: ' + parseInt(await rpc('eth_blockNumber'), 16).toLocaleString(); }
    catch (e) { el.textContent = '✖ Could not reach BNB Chain. Check your internet and try again.'; }
  }
  const out = (t, ok, link) => { const el = $('#bnbResult'); el.className = 'mt-4 font-semibold ' + (ok ? 'msg-ok' : 'msg-err'); el.textContent = t;
    if (link) { const a = document.createElement('a'); a.href = link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = ' View on BscScan'; a.className = 'underline'; el.append(a); } };
  $('#bnbForm').addEventListener('submit', async e => {
    e.preventDefault();
    const tx = $('#txHash').value.trim(), root = $('#rootHash').value.trim();
    if (!HASH.test(tx)) return out('Enter a valid transaction hash (0x followed by 64 characters).', false);
    if (!HASH.test(root)) return out('Enter a valid results fingerprint (0x followed by 64 characters).', false);
    out('Checking…', true);
    try {
      const t = await rpc('eth_getTransactionByHash', [tx]);
      if (!t) return out('Transaction not found on BNB Chain.', false);
      if (!t.blockNumber) return out('This transaction is still pending. Try again soon.', false);
      const b = await rpc('eth_getBlockByNumber', [t.blockNumber, false]), when = new Date(parseInt(b.timestamp, 16) * 1000).toLocaleString();
      const match = t.input.toLowerCase().includes(root.slice(2).toLowerCase());
      out(match ? `✔ Match. This fingerprint was published in block ${parseInt(t.blockNumber, 16).toLocaleString()} on ${when}.` : '✖ No match. This transaction does not contain that fingerprint.', match, 'https://bscscan.com/tx/' + tx);
    } catch (err) { out('Could not check right now. Try again later.', false); }
  });
  addEventListener('hashchange', () => location.hash === '#verify' && status());
  if (location.hash === '#verify') status();
})();
