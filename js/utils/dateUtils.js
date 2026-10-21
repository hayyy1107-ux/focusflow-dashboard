/**
 * FocusFlow - Date & Time Utility Functions
 */

export const dateUtils = {
  /**
   * Parse date safely
   */
  parse(dateInput) {
    if (!dateInput) return new Date();
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  },

  /**
   * Check if date is today
   */
  isToday(dateInput) {
    const d = this.parse(dateInput);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  },

  /**
   * Check if date is tomorrow
   */
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

  /**
   * Check if date is overdue (in past and not completed)
   */
  isOverdue(dateInput, completed = false) {
    if (completed) return false;
    const d = this.parse(dateInput);
    const now = new Date();
    return d.getTime() < now.getTime();
  },

  /**
   * Check if date is upcoming (strictly after today)
   */
  isUpcoming(dateInput) {
    const d = this.parse(dateInput);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return d.getTime() > todayEnd.getTime();
  },

  /**
   * Check if date is within next N days
   */
  isWithinDays(dateInput, days = 7) {
    const d = this.parse(dateInput);
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + days);
    return d.getTime() >= now.getTime() && d.getTime() <= limit.getTime();
  },

  /**
   * Get relative difference in days from today
   */
  getDaysDifference(dateInput) {
    const d = this.parse(dateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  },

  /**
   * Format human relative deadline text
   */
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

  /**
   * Format standard date string (e.g., "Wednesday, Oct 21, 2026")
   */
  formatHeaderDate(dateInput = new Date()) {
    const d = this.parse(dateInput);
    return d.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  /**
   * Format for datetime-local input value (YYYY-MM-DDTHH:mm)
   */
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

  /**
   * Add days to date
   */
  addDays(dateInput, days) {
    const d = new Date(this.parse(dateInput));
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Add hours to date
   */
  addHours(dateInput, hours) {
    const d = new Date(this.parse(dateInput));
    d.setHours(d.getHours() + hours);
    return d;
  }
};
