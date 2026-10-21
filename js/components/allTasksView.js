/**
 * FocusFlow - All Assignments View
 * Full filterable, searchable, and sortable master assignments database.
 */

import { store } from '../store.js';
import { renderTaskCard } from './taskCard.js';

export function renderAllTasksView(container) {
  const state = store.getState();
  const allTasks = store.getTasks();
  const filtered = store.getFilteredTasks(allTasks);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>All Assignments</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              ${filtered.length} of ${allTasks.length}
            </span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Complete master list of all current and completed coursework.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Sort Selector -->
          <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span>Sort:</span>
            <select id="select-sort-by" class="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer">
              <option value="deadline-asc" ${state.sortBy === 'deadline-asc' ? 'selected' : ''}>Deadline (Earliest)</option>
              <option value="deadline-desc" ${state.sortBy === 'deadline-desc' ? 'selected' : ''}>Deadline (Latest)</option>
              <option value="priority-desc" ${state.sortBy === 'priority-desc' ? 'selected' : ''}>Priority (Highest)</option>
              <option value="title-asc" ${state.sortBy === 'title-asc' ? 'selected' : ''}>Title (A - Z)</option>
            </select>
          </div>

          <button
            type="button"
            class="btn-trigger-new-task px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Task (N)
          </button>
        </div>
      </div>

      <!-- Quick Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          class="btn-all-filter px-3 py-1.5 rounded-lg border transition-all ${
            state.quickFilter === 'all'
              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }"
          data-filter="all"
        >
          All Tasks (${allTasks.length})
        </button>
        <button
          type="button"
          class="btn-all-filter px-3 py-1.5 rounded-lg border transition-all ${
            state.quickFilter === 'pending'
              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }"
          data-filter="pending"
        >
          Pending Only (${allTasks.filter((t) => !t.completed).length})
        </button>
        <button
          type="button"
          class="btn-all-filter px-3 py-1.5 rounded-lg border transition-all ${
            state.quickFilter === 'completed'
              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }"
          data-filter="completed"
        >
          Completed (${allTasks.filter((t) => t.completed).length})
        </button>
      </div>

      <!-- Grid -->
      ${
        filtered.length === 0
          ? `
          <div class="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl">
              🔍
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">No Assignments Match Filters</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, subject filters, or priority selections.
            </p>
            <button
              type="button"
              id="btn-clear-all-filters"
              class="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        `
          : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${filtered.map((task) => renderTaskCard(task)).join('')}
          </div>
        `
      }
    </div>
  `;

  // Sort change handler
  const sortSelect = container.querySelector('#select-sort-by');
  if (sortSelect) {
    sortSelect.onchange = () => {
      store.setSortBy(sortSelect.value);
    };
  }

  // Quick filter pills
  container.querySelectorAll('.btn-all-filter').forEach((btn) => {
    btn.onclick = () => {
      store.setQuickFilter(btn.dataset.filter);
    };
  });

  const clearBtn = container.querySelector('#btn-clear-all-filters');
  if (clearBtn) {
    clearBtn.onclick = () => {
      store.clearFilters();
    };
  }
}
