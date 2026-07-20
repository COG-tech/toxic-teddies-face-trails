(async () => {
  const parts = Array.from({ length: 7 }, (_, index) => `./app-v5-${index}.txt`);
  const [responses, fixResponse] = await Promise.all([
    Promise.all(parts.map(path => fetch(path, { cache: 'no-store' }))),
    fetch('./overlap-fix.js', { cache: 'no-store' })
  ]);
  if (responses.some(response => !response.ok) || !fixResponse.ok) throw new Error('Unable to load puzzle engine');
  const encoded = (await Promise.all(responses.map(response => response.text()))).join('');
  const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  const engineSource = new TextDecoder().decode(bytes).replace(/\bboot\(\);\s*$/, '');
  const overlapFix = await fixResponse.text();
  (0, eval)(`${engineSource}\n${overlapFix}\nboot();`);
})().catch(error => {
  console.error(error);
  const status = document.getElementById('statusText');
  if (status) status.textContent = 'Puzzle engine failed to load';
});