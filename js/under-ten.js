(() => {
'use strict';
const $ = id => document.getElementById(id);
const session = MatekShared.create({anchor:'.practice-head', modal:'#underStatsModal'});
const modal = $('underStatsModal');
let difficulty = 'easy';
let queue = [], current = null, started = 0, errors = 0, attempts = 0, locked = false, history = [], nextTimeout = null;
const allPairs = [];
for (let a = 1; a <= 8; a++) {
  for (let b = 1; b <= 9 - a; b++) allPairs.push([a,b]);
}
function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function next() {
  if (nextTimeout !== null) { clearTimeout(nextTimeout); nextTimeout = null; }
  if (!queue.length) queue = shuffle(allPairs.map(p => [...p]));
  current = queue.pop();
  started = performance.now(); errors = 0; attempts = 0; locked = false;
  const [a,b] = current;
  $('underEquation').innerHTML = '<span style="color:#e23c3c">'+a+'</span> + <span style="color:#159e50">'+b+'</span> = ?';
  const frame = $('underFrame'); frame.replaceChildren();
  frame.style.display = difficulty === 'easy' ? '' : 'none';
  for (let i = 0; i < 10; i++) {
    const cell = document.createElement('div');
    cell.className = 'ten-cell under-cell';
    if (i < a + b) {
      const disc = document.createElement('span');
      disc.className = 'ten-disc ' + (i < a ? 'ten-red' : 'ten-green');
      cell.appendChild(disc);
    }
    frame.appendChild(cell);
  }
  $('underInput').value = '';
  $('underInput').disabled = false;
  $('underSubmit').disabled = false;
  $('underFeedback').textContent = '';
  $('underInput').focus({preventScroll:true});
}
function submit(e) {
  e.preventDefault();
  if (locked || !current) return;
  const value = $('underInput').value.trim();
  if (!/^\d+$/.test(value)) return;
  attempts++;
  const answer = Number(value), [a,b] = current;
  if (answer !== a+b) {
    errors++;
    $('underInput').select();
    return;
  }
  locked = true;
  const seconds = (performance.now() - started) / 1000;
  history.push({a,b,result:a+b,difficulty,seconds,attempts,errors,firstTry:errors===0});
  session.record({correct:errors===0,seconds});
  $('underInput').disabled = true;
  $('underSubmit').disabled = true;
  $('underFeedback').textContent = '✓';
  nextTimeout = setTimeout(next, 900);
}
function renderDetails() {
  const first = history.filter(x => x.firstTry).length;
  const mean = history.length ? (history.reduce((s,x)=>s+x.seconds,0)/history.length).toFixed(1) : '–';
  $('underDetails').innerHTML = '<p>Elsőre helyes: <strong>'+first+' / '+history.length+'</strong> · Átlagos válaszidő: <strong>'+mean+' mp</strong></p>';
}
function close() { modal.classList.remove('show'); }
$('underForm').addEventListener('submit',submit);
$('underDifficulty').addEventListener('change',e=>{ difficulty=e.target.value; next(); });
$('underStatsBtn').addEventListener('click',()=>{if(nextTimeout!==null){clearTimeout(nextTimeout);nextTimeout=null;}renderDetails();modal.classList.add('show');});
$('underClose').addEventListener('click',close);
$('underContinue').addEventListener('click',()=>{close();if(locked)next();});
modal.addEventListener('click',e=>{if(e.target===modal)close();});
$('underRestart').addEventListener('click',()=>{close();queue=[];history=[];session.reset();next();});
$('underDownload').addEventListener('click',()=>{
  const rows = [['Feladat','Nehezseg','Elso tag','Masodik tag','Eredmeny','Ido (mp)','Probalkozas','Hibas probalkozasok','Elsore helyes'],...history.map((x,i)=>[i+1,x.difficulty==='easy'?'Konnyu':'Nehez',x.a,x.b,x.result,x.seconds.toFixed(2),x.attempts,x.errors,x.firstTry?'igen':'nem'])];
  const csv = '\uFEFF' + rows.map(row=>row.join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='osszeadas-10-alatt.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
next();
})();
