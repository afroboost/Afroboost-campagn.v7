// emailService.js - Service d'envoi d'emails automatisés via EmailJS
// Compatible Vercel - Configuration stockée dans localStorage et MongoDB
import emailjs from '@emailjs/browser';

// API URL
const API = process.env.REACT_APP_BACKEND_URL || '';

// === CONFIGURATION DÉFAUT (si rien n'est configuré) ===
const DEFAULT_CONFIG = {
  serviceId: 'service_8mrmxim',
  templateId: 'template_3n1u86p',
  publicKey: '5LfgQSIEQoqq_XSqt'
};

// === CONFIGURATION CACHE (localStorage) ===
let cachedConfig = null;

/**
 * Charge la config depuis localStorage (synchrone)
 */
const loadConfigFromStorage = () => {
  try {
    const stored = localStorage.getItem('emailjs_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading EmailJS config from storage:', e);
  }
  return DEFAULT_CONFIG;
};

/**
 * Sauvegarde la config dans localStorage
 */
const saveConfigToStorage = (config) => {
  try {
    localStorage.setItem('emailjs_config', JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error saving EmailJS config to storage:', e);
    return false;
  }
};

// Initialiser le cache au chargement
cachedConfig = loadConfigFromStorage();

/**
 * Récupère la configuration EmailJS (synchrone depuis cache)
 */
export const getEmailJSConfig = () => {
  if (!cachedConfig) {
    cachedConfig = loadConfigFromStorage();
  }
  return cachedConfig;
};

/**
 * Sauvegarde la configuration EmailJS
 */
export const saveEmailJSConfig = (config) => {
  cachedConfig = config;
  const saved = saveConfigToStorage(config);
  
  // Aussi sauvegarder en backend si disponible
  try {
    fetch(`${API}/api/emailjs-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).catch(e => console.log('Backend save optional:', e));
  } catch (e) {
    // Ignorer si backend non disponible
  }
  
  return saved;
};

/**
 * Vérifie si EmailJS est configuré
 */
export const isEmailJSConfigured = () => {
  const config = getEmailJSConfig();
  return !!(config.serviceId && config.templateId && config.publicKey);
};

/**
 * Initialise EmailJS avec la clé publique
 */
export const initEmailJS = () => {
  const config = getEmailJSConfig();
  if (config.publicKey) {
    try {
      emailjs.init(config.publicKey);
      console.log('✅ EmailJS initialized with public key');
      return true;
    } catch (e) {
      console.error('❌ EmailJS init error:', e);
      return false;
    }
  }
  return false;
};

/**
 * Envoie un email à un destinataire unique
 */
export const sendEmail = async (params) => {
  const config = getEmailJSConfig();
  
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    console.error('❌ EmailJS non configuré:', config);
    throw new Error('EmailJS non configuré. Veuillez configurer les clés dans l\'onglet Campagnes.');
  }

  // Initialiser EmailJS
  initEmailJS();

  // Personnaliser le message avec le prénom
  let personalizedMessage = params.message || '';
  if (params.to_name) {
    const firstName = params.to_name.split(' ')[0];
    personalizedMessage = personalizedMessage.replace(/{prénom}/gi, firstName);
  }

  // Ajouter le média au message si présent
  const fullMessage = params.media_url 
    ? `${personalizedMessage}\n\n🔗 Voir le visuel: ${params.media_url}`
    : personalizedMessage;

  // PARAMÈTRES EXACTS pour le template EmailJS
  const templateParams = {
    to_email: params.to_email,
    to_name: params.to_name || 'Client',
    subject: params.subject || 'Afroboost - Message',
    message: fullMessage,
    from_name: 'Afroboost',
    reply_to: 'contact.artboost@gmail.com'
  };

  console.log('📧 Sending email with params:', {
    serviceId: config.serviceId,
    templateId: config.templateId,
    to: params.to_email,
    subject: templateParams.subject
  });

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );
    
    console.log('✅ Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ EmailJS send error:', error);
    return { success: false, error: error.text || error.message || 'Erreur inconnue' };
  }
};

/**
 * Envoie des emails en masse avec progression
 */
export const sendBulkEmails = async (recipients, campaign, onProgress) => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
    details: []
  };

  const total = recipients.length;

  // Vérifier la configuration
  if (!isEmailJSConfigured()) {
    console.error('❌ EmailJS not configured');
    return {
      ...results,
      failed: total,
      errors: ['EmailJS non configuré']
    };
  }

  // Initialiser EmailJS
  initEmailJS();

  console.log(`📧 Starting bulk email send to ${total} recipients...`);

  // Envoyer les emails un par un avec délai
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    if (onProgress) {
      onProgress(i + 1, total, 'sending', recipient.name || recipient.email);
    }

    try {
      const result = await sendEmail({
        to_email: recipient.email,
        to_name: recipient.name,
        subject: campaign.name,
        message: campaign.message,
        media_url: campaign.mediaUrl
      });

      if (result.success) {
        results.sent++;
        results.details.push({
          email: recipient.email,
          name: recipient.name,
          status: 'sent'
        });
        console.log(`✅ [${i + 1}/${total}] Email sent to ${recipient.email}`);
      } else {
        results.failed++;
        results.errors.push(`${recipient.email}: ${result.error}`);
        results.details.push({
          email: recipient.email,
          name: recipient.name,
          status: 'failed',
          error: result.error
        });
        console.error(`❌ [${i + 1}/${total}] Failed to send to ${recipient.email}:`, result.error);
      }
    } catch (error) {
      results.failed++;
      const errorMsg = error.message || 'Erreur inconnue';
      results.errors.push(`${recipient.email}: ${errorMsg}`);
      results.details.push({
        email: recipient.email,
        name: recipient.name,
        status: 'failed',
        error: errorMsg
      });
      console.error(`❌ [${i + 1}/${total}] Exception for ${recipient.email}:`, error);
    }

    // Délai entre les envois (300ms pour éviter rate limit)
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  if (onProgress) {
    onProgress(total, total, 'completed');
  }

  console.log(`📧 Bulk email complete: ${results.sent} sent, ${results.failed} failed`);
  return results;
};

/**
 * Teste la configuration EmailJS
 */
export const testEmailJSConfig = async (testEmail) => {
  console.log('🧪 Testing EmailJS config with email:', testEmail);
  
  const result = await sendEmail({
    to_email: testEmail,
    to_name: 'Test',
    subject: 'Test EmailJS - Afroboost',
    message: '🎉 Félicitations ! Votre configuration EmailJS fonctionne correctement.\n\nCet email a été envoyé depuis le panneau admin Afroboost.'
  });
  
  if (result.success) {
    console.log('✅ Test email sent successfully!', result.response);
  } else {
    console.error('❌ Test email failed:', result.error);
  }
  
  return result;
};

export default {
  getEmailJSConfig,
  saveEmailJSConfig,
  isEmailJSConfigured,
  initEmailJS,
  sendEmail,
  sendBulkEmails,
  testEmailJSConfig
};
