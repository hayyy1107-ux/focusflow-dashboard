/**
 * FocusFlow - Upcoming Deadlines View
 * Organizes future assignments into chronological horizons:
 * Tomorrow, This Week, and Later.
 */

import { store } from '../store.js';
import { renderTaskCard } from './taskCard.js';
import { dateUtils } from '../utils/dateUtils.js';

export function renderUpcomingView(container) {
  const upcomingTasks = store.getUpcomingTasks();
  const filtered = store.getFilteredTasks(upcomingTasks);

  // Group into Tomorrow, This Week (days 2 to 7), and Later (> 7 days)
  const tomorrowTasks = [];
  const thisWeekTasks = [];
  const laterTasks = [];

  filtered.forEach((task) => {
    if (dateUtils.isTomorrow(task.deadline)) {
      tomorrowTasks.push(task);
    } else {
      const diff = dateUtils.getDaysDifference(task.deadline);
      if (diff > 1 && diff <= 7) {
        thisWeekTasks.push(task);
      } else {
        laterTasks.push(task);
      }
    }
  });

  const renderSection = (title, count, tasks, badgeColor = 'indigo') => {
    if (tasks.length === 0) return '';
    return `
      <div class="space-y-3">
        <div class="flex items-center gap-2 pb-1 border-b border-slate-200/80 dark:border-slate-800">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            ${title}
          </h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            ${count}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${tasks.map((task) => renderTaskCard(task)).join('')}
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Upcoming Deadlines</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              ${filtered.length} upcoming
            </span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Chronological roadmap of your upcoming coursework and projects.
          </p>
        </div>

        <button
          type="button"
          class="btn-trigger-new-task self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Task (N)
        </button>
      </div>

      <!-- Sections -->
      ${
        filtered.length === 0
          ? `
          <div class="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl">
              📅
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">No Upcoming Deadlines</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You don't have any upcoming assignments scheduled beyond today.
            </p>
          </div>
        `
          : `
          <div class="space-y-8">
            ${renderSection('Tomorrow', tomorrowTasks.length, tomorrowTasks)}
            ${renderSection('This Week (Next 2-7 Days)', thisWeekTasks.length, thisWeekTasks)}
            ${renderSection('Later Deadlines', laterTasks.length, laterTasks)}
          </div>
        `
      }
    </div>
  `;
}
