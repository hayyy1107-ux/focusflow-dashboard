/**
 * FocusFlow - Daily Progress Ring Component
 * SVG Circular Progress Ring with animations, milestone celebrations,
 * and daily workload metrics.
 */

import { store } from '../store.js';

export function renderProgressRing(containerId = 'progress-ring-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const stats = store.getTodayStats();
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
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
        
        <!-- SVG Progress Ring -->
        <div class="relative flex-shrink-0 w-28 h-28 flex items-center justify-center group">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <!-- Background track -->
            <circle
              cx="50"
              cy="50"
              r="${radius}"
              class="stroke-slate-200 dark:stroke-slate-800"
              stroke-width="8"
              fill="transparent"
            />
            <!-- Gradient definition -->
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${isComplete ? '#10b981' : '#6366f1'}" />
                <stop offset="100%" stop-color="${isComplete ? '#34d399' : '#a855f7'}" />
              </linearGradient>
            </defs>
            <!-- Progress stroke -->
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

          <!-- Center Text -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : ''}">
              ${stats.percent}%
            </span>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Today
            </span>
          </div>
        </div>

        <!-- Progress Metrics & Details -->
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

          <!-- Micro Progress Bar breakdown -->
          <div class="w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style="width: ${stats.percent}%"
            ></div>
          </div>

          <!-- Streak & Quick Encouragement -->
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
