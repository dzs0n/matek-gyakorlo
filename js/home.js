import { exercises } from "./catalog.js";
const grade = document.getElementById("grade");
const subject = document.getElementById("subject");
const list = document.getElementById("exerciseList");
for (const s of [...new Set(exercises.map(x => x.subject))]) subject.add(new Option(s, s));

function disc(color) {
  const d = document.createElement('span'); d.className = 'home-disc'; d.style.background = color; return d;
}
function beadRow(count, color) {
  const row = document.createElement('span'); row.className = 'home-bead-row';
  for (let i=0;i<5;i++) {
    const cell=document.createElement('span'); cell.className='home-bead-cell';
    if(i<count) cell.append(disc(color));
    row.append(cell);
  }
  return row;
}
function iconFor(code) {
  const box=document.createElement('span'); box.className='home-illustration'; box.setAttribute('aria-hidden','true');
  if(code==='m.1') { box.append(beadRow(5,'#3B82F6'),beadRow(3,'#3B82F6')); }
  else if(code==='m.2'||code==='m.3') {
    const first=document.createElement('span'); first.className='home-math-row'; first.append(beadRow(3,'#e54a4a'));
    const sign=document.createElement('b'); sign.textContent=code==='m.2'?'+':'−'; first.append(sign);
    first.append(beadRow(2,'#20a660')); box.append(first);
  } else {
    const formula=document.createElement('span'); formula.className='home-formula';
    formula.textContent=code==='m.4'?'? + ? = 10':code==='m.5'?'8 + 5 = ?':'? + 4 = 10';
    box.append(formula);
  }
  return box;
}
function numberLine(code) {
  const max=code==='m.5'||code==='m.6'?20:10;
  const from=code==='m.1'?1:code==='m.2'?2:code==='m.3'?0:code==='m.4'?10:code==='m.5'?11:0;
  const to=code==='m.1'?10:code==='m.2'?9:code==='m.3'?9:code==='m.4'?10:code==='m.5'?18:20;
  const wrap=document.createElement('div'); wrap.className='home-numberline';
  wrap.setAttribute('aria-label',`Számkör: ${from}–${to}`);
  const line=document.createElement('div'); line.className='home-numberline-track';
  const fill=document.createElement('span'); fill.className='home-numberline-fill';
  fill.style.left=(from/max*100)+'%'; fill.style.width=((to-from)/max*100)+'%'; line.append(fill);
  const ticks=document.createElement('div'); ticks.className='home-numberline-ticks';
  const marks=max===10?[0,2,4,6,8,10]:[0,5,10,15,20];
  for(const mark of marks){const tick=document.createElement('span');tick.textContent=mark;ticks.append(tick);}
  wrap.append(line,ticks);
  const range=document.createElement('div');range.className='home-range-caption';range.textContent=`Számkör: ${from}–${to}`;wrap.append(range);
  return wrap;
}
function render() {
  const filtered=exercises.filter(x=>(grade.value==='all'||x.grades.includes(Number(grade.value)))&&(subject.value==='all'||x.subject===subject.value));
  list.replaceChildren();
  for(const x of filtered){
    const a=document.createElement('a');a.href=x.url;a.className='mode-card home-exercise-card';
    const meta=document.createElement('div');meta.className='home-card-meta';
    const id=document.createElement('span');id.className='home-exercise-id';id.textContent=x.id;
    const klass=document.createElement('span');klass.className='home-grade';klass.textContent=x.id==='m.1'?'0. szint · 1. évfolyam':x.grades.join('–')+'. évfolyam';
    meta.append(id,klass);
    const title=document.createElement('strong');title.textContent=x.title;
    const desc=document.createElement('small');desc.textContent=x.description;
    a.append(meta,iconFor(x.id),title,desc,numberLine(x.id));list.append(a);
  }
  if(!filtered.length) list.textContent='Nincs ilyen feladat.';
}
for(const select of [grade,subject]) select.addEventListener('change',render);
render();
