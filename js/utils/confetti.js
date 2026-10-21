/**
 * FocusFlow - Confetti Celebration Helper
 */

export function triggerConfetti() {
  if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
    try {
      // First burst
      window.confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      });

      // Side fireworks
      setTimeout(() => {
        window.confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#6366f1', '#38bdf8'],
        });
        window.confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f59e0b', '#ec4899', '#a855f7'],
        });
      }, 200);
    } catch (e) {
      console.warn('Confetti trigger failed:', e);
    }
  }
}
