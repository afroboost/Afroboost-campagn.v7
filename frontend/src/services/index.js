// /services/index.js - Export centralisé des services Afroboost
// Compatible Vercel - Données persistées dans MongoDB

// === EMAIL SERVICE (EmailJS + MongoDB) ===
export {
  getEmailJSConfig,
  getEmailJSConfigSync,
  saveEmailJSConfig,
  isEmailJSConfigured,
  initEmailJS,
  sendEmail,
  sendBulkEmails,
  testEmailJSConfig
} from './emailService';

// === WHATSAPP SERVICE (Twilio + MongoDB) ===
export {
  getWhatsAppConfig,
  getWhatsAppConfigSync,
  saveWhatsAppConfig,
  isWhatsAppConfigured,
  formatPhoneE164,
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  testWhatsAppConfig
} from './whatsappService';

// === AI RESPONSE SERVICE ===
export {
  getAIConfig,
  saveAIConfig,
  isAIEnabled,
  setLastMediaUrl,
  addAILog,
  getAILogs,
  clearAILogs,
  findClientByPhone,
  buildAIContext
} from './aiResponseService';
