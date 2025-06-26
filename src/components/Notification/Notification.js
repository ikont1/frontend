import React from 'react';
import './Notification.css';

const Notification = ({ title, message, secondaryMessage, thirdMessage, icon: Icon, buttons, type }) => {
  return (
    <div className="notification-overlay">
      <div className={`notification ${type}`}>
        <div className="notification-icon">
          {Icon && <Icon />}
        </div>
        <div className="notification-message">
          {title && <h2>{title}</h2>}
          {message && <p>{message}</p>}
          {secondaryMessage && <p className="secondary-message">{secondaryMessage}</p>}
          {thirdMessage && <p className="secondary-message">{thirdMessage}</p>}
          <div className="notification-buttons">
            {buttons && buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`notification-button ${button.className || ''}`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
