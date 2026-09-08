import { CAM_PRESETS } from '../config/constants.js';

export function createUIManager({
  onSpeedChange,
  onCameraChange,
  onPilotToggle
}) {
  const sliderSpeed = document.getElementById('slider-speed');
  const speedVal = document.getElementById('speed-val');
  const metricFps = document.getElementById('metric-fps');

  const btnPilotNav = document.getElementById('btn-pilot-nav');
  const btnPilotSidebar = document.getElementById('btn-pilot-sidebar');
  const btnExitPilot = document.getElementById('btn-exit-pilot');

  const modalProjects = document.getElementById('modal-projects');
  const modalSkills = document.getElementById('modal-skills');
  const modalAbout = document.getElementById('modal-about');
  const modals = {
    projects: modalProjects,
    skills: modalSkills,
    about: modalAbout
  };

  let frameCount = 0;
  let lastFpsTime = performance.now();

  function initUI() {
    // 1. Speed Slider Listener
    if (sliderSpeed) {
      sliderSpeed.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (speedVal) speedVal.innerText = `${value.toFixed(1)}x`;
        if (onSpeedChange) onSpeedChange(value);
      });
    }

    // 2. Camera Focus Preset Buttons
    const allCamButtons = document.querySelectorAll('.btn-cam');
    allCamButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewKey = btn.dataset.view;

        allCamButtons.forEach(b => {
          if (b.dataset.view === viewKey) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        if (onCameraChange) onCameraChange(viewKey);
      });
    });

    // 3. Pilot Mode Toggle Handlers
    if (btnPilotNav) btnPilotNav.addEventListener('click', () => onPilotToggle());
    if (btnPilotSidebar) btnPilotSidebar.addEventListener('click', () => onPilotToggle());
    if (btnExitPilot) btnExitPilot.addEventListener('click', () => onPilotToggle(false));

    // 4. Modal Triggers & Close Buttons
    document.querySelectorAll('.btn-nav').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        openModal(target);
      });
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        closeAllModals();
      });
    });

    Object.values(modals).forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeAllModals();
          }
        });
      }
    });
  }

  function openModal(modalKey) {
    closeAllModals();
    if (modals[modalKey]) {
      modals[modalKey].classList.remove('hidden');
    }
  }

  function closeAllModals() {
    Object.values(modals).forEach(modal => {
      if (modal) modal.classList.add('hidden');
    });
  }

  function updateFps() {
    frameCount++;
    const now = performance.now();
    if (now >= lastFpsTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
      if (metricFps) metricFps.innerText = `${fps} FPS`;
      frameCount = 0;
      lastFpsTime = now;
    }
  }

  initUI();

  return {
    openModal,
    closeAllModals,
    updateFps
  };
}
