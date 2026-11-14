import { randomInt, formatSeconds } from "./utils.js?v=20261114203631";
let selectedRed = null;
let selectedGreen = null;
let choiceChecked = false;
let targetChoiceRed = null;
let choiceStartedAt = performance.now();
let choiceHistory = [];
let choiceNextTimer = null;
const choiceModal = document.getElementById('choiceStatsModal');
const matekSession = MatekShared.create({anchor:'.practice-head',modal:'#choiceStatsModal'});

function renderChoiceDiscs() {
    const grid = document.getElementById('choiceDiscGrid');
    grid.replaceChildren();
    for (let i = 0; i < 10; i++) {
        const disc = document.createElement('div');
        disc.className = 'disc ' + (i < targetChoiceRed ? 'red' : 'green');
        grid.appendChild(disc);
    }
}
function renderChoices() {
    for (const [color, parentId, selected] of [['red','redChoices',selectedRed], ['green','greenChoices',selectedGreen]]) {
        const parent = document.getElementById(parentId);
        parent.replaceChildren();
        for (let number = 1; number <= 9; number++) {
            const btn = document.createElement('button');
            btn.className = `number-choice ${color}-choice` + (number === selected ? ` selected-${color}` : '');
            btn.textContent = number;
            btn.disabled = choiceChecked;
            btn.setAttribute('aria-pressed', number === selected ? 'true' : 'false');
            btn.addEventListener('click', () => {
                if (choiceChecked) return;
                if (color === 'red') selectedRed = number;
                else selectedGreen = number;
                renderChoices();
                if (selectedRed !== null && selectedGreen !== null) submitChoice();
            });
            parent.appendChild(btn);
        }
    }
    document.getElementById('choiceResult').innerHTML = `<span class="red-text">${selectedRed ?? '?'}</span> + <span class="green-text">${selectedGreen ?? '?'}</span> = 10`;
}
function nextChoiceExercise() {
    if (choiceNextTimer !== null) { clearTimeout(choiceNextTimer); choiceNextTimer = null; }
    let next;
    do { next = randomInt(1, 9); } while (next === targetChoiceRed);
    targetChoiceRed = next;
    selectedRed = null;
    selectedGreen = null;
    choiceChecked = false;
    document.getElementById('choiceFeedback').textContent = '';
    renderChoiceDiscs();
    renderChoices();
    choiceStartedAt = performance.now();
}
function updateChoiceProgress() {
    const correctCount = choiceHistory.filter(x => x.correct).length;
    document.getElementById('choiceProgress').textContent = `${choiceHistory.length} feladat · ${correctCount} helyes`;
}
function submitChoice() {
    if (choiceChecked || selectedRed === null || selectedGreen === null) return;
    choiceChecked = true;
    const correctChoice = selectedRed === targetChoiceRed && selectedGreen === 10 - targetChoiceRed;
    const seconds = (performance.now() - choiceStartedAt) / 1000;
    matekSession.record({correct: correctChoice, seconds});
    choiceHistory.push({number: choiceHistory.length + 1, red: targetChoiceRed, green: 10 - targetChoiceRed, selectedRed, selectedGreen, correct: correctChoice, seconds});
    const feedback = document.getElementById('choiceFeedback');
    feedback.textContent = correctChoice ? '✓ Jó!' : `✗ Rossz! A helyes válasz: ${targetChoiceRed} + ${10 - targetChoiceRed}`;
    feedback.style.color = correctChoice ? '#14843e' : '#b00020';
    updateChoiceProgress();
    renderChoices();
    choiceNextTimer = setTimeout(() => { choiceNextTimer = null; nextChoiceExercise(); }, 1600);
}
function choiceMedian() {
    if (!choiceHistory.length) return null;
    const times = choiceHistory.map(x => x.seconds).sort((a,b) => a-b);
    const mid = Math.floor(times.length / 2);
    return times.length % 2 ? times[mid] : (times[mid-1]+times[mid])/2;
}
function renderChoiceStats() {
    const total = choiceHistory.length;
    const correctCount = choiceHistory.filter(x => x.correct).length;
    document.getElementById('choiceSumTotal').textContent = total;
    document.getElementById('choiceSumCorrect').textContent = correctCount;
    document.getElementById('choiceSumPercent').textContent = total ? Math.round(correctCount/total*100)+'%' : '0%';
    const median = choiceMedian();
    document.getElementById('choiceSumMedian').textContent = median === null ? '–' : formatSeconds(median);
    const wrap = document.getElementById('choiceStatsTable');
    if (!total) { wrap.innerHTML = '<div class="empty-state">Még nincs megoldott feladat.</div>'; return; }
    const rows = choiceHistory.map(x => `<tr class="${x.correct ? 'correct-row' : 'wrong'}"><td>${x.number}.</td><td>${x.red} + ${x.green} = 10</td><td>${x.selectedRed} + ${x.selectedGreen}</td><td>${formatSeconds(x.seconds)}</td><td class="${x.correct ? 'status-ok' : 'status-wrong'}">${x.correct ? '✓ jó' : '✗ hibás'}</td></tr>`).join('');
    wrap.innerHTML = `<table><thead><tr><th>#</th><th>Feladat</th><th>Válasz</th><th>Idő</th><th>Eredmény</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function openChoiceStats() {
    if (choiceNextTimer !== null) { clearTimeout(choiceNextTimer); choiceNextTimer = null; }
    renderChoiceStats();
    choiceModal.classList.add('show');
}
function closeChoiceStats() {
    choiceModal.classList.remove('show');
    if (choiceChecked) nextChoiceExercise();
    else choiceStartedAt = performance.now();
}
function restartChoicePractice() {
    choiceHistory = [];
    matekSession.reset();
    updateChoiceProgress();
    choiceModal.classList.remove('show');
    nextChoiceExercise();
}
function downloadChoiceStats() {
    const total = choiceHistory.length;
    const correctCount = choiceHistory.filter(x => x.correct).length;
    const median = choiceMedian();
    let content = 'KORONGOS GYAKORLÁS – EREDMÉNY\n================================\n\n';
    content += `Feladatok: ${total}\nHelyes: ${correctCount}\nEredmény: ${total ? Math.round(correctCount/total*100) : 0}%\nMedián válaszidő: ${median === null ? '–' : formatSeconds(median)}\n\nRÉSZLETES EREDMÉNYEK\n---------------------\n`;
    for (const x of choiceHistory) content += `${x.number}. ${x.red} + ${x.green} = 10 | válasz: ${x.selectedRed} + ${x.selectedGreen} | idő: ${formatSeconds(x.seconds)} | ${x.correct ? 'JÓ' : 'HIBÁS'}\n`;
    const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    link.href = url;
    link.download = `korongos_eredmeny_${stamp}.txt`;
    document.body.appendChild(link);
    link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.getElementById('choiceStatsBtn').addEventListener('click', openChoiceStats);
document.getElementById('closeChoiceStats').addEventListener('click', closeChoiceStats);
document.getElementById('continueChoiceStats').addEventListener('click', closeChoiceStats);
document.getElementById('restartChoiceStats').addEventListener('click', restartChoicePractice);
document.getElementById('printChoiceStats').addEventListener('click', () => window.print());
document.getElementById('downloadChoiceStats').addEventListener('click', downloadChoiceStats);
choiceModal.addEventListener('click', e => {if(e.target === choiceModal) closeChoiceStats();});
function resetChoiceExercise() { restartChoicePractice(); }
resetChoiceExercise();

