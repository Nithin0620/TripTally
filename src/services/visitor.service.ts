/**
 * Visitor Service
 * Handles visitor tracking logic
 */

const VISITOR_ID_KEY = 'tripTallyVisitorId';

export const visitor = {
  /**
   * Get existing visitor ID from localStorage (does NOT create new)
   */
  getVisitorId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(VISITOR_ID_KEY);
  },

  /**
   * Create and store a new visitor ID
   */
  createVisitorId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const newId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, newId);
    return newId;
  },

  /**
   * Check if visitor is new (first time visiting)
   */
  isNewVisitor(): boolean {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(VISITOR_ID_KEY);
  },

  /**
   * Register a new visitor
   */
  async registerVisitor(visitorUuid: string): Promise<void> {
    if (!visitorUuid || typeof window === 'undefined') {
      return;
    }

    try {
      await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitor_uuid: visitorUuid }),
      });
    } catch {
      // Silent fail - don't break UI
    }
  },

  /**
   * Get total visitor count with fallback to 0
   */
  async getVisitorCount(): Promise<number> {
    if (typeof window === 'undefined') {
      return 0;
    }

    try {
      const response = await fetch('/api/visitors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch {
      // Silent fail - return 0 as fallback
      return 0;
    }
  },
};
