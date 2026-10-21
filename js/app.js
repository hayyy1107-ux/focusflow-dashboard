/**
 * FocusFlow - Main Application Coordinator & Orchestrator
 */

import { store } from './store.js';
import { renderHeader } from './components/header.js';
import { renderSidebar } from './components/sidebar.js';
import { renderTodayView } from './components/todayView.js';
import { renderPriorityBoard } from './components/priorityBoard.js';
import { renderOverdueView } from './components/overdueView.js';
import { renderUpcomingView } from './components/upcomingView.js';
import { renderAllTasksView } from './components/allTasksView.js';
import { taskModal } from './components/taskModal.js';
import { shortcutsModal } from './components/shortcutsModal.js';
import { pomodoroModal } from './components/pomodoroModal.js';
import { toast } from './components/toast.js';

class FocusFlowApp {
  constructor() {
    this.headerEl = null;
    this.sidebarEl = null;
    this.mobileDrawerEl = null;
    this.mobileBottomNavEl = null;
    this.mainViewEl = null;
  }

  async init() {
    // Cache DOM containers
    this.headerEl = document.getElementById('header-container');
    this.sidebarEl = document.getElementById('sidebar-container');
    this.mobileDrawerEl = document.getElementById('mobile-drawer-content');
    this.mobileBottomNavEl = document.getElementById('mobile-bottom-nav');
    this.mainViewEl = document.getElementById('main-view-container');

    toast.init();

    // Subscribe to store mutations
    store.subscribe((state, event, data) => {
      this.handleStateChange(state, event, data);
    });

    // Setup global keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Setup global event delegation for task actions
    this.setupGlobalDelegation();

    // Setup mobile drawer close backdrop
    const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.onclick = () => {
        document.getElementById('mobile-drawer-root').classList.add('hidden');
      };
    }
    const drawerCloseBtn = document.getElementById('btn-close-mobile-drawer');
    if (drawerCloseBtn) {
      drawerCloseBtn.onclick = () => {
        document.getElementById('mobile-drawer-root').classList.add('hidden');
      };
    }

    // Initialize Store & fetch seed tasks
    await store.init();
  }

  handleStateChange(state, event, data) {
    if (event === 'loading_start') {
      if (this.mainViewEl) {
        this.mainViewEl.innerHTML = `
          <div class="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div class="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-semibold">Loading assignments...</span>
          </div>
        `;
      }
      return;
    }

    // Re-render Header
    if (this.headerEl) {
      renderHeader(this.headerEl);
    }

    // Re-render Sidebars
    if (this.sidebarEl) {
      renderSidebar(this.sidebarEl);
    }
    if (this.mobileDrawerEl) {
      renderSidebar(this.mobileDrawerEl);
    }

    // Re-render Mobile Bottom Nav
    this.renderMobileBottomNav();

    // Re-render Active View
    this.renderActiveView();
  }

  renderActiveView() {
    if (!this.mainViewEl) return;
    const view = store.getState().currentView;

    switch (view) {
      case 'today':
        renderTodayView(this.mainViewEl);
        break;
      case 'board':
        renderPriorityBoard(this.mainViewEl);
        break;
      case 'overdue':
        renderOverdueView(this.mainViewEl);
        break;
      case 'upcoming':
        renderUpcomingView(this.mainViewEl);
        break;
      case 'all':
        renderAllTasksView(this.mainViewEl);
        break;
      default:
        renderTodayView(this.mainViewEl);
    }
  }

  renderMobileBottomNav() {
    if (!this.mobileBottomNavEl) return;
    const state = store.getState();
    const counts = store.getCounts();

    this.mobileBottomNavEl.innerHTML = `
      <div class="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        
        <button
          type="button"
          class="mobile-nav-btn flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            state.currentView === 'today' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }"
          data-view="today"
        >
          <div class="relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            ${
              counts.todayPending > 0
                ? `<span class="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-bold bg-indigo-600 text-white">${counts.todayPending}</span>`
                : ''
            }
          </div>
          <span>Today</span>
        </button>

        <button
          type="button"
          class="mobile-nav-btn flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            state.currentView === 'board' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }"
          data-view="board"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
          <span>Board</span>
        </button>

        <!-- Center Floating Action Button (FAB) -->
        <button
          type="button"
          id="btn-mobile-fab"
          class="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center transition-transform active:scale-90"
          aria-label="Add Assignment"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        </button>

        <button
          type="button"
          class="mobile-nav-btn flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            state.currentView === 'overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          }"
          data-view="overdue"
        >
          <div class="relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            ${
              counts.overdue > 0
                ? `<span class="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-bold bg-rose-600 text-white animate-pulse">${counts.overdue}</span>`
                : ''
            }
          </div>
          <span>Overdue</span>
        </button>

        <button
          type="button"
          class="mobile-nav-btn flex flex-col items-center gap-0.5 text-[11px] font-semibold transition-colors ${
            state.currentView === 'upcoming' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }"
          data-view="upcoming"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span>Upcoming</span>
        </button>

      </div>
    `;

    this.mobileBottomNavEl.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
      btn.onclick = () => store.setCurrentView(btn.dataset.view);
    });

    const fab = this.mobileBottomNavEl.querySelector('#btn-mobile-fab');
    if (fab) {
      fab.onclick = () => taskModal.openCreate();
    }
  }

  setupGlobalDelegation() {
    document.addEventListener('click', async (e) => {
      // Toggle complete checkbox
      const toggleBtn = e.target.closest('.btn-toggle-task');
      if (toggleBtn) {
        e.stopPropagation();
        const taskId = toggleBtn.dataset.id;
        if (taskId) {
          await store.toggleComplete(taskId);
        }
        return;
      }

      // Edit task
      const editBtn = e.target.closest('.btn-edit-task');
      if (editBtn) {
        e.stopPropagation();
        const taskId = editBtn.dataset.id;
        const task = store.getTasks().find((t) => t.id === taskId);
        if (task) {
          taskModal.openEdit(task);
        }
        return;
      }

      // Delete task
      const deleteBtn = e.target.closest('.btn-delete-task');
      if (deleteBtn) {
        e.stopPropagation();
        const taskId = deleteBtn.dataset.id;
        if (taskId) {
          await store.deleteTask(taskId);
        }
        return;
      }

      // Move to today reschedule
      const moveTodayBtn = e.target.closest('.btn-reschedule-today');
      if (moveTodayBtn) {
        e.stopPropagation();
        const taskId = moveTodayBtn.dataset.id;
        if (taskId) {
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 0, 0);
          await store.rescheduleTask(taskId, todayEnd.toISOString());
          toast.show('Assignment deadline moved to today!', 'success');
        }
        return;
      }

      // Trigger new task buttons anywhere
      const triggerNewTask = e.target.closest('.btn-trigger-new-task');
      if (triggerNewTask) {
        taskModal.openCreate();
        return;
      }
    });
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

      // Esc closes modals or clears search
      if (e.key === 'Escape') {
        taskModal.close();
        shortcutsModal.close();
        pomodoroModal.close();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.value = '';
          store.setSearchQuery('');
          searchInput.blur();
        }
        return;
      }

      // When typing inside form inputs, ignore single-letter navigation shortcuts
      if (isInput) return;

      // N or +: New Task
      if (e.key === 'n' || e.key === 'N' || e.key === '+') {
        e.preventDefault();
        taskModal.openCreate();
        return;
      }

      // /: Focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // ?: Shortcuts modal
      if (e.key === '?') {
        e.preventDefault();
        shortcutsModal.open();
        return;
      }

      // D: Toggle theme
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        store.toggleTheme();
        return;
      }

      // P: Pomodoro timer
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        pomodoroModal.open();
        return;
      }

      // 1-5: View switching
      if (e.key === '1') store.setCurrentView('today');
      if (e.key === '2') store.setCurrentView('board');
      if (e.key === '3') store.setCurrentView('upcoming');
      if (e.key === '4') store.setCurrentView('overdue');
      if (e.key === '5') store.setCurrentView('all');
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new FocusFlowApp();
  app.init();
});
