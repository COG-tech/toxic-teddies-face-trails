(async () => {
  const parts = Array.from({ length: 7 }, (_, index) => `./app-v5-${index}.txt`);
  const responses = await Promise.all(parts.map(path => fetch(path, { cache: 'no-store' })));
  if (responses.some(response => !response.ok)) throw new Error('Unable to load puzzle engine');
  const encoded = (await Promise.all(responses.map(response => response.text()))).join('');
  const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  const source = new TextDecoder().decode(bytes);
  (0, eval)(source);
})().catch(error => {
  console.error(error);
  const status = document.getElementById('statusText');
  if (status) status.textContent = 'Puzzle engine failed to load';
});