/**
 * FocusFlow - Task Card Component
 * Render individual task cards with interactive controls, status toggle,
 * priority indicators, subject badges, and action dropdowns.
 */

import { dateUtils } from '../utils/dateUtils.js';
import { getSubjectStyle } from '../mockApi.js';
import { store } from '../store.js';

export function renderTaskCard(task, options = {}) {
  const isOverdue = dateUtils.isOverdue(task.deadline, task.completed);
  const isToday = dateUtils.isToday(task.deadline);
  const subjectStyle = getSubjectStyle(task.subject);

  const priorityMeta = {
    high: { label: 'High Priority', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/50', dot: 'bg-rose-500' },
    medium: { label: 'Medium', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-900/50', dot: 'bg-amber-500' },
    low: { label: 'Low', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900/50', dot: 'bg-emerald-500' }
  }[task.priority] || { label: 'Normal', badge: 'bg-slate-500/10 text-slate-500 border-slate-300', dot: 'bg-slate-500' };

  const deadlineStr = dateUtils.formatRelativeDeadline(task.deadline, task.completed);

  return `
    <div
      class="group task-card relative bg-white dark:bg-slate-800/90 rounded-xl p-4 border transition-all duration-200 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 ${
        task.completed
          ? 'border-slate-200/60 dark:border-slate-800 opacity-65 bg-slate-50/50 dark:bg-slate-900/30'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10'
          : 'border-slate-200 dark:border-slate-700/70'
      }"
      data-task-id="${task.id}"
      data-priority="${task.priority}"
      data-completed="${task.completed}"
      draggable="${options.draggable ? 'true' : 'false'}"
    >
      <div class="flex items-start gap-3">
        <!-- Checkbox -->
        <button
          type="button"
          class="btn-toggle-task mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0 cursor-pointer ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent'
          }"
          data-id="${task.id}"
          title="${task.completed ? 'Mark uncompleted' : 'Mark completed'}"
          aria-label="Toggle completed"
        >
          ${
            task.completed
              ? '<svg class="w-3.5 h-3.5 stroke-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>'
              : ''
          }
        </button>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h4 class="text-sm font-semibold leading-snug break-words text-slate-800 dark:text-slate-100 ${
              task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }">
              ${escapeHtml(task.title)}
            </h4>

            <!-- Card Actions Dropdown Trigger -->
            <div class="relative flex-shrink-0">
              <button
                type="button"
                class="btn-task-menu p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                data-id="${task.id}"
                title="Task options"
                aria-label="Task options"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Notes preview if present -->
          ${
            task.notes
              ? `<p class="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">${escapeHtml(
                  task.notes
                )}</p>`
              : ''
          }

          <!-- Metadata Badges -->
          <div class="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <!-- Subject Badge -->
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium border ${subjectStyle.bg} ${subjectStyle.text} ${subjectStyle.border}">
              <span class="w-1.5 h-1.5 rounded-full ${subjectStyle.dot}"></span>
              ${escapeHtml(task.subject)}
            </span>

            <!-- Priority Badge -->
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border ${priorityMeta.badge}">
              <span class="w-1.5 h-1.5 rounded-full ${priorityMeta.dot}"></span>
              ${priorityMeta.label}
            </span>

            <!-- Estimated study time -->
            ${
              task.estimatedMinutes
                ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50">
                    <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    ${task.estimatedMinutes}m
                  </span>`
                : ''
            }

            <!-- Deadline Badge -->
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
              task.completed
                ? 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                : isOverdue
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-300 dark:border-rose-900/50 font-semibold'
                : isToday
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800/60'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60'
            }">
              <svg class="w-3 h-3 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              ${deadlineStr}
            </span>
          </div>

          <!-- Quick Action Bar (Visible or on hover) -->
          <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2 text-xs text-slate-500">
            <div class="flex items-center gap-1">
              ${
                isOverdue
                  ? `<button type="button" class="btn-reschedule-today px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium transition-colors" data-id="${task.id}" title="Move deadline to today">
                      Move to Today
                    </button>`
                  : ''
              }
            </div>

            <div class="flex items-center gap-1 ml-auto">
              <button
                type="button"
                class="btn-edit-task p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                data-id="${task.id}"
                title="Edit task"
                aria-label="Edit"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button
                type="button"
                class="btn-delete-task p-1 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                data-id="${task.id}"
                title="Delete task"
                aria-label="Delete"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
