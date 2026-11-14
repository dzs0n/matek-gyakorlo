import { randomInt } from "./utils.js?v=20261114170903";
let redDiscCount = 0;
let discAnswerVisible = false;
function renderDiscs() {
    const grid = document.getElementById('discGrid');
    grid.replaceChildren();
    for (let i = 0; i < 10; i++) {
        const disc = document.createElement('div');
        disc.className = 'disc ' + (i < redDiscCount ? 'red' : 'green');
        grid.appendChild(disc);
    }
    document.getElementById('discEquation').innerHTML = discAnswerVisible
        ? `<span class="red-text">${redDiscCount}</span> + <span class="green-text">${10-redDiscCount}</span> = 10`
        : '<span class="red-text">?</span> + <span class="green-text">?</span> = 10';
    document.getElementById('toggleDiscs').textContent = discAnswerVisible ? 'Takard el a választ' : 'Mutasd a választ';
}
function newDiscExercise() {
    // Ne legyen kétszer egymás után ugyanaz a feladat.
    let next;
    do { next = randomInt(0, 10); } while (next === redDiscCount);
    redDiscCount = next;
    discAnswerVisible = false;
    renderDiscs();
}
document.getElementById('newDiscs').addEventListener('click', newDiscExercise);
document.getElementById('toggleDiscs').addEventListener('click', () => { discAnswerVisible = !discAnswerVisible; renderDiscs(); });


newDiscExercise();
