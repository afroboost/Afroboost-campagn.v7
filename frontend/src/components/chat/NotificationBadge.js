/**
 * NotificationBadge.js - Composant isolé pour indicateur visuel de notifications
 * 
 * v7.1 - Ajouté pour améliorer la visibilité des nouveaux messages
 * Ce composant est indépendant et n'impacte pas CoachDashboard.js
 * 
 * Usage:
 *   <NotificationBadge count={unreadCount} pulse={hasNewMessage} />
 */

import React, { useState, useEffect } from 'react';

/**
 * Badge de notification avec animation pulse
 * @param {number} count - Nombre de messages non lus
 * @param {boolean} pulse - Active l'animation de pulsation
 * @param {string} size - Taille du badge ('sm', 'md', 'lg')
 * @param {function} onClick - Callback au clic
 */
const NotificationBadge = ({ 
  count = 0, 
  pulse = false, 
  size = 'md',
  onClick = null,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Déclencher l'animation quand un nouveau message arrive
  useEffect(() => {
    if (pulse && count > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [pulse, count]);
  
  // Ne pas afficher si pas de messages
  if (count <= 0) return null;
  
  // Tailles selon prop
  const sizes = {
    sm: { badge: '16px', font: '10px', padding: '2px 5px' },
    md: { badge: '20px', font: '11px', padding: '3px 7px' },
    lg: { badge: '24px', font: '12px', padding: '4px 9px' }
  };
  
  const sizeConfig = sizes[size] || sizes.md;
  
  // Formater le compteur (99+ si > 99)
  const displayCount = count > 99 ? '99+' : count;
  
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: sizeConfig.badge,
        height: sizeConfig.badge,
        padding: sizeConfig.padding,
        borderRadius: '999px',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#fff',
        fontSize: sizeConfig.font,
        fontWeight: '600',
        boxShadow: isAnimating 
          ? '0 0 0 4px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 6px rgba(0,0,0,0.3)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        animation: isAnimating ? 'notification-pulse 0.6s ease-in-out 3' : 'none',
        zIndex: 50
      }}
    >
      {displayCount}
      
      {/* Animation CSS inline pour isolation totale */}
      <style>{`
        @keyframes notification-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

/**
 * Badge flottant avec icône cloche
 * Pour utilisation dans la barre de navigation
 */
export const NotificationBell = ({ 
  count = 0, 
  onClick = null,
  muted = false 
}) => {
  const [isRinging, setIsRinging] = useState(false);
  
  // Animation de cloche quand nouveau message
  useEffect(() => {
    if (count > 0) {
      setIsRinging(true);
      const timer = setTimeout(() => setIsRinging(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [count]);
  
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      title={muted ? 'Notifications désactivées' : `${count} message(s) non lu(s)`}
    >
      {/* Icône cloche SVG */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={muted ? '#666' : '#fff'}
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{
          animation: isRinging && !muted ? 'bell-ring 0.5s ease-in-out 2' : 'none',
          opacity: muted ? 0.5 : 1
        }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      
      {/* Badge compteur */}
      {count > 0 && !muted && (
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px',
            borderRadius: '999px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
      
      {/* Indicateur mute */}
      {muted && (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            width: '24px',
            height: '2px',
            background: '#ef4444',
            borderRadius: '1px'
          }}
        />
      )}
      
      <style>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
      `}</style>
    </button>
  );
};

/**
 * Point de notification simple (sans compteur)
 * Pour indiquer qu'il y a du nouveau
 */
export const NotificationDot = ({ visible = false, color = '#ef4444' }) => {
  if (!visible) return null;
  
  return (
    <span
      style={{
        position: 'absolute',
        top: '-2px',
        right: '-2px',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: color,
        border: '2px solid #1a1a1a',
        animation: 'dot-pulse 2s ease-in-out infinite'
      }}
    >
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </span>
  );
};

export default NotificationBadge;
