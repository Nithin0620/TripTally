/**
 * Migration Script: Clear Old localStorage Tokens
 * 
 * Run this once to clean up old tokens from localStorage
 * since we've migrated to HTTP-only cookies for security
 */

(function() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const oldToken = localStorage.getItem('auth_token');
    
    if (oldToken) {
      console.log('🔄 Cleaning up old authentication token from localStorage...');
      localStorage.removeItem('auth_token');
      console.log('✅ Migration complete! Your authentication now uses secure HTTP-only cookies.');
      console.log('ℹ️  Please refresh the page to restore your session.');
    } else {
      console.log('✅ No migration needed - already using secure cookies!');
    }
  }
})();

// Export for module usage
export function migrateAuthStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const oldToken = localStorage.getItem('auth_token');
    if (oldToken) {
      localStorage.removeItem('auth_token');
      return true;
    }
  }
  return false;
}
