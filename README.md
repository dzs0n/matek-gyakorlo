# Matekgyakorló

Statikus HTML/CSS/JavaScript webalkalmazás, GitHub Pages-kompatibilis.

- `index.html`: főoldal, kereshető/szűrhető feladatkatalógus
- `js/catalog.js`: feladatok metaadatai (azonosító, évfolyam, tantárgy, témakör, útvonal)
- `exercises/*.html`: önálló feladatoldalak
- `js/discs.js`, `js/choose.js`, `js/existing.js`: feladatlogika
- `js/utils.js`: közös segédfüggvények
- `style.css`: közös megjelenés
- `DEVELOPMENT_PLAN.txt`: hosszabb távú terv

## Helyi futtatás

A projekt gyökerében: `python -m http.server 8000`, majd http://localhost:8000. ES modulok miatt ne közvetlenül `file://` címmel nyisd meg.

## Új feladat hozzáadása

1. Hozz létre egy `exercises/uj-feladat.html` oldalt és egy `js/uj-feladat.js` modult.
2. Add hozzá a metaadatait a `js/catalog.js` `exercises` listájához.
3. A feladat működését tartsd elkülönítve, hogy később szerveres eredménymentés is hozzáadható legyen.

A jelenlegi statisztikák munkamenethez kötöttek; a felhasználói fiók és a felhős szinkron későbbi fejlesztés.
