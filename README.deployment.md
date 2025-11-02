# 🚀 SILab - Deployment Guide

Panduan lengkap untuk deploy aplikasi SILab ke berbagai platform.

## 📋 Daftar Isi

1. [Persiapan](#persiapan)
2. [Deployment ke Vercel](#1-vercel-recommended)
3. [Deployment ke Railway](#2-railway)
4. [Deployment ke Render](#3-render)
5. [Deployment dengan Docker](#4-docker)
6. [Deployment ke VPS](#5-vps-traditional)
7. [Troubleshooting](#troubleshooting)

---

## Persiapan

### 1. Environment Variables

Copy `.env.example` ke `.env` dan isi dengan nilai yang sesuai:

```bash
cp .env.example .env
```

Edit `.env` dan ganti nilai berikut:

```env
JWT_SECRET=your-super-secret-random-string-here
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### 2. Build Frontend

```bash
npm install
npm run build
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

---

## 1. Vercel (Recommended)

### Setup

```bash
npm install -g vercel
vercel login
```

### Deploy

```bash
vercel
```

### Environment Variables di Vercel Dashboard

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Settings → Environment Variables
4. Tambahkan:
   - `JWT_SECRET`: random string
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: https://your-app.vercel.app

### Custom Domain (Optional)

1. Settings → Domains
2. Add domain Anda
3. Update DNS sesuai instruksi Vercel

**Pros:**
- ✅ Gratis untuk hobby projects
- ✅ Auto SSL
- ✅ Global CDN
- ✅ Zero config deployment

**Cons:**
- ❌ Serverless (cold start)
- ❌ Limited backend features

---

## 2. Railway

### Setup

```bash
npm install -g @railway/cli
railway login
```

### Deploy

```bash
railway init
railway up
```

### Environment Variables

```bash
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"
```

### Database (Optional)

```bash
railway add postgresql
```

**Pros:**
- ✅ $5 kredit gratis per bulan
- ✅ Database included
- ✅ Simple deployment
- ✅ Always-on server

**Cons:**
- ❌ Perlu kartu kredit setelah trial

---

## 3. Render

### Setup

1. Push code ke GitHub
2. Buka [render.com](https://render.com)
3. Connect GitHub repository
4. Deploy menggunakan `render.yaml` yang sudah ada

### Manual Deploy

1. New → Web Service
2. Connect repository
3. Build Command: `npm install && npm run build && cd backend && npm install`
4. Start Command: `cd backend && npm start`

### Environment Variables

Tambahkan di Render Dashboard:
- `JWT_SECRET`
- `NODE_ENV=production`
- `CORS_ORIGIN`

**Pros:**
- ✅ Free tier available
- ✅ Auto SSL
- ✅ Easy database setup
- ✅ Always-on server

**Cons:**
- ❌ Free tier spin down setelah 15 menit idle

---

## 4. Docker

### Build Image

```bash
docker build -t isl-virtual-lab .
```

### Run Container

```bash
docker run -d \
  -p 4000:4000 \
  -e JWT_SECRET="your-secret" \
  -e NODE_ENV="production" \
  --name isl-app \
  isl-virtual-lab
```

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

### Dengan Database

Edit `docker-compose.yml` dan uncomment bagian PostgreSQL:

```bash
docker-compose up -d
```

### Stop Containers

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

**Pros:**
- ✅ Konsisten di semua environment
- ✅ Easy to scale
- ✅ Includes database
- ✅ Full control

**Cons:**
- ❌ Perlu setup server sendiri
- ❌ Lebih kompleks

---

## 5. VPS (Traditional)

### Requirements

- Ubuntu 20.04+ atau CentOS 8+
- Node.js 20+
- Nginx
- PM2 (process manager)

### Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/SILab.git
cd SILab

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build frontend
npm run build

# Copy frontend to Nginx
sudo cp -r dist/* /var/www/html/

# Setup environment
cp .env.example .env
nano .env  # Edit dengan nilai production

# Start backend with PM2
cd backend
pm2 start src/server.js --name isl-backend
pm2 save
pm2 startup
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/isl-virtual-lab
```

Paste konfigurasi dari `nginx.conf` file yang sudah dibuat.

```bash
sudo ln -s /etc/nginx/sites-available/isl-virtual-lab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL dengan Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh production
```

**Pros:**
- ✅ Full control
- ✅ Tidak ada cold start
- ✅ Custom configuration
- ✅ Affordable untuk long-term

**Cons:**
- ❌ Perlu maintenance
- ❌ Setup lebih kompleks
- ❌ Perlu handle security sendiri

---

## 🔥 Quick Deployment Comparison

| Platform | Cost | Setup Time | Best For |
|----------|------|------------|----------|
| **Vercel** | Free | 5 min | Quick MVP, Static + API |
| **Railway** | $5/mo | 10 min | Full-stack, Database |
| **Render** | Free | 15 min | Full-stack, Always-on |
| **Docker** | Variable | 30 min | Scalable, Professional |
| **VPS** | $5-20/mo | 1 hour | Full control, Production |

---

## 📊 Recommended Stack per Use Case

### 🎓 **Development/Testing**
```
Frontend: Local Vite Dev Server
Backend: Local Node.js
Database: File-based (current)
```

### 🚀 **MVP/Prototype**
```
Platform: Vercel (Frontend + Backend)
Database: File-based atau Vercel KV
Cost: Free
```

### 💼 **Production (Small)**
```
Platform: Railway
Frontend: Railway Static
Backend: Railway Service
Database: Railway PostgreSQL
Cost: $5-10/month
```

### 🏢 **Production (Professional)**
```
Platform: VPS (DigitalOcean/Linode)
Frontend: Nginx
Backend: PM2 + Node.js
Database: PostgreSQL
Cache: Redis
Cost: $12-20/month
```

### 📈 **Production (Enterprise)**
```
Platform: AWS/GCP/Azure
Frontend: CloudFront + S3
Backend: EC2/ECS + Load Balancer
Database: RDS PostgreSQL
Cache: ElastiCache Redis
Cost: $50+/month
```

---

## 🔧 Troubleshooting

### Backend tidak bisa akses file storage

Pastikan folder `data/` memiliki permission yang benar:
```bash
chmod -R 755 backend/data
```

### CORS Error

Update `CORS_ORIGIN` di environment variables dengan domain frontend Anda.

### Port sudah digunakan

Ubah PORT di `.env` atau kill process yang menggunakan port 4000:
```bash
# Linux/Mac
lsof -ti:4000 | xargs kill -9

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Database connection error

Pastikan DATABASE_URL benar dan database service sudah running.

### Build error

Clear cache dan rebuild:
```bash
rm -rf node_modules dist backend/node_modules
npm install
cd backend && npm install && cd ..
npm run build
```

---

## 📞 Support

Jika ada masalah deployment, silakan:
1. Check logs: `pm2 logs` atau `docker-compose logs`
2. Verify environment variables
3. Check firewall rules
4. Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

## 🎉 Selamat!

Aplikasi SILab Anda sudah deployed! 🚀

**Next Steps:**
- [ ] Setup monitoring (PM2 monitoring, Sentry, etc.)
- [ ] Configure backups
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Add analytics
- [ ] Setup error tracking

Happy Deploying! 🎊
