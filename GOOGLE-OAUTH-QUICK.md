# 🚀 Quick Setup - Google OAuth in 5 Minutes

## Step 1: Get Google Credentials (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized origins:
   - `http://localhost:5173`
   - `http://localhost:4000`
6. **Copy Client ID**

## Step 2: Configure Backend (1 min)

Create `backend/.env`:
```env
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
```

## Step 3: Configure Frontend (1 min)

Create `.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
```

## Step 4: Start Application (1 min)

**Terminal 1:**
```bash
npm run backend:dev
```

**Terminal 2:**
```bash
npm run dev
```

## Step 5: Test (30 seconds)

1. Open http://localhost:5173
2. Click "Masuk Aplikasi"
3. Click "Sign in with Google" button
4. Select your Google account
5. You're logged in! 🎉

---

## That's it!

**Email Domain Rules:**
- `@upi.edu` → Assistant role
- Other emails → Student role

**For full setup guide:** See [GOOGLE-AUTH-SETUP.md](./GOOGLE-AUTH-SETUP.md)
