# Fix Google OAuth "invalid_client" Error

## Error yang Terjadi
```
Access blocked: Authorization Error
Error 401: invalid_client
no registered origin
```

## Penyebab
Origin `http://localhost:5174` belum didaftarkan di Google Cloud Console untuk Client ID yang digunakan.

## Langkah Perbaikan

### Option 1: Update Existing Credentials (Tercepat)

1. **Buka Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials

2. **Pilih Project Anda**
   - Pastikan project yang benar sedang aktif (lihat dropdown di header)

3. **Edit OAuth Client ID**
   - Cari client ID yang digunakan (cek di `.env` → `GOOGLE_CLIENT_ID`)
   - Klik nama credential untuk edit

4. **Tambahkan Authorized JavaScript Origins**
   ```
   http://localhost:5174
   http://localhost:5173
   http://localhost:3000
   ```

5. **Tambahkan Authorized Redirect URIs** (opsional untuk flow ini)
   ```
   http://localhost:5174
   http://localhost:5173
   ```

6. **Save** → Tunggu beberapa detik untuk propagasi

7. **Refresh browser** dan coba login lagi

---

### Option 2: Buat OAuth Client ID Baru

#### 1. Enable Google+ API (jika belum)
```
https://console.cloud.google.com/apis/library/plus.googleapis.com
```
Klik **ENABLE**

#### 2. Configure OAuth Consent Screen
- Buka: https://console.cloud.google.com/apis/credentials/consent
- **User Type:** External
- **App name:** SILab Virtual Lab
- **User support email:** [email Anda]
- **Developer contact:** [email Anda]
- **Scopes:** Tidak perlu tambah scope khusus (default: email, profile)
- **Test users:** Tambahkan email Anda untuk testing
- **Save and Continue**

#### 3. Buat OAuth 2.0 Client ID
- Buka: https://console.cloud.google.com/apis/credentials
- Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
- **Application type:** Web application
- **Name:** SILab Development

**Authorized JavaScript origins:**
```
http://localhost:5174
http://localhost:5173
http://localhost:3000
```

**Authorized redirect URIs:** (kosongkan atau tambah untuk future use)
```
http://localhost:5174/auth/callback
http://localhost:5173/auth/callback
```

- Klik **CREATE**
- **Copy Client ID** dan **Client Secret**

#### 4. Update .env File
```bash
GOOGLE_CLIENT_ID=your-new-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-new-client-secret
```

#### 5. Restart Backend
```bash
cd backend
npm run dev
```

#### 6. Refresh Frontend
- Hard reload: `Ctrl + Shift + R`
- Atau restart: `npm run dev`

---

## Troubleshooting

### Error Masih Muncul Setelah Update Origins?
- **Tunggu 1-5 menit** untuk propagasi DNS Google
- Clear browser cache: `Ctrl + Shift + Delete`
- Coba browser Incognito/Private
- Restart frontend & backend

### Error "Access blocked: This app has not been verified"?
- Normal untuk development
- Klik **"Advanced"** → **"Go to SILab (unsafe)"**
- Untuk production, submit app verification ke Google

### Error "redirect_uri_mismatch"?
- Pastikan URL frontend di browser SAMA PERSIS dengan yang didaftarkan
- Termasuk port number (5174 vs 5173)
- Termasuk protocol (http vs https)

### Client ID Tidak Muncul di Console?
- Pastikan project yang benar dipilih (dropdown di header)
- Cek apakah credentials dihapus
- Buat credentials baru

---

## Verifikasi Setup

### 1. Cek Environment Variables
```bash
# Di root folder
cat .env | grep GOOGLE
```

Expected output:
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### 2. Cek Backend Logs
Seharusnya tidak ada error saat startup:
```
ISL backend running on http://localhost:4000
```

### 3. Test Login Flow
1. Buka http://localhost:5174
2. Klik **"Sign in with Google"**
3. Pilih akun Google
4. Seharusnya redirect kembali dan auto-login

### 4. Cek Browser Console
Jika masih error, buka Developer Tools (F12) → Console tab untuk detail error

---

## Production Deployment

Saat deploy ke production, tambahkan origins production:

**Vercel:**
```
https://your-app.vercel.app
https://your-custom-domain.com
```

**Railway:**
```
https://your-app.railway.app
```

**Custom Domain:**
```
https://silab.upi.edu
https://www.silab.upi.edu
```

---

## Security Notes

⚠️ **JANGAN** commit file `.env` ke Git!

Pastikan `.gitignore` includes:
```
.env
.env.local
.env.production
```

Untuk production, set environment variables di platform hosting (Vercel/Railway/Render).

---

## Quick Reference

### Google Cloud Console Links
- **Credentials:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent:** https://console.cloud.google.com/apis/credentials/consent
- **API Library:** https://console.cloud.google.com/apis/library

### Current Configuration
- **Frontend:** http://localhost:5174
- **Backend:** http://localhost:4000
- **API Base:** http://localhost:4000/api

### Test Accounts
- Email @upi.edu → Role: **assistant**
- Email lainnya → Role: **student**
