/**
 * FocusFlow - Keyboard Shortcuts Modal Component
 * Displays a sleek visual cheat sheet of all available shortcuts.
 */

export class ShortcutsModalManager {
  constructor() {
    this.modalEl = null;
  }

  init() {
    if (this.modalEl) return;

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'shortcuts-modal-root';
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
    const shortcuts = [
      { key: 'N', desc: 'Create new assignment' },
      { key: '/', desc: 'Focus global search input' },
      { key: 'D', desc: 'Toggle dark / light theme' },
      { key: 'P', desc: 'Open Pomodoro Focus Timer' },
      { key: '1', desc: 'Switch to Today\'s Focus view' },
      { key: '2', desc: 'Switch to Priority Board' },
      { key: '3', desc: 'Switch to Upcoming Deadlines' },
      { key: '4', desc: 'Switch to Overdue view' },
      { key: '5', desc: 'Switch to All Assignments' },
      { key: '?', desc: 'Show this shortcuts guide' },
      { key: 'Esc', desc: 'Close dialogs or clear search' }
    ];

    this.modalEl.innerHTML = `
      <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">⌨️</span>
            <div>
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Power navigation for quick study workflows</p>
            </div>
          </div>
          <button type="button" id="btn-shortcuts-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-1">
          ${shortcuts
            .map(
              (s) => `
            <div class="py-2.5 flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">${s.desc}</span>
              <kbd class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                ${s.key}
              </kbd>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            id="btn-shortcuts-ok"
            class="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Got it (Esc)
          </button>
        </div>

      </div>
    `;

    this.modalEl.classList.remove('hidden');
    this.modalEl.querySelector('#btn-shortcuts-close').onclick = () => this.close();
    this.modalEl.querySelector('#btn-shortcuts-ok').onclick = () => this.close();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }
}

export const shortcutsModal = new ShortcutsModalManager();
