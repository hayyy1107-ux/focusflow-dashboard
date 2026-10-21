/**
 * FocusFlow - Task Creation & Edit Modal
 * Supports rapid assignment creation, quick date presets,
 * subject selection, and priority toggling.
 */

import { store } from '../store.js';
import { dateUtils } from '../utils/dateUtils.js';

export class TaskModalManager {
  constructor() {
    this.modalEl = null;
    this.isEditing = false;
    this.currentEditingId = null;
  }

  init() {
    if (this.modalEl) return;

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'task-modal-root';
    this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm hidden transition-opacity duration-200';
    document.body.appendChild(this.modalEl);

    // Close on backdrop click
    this.modalEl.onclick = (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    };
  }

  openCreate() {
    this.isEditing = false;
    this.currentEditingId = null;

    const defaultDeadline = new Date();
    defaultDeadline.setHours(18, 0, 0, 0);

    const initial = {
      title: '',
      subject: 'Computer Science',
      deadline: dateUtils.toInputDateTime(defaultDeadline),
      priority: 'medium',
      estimatedMinutes: 45,
      notes: ''
    };

    this.render(initial);
  }

  openEdit(task) {
    this.isEditing = true;
    this.currentEditingId = task.id;

    const initial = {
      title: task.title,
      subject: task.subject,
      deadline: dateUtils.toInputDateTime(task.deadline),
      priority: task.priority,
      estimatedMinutes: task.estimatedMinutes || 45,
      notes: task.notes || ''
    };

    this.render(initial);
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
  }

  render(data) {
    this.init();
    const subjects = store.getSubjectsList();

    this.modalEl.innerHTML = `
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
              ${this.isEditing ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ${this.isEditing ? 'Update assignment details and deadlines.' : 'Add to your daily workflow and track progress.'}
            </p>
          </div>
          <button type="button" id="btn-modal-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form -->
        <form id="task-form" class="mt-4 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assignment Title <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              autofocus
              value="${escapeAttr(data.title)}"
              placeholder="e.g. Calculus Problem Set 4"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
            />
          </div>

          <!-- Subject & Priority Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Subject -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course / Subject <span class="text-rose-500">*</span>
              </label>
              <select
                name="subject"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                ${subjects
                  .map(
                    (s) => `<option value="${escapeAttr(s)}" ${data.subject === s ? 'selected' : ''}>${escapeAttr(s)}</option>`
                  )
                  .join('')}
                <option value="custom">+ New Subject...</option>
              </select>
              <input
                type="text"
                id="custom-subject-input"
                placeholder="Type course name"
                class="mt-2 hidden w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level <span class="text-rose-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <label class="cursor-pointer text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  data.priority === 'high' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }">
                  <input type="radio" name="priority" value="high" class="sr-only" ${data.priority === 'high' ? 'checked' : ''} />
                  High
                </label>
                <label class="cursor-pointer text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  data.priority === 'medium' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }">
                  <input type="radio" name="priority" value="medium" class="sr-only" ${data.priority === 'medium' ? 'checked' : ''} />
                  Med
                </label>
                <label class="cursor-pointer text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  data.priority === 'low' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }">
                  <input type="radio" name="priority" value="low" class="sr-only" ${data.priority === 'low' ? 'checked' : ''} />
                  Low
                </label>
              </div>
            </div>
          </div>

          <!-- Deadline with Quick Presets -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deadline <span class="text-rose-500">*</span>
              </label>
              <span class="text-[11px] text-slate-400">Date & Time</span>
            </div>
            <input
              type="datetime-local"
              id="deadline-input"
              name="deadline"
              required
              value="${data.deadline}"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <!-- Quick Presets -->
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <button type="button" class="btn-preset px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" data-preset="today-evening">
                Today 6:00 PM
              </button>
              <button type="button" class="btn-preset px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" data-preset="tonight">
                Tonight 11:59 PM
              </button>
              <button type="button" class="btn-preset px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" data-preset="tomorrow">
                Tomorrow
              </button>
              <button type="button" class="btn-preset px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors" data-preset="in3days">
                In 3 Days
              </button>
            </div>
          </div>

          <!-- Estimated Study Duration -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Study Time (minutes)
            </label>
            <div class="flex items-center gap-2">
              <input
                type="number"
                name="estimatedMinutes"
                min="5"
                max="600"
                step="5"
                value="${data.estimatedMinutes}"
                class="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div class="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto">
                <button type="button" class="btn-time-chip px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200" data-mins="25">25m</button>
                <button type="button" class="btn-time-chip px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200" data-mins="45">45m</button>
                <button type="button" class="btn-time-chip px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200" data-mins="60">60m</button>
                <button type="button" class="btn-time-chip px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200" data-mins="90">90m</button>
                <button type="button" class="btn-time-chip px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200" data-mins="120">2h</button>
              </div>
            </div>
          </div>

          <!-- Notes / Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assignment Notes & Checkpoints (Optional)
            </label>
            <textarea
              name="notes"
              rows="3"
              placeholder="Add key instructions, textbook pages, links, or sub-tasks..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition-all leading-relaxed"
            >${escapeHtml(data.notes)}</textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="btn-cancel"
              class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>${this.isEditing ? 'Save Changes' : 'Create Assignment'}</span>
            </button>
          </div>
        </form>

      </div>
    `;

    this.modalEl.classList.remove('hidden');

    // Attach listeners
    this.modalEl.querySelector('#btn-modal-close').onclick = () => this.close();
    this.modalEl.querySelector('#btn-cancel').onclick = () => this.close();

    // Priority radio style updates
    const form = this.modalEl.querySelector('#task-form');
    const priorityLabels = form.querySelectorAll('input[name="priority"]');
    priorityLabels.forEach((radio) => {
      radio.onchange = () => {
        form.querySelectorAll('label').forEach((lbl) => {
          if (lbl.querySelector('input[name="priority"]')) {
            const r = lbl.querySelector('input[name="priority"]');
            lbl.className = `cursor-pointer text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
              r.checked
                ? r.value === 'high'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : r.value === 'medium'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`;
          }
        });
      };
    });

    // Custom subject input toggle
    const subjectSelect = form.querySelector('select[name="subject"]');
    const customSubjectInput = form.querySelector('#custom-subject-input');
    subjectSelect.onchange = () => {
      if (subjectSelect.value === 'custom') {
        customSubjectInput.classList.remove('hidden');
        customSubjectInput.focus();
      } else {
        customSubjectInput.classList.add('hidden');
      }
    };

    // Deadline presets
    const deadlineInput = form.querySelector('#deadline-input');
    form.querySelectorAll('.btn-preset').forEach((btn) => {
      btn.onclick = () => {
        const now = new Date();
        const p = btn.dataset.preset;
        if (p === 'today-evening') {
          now.setHours(18, 0, 0, 0);
        } else if (p === 'tonight') {
          now.setHours(23, 59, 0, 0);
        } else if (p === 'tomorrow') {
          now.setDate(now.getDate() + 1);
          now.setHours(17, 0, 0, 0);
        } else if (p === 'in3days') {
          now.setDate(now.getDate() + 3);
          now.setHours(23, 59, 0, 0);
        }
        deadlineInput.value = dateUtils.toInputDateTime(now);
      };
    });

    // Time chips
    const minsInput = form.querySelector('input[name="estimatedMinutes"]');
    form.querySelectorAll('.btn-time-chip').forEach((btn) => {
      btn.onclick = () => {
        minsInput.value = btn.dataset.mins;
      };
    });

    // Form submit
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      let subject = formData.get('subject');
      if (subject === 'custom') {
        subject = customSubjectInput.value.trim() || 'General';
      }

      const taskData = {
        title: formData.get('title'),
        subject: subject,
        priority: formData.get('priority') || 'medium',
        deadline: new Date(formData.get('deadline')).toISOString(),
        estimatedMinutes: parseInt(formData.get('estimatedMinutes'), 10) || 45,
        notes: formData.get('notes')
      };

      if (this.isEditing && this.currentEditingId) {
        await store.updateTask(this.currentEditingId, taskData);
      } else {
        await store.addTask(taskData);
      }

      this.close();
    };
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}

export const taskModal = new TaskModalManager();
