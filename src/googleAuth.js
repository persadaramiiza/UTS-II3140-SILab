// Google OAuth Integration for SILab

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_URL = import.meta.env.VITE_API_URL || '/api';

let googleInitialized = false;

/**
 * Initialize Google Sign-In
 */
export function initGoogleSignIn() {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured. Google Sign-In disabled.');
    return;
  }

  if (googleInitialized) {
    console.log('Google Sign-In already initialized');
    return;
  }

  // Wait for Google script to load
  const checkGoogleLoaded = setInterval(() => {
    if (typeof google !== 'undefined') {
      clearInterval(checkGoogleLoaded);
      setupGoogleButton();
    }
  }, 100);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkGoogleLoaded);
    if (!googleInitialized) {
      console.warn('Google Sign-In script failed to load');
    }
  }, 10000);
}

/**
 * Setup Google Sign-In button
 */
function setupGoogleButton() {
  try {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    const buttonContainer = document.getElementById('google-signin-button');
    if (buttonContainer) {
      google.accounts.id.renderButton(buttonContainer, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320,
      });

      googleInitialized = true;
      console.log('Google Sign-In initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Google Sign-In:', error);
  }
}

/**
 * Handle Google Sign-In response
 * @param {Object} response - Google credential response
 */
async function handleGoogleResponse(response) {
  const loginError = document.getElementById('login-error');
  
  try {
    if (!response.credential) {
      throw new Error('No credential received from Google');
    }

    // Show loading state
    if (loginError) {
      loginError.textContent = 'Memproses login...';
      loginError.style.color = 'var(--accent)';
    }

    // Send ID token to backend
    const apiResponse = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: response.credential,
      }),
    });

    // Check if response is JSON
    const contentType = apiResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await apiResponse.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server mengembalikan response tidak valid. Pastikan backend berjalan.');
    }

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    // Store token and user info
    localStorage.setItem('isl-token', data.token);
    localStorage.setItem('isl-user', JSON.stringify(data.user));

    // Show success message
    if (loginError) {
      loginError.textContent = '✅ Login berhasil! Mengalihkan...';
      loginError.style.color = 'var(--success)';
    }

    // Dispatch custom event for app to handle
    window.dispatchEvent(
      new CustomEvent('google-login-success', {
        detail: { user: data.user, token: data.token },
      })
    );

    // Close modal and show main app
    setTimeout(() => {
      const authModal = document.getElementById('auth-modal');
      const landingPage = document.getElementById('landing-page');
      const mainApp = document.getElementById('main-app');

      if (authModal) authModal.classList.add('is-hidden');
      if (landingPage) landingPage.style.display = 'none';
      if (mainApp) mainApp.style.display = 'block';

      // Update user badge
      const userBadge = document.getElementById('userBadge');
      if (userBadge && data.user) {
        userBadge.textContent = `${data.user.name} (${data.user.role === 'assistant' ? 'Asisten' : 'Mahasiswa'})`;
      }

      // Show profile and logout buttons
      const profileBtn = document.getElementById('profileBtn');
      const logoutBtn = document.getElementById('logoutBtn');
      if (profileBtn) {
        profileBtn.style.display = 'block';
        profileBtn.style.visibility = 'visible';
        profileBtn.style.opacity = '1';
        console.log('[GoogleAuth] Profile button shown', profileBtn);
      }
      if (logoutBtn) logoutBtn.style.display = '';

      // Reload app state if needed
      window.dispatchEvent(new Event('auth-state-changed'));
    }, 1000);

  } catch (error) {
    console.error('Google login error:', error);
    if (loginError) {
      loginError.textContent = error.message || 'Login dengan Google gagal. Silakan coba lagi.';
      loginError.style.color = 'var(--danger)';
    }
  }
}

/**
 * Sign out from Google
 */
export function googleSignOut() {
  if (typeof google !== 'undefined') {
    google.accounts.id.disableAutoSelect();
  }
  localStorage.removeItem('isl-token');
  localStorage.removeItem('isl-user');
}

/**
 * Check if user is authenticated via Google
 */
export function isGoogleAuthenticated() {
  const token = localStorage.getItem('isl-token');
  const user = localStorage.getItem('isl-user');
  return !!(token && user);
}

/**
 * Get current user from local storage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('isl-user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}
