# 🔐 Google OAuth Setup Guide

Panduan lengkap untuk mengaktifkan fitur **Login dengan Google** di SILab.

---

## 📋 Prerequisites

- Google Account (untuk Google Cloud Console)
- Domain/URL aplikasi Anda (atau gunakan localhost untuk development)

---

## 🚀 Step-by-Step Setup

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Select a project** → **New Project**
3. Nama project: **SILab** (atau sesuai keinginan)
4. Klik **Create**

### 2. Enable Google+ API

1. Di dashboard project, buka **APIs & Services** → **Library**
2. Cari **"Google+ API"** atau **"Google Identity"**
3. Klik **Enable**

### 3. Configure OAuth Consent Screen

1. Buka **APIs & Services** → **OAuth consent screen**
2. Pilih **External** (untuk public app) atau **Internal** (untuk UPI only)
3. Klik **Create**

**Isi informasi berikut:**

- **App name**: SILab
- **User support email**: your-email@upi.edu
- **App logo**: (optional) upload logo ISL
- **Application home page**: https://your-domain.com
- **Authorized domains**: 
  - `upi.edu` (jika menggunakan domain UPI)
  - `localhost` (untuk development)
- **Developer contact**: your-email@upi.edu

4. **Scopes**: Klik **Add or Remove Scopes**
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Save and Continue

5. **Test users** (jika External):
   - Tambahkan email Anda dan tim
   - Save and Continue

6. Klik **Back to Dashboard**

### 4. Create OAuth 2.0 Credentials

1. Buka **APIs & Services** → **Credentials**
2. Klik **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: **SILab Web Client**

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:4000
https://your-domain.com
https://www.your-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:5173
http://localhost:4000/api/auth/google/callback
https://your-domain.com
https://your-domain.com/api/auth/google/callback
```

5. Klik **Create**
6. **Copy** Client ID dan Client Secret yang muncul

### 5. Configure Backend Environment

Edit file `backend/.env` atau buat jika belum ada:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

⚠️ **PENTING**: Jangan commit file `.env` ke Git!

### 6. Configure Frontend Environment

Buat file `.env.local` di root project:

```env
# Frontend Google OAuth
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
VITE_API_URL=http://localhost:4000
```

### 7. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (root)
cd ..
npm install
```

Dependencies yang ditambahkan:
- Backend: `google-auth-library@^9.4.1`
- Frontend: Google Sign-In script (via CDN)

### 8. Test Locally

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Test Login:**
1. Buka http://localhost:5173
2. Klik **"Masuk Aplikasi"**
3. Klik tombol **"Sign in with Google"**
4. Pilih akun Google Anda
5. Izinkan akses ke email dan profile
6. Anda harus berhasil login! 🎉

---

## 🎯 Role Assignment Logic

Sistem otomatis menentukan role berdasarkan email:

- **Email @upi.edu** → Role: `assistant` (Asisten/Dosen)
- **Email lainnya** → Role: `student` (Mahasiswa)

Contoh:
- `dosen@upi.edu` → Assistant
- `mahasiswa@student.upi.edu` → Assistant (karena domain upi.edu)
- `user@gmail.com` → Student

### Customize Role Logic

Edit `backend/src/routes/auth.js` baris ~40:

```javascript
role: googleUser.email.endsWith('@upi.edu') ? 'assistant' : 'student',
```

Ubah sesuai kebutuhan, misalnya:
```javascript
// Hanya email dosen yang jadi assistant
role: googleUser.email.endsWith('@dosen.upi.edu') ? 'assistant' : 'student',

// Atau berdasarkan list email tertentu
const assistantEmails = ['dosen1@upi.edu', 'dosen2@upi.edu'];
role: assistantEmails.includes(googleUser.email) ? 'assistant' : 'student',
```

---

## 🌐 Production Deployment

### Vercel

1. Add environment variables di Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `VITE_GOOGLE_CLIENT_ID`

2. Update **Authorized JavaScript origins** & **Redirect URIs**:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/api/auth/google/callback
   ```

### Railway / Render

1. Add environment variables:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. Update OAuth credentials dengan production URL

### Custom Domain

Jika menggunakan custom domain:

1. Tambahkan domain ke **Authorized domains** di OAuth consent screen
2. Update **Authorized JavaScript origins** dan **Redirect URIs**
3. Update environment variable `VITE_API_URL`

---

## 🔧 Troubleshooting

### Error: "Invalid Client ID"

**Solusi:**
- Pastikan `VITE_GOOGLE_CLIENT_ID` benar
- Check console browser untuk error
- Pastikan domain ada di Authorized JavaScript origins

### Error: "redirect_uri_mismatch"

**Solusi:**
- Tambahkan redirect URI yang benar di Google Console
- Format harus exact match (http vs https, trailing slash)

### Error: "Access blocked: This app's request is invalid"

**Solusi:**
- Pastikan OAuth consent screen sudah complete
- Tambahkan test users jika status "Testing"
- Verify scopes sudah benar

### User data tidak tersimpan

**Solusi:**
- Check backend logs: `npm run backend:dev`
- Verify `backend/data` folder writable
- Check `backend/data/state.json`

### Google button tidak muncul

**Solusi:**
- Check browser console untuk error
- Verify Google script loaded: `typeof google !== 'undefined'`
- Clear cache and reload
- Check `VITE_GOOGLE_CLIENT_ID` di .env.local

---

## 🔒 Security Best Practices

### 1. Protect Client Secret
```bash
# NEVER commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. Validate Email Domain
Backend otomatis validasi domain email untuk role assignment.

### 3. Use HTTPS in Production
Always use HTTPS for OAuth in production!

### 4. Rotate Credentials Regularly
Buat credentials baru setiap 6-12 bulan.

### 5. Monitor OAuth Usage
Check Google Console untuk:
- Failed login attempts
- Suspicious activity
- API quota usage

---

## 📊 Features Added

✅ **Login dengan Google**
- One-click sign in
- Auto user creation
- Email verification
- Profile picture sync

✅ **User Management**
- Auto role assignment (assistant/student)
- Link Google account to existing users
- Email-based user lookup

✅ **Security**
- JWT token generation
- Token verification
- Secure credential storage

✅ **UX Improvements**
- Social login button
- Loading states
- Error handling
- Success feedback

---

## 🎨 Customization

### Change Button Style

Edit `src/googleAuth.js` line ~40:

```javascript
google.accounts.id.renderButton(buttonContainer, {
  type: 'standard',        // or 'icon'
  theme: 'filled_blue',    // or 'outline', 'filled_black'
  size: 'large',           // or 'medium', 'small'
  text: 'signin_with',     // or 'signup_with', 'continue_with'
  shape: 'rectangular',    // or 'pill', 'circle', 'square'
  logo_alignment: 'left',  // or 'center'
  width: 320,
});
```

### Add More OAuth Providers

Struktur sudah ready untuk OAuth providers lain:
- Facebook Login
- GitHub Login
- Microsoft Login

Copy pattern dari Google OAuth implementation.

---

## 📚 Resources

- [Google Identity Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Button](https://developers.google.com/identity/gsi/web/guides/display-button)

---

## 🆘 Need Help?

1. Check [Google Identity Troubleshooting](https://developers.google.com/identity/gsi/web/guides/troubleshooting)
2. Review backend logs: `tail -f logs/backend.log`
3. Check browser console for frontend errors
4. Verify all environment variables set correctly

---

## ✅ Testing Checklist

- [ ] Google button appears on login modal
- [ ] Clicking button shows Google account picker
- [ ] After selecting account, user is logged in
- [ ] User data saved in `backend/data/state.json`
- [ ] Role assigned correctly (assistant/student)
- [ ] Profile picture displayed
- [ ] Can logout and login again
- [ ] Works on different browsers
- [ ] Works on mobile devices
- [ ] Production deployment successful

---

**🎉 Selamat! Google OAuth sudah terintegrasi!**

Users sekarang bisa login dengan satu klik menggunakan akun Google mereka. Tidak perlu remember password lagi! 🚀
