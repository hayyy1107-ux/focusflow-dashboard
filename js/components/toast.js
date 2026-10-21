/**
 * FocusFlow - Toast Notification Component with Undo Support
 */

import { store } from '../store.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.currentTimeout = null;
  }

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(this.container);

    store.subscribe((state, event, data) => {
      if (event === 'undo_available' && data) {
        this.showUndoToast(data);
      } else if (event === 'undo_cleared' || event === 'undo_executed') {
        this.dismissCurrent();
      }
    });
  }

  show(message, type = 'info', duration = 3500) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0 animate-toast-in ${
      type === 'success'
        ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
        : type === 'error'
        ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
        : 'bg-slate-900/90 border-slate-700 text-slate-100'
    }`;

    toast.innerHTML = `
      <div class="flex-1">${message}</div>
      <button class="text-slate-400 hover:text-slate-200 p-1" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    toast.querySelector('button').onclick = () => toast.remove();
    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  showUndoToast(undoData) {
    this.dismissCurrent();
    const toast = document.createElement('div');
    toast.id = 'active-undo-toast';
    toast.className =
      'pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-xl shadow-2xl bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700/80 text-white text-sm font-medium backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100';

    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>${undoData.description}</span>
      </div>
      <button id="btn-undo-action" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
        Undo
      </button>
      <button id="btn-close-toast" class="text-slate-400 hover:text-slate-200 text-xs">✕</button>
    `;

    toast.querySelector('#btn-undo-action').onclick = () => {
      store.executeUndo();
      this.dismissCurrent();
    };

    toast.querySelector('#btn-close-toast').onclick = () => {
      this.dismissCurrent();
    };

    this.container.appendChild(toast);
  }

  dismissCurrent() {
    const existing = document.getElementById('active-undo-toast');
    if (existing) {
      existing.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => existing.remove(), 250);
    }
  }
}

export const toast = new ToastManager();
