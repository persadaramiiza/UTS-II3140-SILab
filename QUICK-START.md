# 🚀 Quick Start Guide - SILab

## 📦 Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-username/SILab.git
cd SILab
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file (optional untuk development)
nano .env
```

## 🏃 Running Locally

### Development Mode (Recommended)

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Akses di: http://localhost:5173

**Terminal 2 - Backend:**
```bash
npm run backend:dev
```
API running di: http://localhost:4000

### Production Mode (Testing)

**Build Frontend:**
```bash
npm run build
npm run preview
```

**Start Backend:**
```bash
npm run backend
```

## 🐳 Using Docker

### Quick Start
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access:
- Frontend: http://localhost:4000
- API: http://localhost:4000/api

## 🌐 Deploy to Cloud

### Option 1: Vercel (Easiest - 5 minutes)
```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Railway (Best for full-stack)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Render (Free tier available)
1. Push code ke GitHub
2. Go to render.com
3. New Web Service → Connect repository
4. Render will auto-detect `render.yaml`

### Option 4: Docker on VPS
```bash
# On your VPS
git clone https://github.com/your-username/SILab.git
cd SILab
docker-compose up -d
```

## 📝 Default Accounts

### Asisten (Teaching Assistant)
- Username: `asisten`
- Password: `asisten123`

### Mahasiswa 1
- Username: `mahasiswa`
- Password: `mahasiswa123`

### Mahasiswa 2
- Username: `mahasiswa2`
- Password: `mahasiswa234`

## 🎯 Features

- ✅ Requirements Engineering (MoSCoW)
- ✅ Enterprise Architecture (Value Stream)
- ✅ Interaction Design (Wireframes)
- ✅ Diagram Builder
- ✅ Conceptual Modeling (ERD)
- ✅ Quiz & Assessment
- ✅ Assignment Management

## 📚 Documentation

- **Full Deployment Guide**: [README.deployment.md](README.deployment.md)
- **Backend API**: http://localhost:4000/api/health
- **Main README**: [README.md](README.md)

## 🔧 Troubleshooting

### Port already in use
```bash
# Change PORT in .env
PORT=5000
```

### Frontend can't connect to backend
```bash
# Update CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://localhost:5173
```

### Database/data folder permission
```bash
chmod -R 755 backend/data
```

## 🆘 Need Help?

1. Check logs: `docker-compose logs` or `npm run backend:dev`
2. Review [README.deployment.md](README.deployment.md)
3. Open an issue on GitHub

## 🎉 You're Ready!

Open http://localhost:5173 and start using SILab!

**Quick Tips:**
- Use `asisten` account to create assignments
- Use `mahasiswa` account to submit work
- All data is saved in `backend/data/state.json`
- Export your work regularly using the Export buttons

Happy coding! 🚀
