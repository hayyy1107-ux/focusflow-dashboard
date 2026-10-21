/**
 * FocusFlow - Pomodoro Focus Session Timer Modal
 * Helps students execute focused study intervals with audible completion bells.
 */

import { soundManager } from '../utils/audio.js';

export class PomodoroModalManager {
  constructor() {
    this.modalEl = null;
    this.timerId = null;
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.isRunning = false;
    this.currentMode = 'focus'; // 'focus' | 'short' | 'long'
  }

  init() {
    if (this.modalEl) return;

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'pomodoro-modal-root';
    this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm hidden transition-opacity duration-200';
    document.body.appendChild(this.modalEl);

    this.modalEl.onclick = (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    };
  }

  open() {
    this.init();
    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    this.pause();
    if (mode === 'focus') this.totalSeconds = 25 * 60;
    else if (mode === 'short') this.totalSeconds = 5 * 60;
    else if (mode === 'long') this.totalSeconds = 15 * 60;
    this.remainingSeconds = this.totalSeconds;
    this.render();
  }

  toggleStartPause() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    this.render();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.updateTimeDisplay();
      } else {
        this.pause();
        soundManager.playTimerBell();
        alert(this.currentMode === 'focus' ? '🎉 Focus session completed! Take a break!' : '⚡ Break over! Ready for next session?');
        this.render();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.render();
  }

  formatTime(totalSecs) {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  updateTimeDisplay() {
    const textEl = this.modalEl.querySelector('#pomodoro-time-text');
    const ringEl = this.modalEl.querySelector('#pomodoro-ring');
    if (textEl) {
      textEl.textContent = this.formatTime(this.remainingSeconds);
    }
    if (ringEl) {
      const radius = 54;
      const circumference = 2 * Math.PI * radius;
      const fraction = this.remainingSeconds / this.totalSeconds;
      ringEl.style.strokeDashoffset = String(circumference - fraction * circumference);
    }
  }

  render() {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const fraction = this.remainingSeconds / this.totalSeconds;
    const offset = circumference - fraction * circumference;

    this.modalEl.innerHTML = `
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xl">⏱️</span>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Study Focus Timer</h3>
          </div>
          <button type="button" id="btn-pomodoro-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
        </div>

        <!-- Mode Tabs -->
        <div class="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 text-xs font-semibold">
          <button type="button" class="btn-pomo-mode py-1.5 rounded-lg transition-all ${this.currentMode === 'focus' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" data-mode="focus">
            Focus (25m)
          </button>
          <button type="button" class="btn-pomo-mode py-1.5 rounded-lg transition-all ${this.currentMode === 'short' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" data-mode="short">
            Short (5m)
          </button>
          <button type="button" class="btn-pomo-mode py-1.5 rounded-lg transition-all ${this.currentMode === 'long' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" data-mode="long">
            Long (15m)
          </button>
        </div>

        <!-- Timer Circle -->
        <div class="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="${radius}" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="8" fill="transparent" />
            <circle
              id="pomodoro-ring"
              cx="60"
              cy="60"
              r="${radius}"
              class="stroke-indigo-600 transition-all duration-300"
              stroke-width="8"
              stroke-linecap="round"
              fill="transparent"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span id="pomodoro-time-text" class="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
              ${this.formatTime(this.remainingSeconds)}
            </span>
            <span class="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
              ${this.currentMode === 'focus' ? 'Deep Work' : 'Break Time'}
            </span>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            id="btn-pomo-start"
            class="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center gap-2 ${
              this.isRunning ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }"
          >
            ${this.isRunning ? 'Pause' : 'Start Focus'}
          </button>
          <button
            type="button"
            id="btn-pomo-reset"
            class="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>

      </div>
    `;

    this.modalEl.querySelector('#btn-pomodoro-close').onclick = () => this.close();
    this.modalEl.querySelector('#btn-pomo-start').onclick = () => this.toggleStartPause();
    this.modalEl.querySelector('#btn-pomo-reset').onclick = () => this.reset();

    this.modalEl.querySelectorAll('.btn-pomo-mode').forEach((btn) => {
      btn.onclick = () => this.setMode(btn.dataset.mode);
    });
  }
}

export const pomodoroModal = new PomodoroModalManager();
