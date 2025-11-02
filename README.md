# SILab — Virtual Lab Suite

**SILab** merupakan unit penunjang akademik dan penelitian untuk melakukan penelitian di bidang sistem informasi. SILab bertujuan untuk menyediakan teknologi yang memungkinkan munculnya masyarakat informasi dan ekonomi digital.

## Fokus Penelitian

Penelitian di ISL berfokus pada:
- **Manajemen Data dan Analisis Informasi** — Optimalisasi implementasi sistematis dunia digital yang terhubung
- **Pengembangan Sistem Informasi** — Metodologi dan framework pembangunan SI
- **Ilmu Informasi** — Teori dan praktik manajemen informasi
- **Pemodelan Konseptual** — Representasi abstrak sistem dan proses bisnis
- **Integrasi Bisnis-Teknologi** — Alignment strategis bisnis dan TI

## Modul Platform
1. **Requirements Engineering** — Analisis kebutuhan dengan **MoSCoW prioritization** (drag & drop), stakeholder analysis, export CSV.
2. **Enterprise Architecture** — **Value Stream × Capability Mapping**, stakeholder management, business-IT integration, heat intensity mapping.
3. **Interaction Design & Prototyping** — **Wireframe playground** interaktif: component-based design, wiring, event-driven simulation, export SVG.
4. **Conceptual Data Modeling** — **Entity-Relationship Diagram (ERD)** builder: atribut, relasi, cardinality, export JSON schema.

## Teknologi
- **React 18**: membungkus markup kompleks dan menginisialisasi ulang modul legacy secara terkontrol
- **Vite**: bundler modern untuk proses build super cepat dan DX yang nyaman
- **JavaScript ES6+**: logika interaktif modular (drag & drop, SVG, canvas-like)
- **CSS3 Custom Properties**: tema futuristik dengan animasi, grid responsif, dan glassmorphism

## Struktur Proyek
```
.
├── index.html          # Entrypoint minimal untuk aplikasi Vite
├── package.json        # Script dev/build & dependency React/Vite
├── src
│   ├── App.jsx         # Komponen React yang merender markup legacy
│   ├── legacy
│   │   └── app.js      # Seluruh logika interaktif asli (drag-drop, quiz, ERD, dst)
│   ├── main.jsx        # Bootstrap ReactDOM.createRoot
│   ├── markup.js       # Template HTML string untuk layout landing + lab
│   └── styles.css      # Stylesheet utama dengan token tema & responsive layout
└── vite.config.js
```

## Cara Menjalankan
1. **Instal dependensi**
	```powershell
	npm install
	```
2. **Mode pengembangan** – otomatis membuka dev server dengan HMR.
	```powershell
	npm run dev
	```
3. **Build produksi** – output berada di folder `dist/`.
	```powershell
	npm run build
	```
4. **Preview build** (opsional) untuk memastikan deploy siap.
	```powershell
	npm run preview
	```

## Backend Service
1. Masuk ke folder backend dan instal dependensi
   ```powershell
   cd backend
   npm install
   ```
2. Jalankan server pengembangan (port default `4000`)
   ```powershell
   npm run dev
   ```
3. Endpoint utama tersedia di prefix `http://localhost:4000/api`, meliputi:
   - `POST /auth/login` untuk autentikasi (token JWT)
   - `GET /auth/me` untuk mendapatkan profil pengguna aktif
   - `GET /assignments` dan `POST /assignments/:id/submissions` untuk alur tugas mahasiswa
   - `POST/DELETE /submissions/:id/grade` untuk penilaian oleh asisten
   - Form pengumpulan tugas mendukung unggah dokumen (PDF/DOCX/ZIP/gambar) selain tautan dan catatan
   - Asisten dapat membuat, mengedit, dan menghapus katalog tugas; status pengumpulan tersinkron otomatis

Konfigurasi lanjutan dapat diatur melalui environment variable (`PORT`, `JWT_SECRET`, `CORS_ORIGIN`, dll) yang dibaca oleh server Node.

## Deployment
- **Netlify / Vercel**: gunakan opsi *Deploy Vite* dan arahkan ke folder root repo.
- **Static hosting** (GitHub Pages, Cloudflare Pages, dsb.): jalankan `npm run build` lalu unggah isi folder `dist/`.

## Deskripsi Platform
**Judul:** SILab — Virtual Lab Suite  
**Ringkasan:** Laboratorium virtual interaktif untuk penelitian dan pengembangan sistem informasi. Mendukung requirements engineering, enterprise architecture, interaction design, conceptual data modeling, quiz & assessment — seluruhnya berjalan di browser dengan persistensi localStorage dan opsi ekspor.  
**Fokus:** Pengembangan SI, Analisis Data, Pemodelan Konseptual, Integrasi Bisnis-TI, Pengalaman Interaksi Pengguna
