// Main API service that combines all individual services
import { authApi } from './auth';
import { categoriesApi } from './categories';
import { documentsApi } from './documents';
import { emailsApi } from './emails';
import { mailboxApi } from './mailbox';
import { analyticsApi } from './analytics';

// Export individual services
export { authApi } from './auth';
export { categoriesApi } from './categories';
export { documentsApi } from './documents';
export { emailsApi } from './emails';
export { mailboxApi } from './mailbox';
export { analyticsApi } from './analytics';

// Export types
export type { AuthResponse } from './auth';
export type { DocumentsParams } from './documents';
export type { EmailsParams, AIResponseData, SendReplyData } from './emails';
export type { MailboxConnectionTest, AutoReplyRule, MonitoringStats } from './mailbox';
export type { LogsParams, DashboardAnalytics } from './analytics';
export type { ApiResponse, PaginatedResponse } from './base';

// Combined API service class for backward compatibility
class ApiService {
  // Authentication
  login = authApi.login.bind(authApi);
  register = authApi.register.bind(authApi);
  logout = authApi.logout.bind(authApi);
  refreshToken = authApi.refreshUserToken.bind(authApi);

  // Categories
  getCategories = categoriesApi.getCategories.bind(categoriesApi);
  createCategory = categoriesApi.createCategory.bind(categoriesApi);
  updateCategory = categoriesApi.updateCategory.bind(categoriesApi);
  deleteCategory = categoriesApi.deleteCategory.bind(categoriesApi);
  getCategoryById = categoriesApi.getCategoryById.bind(categoriesApi);

  // Documents
  getDocuments = documentsApi.getDocuments.bind(documentsApi);
  uploadDocument = documentsApi.uploadDocument.bind(documentsApi);
  getDocumentContent = documentsApi.getDocumentContent.bind(documentsApi);
  deleteDocument = documentsApi.deleteDocument.bind(documentsApi);
  updateDocumentCategories = documentsApi.updateDocumentCategories.bind(documentsApi);

  // Emails
  getEmails = emailsApi.getEmails.bind(emailsApi);
  getEmailDetails = emailsApi.getEmailDetails.bind(emailsApi);
  markEmailAsRead = emailsApi.markEmailAsRead.bind(emailsApi);
  starEmail = emailsApi.starEmail.bind(emailsApi);
  archiveEmail = emailsApi.archiveEmail.bind(emailsApi);
  deleteEmail = emailsApi.deleteEmail.bind(emailsApi);
  generateAIResponse = emailsApi.generateAIResponse.bind(emailsApi);
  sendReply = emailsApi.sendReply.bind(emailsApi);
  forwardEmail = emailsApi.forwardEmail.bind(emailsApi);
  getSentEmails = emailsApi.getSentEmails.bind(emailsApi);

  // Mailbox
  getMailboxConfig = mailboxApi.getMailboxConfig.bind(mailboxApi);
  updateMailboxConfig = mailboxApi.updateMailboxConfig.bind(mailboxApi);
  configureMailbox = mailboxApi.configureMailbox.bind(mailboxApi);
  testMailboxConnection = mailboxApi.testMailboxConnection.bind(mailboxApi);
  
  // Monitoring
  getMonitoringStats = mailboxApi.getMonitoringStats.bind(mailboxApi);
  startMonitoring = mailboxApi.startMonitoring.bind(mailboxApi);
  stopMonitoring = mailboxApi.stopMonitoring.bind(mailboxApi);
  getMonitoringStatus = mailboxApi.getMonitoringStatus.bind(mailboxApi);
  
  // Auto-Reply Rules
  getAutoReplyRules = mailboxApi.getAutoReplyRules.bind(mailboxApi);
  createAutoReplyRule = mailboxApi.createAutoReplyRule.bind(mailboxApi);
  updateAutoReplyRule = mailboxApi.updateAutoReplyRule.bind(mailboxApi);
  deleteAutoReplyRule = mailboxApi.deleteAutoReplyRule.bind(mailboxApi);
  toggleAutoReplyRule = mailboxApi.toggleAutoReplyRule.bind(mailboxApi);
  
  // Email Processing Control
  pauseEmailProcessing = mailboxApi.pauseEmailProcessing.bind(mailboxApi);
  resumeEmailProcessing = mailboxApi.resumeEmailProcessing.bind(mailboxApi);
  
  // Sync and Health
  syncMailbox = mailboxApi.syncMailbox.bind(mailboxApi);
  healthCheck = mailboxApi.healthCheck.bind(mailboxApi);

  // Analytics & Logs
  getLogs = analyticsApi.getLogs.bind(analyticsApi);
  getDashboardAnalytics = analyticsApi.getDashboardAnalytics.bind(analyticsApi);
  exportLogs = analyticsApi.exportLogs.bind(analyticsApi);
  getAIResponseHistory = analyticsApi.getAIResponseHistory.bind(analyticsApi);
  approveAIResponse = analyticsApi.approveAIResponse.bind(analyticsApi);
  rejectAIResponse = analyticsApi.rejectAIResponse.bind(analyticsApi);
}

// Export the combined service for backward compatibility
export const apiService = new ApiService();

// Export default as the combined service
export default apiService;