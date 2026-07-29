(() => {
  const gameView = document.getElementById('gameView');
  const boardBackdrop = document.getElementById('boardBackdrop');
  if (!gameView || !boardBackdrop) return;

  const syncGameplayBackdrop = () => {
    const image = boardBackdrop.style.backgroundImage;
    const active = Boolean(image && image !== 'none');

    gameView.classList.toggle('has-gameplay-backdrop', active);
    if (!active) {
      gameView.style.removeProperty('--gameplay-backdrop-image');
      gameView.style.removeProperty('--gameplay-backdrop-position');
      return;
    }

    gameView.style.setProperty('--gameplay-backdrop-image', image);
    gameView.style.setProperty(
      '--gameplay-backdrop-position',
      boardBackdrop.style.backgroundPosition || '50% 50%',
    );
  };

  new MutationObserver(syncGameplayBackdrop).observe(boardBackdrop, {
    attributes: true,
    attributeFilter: ['style'],
  });

  syncGameplayBackdrop();
})();
