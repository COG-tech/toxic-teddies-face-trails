# GitHub Pages Startup Incident

Observed symptom on Android Chrome:

- static Toxic Teddies header rendered;
- collection counter rendered as `0 / 5`;
- How to Play and Settings buttons rendered;
- no Teddy cards appeared;
- no puzzle could be opened.

Root cause:

- GitHub Pages was serving the raw repository `index.html`;
- that file loads `src/app/bootstrap.js` directly;
- the source bootstrap imports JSON modules and Capacitor packages that are resolved by Vite during the production build;
- raw GitHub Pages hosting therefore stopped before `renderHome()` populated the Teddy grid.

Resolution:

- build the browser application through Vite;
- publish the verified output under `/play/`;
- redirect the GitHub Pages root to `/play/`;
- retain the same built output model used by Capacitor.
