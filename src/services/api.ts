// Legacy API service file - now imports from the new modular structure
// This file is kept for backward compatibility

export { apiService as default, apiService } from './api/index';

// Re-export all the individual services and types for direct access
export * from './api/index';