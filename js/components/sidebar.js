/**
 * FocusFlow - Navigation Sidebar & Mobile Drawer Component
 * Handles desktop sidebar navigation, quick subject filtering,
 * storage utilities, and responsive mobile bottom nav.
 */

import { store } from '../store.js';
import { mockApi, getSubjectStyle } from '../mockApi.js';
import { toast } from './toast.js';
import { taskModal } from './taskModal.js';
import { pomodoroModal } from './pomodoroModal.js';

export function renderSidebar(container) {
  const state = store.getState();
  const counts = store.getCounts();
  const subjects = store.getSubjectsList();
  const todayStats = store.getTodayStats();

  const navItems = [
    {
      id: 'today',
      label: "Today's Focus",
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
      badge: counts.todayPending > 0 ? counts.todayPending : counts.today,
      badgeColor: counts.todayPending > 0 ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
    },
    {
      id: 'board',
      label: 'Priority Board',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>`,
      badge: counts.highPriority > 0 ? `${counts.highPriority} High` : null,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    },
    {
      id: 'overdue',
      label: 'Overdue Tasks',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
      badge: counts.overdue,
      badgeColor: counts.overdue > 0 ? 'bg-rose-500 text-white font-bold animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
    },
    {
      id: 'upcoming',
      label: 'Upcoming Deadlines',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      badge: counts.upcoming,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500'
    },
    {
      id: 'all',
      label: 'All Assignments',
      icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
      badge: counts.all,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-500'
    }
  ];

  container.innerHTML = `
    <div class="h-full flex flex-col justify-between p-4">
      
      <!-- Top Section: Brand & Nav Links -->
      <div class="space-y-6">
        
        <!-- App Logo & Brand -->
        <div class="flex items-center gap-2.5 px-2 py-1">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <div class="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>FocusFlow</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">PRO</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium">Student Dashboard</p>
          </div>
        </div>

        <!-- Main Navigation Links -->
        <nav class="space-y-1">
          ${navItems
            .map(
              (item) => `
            <button
              type="button"
              class="nav-tab-btn w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                state.currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }"
              data-view="${item.id}"
            >
              <div class="flex items-center gap-2.5">
                <span class="${state.currentView === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}">
                  ${item.icon}
                </span>
                <span>${item.label}</span>
              </div>

              ${
                item.badge !== null && item.badge !== undefined
                  ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      state.currentView === item.id ? 'bg-white/20 text-white' : item.badgeColor
                    }">
                      ${item.badge}
                    </span>`
                  : ''
              }
            </button>
          `
            )
            .join('')}
        </nav>

        <!-- Mini Progress Card -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-700 dark:text-slate-300">Daily Target</span>
            <span class="text-indigo-600 dark:text-indigo-400 font-bold">${todayStats.percent}%</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div class="bg-indigo-600 h-full rounded-full transition-all duration-300" style="width: ${todayStats.percent}%"></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span>${todayStats.completed}/${todayStats.total} done</span>
            <span>${Math.round(todayStats.remainingMinutes)}m left</span>
          </div>
        </div>

        <!-- Subject Filter Tags -->
        <div class="space-y-2">
          <div class="flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Filter by Course</span>
            ${
              state.filterSubject !== 'all'
                ? `<button type="button" id="btn-reset-subject" class="text-indigo-600 dark:text-indigo-400 hover:underline lowercase font-normal">reset</button>`
                : ''
            }
          </div>
          <div class="flex flex-wrap gap-1 px-1 max-h-36 overflow-y-auto">
            <button
              type="button"
              class="subject-chip px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                state.filterSubject === 'all'
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }"
              data-subject="all"
            >
              All
            </button>
            ${subjects
              .map((sub) => {
                const style = getSubjectStyle(sub);
                const active = state.filterSubject === sub;
                return `
                <button
                  type="button"
                  class="subject-chip px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? `${style.bg} ${style.text} ${style.border} font-bold ring-2 ring-indigo-500/40`
                      : 'border-transparent bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }"
                  data-subject="${sub}"
                >
                  ${sub}
                </button>
              `;
              })
              .join('')}
          </div>
        </div>

      </div>

      <!-- Bottom Utilities -->
      <div class="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        <button
          type="button"
          id="btn-sidebar-focus-timer"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
        >
          <span>⏱️</span>
          <span>Focus Session (P)</span>
        </button>

        <div class="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <button type="button" id="btn-export-json" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Export JSON
          </button>
          <span>•</span>
          <button type="button" id="btn-reset-sample" class="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Reset Demo
          </button>
        </div>
      </div>

    </div>
  `;

  // Attach Navigation Listeners
  container.querySelectorAll('.nav-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      const view = btn.dataset.view;
      store.setCurrentView(view);
      // Close mobile drawer if open
      const drawer = document.getElementById('mobile-drawer-root');
      if (drawer) drawer.classList.add('hidden');
    };
  });

  // Subject chip filters
  container.querySelectorAll('.subject-chip').forEach((btn) => {
    btn.onclick = () => {
      store.setFilterSubject(btn.dataset.subject);
    };
  });

  const resetSubBtn = container.querySelector('#btn-reset-subject');
  if (resetSubBtn) {
    resetSubBtn.onclick = () => store.setFilterSubject('all');
  }

  // Timer
  const timerBtn = container.querySelector('#btn-sidebar-focus-timer');
  if (timerBtn) {
    timerBtn.onclick = () => pomodoroModal.open();
  }

  // Demo reset
  const resetBtn = container.querySelector('#btn-reset-sample');
  if (resetBtn) {
    resetBtn.onclick = async () => {
      if (confirm('Reset dashboard to fresh sample student assignments?')) {
        await store.resetData();
        toast.show('Dashboard reset with sample student assignments!', 'success');
      }
    };
  }

  // Export JSON
  const exportBtn = container.querySelector('#btn-export-json');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const json = mockApi.exportJSON(store.getTasks());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focusflow-assignments-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show('Assignments backup exported successfully!', 'success');
    };
  }
}
