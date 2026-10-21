/**
 * FocusFlow Student Dashboard - Universal Standalone Bundle
 * Bundled for 100% seamless execution across all protocols (file:// and http://)
 * without CORS module restrictions.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DATE UTILITIES
  // =========================================================================
  const dateUtils = {
    parse(dateInput) {
      if (!dateInput) return new Date();
      return dateInput instanceof Date ? dateInput : new Date(dateInput);
    },

    isToday(dateInput) {
      const d = this.parse(dateInput);
      const today = new Date();
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    },

    isTomorrow(dateInput) {
      const d = this.parse(dateInput);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return (
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear()
      );
    },

    isOverdue(dateInput, completed = false) {
      if (completed) return false;
      const d = this.parse(dateInput);
      const now = new Date();
      return d.getTime() < now.getTime();
    },

    isUpcoming(dateInput) {
      const d = this.parse(dateInput);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      return d.getTime() > todayEnd.getTime();
    },

    isWithinDays(dateInput, days = 7) {
      const d = this.parse(dateInput);
      const now = new Date();
      const limit = new Date();
      limit.setDate(limit.getDate() + days);
      return d.getTime() >= now.getTime() && d.getTime() <= limit.getTime();
    },

    getDaysDifference(dateInput) {
      const d = this.parse(dateInput);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(d);
      target.setHours(0, 0, 0, 0);

      const diffMs = target.getTime() - today.getTime();
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    },

    formatRelativeDeadline(dateInput, completed = false) {
      const d = this.parse(dateInput);
      const now = new Date();
      const diffDays = this.getDaysDifference(d);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (completed) {
        return `Completed • ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
      }

      if (this.isOverdue(d, completed)) {
        const diffMs = now.getTime() - d.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) {
          return `Overdue by ${Math.max(1, diffHours)}h (${timeStr})`;
        }
        const days = Math.floor(diffHours / 24);
        return `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
      }

      if (this.isToday(d)) {
        return `Due Today at ${timeStr}`;
      }

      if (this.isTomorrow(d)) {
        return `Due Tomorrow at ${timeStr}`;
      }

      if (diffDays > 1 && diffDays <= 7) {
        const dayName = d.toLocaleDateString([], { weekday: 'short' });
        return `Due ${dayName} (${diffDays} days)`;
      }

      return `Due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    },

    formatHeaderDate(dateInput = new Date()) {
      const d = this.parse(dateInput);
      return d.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    toInputDateTime(dateInput = new Date()) {
      const d = this.parse(dateInput);
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    addDays(dateInput, days) {
      const d = new Date(this.parse(dateInput));
      d.setDate(d.getDate() + days);
      return d;
    }
  };

  // =========================================================================
  // 2. AUDIO SYNTHESIZER (ZERO ASSET DEPENDENCIES)
  // =========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.muted = false;
      try {
        this.muted = localStorage.getItem('focusflow_sound_muted') === 'true';
      } catch (e) {
        this.muted = false;
      }
    }

    init() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
    }

    isMuted() {
      return this.muted;
    }

    setMuted(muted) {
      this.muted = !!muted;
      try {
        localStorage.setItem('focusflow_sound_muted', String(this.muted));
      } catch (e) {}
    }

    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }

    playComplete() {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.36);
        });
      } catch (e) {}
    }

    playCelebration() {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);

          gain.gain.setValueAtTime(0, now + i * 0.1);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.62);
        });
      } catch (e) {}
    }

    playTimerBell() {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
      } catch (e) {}
    }
  }

  const soundManager = new SoundManager();

  // =========================================================================
  // 3. CONFETTI TRIGGER HELPER
  // =========================================================================
  function triggerConfetti() {
    if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
      try {
        window.confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6']
        });
        setTimeout(() => {
          window.confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#10b981', '#6366f1', '#38bdf8']
          });
          window.confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#f59e0b', '#ec4899', '#a855f7']
          });
        }, 200);
      } catch (e) {}
    }
  }

  // =========================================================================
  // 4. MOCK API & INITIAL SEED DATA
  // =========================================================================
  const STORAGE_KEY = 'focusflow_tasks_v1';

  const SUBJECT_COLORS = {
    'Computer Science': { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-800', dot: 'bg-indigo-500' },
    'Mathematics': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
    'Physics': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
    'Literature': { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-800', dot: 'bg-rose-500' },
    'Chemistry': { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-800', dot: 'bg-cyan-500' },
    'History': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-800', dot: 'bg-purple-500' },
    'Biology': { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-300 dark:border-teal-800', dot: 'bg-teal-500' },
    'General': { bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-500' }
  };

  function getSubjectStyle(subject) {
    return SUBJECT_COLORS[subject] || SUBJECT_COLORS['General'];
  }

  function generateSeedTasks() {
    const now = new Date();
    const relativeDate = (daysOffset, hours, minutes) => {
      const d = new Date(now);
      d.setDate(d.getDate() + daysOffset);
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString();
    };

    return [
      {
        id: 'task-1',
        title: 'CS 201: Binary Search Trees & AVL Balancing',
        subject: 'Computer Science',
        deadline: relativeDate(0, 18, 0),
        priority: 'high',
        completed: false,
        completedAt: null,
        notes: 'Implement insertion, deletion, and rotation methods with verification tests.',
        estimatedMinutes: 90,
        createdAt: relativeDate(-3, 10, 0),
        updatedAt: relativeDate(-1, 14, 0)
      },
      {
        id: 'task-2',
        title: 'Physics Lab 4: Pendulum Damping & Harmonic Motion',
        subject: 'Physics',
        deadline: relativeDate(0, 21, 30),
        priority: 'high',
        completed: false,
        completedAt: null,
        notes: 'Plot dampening coefficients vs angular amplitude. Export charts into PDF format.',
        estimatedMinutes: 60,
        createdAt: relativeDate(-2, 11, 0),
        updatedAt: relativeDate(0, 9, 0)
      },
      {
        id: 'task-3',
        title: 'Calculus II: Review Integration by Parts Problems',
        subject: 'Mathematics',
        deadline: relativeDate(0, 15, 0),
        priority: 'medium',
        completed: true,
        completedAt: relativeDate(0, 14, 30),
        notes: 'Finish exercises 12 through 28 on page 340.',
        estimatedMinutes: 45,
        createdAt: relativeDate(-1, 9, 0),
        updatedAt: relativeDate(0, 14, 30)
      },
      {
        id: 'task-4',
        title: 'Linear Algebra: Quick Flashcard Deck (Eigenvalues)',
        subject: 'Mathematics',
        deadline: relativeDate(0, 12, 0),
        priority: 'low',
        completed: true,
        completedAt: relativeDate(0, 11, 45),
        notes: 'Memorize characteristic polynomial equations and 2x2 shortcut trace/determinant.',
        estimatedMinutes: 25,
        createdAt: relativeDate(-1, 8, 0),
        updatedAt: relativeDate(0, 11, 45)
      },
      {
        id: 'task-5',
        title: 'History: Draft Intro & Thesis for Renaissance Paper',
        subject: 'History',
        deadline: relativeDate(-1, 23, 59),
        priority: 'high',
        completed: false,
        completedAt: null,
        notes: 'Focus on Florentine banking influence on patron-funded art architecture.',
        estimatedMinutes: 75,
        createdAt: relativeDate(-4, 15, 0),
        updatedAt: relativeDate(-1, 18, 0)
      },
      {
        id: 'task-6',
        title: 'Organic Chemistry: Chapter 8 Reaction Mechanisms',
        subject: 'Chemistry',
        deadline: relativeDate(-2, 17, 0),
        priority: 'medium',
        completed: false,
        completedAt: null,
        notes: 'Draw electron-pushing curved arrows for SN1 vs SN2 competitive pathways.',
        estimatedMinutes: 50,
        createdAt: relativeDate(-5, 10, 0),
        updatedAt: relativeDate(-2, 12, 0)
      },
      {
        id: 'task-7',
        title: 'Literature: Critical Analysis of Hamlet Soliloquy',
        subject: 'Literature',
        deadline: relativeDate(1, 16, 0),
        priority: 'high',
        completed: false,
        completedAt: null,
        notes: 'Analyze meter variations and existential motif recurring imagery in 1,200 words.',
        estimatedMinutes: 80,
        createdAt: relativeDate(-2, 14, 0),
        updatedAt: relativeDate(0, 10, 0)
      },
      {
        id: 'task-8',
        title: 'Web Dev: FocusFlow Student Dashboard Milestone',
        subject: 'Computer Science',
        deadline: relativeDate(2, 23, 59),
        priority: 'medium',
        completed: false,
        completedAt: null,
        notes: 'Implement drag and drop, responsive navigation, and progress ring animations.',
        estimatedMinutes: 120,
        createdAt: relativeDate(-1, 16, 0),
        updatedAt: relativeDate(0, 12, 0)
      },
      {
        id: 'task-9',
        title: 'Calculus Quiz Prep: Series Convergence Tests',
        subject: 'Mathematics',
        deadline: relativeDate(4, 11, 0),
        priority: 'medium',
        completed: false,
        completedAt: null,
        notes: 'Ratio test, Root test, Alternating series test practice worksheets.',
        estimatedMinutes: 60,
        createdAt: relativeDate(0, 9, 0),
        updatedAt: relativeDate(0, 9, 0)
      },
      {
        id: 'task-10',
        title: 'Biology: Genetics Lab Report on Drosophila Crosses',
        subject: 'Biology',
        deadline: relativeDate(6, 17, 0),
        priority: 'low',
        completed: false,
        completedAt: null,
        notes: 'Calculate chi-squared goodness of fit on phenotypic distribution ratios.',
        estimatedMinutes: 70,
        createdAt: relativeDate(0, 10, 0),
        updatedAt: relativeDate(0, 10, 0)
      }
    ];
  }

  const mockApi = {
    async getTasks() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const seed = generateSeedTasks();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
          return seed;
        }
        return JSON.parse(raw);
      } catch (e) {
        const seed = generateSeedTasks();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        } catch (err) {}
        return seed;
      }
    },

    async saveTasks(tasks) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {}
      return tasks;
    },

    async resetToDefaults() {
      const seed = generateSeedTasks();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      } catch (e) {}
      return seed;
    },

    exportJSON(tasks) {
      return JSON.stringify(
        {
          app: 'FocusFlow Student Dashboard',
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          tasksCount: tasks.length,
          tasks
        },
        null,
        2
      );
    }
  };

  // =========================================================================
  // 5. OBSERVABLE CENTRAL STATE STORE
  // =========================================================================
  class TaskStore {
    constructor() {
      this.state = {
        tasks: [],
        loading: true,
        filterSubject: 'all',
        filterPriority: 'all',
        searchQuery: '',
        currentView: 'today',
        theme: 'dark',
        undoAction: null,
        editingTask: null,
        sortBy: 'deadline-asc',
        quickFilter: 'all'
      };
      this.listeners = new Set();
    }

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

    async init() {
      try {
        const savedTheme = localStorage.getItem('focusflow_theme');
        if (savedTheme) {
          this.state.theme = savedTheme;
        } else {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          this.state.theme = prefersDark ? 'dark' : 'light';
        }
      } catch (e) {
        this.state.theme = 'dark';
      }
      this.applyTheme();

      this.state.loading = true;
      this.notify('loading_start');

      const loadedTasks = await mockApi.getTasks();
      this.state.tasks = loadedTasks;
      this.state.loading = false;
      this.notify('init');
    }

    toggleTheme() {
      this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('focusflow_theme', this.state.theme);
      } catch (e) {}
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

      if (this.state.filterSubject && this.state.filterSubject !== 'all') {
        list = list.filter((t) => t.subject === this.state.filterSubject);
      }

      if (this.state.filterPriority && this.state.filterPriority !== 'all') {
        list = list.filter((t) => t.priority === this.state.filterPriority);
      }

      if (this.state.quickFilter === 'pending') {
        list = list.filter((t) => !t.completed);
      } else if (this.state.quickFilter === 'completed') {
        list = list.filter((t) => t.completed);
      }

      if (this.state.searchQuery && this.state.searchQuery.trim() !== '') {
        const q = this.state.searchQuery.toLowerCase().trim();
        list = list.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            (t.notes && t.notes.toLowerCase().includes(q))
        );
      }

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

    async moveTaskPriority(taskId, targetColumn) {
      const task = this.state.tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (targetColumn === 'completed') {
        if (!task.completed) {
          await this.toggleComplete(taskId);
        }
      } else if (['high', 'medium', 'low'].includes(targetColumn)) {
        await this.updateTask(taskId, {
          priority: targetColumn,
          completed: false,
          completedAt: null
        });
      }
    }

    async rescheduleTask(taskId, newDeadlineISO) {
      return await this.updateTask(taskId, {
        deadline: newDeadlineISO,
        completed: false
      });
    }

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

    async resetData() {
      this.state.loading = true;
      this.notify('loading_start');
      const seed = await mockApi.resetToDefaults();
      this.state.tasks = seed;
      this.state.loading = false;
      this.notify('data_reset');
    }
  }

  const store = new TaskStore();

  // =========================================================================
  // 6. TOAST NOTIFICATIONS
  // =========================================================================
  class ToastManager {
    constructor() {
      this.container = null;
    }

    init() {
      if (this.container) return;
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(this.container);

      store.subscribe((state, event, data) => {
        if (event === 'undo_available' && data) {
          this.showUndoToast(data);
        } else if (event === 'undo_cleared' || event === 'undo_executed') {
          this.dismissCurrent();
        }
      });
    }

    show(message, type = 'info', duration = 3500) {
      this.init();
      const toast = document.createElement('div');
      toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0 animate-toast-in ${
        type === 'success'
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          : type === 'error'
          ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          : 'bg-slate-900/90 border-slate-700 text-slate-100'
      }`;

      toast.innerHTML = `
        <div class="flex-1">${message}</div>
        <button class="text-slate-400 hover:text-slate-200 p-1" aria-label="Close">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      `;

      toast.querySelector('button').onclick = () => toast.remove();
      this.container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    showUndoToast(undoData) {
      this.dismissCurrent();
      const toast = document.createElement('div');
      toast.id = 'active-undo-toast';
      toast.className =
        'pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-xl shadow-2xl bg-slate-900/95 dark:bg-slate-800/95 border border-slate-700/80 text-white text-sm font-medium backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100';

      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>${undoData.description}</span>
        </div>
        <button id="btn-undo-action" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
          Undo
        </button>
        <button id="btn-close-toast" class="text-slate-400 hover:text-slate-200 text-xs">✕</button>
      `;

      toast.querySelector('#btn-undo-action').onclick = () => {
        store.executeUndo();
        this.dismissCurrent();
      };

      toast.querySelector('#btn-close-toast').onclick = () => {
        this.dismissCurrent();
      };

      this.container.appendChild(toast);
    }

    dismissCurrent() {
      const existing = document.getElementById('active-undo-toast');
      if (existing) {
        existing.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => existing.remove(), 250);
      }
    }
  }

  const toast = new ToastManager();

  // =========================================================================
  // 7. HTML HELPERS & CARD RENDERER
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;');
  }

  function renderTaskCard(task, options = {}) {
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

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h4 class="text-sm font-semibold leading-snug break-words text-slate-800 dark:text-slate-100 ${
                task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }">
                ${escapeHtml(task.title)}
              </h4>
            </div>

            ${
              task.notes
                ? `<p class="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">${escapeHtml(
                    task.notes
                  )}</p>`
                : ''
            }

            <div class="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium border ${subjectStyle.bg} ${subjectStyle.text} ${subjectStyle.border}">
                <span class="w-1.5 h-1.5 rounded-full ${subjectStyle.dot}"></span>
                ${escapeHtml(task.subject)}
              </span>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium border ${priorityMeta.badge}">
                <span class="w-1.5 h-1.5 rounded-full ${priorityMeta.dot}"></span>
                ${priorityMeta.label}
              </span>

              ${
                task.estimatedMinutes
                  ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50">
                      <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      ${task.estimatedMinutes}m
                    </span>`
                  : ''
              }

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
                  title="Edit assignment"
                  aria-label="Edit"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button
                  type="button"
                  class="btn-delete-task p-1 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  data-id="${task.id}"
                  title="Delete assignment"
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

  // =========================================================================
  // 8. PROGRESS RING COMPONENT
  // =========================================================================
  function renderProgressRing(containerId = 'progress-ring-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = store.getTodayStats();
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (stats.percent / 100) * circumference;

    const isComplete = stats.allCompleted;

    let motivation = 'Ready to conquer today?';
    if (stats.percent === 100 && stats.total > 0) {
      motivation = '🎉 All assignments completed! Outstanding work!';
    } else if (stats.percent >= 66) {
      motivation = '🚀 Final stretch! Keep up the great pace!';
    } else if (stats.percent >= 33) {
      motivation = '⚡ Solid momentum! Halfway through today\'s tasks!';
    } else if (stats.percent > 0) {
      motivation = '✨ Great start! Step by step.';
    }

    const hoursRemaining = Math.floor(stats.remainingMinutes / 60);
    const minsRemaining = stats.remainingMinutes % 60;
    const timeRemainingStr =
      stats.remainingMinutes > 0
        ? `${hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}${minsRemaining}m left`
        : 'All done for today';

    container.innerHTML = `
      <div class="relative bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/40 p-5 rounded-2xl border border-indigo-200/40 dark:border-indigo-900/40 shadow-sm backdrop-blur-sm transition-all duration-300">
        <div class="flex flex-col sm:flex-row items-center gap-6">
          
          <div class="relative flex-shrink-0 w-28 h-28 flex items-center justify-center group">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="${radius}"
                class="stroke-slate-200 dark:stroke-slate-800"
                stroke-width="8"
                fill="transparent"
              />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="${isComplete ? '#10b981' : '#6366f1'}" />
                  <stop offset="100%" stop-color="${isComplete ? '#34d399' : '#a855f7'}" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="${radius}"
                stroke="url(#ringGradient)"
                stroke-width="8"
                stroke-linecap="round"
                fill="transparent"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                class="transition-all duration-700 ease-out ${isComplete ? 'filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}"
              />
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : ''}">
                ${stats.percent}%
              </span>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Today
              </span>
            </div>
          </div>

          <div class="flex-1 text-center sm:text-left space-y-2">
            <div class="flex flex-wrap items-center justify-center sm:justify-between gap-2">
              <div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
                  Daily Focus Completion
                  ${isComplete ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Target Hit 🎯</span>' : ''}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">${motivation}</p>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                  <span class="w-2 h-2 rounded-full ${stats.pending > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}"></span>
                  <span class="font-bold text-slate-700 dark:text-slate-200">${stats.completed}</span>
                  <span class="text-slate-400">/</span>
                  <span class="text-slate-500">${stats.total} tasks</span>
                </span>

                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs text-slate-600 dark:text-slate-300">
                  <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  ${timeRemainingStr}
                </span>
              </div>
            </div>

            <div class="w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
              <div
                class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style="width: ${stats.percent}%"
              ></div>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span class="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                🔥 5-Day Study Streak
              </span>
              <span>
                ${stats.pending} remaining • ${stats.completed} done
              </span>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // =========================================================================
  // 9. TODAY VIEW
  // =========================================================================
  let todaySubFilter = 'all';

  function renderTodayView(container) {
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
        <div id="today-progress-container"></div>

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

        ${
          displayed.length === 0
            ? renderTodayEmptyState()
            : `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${displayed.map((task) => renderTaskCard(task)).join('')}
              </div>`
        }
      </div>
    `;

    renderProgressRing('today-progress-container');

    container.querySelectorAll('.sub-filter-btn').forEach((btn) => {
      btn.onclick = () => {
        todaySubFilter = btn.dataset.sub;
        renderTodayView(container);
      };
    });
  }

  function renderTodayEmptyState() {
    const stats = store.getTodayStats();
    if (stats.allCompleted && stats.total > 0) {
      return `
        <div class="p-10 text-center rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
          <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
            🎯
          </div>
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">All Today's Assignments Crushed!</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            You've completed every task scheduled for today. Great job staying focused!
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

  // =========================================================================
  // 10. DRAG-AND-DROP PRIORITY BOARD
  // =========================================================================
  function renderPriorityBoard(container) {
    const allTasks = store.getTasks();
    const filtered = store.getFilteredTasks(allTasks);

    const highTasks = filtered.filter((t) => t.priority === 'high' && !t.completed);
    const mediumTasks = filtered.filter((t) => t.priority === 'medium' && !t.completed);
    const lowTasks = filtered.filter((t) => t.priority === 'low' && !t.completed);
    const completedTasks = filtered.filter((t) => t.completed);

    const columns = [
      { id: 'high', title: 'High Priority', headerBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', tasks: highTasks, icon: '🔥' },
      { id: 'medium', title: 'Medium Priority', headerBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50', tasks: mediumTasks, icon: '⚡' },
      { id: 'low', title: 'Low Priority', headerBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', tasks: lowTasks, icon: '🌱' },
      { id: 'completed', title: 'Completed', headerBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50', tasks: completedTasks, icon: '✅' }
    ];

    container.innerHTML = `
      <div class="space-y-4">
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          ${columns
            .map(
              (col) => `
            <div
              class="kanban-column bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[500px] transition-all duration-200"
              data-column-id="${col.id}"
            >
              <div class="flex items-center justify-between p-2 mb-2 rounded-xl border ${col.headerBg}">
                <div class="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                  <span>${col.icon}</span>
                  <span>${col.title}</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800/80 shadow-xs">
                  ${col.tasks.length}
                </span>
              </div>

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

    setupDragAndDrop(container);
  }

  function setupDragAndDrop(container) {
    let draggedTaskId = null;

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
        if (col) col.classList.add('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
      });

      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget) && col) {
          col.classList.remove('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
        }
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        if (col) col.classList.remove('ring-2', 'ring-indigo-500/50', 'bg-indigo-500/5');
        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
        const targetColumnId = zone.dataset.columnId;

        if (taskId && targetColumnId) {
          await store.moveTaskPriority(taskId, targetColumnId);
        }
      });
    });

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
        } catch (err) {}
      });
    }
  }

  // =========================================================================
  // 11. OVERDUE VIEW
  // =========================================================================
  function renderOverdueView(container) {
    const overdueTasks = store.getOverdueTasks();
    const filtered = store.getFilteredTasks(overdueTasks);

    container.innerHTML = `
      <div class="space-y-6">
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

  // =========================================================================
  // 12. UPCOMING VIEW
  // =========================================================================
  function renderUpcomingView(container) {
    const upcomingTasks = store.getUpcomingTasks();
    const filtered = store.getFilteredTasks(upcomingTasks);

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

    const renderSection = (title, count, tasks) => {
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

  // =========================================================================
  // 13. ALL ASSIGNMENTS VIEW
  // =========================================================================
  function renderAllTasksView(container) {
    const state = store.getState();
    const allTasks = store.getTasks();
    const filtered = store.getFilteredTasks(allTasks);

    container.innerHTML = `
      <div class="space-y-6">
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

    const sortSelect = container.querySelector('#select-sort-by');
    if (sortSelect) {
      sortSelect.onchange = () => store.setSortBy(sortSelect.value);
    }

    container.querySelectorAll('.btn-all-filter').forEach((btn) => {
      btn.onclick = () => store.setQuickFilter(btn.dataset.filter);
    });

    const clearBtn = container.querySelector('#btn-clear-all-filters');
    if (clearBtn) {
      clearBtn.onclick = () => store.clearFilters();
    }
  }

  // =========================================================================
  // 14. TASK MODAL (CREATE & EDIT)
  // =========================================================================
  class TaskModalManager {
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

      this.modalEl.onclick = (e) => {
        if (e.target === this.modalEl) this.close();
      };
    }

    openCreate() {
      this.isEditing = false;
      this.currentEditingId = null;

      const defaultDeadline = new Date();
      defaultDeadline.setHours(18, 0, 0, 0);

      this.render({
        title: '',
        subject: 'Computer Science',
        deadline: dateUtils.toInputDateTime(defaultDeadline),
        priority: 'medium',
        estimatedMinutes: 45,
        notes: ''
      });
    }

    openEdit(task) {
      this.isEditing = true;
      this.currentEditingId = task.id;

      this.render({
        title: task.title,
        subject: task.subject,
        deadline: dateUtils.toInputDateTime(task.deadline),
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes || 45,
        notes: task.notes || ''
      });
    }

    close() {
      if (this.modalEl) this.modalEl.classList.add('hidden');
    }

    render(data) {
      this.init();
      const subjects = store.getSubjectsList();

      this.modalEl.innerHTML = `
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
          
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

          <form id="task-form" class="mt-4 space-y-4">
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

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignment Notes & Instructions (Optional)
              </label>
              <textarea
                name="notes"
                rows="3"
                placeholder="Add instructions, textbook problems, links, or notes..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition-all leading-relaxed"
              >${escapeHtml(data.notes)}</textarea>
            </div>

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

      this.modalEl.querySelector('#btn-modal-close').onclick = () => this.close();
      this.modalEl.querySelector('#btn-cancel').onclick = () => this.close();

      const form = this.modalEl.querySelector('#task-form');
      const priorityRadios = form.querySelectorAll('input[name="priority"]');
      priorityRadios.forEach((radio) => {
        radio.onchange = () => {
          form.querySelectorAll('label').forEach((lbl) => {
            const r = lbl.querySelector('input[name="priority"]');
            if (r) {
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

      const deadlineInput = form.querySelector('#deadline-input');
      form.querySelectorAll('.btn-preset').forEach((btn) => {
        btn.onclick = () => {
          const now = new Date();
          const p = btn.dataset.preset;
          if (p === 'today-evening') now.setHours(18, 0, 0, 0);
          else if (p === 'tonight') now.setHours(23, 59, 0, 0);
          else if (p === 'tomorrow') {
            now.setDate(now.getDate() + 1);
            now.setHours(17, 0, 0, 0);
          } else if (p === 'in3days') {
            now.setDate(now.getDate() + 3);
            now.setHours(23, 59, 0, 0);
          }
          deadlineInput.value = dateUtils.toInputDateTime(now);
        };
      });

      const minsInput = form.querySelector('input[name="estimatedMinutes"]');
      form.querySelectorAll('.btn-time-chip').forEach((btn) => {
        btn.onclick = () => {
          minsInput.value = btn.dataset.mins;
        };
      });

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

  const taskModal = new TaskModalManager();

  // =========================================================================
  // 15. SHORTCUTS MODAL
  // =========================================================================
  class ShortcutsModalManager {
    constructor() {
      this.modalEl = null;
    }

    init() {
      if (this.modalEl) return;
      this.modalEl = document.createElement('div');
      this.modalEl.id = 'shortcuts-modal-root';
      this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm hidden transition-opacity duration-200';
      document.body.appendChild(this.modalEl);

      this.modalEl.onclick = (e) => {
        if (e.target === this.modalEl) this.close();
      };
    }

    open() {
      this.init();
      const shortcuts = [
        { key: 'N', desc: 'Create new assignment' },
        { key: '/', desc: 'Focus global search input' },
        { key: 'D', desc: 'Toggle dark / light theme' },
        { key: 'P', desc: 'Open Pomodoro Focus Timer' },
        { key: '1', desc: 'Switch to Today\'s Focus view' },
        { key: '2', desc: 'Switch to Priority Board' },
        { key: '3', desc: 'Switch to Upcoming Deadlines' },
        { key: '4', desc: 'Switch to Overdue view' },
        { key: '5', desc: 'Switch to All Assignments' },
        { key: '?', desc: 'Show this shortcuts guide' },
        { key: 'Esc', desc: 'Close dialogs or clear search' }
      ];

      this.modalEl.innerHTML = `
        <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-200">
          
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">⌨️</span>
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Power navigation for quick study workflows</p>
              </div>
            </div>
            <button type="button" id="btn-shortcuts-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-1">
            ${shortcuts
              .map(
                (s) => `
              <div class="py-2.5 flex items-center justify-between text-xs">
                <span class="text-slate-600 dark:text-slate-300">${s.desc}</span>
                <kbd class="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                  ${s.key}
                </kbd>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              id="btn-shortcuts-ok"
              class="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Got it (Esc)
            </button>
          </div>

        </div>
      `;

      this.modalEl.classList.remove('hidden');
      this.modalEl.querySelector('#btn-shortcuts-close').onclick = () => this.close();
      this.modalEl.querySelector('#btn-shortcuts-ok').onclick = () => this.close();
    }

    close() {
      if (this.modalEl) this.modalEl.classList.add('hidden');
    }
  }

  const shortcutsModal = new ShortcutsModalManager();

  // =========================================================================
  // 16. POMODORO TIMER MODAL
  // =========================================================================
  class PomodoroModalManager {
    constructor() {
      this.modalEl = null;
      this.timerId = null;
      this.totalSeconds = 25 * 60;
      this.remainingSeconds = 25 * 60;
      this.isRunning = false;
      this.currentMode = 'focus';
    }

    init() {
      if (this.modalEl) return;
      this.modalEl = document.createElement('div');
      this.modalEl.id = 'pomodoro-modal-root';
      this.modalEl.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm hidden transition-opacity duration-200';
      document.body.appendChild(this.modalEl);

      this.modalEl.onclick = (e) => {
        if (e.target === this.modalEl) this.close();
      };
    }

    open() {
      this.init();
      this.render();
      this.modalEl.classList.remove('hidden');
    }

    close() {
      if (this.modalEl) this.modalEl.classList.add('hidden');
    }

    setMode(mode) {
      this.currentMode = mode;
      this.pause();
      if (mode === 'focus') this.totalSeconds = 25 * 60;
      else if (mode === 'short') this.totalSeconds = 5 * 60;
      else if (mode === 'long') this.totalSeconds = 15 * 60;
      this.remainingSeconds = this.totalSeconds;
      this.render();
    }

    toggleStartPause() {
      if (this.isRunning) this.pause();
      else this.start();
      this.render();
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.timerId = setInterval(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.updateTimeDisplay();
        } else {
          this.pause();
          soundManager.playTimerBell();
          alert(this.currentMode === 'focus' ? '🎉 Focus session completed! Take a break!' : '⚡ Break over! Ready for next session?');
          this.render();
        }
      }, 1000);
    }

    pause() {
      this.isRunning = false;
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }

    reset() {
      this.pause();
      this.remainingSeconds = this.totalSeconds;
      this.render();
    }

    formatTime(totalSecs) {
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    updateTimeDisplay() {
      const textEl = this.modalEl.querySelector('#pomodoro-time-text');
      const ringEl = this.modalEl.querySelector('#pomodoro-ring');
      if (textEl) textEl.textContent = this.formatTime(this.remainingSeconds);
      if (ringEl) {
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const fraction = this.remainingSeconds / this.totalSeconds;
        ringEl.style.strokeDashoffset = String(circumference - fraction * circumference);
      }
    }

    render() {
      const radius = 54;
      const circumference = 2 * Math.PI * radius;
      const fraction = this.remainingSeconds / this.totalSeconds;
      const offset = circumference - fraction * circumference;

      this.modalEl.innerHTML = `
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-xl">⏱️</span>
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Study Focus Timer</h3>
            </div>
            <button type="button" id="btn-pomodoro-close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
          </div>

          <div class="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 text-xs font-semibold">
            <button type="button" class="btn-pomo-mode py-1.5 rounded-lg transition-all ${this.currentMode === 'focus' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" data-mode="focus">
              Focus (25m)
            </button>
            <button type="button" class="btn-pomo-mode py-1.5 rounded-lg transition-all ${this.currentMode === 'short' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" data-mode="short">
              Short (5m)
            </button>
            <button type="button" class="btn-pomo-mode py-1.5 rounded-lg transition-all ${this.currentMode === 'long' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}" data-mode="long">
              Long (15m)
            </button>
          </div>

          <div class="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="${radius}" class="stroke-slate-100 dark:stroke-slate-800" stroke-width="8" fill="transparent" />
              <circle
                id="pomodoro-ring"
                cx="60"
                cy="60"
                r="${radius}"
                class="stroke-indigo-600 transition-all duration-300"
                stroke-width="8"
                stroke-linecap="round"
                fill="transparent"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span id="pomodoro-time-text" class="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
                ${this.formatTime(this.remainingSeconds)}
              </span>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                ${this.currentMode === 'focus' ? 'Deep Work' : 'Break Time'}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              id="btn-pomo-start"
              class="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center gap-2 ${
                this.isRunning ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
              }"
            >
              ${this.isRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button
              type="button"
              id="btn-pomo-reset"
              class="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              Reset
            </button>
          </div>

        </div>
      `;

      this.modalEl.querySelector('#btn-pomodoro-close').onclick = () => this.close();
      this.modalEl.querySelector('#btn-pomo-start').onclick = () => this.toggleStartPause();
      this.modalEl.querySelector('#btn-pomo-reset').onclick = () => this.reset();

      this.modalEl.querySelectorAll('.btn-pomo-mode').forEach((btn) => {
        btn.onclick = () => this.setMode(btn.dataset.mode);
      });
    }
  }

  const pomodoroModal = new PomodoroModalManager();

  // =========================================================================
  // 17. HEADER COMPONENT
  // =========================================================================
  function renderHeader(container) {
    const state = store.getState();
    const subjects = store.getSubjectsList();
    const todayFormatted = dateUtils.formatHeaderDate();
    const isMuted = soundManager.isMuted();

    container.innerHTML = `
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div class="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          <div class="flex items-center gap-3">
            <button
              type="button"
              id="btn-mobile-sidebar-toggle"
              class="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>

            <div class="hidden sm:block">
              <div class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                ${todayFormatted}
              </div>
              <div class="text-sm font-bold text-slate-800 dark:text-slate-100">
                Student Focus Dashboard
              </div>
            </div>
          </div>

          <div class="flex-1 max-w-md mx-2">
            <div class="relative flex items-center">
              <svg class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                id="global-search-input"
                value="${escapeAttr(state.searchQuery)}"
                placeholder="Search assignments, courses, notes..."
                class="w-full pl-9 pr-12 py-1.5 sm:py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <kbd class="hidden sm:inline-block absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs">
                /
              </kbd>
            </div>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2">
            
            <div class="hidden lg:flex items-center text-xs">
              <select
                id="header-subject-filter"
                class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Subjects</option>
                ${subjects
                  .map((s) => `<option value="${escapeAttr(s)}" ${state.filterSubject === s ? 'selected' : ''}>${escapeAttr(s)}</option>`)
                  .join('')}
              </select>
            </div>

            <div class="hidden lg:flex items-center text-xs">
              <select
                id="header-priority-filter"
                class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all" ${state.filterPriority === 'all' ? 'selected' : ''}>All Priorities</option>
                <option value="high" ${state.filterPriority === 'high' ? 'selected' : ''}>🔴 High Priority</option>
                <option value="medium" ${state.filterPriority === 'medium' ? 'selected' : ''}>🟡 Medium Priority</option>
                <option value="low" ${state.filterPriority === 'low' ? 'selected' : ''}>🟢 Low Priority</option>
              </select>
            </div>

            <button
              type="button"
              id="btn-timer-trigger"
              class="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Focus Timer (P)"
              aria-label="Pomodoro Timer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>

            <button
              type="button"
              id="btn-sound-toggle"
              class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="${isMuted ? 'Unmute sounds' : 'Mute sounds'}"
              aria-label="Sound toggle"
            >
              ${
                isMuted
                  ? '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>'
                  : '<svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>'
              }
            </button>

            <button
              type="button"
              id="btn-theme-toggle"
              class="p-2 rounded-xl text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light theme (D)"
              aria-label="Toggle Theme"
            >
              ${
                state.theme === 'dark'
                  ? '<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
                  : '<svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>'
              }
            </button>

            <button
              type="button"
              id="btn-shortcuts-trigger"
              class="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Keyboard Shortcuts (?)"
              aria-label="Shortcuts"
            >
              <span class="text-xs font-bold font-mono">?</span>
            </button>

            <button
              type="button"
              id="btn-create-task-header"
              class="btn-trigger-new-task px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              title="Create Assignment (N)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span class="hidden sm:inline">New Task</span>
              <kbd class="hidden md:inline-block px-1 rounded text-[10px] bg-indigo-700/50 font-mono">N</kbd>
            </button>

          </div>
        </div>
      </header>
    `;

    const searchInput = container.querySelector('#global-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => store.setSearchQuery(e.target.value);
    }

    const subjectFilter = container.querySelector('#header-subject-filter');
    if (subjectFilter) {
      subjectFilter.onchange = (e) => store.setFilterSubject(e.target.value);
    }

    const priorityFilter = container.querySelector('#header-priority-filter');
    if (priorityFilter) {
      priorityFilter.onchange = (e) => store.setFilterPriority(e.target.value);
    }

    const themeBtn = container.querySelector('#btn-theme-toggle');
    if (themeBtn) {
      themeBtn.onclick = () => store.toggleTheme();
    }

    const soundBtn = container.querySelector('#btn-sound-toggle');
    if (soundBtn) {
      soundBtn.onclick = () => {
        soundManager.toggleMute();
        renderHeader(container);
      };
    }

    const timerBtn = container.querySelector('#btn-timer-trigger');
    if (timerBtn) {
      timerBtn.onclick = () => pomodoroModal.open();
    }

    const shortcutsBtn = container.querySelector('#btn-shortcuts-trigger');
    if (shortcutsBtn) {
      shortcutsBtn.onclick = () => shortcutsModal.open();
    }

    const createBtn = container.querySelector('#btn-create-task-header');
    if (createBtn) {
      createBtn.onclick = () => taskModal.openCreate();
    }

    const mobileSidebarBtn = container.querySelector('#btn-mobile-sidebar-toggle');
    if (mobileSidebarBtn) {
      mobileSidebarBtn.onclick = () => {
        const drawer = document.getElementById('mobile-drawer-root');
        if (drawer) drawer.classList.remove('hidden');
      };
    }
  }

  // =========================================================================
  // 18. SIDEBAR COMPONENT
  // =========================================================================
  function renderSidebar(container) {
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
        
        <div class="space-y-6">
          
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

    container.querySelectorAll('.nav-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        store.setCurrentView(btn.dataset.view);
        const drawer = document.getElementById('mobile-drawer-root');
        if (drawer) drawer.classList.add('hidden');
      };
    });

    container.querySelectorAll('.subject-chip').forEach((btn) => {
      btn.onclick = () => store.setFilterSubject(btn.dataset.subject);
    });

    const resetSubBtn = container.querySelector('#btn-reset-subject');
    if (resetSubBtn) {
      resetSubBtn.onclick = () => store.setFilterSubject('all');
    }

    const timerBtn = container.querySelector('#btn-sidebar-focus-timer');
    if (timerBtn) {
      timerBtn.onclick = () => pomodoroModal.open();
    }

    const resetBtn = container.querySelector('#btn-reset-sample');
    if (resetBtn) {
      resetBtn.onclick = async () => {
        if (confirm('Reset dashboard to fresh sample student assignments?')) {
          await store.resetData();
          toast.show('Dashboard reset with sample assignments!', 'success');
        }
      };
    }

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
        toast.show('Backup exported successfully!', 'success');
      };
    }
  }

  // =========================================================================
  // 19. MAIN APP COORDINATOR & ROBUST BOOTSTRAPPER
  // =========================================================================
  class FocusFlowApp {
    constructor() {
      this.headerEl = null;
      this.sidebarEl = null;
      this.mobileDrawerEl = null;
      this.mobileBottomNavEl = null;
      this.mainViewEl = null;
    }

    async init() {
      this.headerEl = document.getElementById('header-container');
      this.sidebarEl = document.getElementById('sidebar-container');
      this.mobileDrawerEl = document.getElementById('mobile-drawer-content');
      this.mobileBottomNavEl = document.getElementById('mobile-bottom-nav');
      this.mainViewEl = document.getElementById('main-view-container');

      toast.init();

      store.subscribe((state, event, data) => {
        this.handleStateChange(state, event, data);
      });

      this.setupKeyboardShortcuts();
      this.setupGlobalDelegation();

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

      await store.init();
    }

    handleStateChange(state, event, data) {
      if (event === 'loading_start') {
        if (this.mainViewEl) {
          this.mainViewEl.innerHTML = `
            <div class="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-xs font-semibold">Loading assignments...</span>
            </div>
          `;
        }
        return;
      }

      if (this.headerEl) renderHeader(this.headerEl);
      if (this.sidebarEl) renderSidebar(this.sidebarEl);
      if (this.mobileDrawerEl) renderSidebar(this.mobileDrawerEl);
      this.renderMobileBottomNav();
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
      if (fab) fab.onclick = () => taskModal.openCreate();
    }

    setupGlobalDelegation() {
      document.addEventListener('click', async (e) => {
        const toggleBtn = e.target.closest('.btn-toggle-task');
        if (toggleBtn) {
          e.stopPropagation();
          const taskId = toggleBtn.dataset.id;
          if (taskId) await store.toggleComplete(taskId);
          return;
        }

        const editBtn = e.target.closest('.btn-edit-task');
        if (editBtn) {
          e.stopPropagation();
          const taskId = editBtn.dataset.id;
          const task = store.getTasks().find((t) => t.id === taskId);
          if (task) taskModal.openEdit(task);
          return;
        }

        const deleteBtn = e.target.closest('.btn-delete-task');
        if (deleteBtn) {
          e.stopPropagation();
          const taskId = deleteBtn.dataset.id;
          if (taskId) await store.deleteTask(taskId);
          return;
        }

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

        if (isInput) return;

        if (e.key === 'n' || e.key === 'N' || e.key === '+') {
          e.preventDefault();
          taskModal.openCreate();
          return;
        }

        if (e.key === '/') {
          e.preventDefault();
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          return;
        }

        if (e.key === '?') {
          e.preventDefault();
          shortcutsModal.open();
          return;
        }

        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          store.toggleTheme();
          return;
        }

        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          pomodoroModal.open();
          return;
        }

        if (e.key === '1') store.setCurrentView('today');
        if (e.key === '2') store.setCurrentView('board');
        if (e.key === '3') store.setCurrentView('upcoming');
        if (e.key === '4') store.setCurrentView('overdue');
        if (e.key === '5') store.setCurrentView('all');
      });
    }
  }

  // Resilient start: handles both before and after DOMContentLoaded
  function bootstrap() {
    try {
      const app = new FocusFlowApp();
      app.init();
    } catch (err) {
      console.error('FocusFlow bootstrap error:', err);
      const container = document.getElementById('main-view-container');
      if (container) {
        container.innerHTML = `
          <div class="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-sm">
            <h3 class="font-bold text-base mb-1">Initialization Notice</h3>
            <p>${err.message}</p>
          </div>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
