/**
 * FocusFlow - Today's Daily Focus View
 * Presents today's assignments, the daily progress ring, study workload estimate,
 * and quick-filter subtabs (All, Pending, Completed).
 */

import { store } from '../store.js';
import { renderProgressRing } from './progressRing.js';
import { renderTaskCard } from './taskCard.js';

let todaySubFilter = 'all'; // 'all' | 'pending' | 'completed'

export function renderTodayView(container) {
  const allTodayTasks = store.getTodayTasks();
  const filtered = store.getFilteredTasks(allTodayTasks);

  let displayed = filtered;
  if (todaySubFilter === 'pending') {
    displayed = filtered.filter((t) => !t.completed);
  } else if (todaySubFilter === 'completed') {
    displayed = filtered.filter((t) => t.completed);
  }

  const counts = {
    all: filtered.length,
    pending: filtered.filter((t) => !t.completed).length,
    completed: filtered.filter((t) => t.completed).length
  };

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Progress Ring Banner -->
      <div id="today-progress-container"></div>

      <!-- Section Title & Sub-filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Today's Assignments</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              ${counts.pending} to do
            </span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Focus on what matters most for today's deadlines.
          </p>
        </div>

        <!-- Filter tabs: All / Pending / Completed -->
        <div class="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            class="sub-filter-btn px-3 py-1.5 rounded-lg transition-all ${
              todaySubFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }"
            data-sub="all"
          >
            All (${counts.all})
          </button>
          <button
            type="button"
            class="sub-filter-btn px-3 py-1.5 rounded-lg transition-all ${
              todaySubFilter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }"
            data-sub="pending"
          >
            Pending (${counts.pending})
          </button>
          <button
            type="button"
            class="sub-filter-btn px-3 py-1.5 rounded-lg transition-all ${
              todaySubFilter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }"
            data-sub="completed"
          >
            Completed (${counts.completed})
          </button>
        </div>
      </div>

      <!-- Task List Grid -->
      ${
        displayed.length === 0
          ? renderEmptyState()
          : `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${displayed.map((task) => renderTaskCard(task)).join('')}
            </div>`
      }
    </div>
  `;

  // Render the progress ring inside the banner container
  renderProgressRing('today-progress-container');

  // Subfilter clicks
  container.querySelectorAll('.sub-filter-btn').forEach((btn) => {
    btn.onclick = () => {
      todaySubFilter = btn.dataset.sub;
      renderTodayView(container);
    };
  });
}

function renderEmptyState() {
  const stats = store.getTodayStats();
  if (stats.allCompleted && stats.total > 0) {
    return `
      <div class="p-10 text-center rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
          🎯
        </div>
        <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">All Today's Assignments Crushed!</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          You've completed every task scheduled for today. Take a well-deserved break or get a head start on tomorrow!
        </p>
        <button
          type="button"
          class="btn-trigger-new-task mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
        >
          + Add another assignment
        </button>
      </div>
    `;
  }

  return `
    <div class="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
      <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl">
        📚
      </div>
      <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">No Assignments Found</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        No tasks matching this view. Ready to plan your study session?
      </p>
      <button
        type="button"
        class="btn-trigger-new-task mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
      >
        + Add Assignment (Press N)
      </button>
    </div>
  `;
}
