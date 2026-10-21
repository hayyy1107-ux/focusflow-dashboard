/**
 * FocusFlow - Mock API & Local Persistence Layer
 * Provides simulated async API operations, seed dataset relative to now,
 * and robust LocalStorage persistence.
 */

import { dateUtils } from './utils/dateUtils.js';

const STORAGE_KEY = 'focusflow_tasks_v1';
const SIMULATED_LATENCY_MS = 60; // snappy yet demonstrates async state flow

export const SUBJECT_COLORS = {
  'Computer Science': { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-800', dot: 'bg-indigo-500' },
  'Mathematics': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'Physics': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  'Literature': { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-300 dark:border-rose-800', dot: 'bg-rose-500' },
  'Chemistry': { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-800', dot: 'bg-cyan-500' },
  'History': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-800', dot: 'bg-purple-500' },
  'Biology': { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-300 dark:border-teal-800', dot: 'bg-teal-500' },
  'General': { bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-700', dot: 'bg-slate-500' }
};

export function getSubjectStyle(subject) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS['General'];
}

export function generateSeedTasks() {
  const now = new Date();

  // Helper for generating relative ISO date strings
  const relativeDate = (daysOffset, hours, minutes) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'task-1',
      title: 'CS 201: Binary Search Trees & AVL Tree Balancing',
      subject: 'Computer Science',
      deadline: relativeDate(0, 18, 0), // Today 6:00 PM
      priority: 'high',
      completed: false,
      completedAt: null,
      notes: 'Implement insertion, deletion, and rotation methods with O(log n) verification tests.',
      estimatedMinutes: 90,
      createdAt: relativeDate(-3, 10, 0),
      updatedAt: relativeDate(-1, 14, 0)
    },
    {
      id: 'task-2',
      title: 'Physics Lab 4: Pendulum Damping & Harmonic Motion',
      subject: 'Physics',
      deadline: relativeDate(0, 21, 30), // Today 9:30 PM
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
      deadline: relativeDate(0, 15, 0), // Today earlier
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
      deadline: relativeDate(0, 12, 0), // Today noon
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
      deadline: relativeDate(-1, 23, 59), // Yesterday (Overdue!)
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
      deadline: relativeDate(-2, 17, 0), // 2 days ago (Overdue!)
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
      title: 'Literature: Critical Analysis of Hamlet Act III Soliloquy',
      subject: 'Literature',
      deadline: relativeDate(1, 16, 0), // Tomorrow 4:00 PM
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
      title: 'Web Dev: Build FocusFlow Student Dashboard Milestone 2',
      subject: 'Computer Science',
      deadline: relativeDate(2, 23, 59), // In 2 days
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
      deadline: relativeDate(4, 11, 0), // In 4 days
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
      deadline: relativeDate(6, 17, 0), // In 6 days
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

export const mockApi = {
  /**
   * Fetch all tasks from storage or seed defaults
   */
  async getTasks() {
    await new Promise((res) => setTimeout(res, SIMULATED_LATENCY_MS));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = generateSeedTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse stored tasks, resetting to seed data:', e);
      const seed = generateSeedTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
  },

  /**
   * Save full tasks list to storage
   */
  async saveTasks(tasks) {
    await new Promise((res) => setTimeout(res, 20));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return tasks;
  },

  /**
   * Reset data to fresh seed
   */
  async resetToDefaults() {
    const seed = generateSeedTasks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  },

  /**
   * Export all tasks as a JSON formatted string
   */
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
  },

  /**
   * Import tasks from JSON string
   */
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
      if (!Array.isArray(tasks)) {
        throw new Error('Invalid format: tasks array missing');
      }
      // Basic validation
      for (const t of tasks) {
        if (!t.id || !t.title || !t.subject || !t.priority || !t.deadline) {
          throw new Error('Task missing mandatory properties (id, title, subject, priority, deadline)');
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return { success: true, count: tasks.length, tasks };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
