(async () => {
  try {
    const [baseResponse, denseResponse] = await Promise.all([
      fetch('./compiled-app.js?v=6', { cache: 'no-store' }),
      fetch('./hard-mode-v3.js?v=6', { cache: 'no-store' }),
    ]);
    if (!baseResponse.ok || !denseResponse.ok) {
      throw new Error('Toxic Toby runtime files failed to load');
    }
    const baseSource = (await baseResponse.text()).replace(/\bboot\(\);\s*$/, '');
    const denseSource = await denseResponse.text();
    (0, eval)(`${baseSource}\n${denseSource}\nboot();`);
  } catch (error) {
    console.error(error);
    const status = document.getElementById('statusText');
    if (status) status.textContent = 'Dense Toxic Toby build failed to load';
  }
})();
