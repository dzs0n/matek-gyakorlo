import { randomInt, formatSeconds } from "./utils.js?v=20261114170903";

let a = 7;
let b = 12;
let correct = 0;
let total = 0;
let streak = 0;
let locked = false;
let history = [];
let nextQuestionTimer = null;

let questionStartedAt = performance.now();

const startEl = document.getElementById("start");
const targetEl = document.getElementById("target");
const answerEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const correctEl = document.getElementById("correct");
const totalEl = document.getElementById("total");
const streakEl = document.getElementById("streak");
const checkButton = document.getElementById("check");
const levelEl = document.getElementById("level");
const statsModal = document.getElementById("statsModal");

function newQuestion() {
    if (nextQuestionTimer) { clearTimeout(nextQuestionTimer); nextQuestionTimer = null; }
    const level = levelEl.value;

    if (level === "10") {
        a = randomInt(1, 9);
        b = randomInt(a + 1, 10);
    } else if (level === "20easy") {
        if (Math.random() < 0.5) {
            a = randomInt(1, 9);
            b = randomInt(a + 1, 10);
        } else {
            a = randomInt(10, 19);
            b = randomInt(a + 1, 20);
        }
    } else {
        a = randomInt(1, 19);
        b = randomInt(a + 1, 20);
    }

    startEl.textContent = a;
    targetEl.textContent = b;
    answerEl.value = "";
    feedbackEl.textContent = "";
    locked = false;
    checkButton.textContent = "Ellenőrzés";
    answerEl.disabled = false;
    questionStartedAt = performance.now();
    answerEl.focus();
}

function checkAnswer() {
    if (locked) {
        newQuestion();
        return;
    }

    const value = answerEl.value.trim();
    if (value === "") {
        feedbackEl.textContent = "Írj be egy számot!";
        feedbackEl.style.color = "#b00020";
        return;
    }

    const answer = Number(value);
    const solution = b - a;
    const seconds = (performance.now() - questionStartedAt) / 1000;
    const isCorrect = answer === solution;

    total++;

    if (isCorrect) {
        correct++;
        streak++;
        feedbackEl.textContent = "✓ Ügyes!";
        feedbackEl.style.color = "green";
    } else {
        streak = 0;
        feedbackEl.textContent = "✗ A helyes válasz: " + solution;
        feedbackEl.style.color = "red";
    }

    history.push({
        number: total,
        a: a,
        b: b,
        answer: answer,
        solution: solution,
        correct: isCorrect,
        seconds: seconds
    });

    correctEl.textContent = correct;
    totalEl.textContent = total;
    streakEl.textContent = streak;

    locked = true;
    answerEl.disabled = true;
    checkButton.textContent = "Következő";

    // Rövid ideig látszik a visszajelzés, aztán automatikusan jön a következő.
    nextQuestionTimer = setTimeout(function() {
        nextQuestionTimer = null;
        newQuestion();
    }, 1000);
}

function renderStats() {
    document.getElementById("sumTotal").textContent = total;
    document.getElementById("sumCorrect").textContent = correct;
    document.getElementById("sumPercent").textContent = total ? Math.round(correct / total * 100) + "%" : "0%";

    if (history.length) {
        const times = history.map(item => item.seconds).sort((x, y) => x - y);
        const middle = Math.floor(times.length / 2);
        const median = times.length % 2
            ? times[middle]
            : (times[middle - 1] + times[middle]) / 2;
        document.getElementById("sumAvg").textContent = formatSeconds(median);
    } else {
        document.getElementById("sumAvg").textContent = "–";
    }

    const wrap = document.getElementById("resultTableWrap");

    if (history.length === 0) {
        wrap.innerHTML = '<div class="empty-state">Még nincs megoldott feladat.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Feladat</th>
                    <th>Válasz</th>
                    <th>Helyes</th>
                    <th>Idő</th>
                    <th>Eredmény</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const item of history) {
        html += `
            <tr class="${item.correct ? 'correct-row' : 'wrong'}">
                <td>${item.number}.</td>
                <td><strong>${item.a} + ? = ${item.b}</strong></td>
                <td>${item.answer}</td>
                <td>${item.solution}</td>
                <td>${formatSeconds(item.seconds)}</td>
                <td class="${item.correct ? 'status-ok' : 'status-wrong'}">${item.correct ? '✓ jó' : '✗ hibás'}</td>
            </tr>
        `;
    }

    html += "</tbody></table>";
    wrap.innerHTML = html;
}


function downloadStatsTxt() {
    const percent = total ? Math.round(correct / total * 100) : 0;
    const times = history.map(item => item.seconds).sort((x, y) => x - y);
    const middle = Math.floor(times.length / 2);
    const median = history.length
        ? (times.length % 2 ? times[middle] : (times[middle - 1] + times[middle]) / 2)
        : 0;

    let text = "KIEGÉSZÍTÉS GYAKORLÁS – EREDMÉNY\n";
    text += "================================\n\n";
    text += `Feladatok: ${total}\n`;
    text += `Helyes: ${correct}\n`;
    text += `Eredmény: ${percent}%\n`;
    text += `Medián válaszidő: ${history.length ? formatSeconds(median) : "–"}\n\n`;
    text += "RÉSZLETES EREDMÉNYEK\n";
    text += "---------------------\n";

    for (const item of history) {
        text += `${item.number}. ${item.a} + ? = ${item.b} | válasz: ${item.answer} | helyes: ${item.solution} | idő: ${formatSeconds(item.seconds)} | ${item.correct ? "JÓ" : "HIBÁS"}\n`;
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        "_",
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0")
    ].join("");

    link.href = url;
    link.download = `kiegeszites_eredmeny_${stamp}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function showStats() {
    if (nextQuestionTimer) { clearTimeout(nextQuestionTimer); nextQuestionTimer = null; }
    renderStats();
    statsModal.classList.add("show");
}

function hideStats() {
    statsModal.classList.remove("show");
    if (!locked) answerEl.focus();
}

function resetPractice() {
    if (nextQuestionTimer) { clearTimeout(nextQuestionTimer); nextQuestionTimer = null; }
    correct = 0;
    total = 0;
    streak = 0;
    history = [];
    correctEl.textContent = "0";
    totalEl.textContent = "0";
    streakEl.textContent = "0";
    hideStats();
    newQuestion();
}

checkButton.addEventListener("click", checkAnswer);

answerEl.addEventListener("keydown", function(event) {
    if (event.key === "Enter") checkAnswer();
});

levelEl.addEventListener("change", newQuestion);
document.getElementById("reset").addEventListener("click", resetPractice);
document.getElementById("finish").addEventListener("click", showStats);
document.getElementById("closeStats").addEventListener("click", hideStats);
document.getElementById("printStats").addEventListener("click", function() { window.print(); });
document.getElementById("downloadTxt").addEventListener("click", downloadStatsTxt);
document.getElementById("continueBtn").addEventListener("click", hideStats);
document.getElementById("restartFromStats").addEventListener("click", resetPractice);

statsModal.addEventListener("click", function(event) {
    if (event.target === statsModal) hideStats();
});

newQuestion();

