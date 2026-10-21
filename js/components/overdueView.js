/**
 * FocusFlow - Overdue Tasks View
 * Highlights missed assignment deadlines with urgency indicators
 * and 1-click single/bulk rescheduling actions.
 */

import { store } from '../store.js';
import { renderTaskCard } from './taskCard.js';
import { dateUtils } from '../utils/dateUtils.js';

export function renderOverdueView(container) {
  const overdueTasks = store.getOverdueTasks();
  const filtered = store.getFilteredTasks(overdueTasks);

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Overdue Alert Banner -->
      <div class="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent dark:from-rose-950/30 dark:via-amber-950/20 p-5 rounded-2xl border border-rose-300 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg flex-shrink-0">
            ⚠️
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Overdue Assignments (${filtered.length})
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              These deadlines have passed. Update their status or reschedule them to get back on track.
            </p>
          </div>
        </div>

        ${
          filtered.length > 0
            ? `<button
                type="button"
                id="btn-reschedule-all"
                class="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Reschedule All to Today
              </button>`
            : ''
        }
      </div>

      <!-- Overdue List -->
      ${
        filtered.length === 0
          ? `
          <div class="p-12 text-center rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl">
              ✨
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Zero Overdue Assignments!</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You're completely up to date with your coursework. Great job staying ahead of deadlines!
            </p>
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

  // Reschedule all button handler
  const btnRescheduleAll = container.querySelector('#btn-reschedule-all');
  if (btnRescheduleAll) {
    btnRescheduleAll.onclick = async () => {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 0, 0);
      const iso = todayEnd.toISOString();

      for (const t of filtered) {
        await store.rescheduleTask(t.id, iso);
      }
      renderOverdueView(container);
    };
  }
}
