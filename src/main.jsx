import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { initGoogleSignIn } from './googleAuth.js';
import { initProfileModal } from './profileManager.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Google Sign-In and Profile Modal after DOM is ready
function initializeApp() {
  initGoogleSignIn();
  initProfileModal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded, init immediately
  setTimeout(initializeApp, 100);
}
