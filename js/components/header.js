/**
 * FocusFlow - Top Header Component
 * Contains branding, global search with hotkey badge, subject & priority filter dropdowns,
 * theme toggle, sound effects switch, and quick creation button.
 */

import { store } from '../store.js';
import { dateUtils } from '../utils/dateUtils.js';
import { soundManager } from '../utils/audio.js';
import { taskModal } from './taskModal.js';
import { shortcutsModal } from './shortcutsModal.js';
import { pomodoroModal } from './pomodoroModal.js';

export function renderHeader(container) {
  const state = store.getState();
  const subjects = store.getSubjectsList();
  const todayFormatted = dateUtils.formatHeaderDate();
  const isMuted = soundManager.isMuted();

  container.innerHTML = `
    <header class="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div class="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        
        <!-- Left: Mobile Menu Trigger & Title / Date -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            id="btn-mobile-sidebar-toggle"
            class="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          <div class="hidden sm:block">
            <div class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              ${todayFormatted}
            </div>
            <div class="text-sm font-bold text-slate-800 dark:text-slate-100">
              Student Focus Dashboard
            </div>
          </div>
        </div>

        <!-- Center: Global Search Bar -->
        <div class="flex-1 max-w-md mx-2">
          <div class="relative flex items-center">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              id="global-search-input"
              value="${escapeAttr(state.searchQuery)}"
              placeholder="Search assignments, courses, notes..."
              class="w-full pl-9 pr-12 py-1.5 sm:py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <kbd class="hidden sm:inline-block absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs">
              /
            </kbd>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          
          <!-- Subject Filter Dropdown (Header compact) -->
          <div class="hidden lg:flex items-center text-xs">
            <select
              id="header-subject-filter"
              class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              ${subjects
                .map((s) => `<option value="${escapeAttr(s)}" ${state.filterSubject === s ? 'selected' : ''}>${escapeAttr(s)}</option>`)
                .join('')}
            </select>
          </div>

          <!-- Priority Filter Dropdown -->
          <div class="hidden lg:flex items-center text-xs">
            <select
              id="header-priority-filter"
              class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all" ${state.filterPriority === 'all' ? 'selected' : ''}>All Priorities</option>
              <option value="high" ${state.filterPriority === 'high' ? 'selected' : ''}>🔴 High Priority</option>
              <option value="medium" ${state.filterPriority === 'medium' ? 'selected' : ''}>🟡 Medium Priority</option>
              <option value="low" ${state.filterPriority === 'low' ? 'selected' : ''}>🟢 Low Priority</option>
            </select>
          </div>

          <!-- Pomodoro Timer Trigger -->
          <button
            type="button"
            id="btn-timer-trigger"
            class="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Focus Timer (P)"
            aria-label="Pomodoro Timer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>

          <!-- Audio Sound Effects Toggle -->
          <button
            type="button"
            id="btn-sound-toggle"
            class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="${isMuted ? 'Unmute sounds' : 'Mute sounds'}"
            aria-label="Sound toggle"
          >
            ${
              isMuted
                ? '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>'
                : '<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>'
            }
          </button>

          <!-- Theme Toggle (Brownie point: Dark/light theme with persisted preference) -->
          <button
            type="button"
            id="btn-theme-toggle"
            class="p-2 rounded-xl text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark / Light theme (D)"
            aria-label="Toggle Theme"
          >
            ${
              state.theme === 'dark'
                ? '<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
                : '<svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>'
            }
          </button>

          <!-- Keyboard Shortcuts Modal Trigger -->
          <button
            type="button"
            id="btn-shortcuts-trigger"
            class="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Keyboard Shortcuts (?)"
            aria-label="Shortcuts"
          >
            <span class="text-xs font-bold font-mono">?</span>
          </button>

          <!-- Primary + New Task Button -->
          <button
            type="button"
            id="btn-create-task-header"
            class="btn-trigger-new-task px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            title="Create Assignment (N)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span class="hidden sm:inline">New Task</span>
            <kbd class="hidden md:inline-block px-1 rounded text-[10px] bg-indigo-700/50 font-mono">N</kbd>
          </button>

        </div>
      </div>
    </header>
  `;

  // Attach Listeners
  const searchInput = container.querySelector('#global-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      store.setSearchQuery(e.target.value);
    };
  }

  const subjectFilter = container.querySelector('#header-subject-filter');
  if (subjectFilter) {
    subjectFilter.onchange = (e) => {
      store.setFilterSubject(e.target.value);
    };
  }

  const priorityFilter = container.querySelector('#header-priority-filter');
  if (priorityFilter) {
    priorityFilter.onchange = (e) => {
      store.setFilterPriority(e.target.value);
    };
  }

  const themeBtn = container.querySelector('#btn-theme-toggle');
  if (themeBtn) {
    themeBtn.onclick = () => store.toggleTheme();
  }

  const soundBtn = container.querySelector('#btn-sound-toggle');
  if (soundBtn) {
    soundBtn.onclick = () => {
      soundManager.toggleMute();
      renderHeader(container);
    };
  }

  const timerBtn = container.querySelector('#btn-timer-trigger');
  if (timerBtn) {
    timerBtn.onclick = () => pomodoroModal.open();
  }

  const shortcutsBtn = container.querySelector('#btn-shortcuts-trigger');
  if (shortcutsBtn) {
    shortcutsBtn.onclick = () => shortcutsModal.open();
  }

  const createBtn = container.querySelector('#btn-create-task-header');
  if (createBtn) {
    createBtn.onclick = () => taskModal.openCreate();
  }

  const mobileSidebarBtn = container.querySelector('#btn-mobile-sidebar-toggle');
  if (mobileSidebarBtn) {
    mobileSidebarBtn.onclick = () => {
      const drawer = document.getElementById('mobile-drawer-root');
      if (drawer) drawer.classList.remove('hidden');
    };
  }
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}
