(async () => {
  try {
    const [baseResponse, denseResponse, fallbackResponse, interactionResponse] = await Promise.all([
      fetch('./compiled-app.js?v=27', { cache: 'no-store' }),
      fetch('./hard-mode-v3.js?v=27', { cache: 'no-store' }),
      fetch('./dense-fallback.js?v=27', { cache: 'no-store' }),
      fetch('./interaction-fix.js?v=27', { cache: 'no-store' }),
    ]);
    if (!baseResponse.ok || !denseResponse.ok || !fallbackResponse.ok || !interactionResponse.ok) {
      throw new Error('Toxic Toby runtime files failed to load');
    }
    const baseSource = (await baseResponse.text()).replace(/\bboot\(\);\s*$/, '');
    const denseSource = await denseResponse.text();
    const fallbackSource = await fallbackResponse.text();
    const interactionSource = await interactionResponse.text();
    (0, eval)(`${baseSource}\n${denseSource}\n${fallbackSource}\n${interactionSource}\nboot();`);
  } catch (error) {
    console.error(error);
    const status = document.getElementById('statusText');
    if (status) status.textContent = 'Dense Toxic Toby build failed to load';
  }
})();
