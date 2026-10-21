/**
 * FocusFlow - Central Reactive State Store
 * Implements an observable store pattern with unidirectional data flow,
 * computed getters, undo/redo history, and automatic persistence.
 */

import { mockApi } from './mockApi.js';
import { dateUtils } from './utils/dateUtils.js';
import { soundManager } from './utils/audio.js';
import { triggerConfetti } from './utils/confetti.js';

class TaskStore {
  constructor() {
    this.state = {
      tasks: [],
      loading: true,
      filterSubject: 'all',
      filterPriority: 'all',
      searchQuery: '',
      currentView: 'today', // 'today' | 'board' | 'upcoming' | 'overdue' | 'all'
      theme: 'dark', // 'dark' | 'light'
      undoAction: null,
      editingTask: null,
      sortBy: 'deadline-asc', // 'deadline-asc' | 'priority-desc' | 'title-asc'
      quickFilter: 'all' // 'all' | 'pending' | 'completed'
    };

    this.listeners = new Set();
  }

  // -------------------------------------------------------------
  // Subscription / PubSub
  // -------------------------------------------------------------
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event = 'state_change', data = null) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, event, data);
      } catch (err) {
        console.error('Store subscriber error:', err);
      }
    }
  }

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  async init() {
    // 1. Initialize Theme
    const savedTheme = localStorage.getItem('focusflow_theme');
    if (savedTheme) {
      this.state.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.state.theme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme();

    // 2. Fetch Tasks from Mock API
    this.state.loading = true;
    this.notify('loading_start');

    const loadedTasks = await mockApi.getTasks();
    this.state.tasks = loadedTasks;
    this.state.loading = false;
    this.notify('init');
  }

  // -------------------------------------------------------------
  // Theme Management
  // -------------------------------------------------------------
  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('focusflow_theme', this.state.theme);
    this.applyTheme();
    this.notify('theme_change', this.state.theme);
  }

  applyTheme() {
    const root = document.documentElement;
    if (this.state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // -------------------------------------------------------------
  // Getters / Selectors
  // -------------------------------------------------------------
  getState() {
    return this.state;
  }

  getTasks() {
    return this.state.tasks;
  }

  getTodayTasks() {
    return this.state.tasks.filter((t) => dateUtils.isToday(t.deadline));
  }

  getOverdueTasks() {
    return this.state.tasks.filter((t) => dateUtils.isOverdue(t.deadline, t.completed));
  }

  getUpcomingTasks() {
    return this.state.tasks.filter((t) => dateUtils.isUpcoming(t.deadline) && !t.completed);
  }

  getSubjectsList() {
    const subjects = new Set(['Computer Science', 'Mathematics', 'Physics', 'Literature', 'Chemistry', 'History']);
    this.state.tasks.forEach((t) => {
      if (t.subject) subjects.add(t.subject.trim());
    });
    return Array.from(subjects).sort();
  }

  getTodayStats() {
    const todayTasks = this.getTodayTasks();
    const total = todayTasks.length;
    const completed = todayTasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    let totalMinutes = 0;
    let completedMinutes = 0;
    todayTasks.forEach((t) => {
      const mins = Number(t.estimatedMinutes) || 30;
      totalMinutes += mins;
      if (t.completed) completedMinutes += mins;
    });

    return {
      total,
      completed,
      pending,
      percent,
      totalMinutes,
      completedMinutes,
      remainingMinutes: Math.max(0, totalMinutes - completedMinutes),
      allCompleted: total > 0 && completed === total
    };
  }

  getCounts() {
    return {
      today: this.getTodayTasks().length,
      todayPending: this.getTodayTasks().filter((t) => !t.completed).length,
      overdue: this.getOverdueTasks().length,
      upcoming: this.getUpcomingTasks().length,
      all: this.state.tasks.length,
      highPriority: this.state.tasks.filter((t) => t.priority === 'high' && !t.completed).length
    };
  }

  getFilteredTasks(customList = null) {
    let list = customList ? [...customList] : [...this.state.tasks];

    // Filter by subject
    if (this.state.filterSubject && this.state.filterSubject !== 'all') {
      list = list.filter((t) => t.subject === this.state.filterSubject);
    }

    // Filter by priority
    if (this.state.filterPriority && this.state.filterPriority !== 'all') {
      list = list.filter((t) => t.priority === this.state.filterPriority);
    }

    // Filter by quick status filter
    if (this.state.quickFilter === 'pending') {
      list = list.filter((t) => !t.completed);
    } else if (this.state.quickFilter === 'completed') {
      list = list.filter((t) => t.completed);
    }

    // Search query
    if (this.state.searchQuery && this.state.searchQuery.trim() !== '') {
      const q = this.state.searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    list.sort((a, b) => {
      if (this.state.sortBy === 'deadline-asc') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (this.state.sortBy === 'deadline-desc') {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
      if (this.state.sortBy === 'priority-desc') {
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      }
      if (this.state.sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return list;
  }

  // -------------------------------------------------------------
  // Actions & Mutations
  // -------------------------------------------------------------
  async addTask(taskData) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: taskData.title.trim(),
      subject: taskData.subject || 'General',
      deadline: taskData.deadline || new Date().toISOString(),
      priority: taskData.priority || 'medium',
      completed: !!taskData.completed,
      completedAt: taskData.completed ? new Date().toISOString() : null,
      notes: (taskData.notes || '').trim(),
      estimatedMinutes: parseInt(taskData.estimatedMinutes, 10) || 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.tasks.unshift(newTask);
    await mockApi.saveTasks(this.state.tasks);
    this.notify('task_added', newTask);
    return newTask;
  }

  async updateTask(taskId, updates) {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return null;

    const current = this.state.tasks[idx];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If completed changed
    if (updates.completed !== undefined && updates.completed !== current.completed) {
      updated.completedAt = updates.completed ? new Date().toISOString() : null;
    }

    this.state.tasks[idx] = updated;
    await mockApi.saveTasks(this.state.tasks);
    this.notify('task_updated', updated);
    return updated;
  }

  async toggleComplete(taskId) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const previousStats = this.getTodayStats();
    const newCompleted = !task.completed;

    await this.updateTask(taskId, {
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : null
    });

    if (newCompleted) {
      soundManager.playComplete();
      const currentStats = this.getTodayStats();
      // Check if this action just triggered 100% completion of today's tasks
      if (currentStats.allCompleted && !previousStats.allCompleted) {
        soundManager.playCelebration();
        triggerConfetti();
      }
    }
  }

  async deleteTask(taskId) {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    const [deletedTask] = this.state.tasks.splice(idx, 1);
    await mockApi.saveTasks(this.state.tasks);

    // Provide undo capability
    this.setUndoAction({
      description: `Task "${deletedTask.title.slice(0, 24)}..." deleted`,
      undoFn: async () => {
        this.state.tasks.splice(idx, 0, deletedTask);
        await mockApi.saveTasks(this.state.tasks);
        this.notify('task_restored', deletedTask);
      }
    });

    this.notify('task_deleted', deletedTask);
  }

  /**
   * Move task across priority board columns
   * columnId can be: 'high', 'medium', 'low', or 'completed'
   */
  async moveTaskPriority(taskId, targetColumn) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (targetColumn === 'completed') {
      if (!task.completed) {
        await this.toggleComplete(taskId);
      }
    } else if (['high', 'medium', 'low'].includes(targetColumn)) {
      const updates = {
        priority: targetColumn,
        completed: false,
        completedAt: null
      };
      await this.updateTask(taskId, updates);
    }
  }

  /**
   * Reschedule deadline quickly (e.g. +1 day, +3 days, tomorrow)
   */
  async rescheduleTask(taskId, newDeadlineISO) {
    return await this.updateTask(taskId, {
      deadline: newDeadlineISO,
      completed: false
    });
  }

  // -------------------------------------------------------------
  // Filter & Navigation Actions
  // -------------------------------------------------------------
  setCurrentView(view) {
    this.state.currentView = view;
    this.notify('view_change', view);
  }

  setFilterSubject(subject) {
    this.state.filterSubject = subject;
    this.notify('filter_change', { filterSubject: subject });
  }

  setFilterPriority(priority) {
    this.state.filterPriority = priority;
    this.notify('filter_change', { filterPriority: priority });
  }

  setQuickFilter(quick) {
    this.state.quickFilter = quick;
    this.notify('filter_change', { quickFilter: quick });
  }

  setSortBy(sortBy) {
    this.state.sortBy = sortBy;
    this.notify('sort_change', sortBy);
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notify('search_change', query);
  }

  clearFilters() {
    this.state.filterSubject = 'all';
    this.state.filterPriority = 'all';
    this.state.quickFilter = 'all';
    this.state.searchQuery = '';
    this.notify('filters_cleared');
  }

  // -------------------------------------------------------------
  // Undo & Modals
  // -------------------------------------------------------------
  setUndoAction(action) {
    if (this.state.undoAction && this.state.undoAction.timerId) {
      clearTimeout(this.state.undoAction.timerId);
    }

    const timerId = setTimeout(() => {
      this.state.undoAction = null;
      this.notify('undo_cleared');
    }, 6000);

    this.state.undoAction = { ...action, timerId };
    this.notify('undo_available', this.state.undoAction);
  }

  async executeUndo() {
    if (this.state.undoAction && typeof this.state.undoAction.undoFn === 'function') {
      const fn = this.state.undoAction.undoFn;
      clearTimeout(this.state.undoAction.timerId);
      this.state.undoAction = null;
      await fn();
      this.notify('undo_executed');
    }
  }

  setEditingTask(task) {
    this.state.editingTask = task;
    this.notify('editing_task', task);
  }

  async resetData() {
    this.state.loading = true;
    this.notify('loading_start');
    const seed = await mockApi.resetToDefaults();
    this.state.tasks = seed;
    this.state.loading = false;
    this.notify('data_reset');
  }
}

export const store = new TaskStore();
