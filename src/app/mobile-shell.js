const SETTINGS = {
  reducedMotion: 'settings:reduced-motion',
  highContrast: 'settings:high-contrast',
  touchAssistance: 'settings:touch-assistance',
};

function asBoolean(value, fallback = false) {
  if (value == null) return fallback;
  return value === true || value === 'true';
}

async function installResearchControls(settingsModal) {
  const analytics = window.ToxicAnalytics;
  if (!analytics || !settingsModal) return;

  const card = settingsModal.querySelector('.modal-card');
  const closeButton = document.getElementById('closeSettingsButton');
  if (!card || !closeButton) return;

  const section = document.createElement('section');
  section.className = 'research-controls';
  section.setAttribute('aria-labelledby', 'researchControlsTitle');
  section.innerHTML = `
    <h4 id="researchControlsTitle">Research tools</h4>
    <label class="setting-row">
      <span><strong>Research build</strong><small>Stores approved local study events. No raw touch coordinates or personal identity.</small></span>
      <input id="researchBuildToggle" type="checkbox" />
    </label>
    <button id="exportResearchButton" class="secondary-button full" type="button">Copy research data</button>
    <button id="clearResearchButton" class="secondary-button full" type="button">Clear research data</button>
    <p id="researchExportStatus" class="build-info" role="status"></p>
  `;
  card.insertBefore(section, closeButton);

  const toggle = document.getElementById('researchBuildToggle');
  const status = document.getElementById('researchExportStatus');
  toggle.checked = analytics.isResearchBuild();
  toggle.addEventListener('change', async () => {
    await analytics.setResearchBuild(toggle.checked);
    status.textContent = toggle.checked
      ? 'Research event logging enabled on this device.'
      : 'Research event logging remains local but this session is not marked as a study build.';
  });

  document.getElementById('exportResearchButton')?.addEventListener('click', async () => {
    const payload = await analytics.exportResearchData();
    const serialized = JSON.stringify(payload, null, 2);
    window.__TOXIC_RESEARCH_EXPORT__ = serialized;
    try {
      await navigator.clipboard.writeText(serialized);
      status.textContent = `Copied ${payload.event_count} local events. Paste them into the participant JSON file.`;
    } catch {
      status.textContent = `Prepared ${payload.event_count} events in window.__TOXIC_RESEARCH_EXPORT__.`;
    }
  });

  document.getElementById('clearResearchButton')?.addEventListener('click', async () => {
    await analytics.clear();
    status.textContent = 'Local research events cleared.';
  });
}

export async function installMobileShell(bridge) {
  const root = document.documentElement;
  const settingsModal = document.getElementById('settingsModal');
  const howToModal = document.getElementById('howToModal');

  function applySetting(name, value) {
    if (name === 'reducedMotion') root.classList.toggle('reduced-motion', value);
    if (name === 'highContrast') root.classList.toggle('high-contrast', value);
    if (name === 'touchAssistance') root.classList.toggle('touch-assistance', value);
  }

  async function bindToggle(id, name, defaultValue = false) {
    const input = document.getElementById(id);
    if (!input) return;
    const stored = await bridge.loadSetting(SETTINGS[name]);
    const value = asBoolean(stored, defaultValue);
    input.checked = value;
    applySetting(name, value);
    input.addEventListener('change', async () => {
      applySetting(name, input.checked);
      await bridge.saveSetting(SETTINGS[name], input.checked);
      window.dispatchEvent(new CustomEvent('toxic-settings-changed', {
        detail: {name, value: input.checked},
      }));
    });
  }

  await Promise.all([
    bindToggle('reducedMotionToggle', 'reducedMotion', matchMedia('(prefers-reduced-motion: reduce)').matches),
    bindToggle('highContrastToggle', 'highContrast', false),
    bindToggle('touchAssistanceToggle', 'touchAssistance', true),
  ]);

  const build = window.ToxicBuildInfo;
  const buildElement = document.getElementById('buildInfo');
  if (buildElement && build) {
    buildElement.textContent = `Version ${build.version || build.appVersion} (${build.build || build.iosBuildNumber}) · Content ${build.contentVersion} · ${build.integrity?.fileCount || 0} files verified`;
  }
  await installResearchControls(settingsModal);

  function openModal(modal, trigger) {
    if (!modal) return;
    modal.dataset.returnFocus = trigger?.id || '';
    modal.classList.remove('hidden');
    modal.querySelector('button, input, [tabindex="0"]')?.focus();
  }

  function closeModal(modal) {
    if (!modal || modal.classList.contains('hidden')) return false;
    modal.classList.add('hidden');
    const triggerId = modal.dataset.returnFocus;
    if (triggerId) document.getElementById(triggerId)?.focus();
    return true;
  }

  const settingsButton = document.getElementById('settingsButton');
  const howToButton = document.getElementById('howToButton');
  settingsButton?.addEventListener('click', () => openModal(settingsModal, settingsButton));
  howToButton?.addEventListener('click', () => openModal(howToModal, howToButton));
  document.getElementById('closeSettingsButton')?.addEventListener('click', () => closeModal(settingsModal));
  document.getElementById('closeHowToButton')?.addEventListener('click', () => closeModal(howToModal));

  document.getElementById('shareButton')?.addEventListener('click', async () => {
    const summary = window.__toxicCurrentLevelSummary || {
      title: 'Toxic Teddies: Arrow Escape',
      text: 'I cleared a Toxic Teddies face puzzle. The face is the puzzle.',
    };
    await bridge.shareResult(summary);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (closeModal(settingsModal)) return;
    if (closeModal(howToModal)) return;
    const feed = document.getElementById('feedView');
    if (feed && !feed.classList.contains('hidden')) document.getElementById('feedBackButton')?.click();
  });

  bridge.onBack(() => {
    if (closeModal(settingsModal) || closeModal(howToModal)) return true;
    const accessibleModal = document.getElementById('accessibleMovesModal');
    if (accessibleModal && !accessibleModal.classList.contains('hidden')) {
      window.ToxicAccessibility?.closeMoves();
      return true;
    }
    const feed = document.getElementById('feedView');
    if (feed && !feed.classList.contains('hidden')) {
      document.getElementById('feedBackButton')?.click();
      return true;
    }
    const game = document.getElementById('gameView');
    if (game && !game.classList.contains('hidden')) {
      document.getElementById('backButton')?.click();
      return true;
    }
    return false;
  });
}
