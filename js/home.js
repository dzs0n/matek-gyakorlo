import { exercises } from "./catalog.js?v=20261114170903";
const grade = document.getElementById("grade");
const subject = document.getElementById("subject");
const topic = document.getElementById("topic");
const list = document.getElementById("exerciseList");
for (const s of [...new Set(exercises.map(x => x.subject))]) subject.add(new Option(s, s));
for (const t of [...new Set(exercises.map(x => x.topic))]) topic.add(new Option(t, t));
function render() {
  const filtered = exercises.filter(x => (grade.value === "all" || x.grades.includes(Number(grade.value))) && (subject.value === "all" || x.subject === subject.value) && (topic.value === "all" || x.topic === topic.value));
  list.replaceChildren();
  for (const x of filtered) {
    const a = document.createElement("a"); a.href = x.url; a.className = "mode-card";
    const icon = document.createElement("span"); icon.className = "mode-icon"; icon.textContent = x.icon;
    const title = document.createElement("strong"); title.textContent = x.title;
    const desc = document.createElement("small"); desc.textContent = `${x.subject} · ${x.grades.join("–")}. évfolyam · ${x.topic}\n${x.description}`;
    a.append(icon, title, desc); list.append(a);
  }
  if (!filtered.length) list.textContent = "Nincs ilyen feladat.";
}
for (const select of [grade, subject, topic]) select.addEventListener("change", render);
render();
