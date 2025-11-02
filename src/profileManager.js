// Profile Management Module
const API_BASE = 'http://localhost:4000/api';

/**
 * Get current user profile from API
 */
export async function fetchUserProfile() {
  const token = localStorage.getItem('isl-token');
  
  console.log('[Profile] Token check:', token ? `Token found (${token.substring(0, 20)}...)` : 'No token');
  
  if (!token) {
    throw new Error('Anda belum login. Silakan login terlebih dahulu.');
  }

  console.log('[Profile] Sending request to /api/users/profile with Authorization header');

  const response = await fetch(`${API_BASE}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('[Profile] API response status:', response.status);
  console.log('[Profile] Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear localStorage
      console.warn('[Profile] Token invalid/expired, clearing localStorage');
      localStorage.removeItem('isl-token');
      localStorage.removeItem('isl-user');
      throw new Error('Sesi login telah berakhir. Silakan login kembali.');
    }
    
    const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
    throw new Error(error.message || 'Failed to fetch profile');
  }

  const data = await response.json();
  console.log('[Profile] User data received:', data.user);
  return data.user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData) {
  const token = localStorage.getItem('isl-token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  const data = await response.json();
  return data;
}

/**
 * Convert image file to base64 data URL
 */
async function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      reject(new Error('Ukuran file terlalu besar. Maksimal 2MB.'));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Initialize profile modal
 */
export function initProfileModal() {
  const profileBtn = document.getElementById('profileBtn');
  const profileModal = document.getElementById('profile-modal');
  const profileClose = document.getElementById('profileClose');
  const profileCancel = document.getElementById('profileCancel');
  const profileForm = document.getElementById('profile-form');
  const profileError = document.getElementById('profile-error');
  const profileSuccess = document.getElementById('profile-success');
  const profileRoleLabel = document.getElementById('profile-role-label');
  
  // Profile picture elements
  const profilePictureInput = document.getElementById('profile-picture-input');
  const profilePicturePreview = document.getElementById('profile-picture-preview');
  const profilePictureBtn = document.getElementById('profilePictureBtn');

  if (!profileModal) {
    console.warn('[ProfileManager] Profile modal not found');
    return;
  }

  let currentPictureData = null;

  // Handle profile picture upload
  if (profilePictureBtn && profilePictureInput) {
    profilePictureBtn.addEventListener('click', () => {
      profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const dataURL = await fileToDataURL(file);
        currentPictureData = dataURL;
        profilePicturePreview.src = dataURL;
        console.log('[ProfileManager] Profile picture loaded');
      } catch (error) {
        alert(error.message || 'Gagal memuat gambar');
        profilePictureInput.value = '';
      }
    });
  }

  // Function to open profile modal
  async function openProfileModal() {
    try {
      if (profileError) profileError.textContent = '';
      if (profileSuccess) profileSuccess.textContent = '';

      // Fetch current user data
      const user = await fetchUserProfile();
      
      // Populate form fields
      document.getElementById('profile-name').value = user.name || '';
      document.getElementById('profile-email').value = user.email || '';
      document.getElementById('profile-username').value = user.username || '';
      document.getElementById('profile-role').value = user.role || 'student';
      document.getElementById('profile-student-id').value = user.studentId || '';
      document.getElementById('profile-department').value = user.department || '';
      document.getElementById('profile-phone').value = user.phone || '';
      document.getElementById('profile-bio').value = user.bio || '';

      // Set profile picture
      if (user.picture) {
        profilePicturePreview.src = user.picture;
        currentPictureData = user.picture;
      } else {
        profilePicturePreview.src = '';
        currentPictureData = null;
      }

      // Role selector - always enabled for all users
      const roleSelect = document.getElementById('profile-role');
      const roleLabelText = document.getElementById('profile-role-label-text');
      
      if (profileRoleLabel && roleSelect) {
        profileRoleLabel.style.display = 'flex'; // Always show
        roleSelect.disabled = false; // Enable for all users
        
        if (roleLabelText) {
          roleLabelText.textContent = 'Status Pengguna *';
        }
      }

      profileModal.classList.remove('is-hidden');
      document.getElementById('profile-name')?.focus();
    } catch (error) {
      console.error('Failed to load profile:', error);
      
      // If session expired, show login modal
      if (error.message.includes('Sesi login telah berakhir')) {
        alert('Sesi login Anda telah berakhir. Silakan login kembali.');
        
        // Clear state and show login
        if (window.state && window.state.auth) {
          window.state.auth.currentUser = null;
        }
        
        // Trigger auth UI update
        window.dispatchEvent(new Event('auth-state-changed'));
        
        // Show auth modal
        const authModal = document.getElementById('auth-modal');
        const landingPage = document.getElementById('landing-page');
        const mainApp = document.getElementById('main-app');
        
        if (authModal) authModal.classList.remove('is-hidden');
        if (landingPage) landingPage.style.display = 'block';
        if (mainApp) mainApp.style.display = 'none';
        
        return;
      }
      
      alert('Gagal memuat data profile: ' + error.message);
    }
  }

  // Expose to window for landing page buttons
  window.profileManager = {
    openProfileModal
  };

  // Show profile button if user is logged in
  const token = localStorage.getItem('isl-token');
  const user = getCurrentUser();
  if (token && user && profileBtn) {
    profileBtn.style.display = 'block';
    console.log('[ProfileManager] Profile button shown on init');
  }

  // Open profile modal on button click
  if (profileBtn) {
    profileBtn.addEventListener('click', openProfileModal);
  }

  // Close modal
  const closeModal = () => {
    profileModal.classList.add('is-hidden');
    profileError.textContent = '';
    profileSuccess.textContent = '';
    profileForm.reset();
  };

  profileClose.addEventListener('click', closeModal);
  profileCancel.addEventListener('click', closeModal);

  // Handle form submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    profileError.textContent = '';
    profileSuccess.textContent = '';

    const formData = new FormData(profileForm);
    const profileData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      studentId: formData.get('studentId'),
      department: formData.get('department'),
      phone: formData.get('phone'),
      bio: formData.get('bio'),
      picture: currentPictureData // Include base64 image data
    };

    try {
      const result = await updateUserProfile(profileData);
      
      // Update local storage
      const currentUser = JSON.parse(localStorage.getItem('isl-user') || '{}');
      const updatedUser = { ...currentUser, ...result.user };
      localStorage.setItem('isl-user', JSON.stringify(updatedUser));

      // Update UI
      const userBadge = document.getElementById('userBadge');
      if (userBadge) {
        const roleLabel = updatedUser.role === 'assistant' ? 'Asisten' : 'Mahasiswa';
        userBadge.textContent = `${updatedUser.name} (${roleLabel})`;
      }

      // Update landing page badge
      const landingUserBadge = document.getElementById('landing-user-badge');
      if (landingUserBadge) {
        const roleLabel = updatedUser.role === 'assistant' ? 'Asisten' : 'Mahasiswa';
        landingUserBadge.textContent = `${updatedUser.name} (${roleLabel})`;
      }

      // Show success message
      profileSuccess.textContent = result.message || 'Profile berhasil diperbarui!';
      profileSuccess.style.color = 'var(--success)';
      profileSuccess.style.color = 'var(--success)';

      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { user: updatedUser }
      }));

      // Close modal after 1.5 seconds
      setTimeout(closeModal, 1500);
    } catch (error) {
      console.error('Profile update error:', error);
      profileError.textContent = error.message || 'Gagal memperbarui profile';
      profileError.style.color = 'var(--danger)';
    }
  });
}

/**
 * Get current user from localStorage
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
