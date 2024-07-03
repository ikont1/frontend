import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-circle"></div>
      </div>
    </div>
  );
};

export default Loading;
