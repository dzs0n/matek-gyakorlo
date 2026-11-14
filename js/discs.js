import { randomInt } from "./utils.js";

const grid = document.getElementById('discGrid');
const form = document.getElementById('discAnswerForm');
const answer = document.getElementById('discAnswer');
const session = MatekShared.create({anchor:'.practice-head', title:'Számold meg a korongokat'});
let count = -1;
let startedAt = performance.now();
let locked = false;

function nextExercise() {
  let next;
  do { next = randomInt(1, 10); } while (next === count);
  count = next;
  locked = false;
  startedAt = performance.now();
  answer.value = '';
  grid.replaceChildren();
  for (let i = 0; i < 10; i++) {
    const cell = document.createElement('div');
    cell.className = 'disc' + (i < count ? '' : ' empty');
    grid.appendChild(cell);
  }
  grid.setAttribute('aria-label', `${count} kék korong ötös elrendezésben`);
  answer.focus({preventScroll:true});
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (locked || answer.value.trim() === '') return;
  const submitted = Number(answer.value);
  if (!Number.isInteger(submitted) || submitted !== count) return;
  locked = true;
  session.record({correct:true, seconds:(performance.now()-startedAt)/1000});
  nextExercise();
});

document.getElementById('discsStats').addEventListener('click', () => session.showOwnStats());
nextExercise();
