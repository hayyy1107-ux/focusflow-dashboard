/**
 * FocusFlow - Drag-and-Drop Priority Board Component
 * Kanban-style board with columns for High, Medium, Low, and Completed tasks.
 * Supports HTML5 native drag-and-drop + SortableJS touch fallback.
 */

import { store } from '../store.js';
import { renderTaskCard } from './taskCard.js';

export function renderPriorityBoard(container) {
  const allTasks = store.getTasks();
  const filtered = store.getFilteredTasks(allTasks);

  // Group tasks into columns
  const highTasks = filtered.filter((t) => t.priority === 'high' && !t.completed);
  const mediumTasks = filtered.filter((t) => t.priority === 'medium' && !t.completed);
  const lowTasks = filtered.filter((t) => t.priority === 'low' && !t.completed);
  const completedTasks = filtered.filter((t) => t.completed);

  const columns = [
    {
      id: 'high',
      title: 'High Priority',
      color: 'rose',
      dotClass: 'bg-rose-500',
      headerBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
      tasks: highTasks,
      icon: '🔥'
    },
    {
      id: 'medium',
      title: 'Medium Priority',
      color: 'amber',
      dotClass: 'bg-amber-500',
      headerBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      tasks: mediumTasks,
      icon: '⚡'
    },
    {
      id: 'low',
      title: 'Low Priority',
      color: 'emerald',
      dotClass: 'bg-emerald-500',
      headerBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      tasks: lowTasks,
      icon: '🌱'
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'indigo',
      dotClass: 'bg-indigo-500',
      headerBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
      tasks: completedTasks,
      icon: '✅'
    }
  ];

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Board Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Priority Board</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Drag & Drop Enabled
            </span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Drag cards between columns to reprioritize or mark assignments completed.
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

      <!-- Kanban Columns Container -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        ${columns
          .map(
            (col) => `
          <div
            class="kanban-column bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[500px] transition-all duration-200"
            data-column-id="${col.id}"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between p-2 mb-2 rounded-xl border ${col.headerBg}">
              <div class="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                <span>${col.icon}</span>
                <span>${col.title}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800/80 shadow-xs">
                ${col.tasks.length}
              </span>
            </div>

            <!-- Drop Zone / Cards List -->
            <div
              class="column-drop-zone flex-1 flex flex-col gap-3 min-h-[380px] p-1 rounded-xl transition-all duration-200"
              data-column-id="${col.id}"
            >
              ${
                col.tasks.length === 0
                  ? `<div class="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center select-none text-slate-400 dark:text-slate-600 text-xs">
                      <span>Drop tasks here</span>
                    </div>`
                  : col.tasks.map((task) => renderTaskCard(task, { draggable: true })).join('')
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  // Attach Drag & Drop handlers
  setupDragAndDrop(container);
}

function setupDragAndDrop(container) {
  let draggedTaskId = null;

  // 1. Native HTML5 Drag Handlers
  const cards = container.querySelectorAll('.task-card[draggable="true"]');
  cards.forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedTaskId = card.dataset.taskId;
      card.classList.add('opacity-40', 'scale-95');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedTaskId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('opacity-40', 'scale-95');
      draggedTaskId = null;
      container.querySelectorAll('.kanban-column').forEach((c) => {
        c.classList.remove('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
      });
    });
  });

  const dropZones = container.querySelectorAll('.column-drop-zone');
  dropZones.forEach((zone) => {
    const col = zone.closest('.kanban-column');

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (col) {
        col.classList.add('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
      }
    });

    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget) && col) {
        col.classList.remove('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
      }
    });

    zone.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (col) {
        col.classList.remove('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
      }
      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
      const targetColumnId = zone.dataset.columnId;

      if (taskId && targetColumnId) {
        await store.moveTaskPriority(taskId, targetColumnId);
      }
    });
  });

  // 2. SortableJS enhancement if available on window
  if (typeof window.Sortable !== 'undefined') {
    dropZones.forEach((zone) => {
      try {
        new window.Sortable(zone, {
          group: 'focusflow-kanban',
          animation: 150,
          ghostClass: 'opacity-40',
          chosenClass: 'scale-95',
          dragClass: 'shadow-2xl',
          onEnd: async (evt) => {
            const targetZone = evt.to;
            const targetColumn = targetZone.dataset.columnId;
            const itemEl = evt.item;
            const taskId = itemEl.dataset.taskId;
            if (taskId && targetColumn) {
              await store.moveTaskPriority(taskId, targetColumn);
            }
          }
        });
      } catch (err) {
        console.warn('Sortable init error:', err);
      }
    });
  }
}
