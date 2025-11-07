export const appMarkup = `
<!-- Splash Screen -->
<div id="splash-screen" class="splash-screen">
  <div class="splash-container">
    <div class="splash-logo-wrapper">
      <img src="/logo1.png" alt="SILab Suite Logo" class="splash-logo" />
      <div class="splash-glow"></div>
    </div>
    <div class="splash-content">
      <h1 class="splash-title">SILab Suite</h1>
      <p class="splash-subtitle">Information System Laboratory</p>
      <div class="splash-tagline">Virtual Lab Environment</div>
    </div>
    <div class="splash-loader">
      <div class="loader-bar">
        <div class="loader-progress"></div>
      </div>
      <div class="loader-text">Loading...</div>
    </div>
  </div>
  <div class="splash-particles">
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
  </div>
</div>

<div id="auth-modal" class="auth-modal is-hidden" role="dialog" aria-modal="true" aria-labelledby="auth-title">
  <div class="auth-card">
    <button type="button" class="auth-close" id="loginClose" aria-label="Tutup dialog login">&times;</button>
  <h2 id="auth-title">Masuk ke SILab</h2>
    <p class="auth-subtitle">Gunakan akun contoh berikut untuk masuk sebagai asisten atau mahasiswa.</p>
    <form id="login-form" class="auth-form">
      <label>Username
        <input id="login-username" name="username" autocomplete="username" required />
      </label>
      <label>Password
        <input id="login-password" name="password" type="password" autocomplete="current-password" required />
      </label>
      <p id="login-error" class="auth-error" role="alert"></p>
      <button type="submit" class="cta-btn full">Masuk</button>
      <button type="button" id="loginCancel" class="secondary-btn full">Kembali</button>
    </form>
    
    <div class="auth-divider">
      <span>atau</span>
    </div>
    
    <div class="auth-social">
      <div id="google-signin-button" class="google-signin-wrapper"></div>
      <p class="auth-social-hint">Login dengan akun Google Anda untuk akses cepat</p>
    </div>
    <div class="auth-hint">
      <p><strong>Akun contoh:</strong></p>
      <ul>
        <li>Asisten &mdash; <code>asisten</code> / <code>asisten123</code></li>
        <li>Mahasiswa &mdash; <code>mahasiswa</code> / <code>mahasiswa123</code></li>
        <li>Mahasiswa 2 &mdash; <code>mahasiswa2</code> / <code>mahasiswa234</code></li>
        <li>Admin &mdash; <code>admin</code> / <code>admin123</code></li>
      </ul>
    </div>
  </div>
</div>

<!-- Profile Modal -->
<div id="profile-modal" class="auth-modal is-hidden" role="dialog" aria-modal="true" aria-labelledby="profile-title">
  <div class="auth-card profile-card">
    <button type="button" class="auth-close" id="profileClose" aria-label="Tutup dialog profile">&times;</button>
    <h2 id="profile-title">Profile Saya</h2>
    
    <form id="profile-form" class="profile-form">
      <!-- Profile Picture Section -->
      <div class="profile-picture-section">
        <div class="profile-picture-wrapper">
          <img id="profile-picture-preview" src="" alt="Profile Picture" class="profile-picture" />
          <div class="profile-picture-placeholder">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <button type="button" class="profile-picture-upload-btn" id="profilePictureBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M20 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <input type="file" id="profile-picture-input" accept="image/*" style="display: none;" />
        <p class="profile-picture-hint">Klik tombol + untuk upload foto profil (Max 2MB)</p>
      </div>

      <!-- Personal Information -->
      <div class="profile-section">
        <h3>Informasi Pribadi</h3>
        <div class="profile-form-grid">
          <label class="profile-field">Nama Lengkap *
            <input id="profile-name" name="name" type="text" required placeholder="Masukkan nama lengkap" />
          </label>
          
          <label class="profile-field">Email *
            <input id="profile-email" name="email" type="email" required placeholder="email@example.com" />
          </label>
          
          <label class="profile-field">Username
            <input id="profile-username" name="username" type="text" disabled placeholder="Username (tidak dapat diubah)" />
          </label>
          
          <label class="profile-field" id="profile-role-label">
            <span id="profile-role-label-text">Status Pengguna *</span>
            <select id="profile-role" name="role">
              <option value="student">Mahasiswa</option>
              <option value="assistant">Asisten</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="profile-section">
        <h3>Informasi Tambahan</h3>
        <div class="profile-form-grid">
          <label class="profile-field full-width">NIM / NIP
            <input id="profile-student-id" name="studentId" type="text" placeholder="Nomor Induk (opsional)" />
          </label>
          
          <label class="profile-field full-width">Program Studi / Divisi
            <input id="profile-department" name="department" type="text" placeholder="Contoh: Teknik Informatika" />
          </label>
          
          <label class="profile-field full-width">Nomor Telepon
            <input id="profile-phone" name="phone" type="tel" placeholder="+62 812-3456-7890" />
          </label>
          
          <label class="profile-field full-width">Bio
            <textarea id="profile-bio" name="bio" rows="3" placeholder="Ceritakan sedikit tentang diri Anda..."></textarea>
          </label>
        </div>
      </div>

      <p id="profile-error" class="auth-error" role="alert"></p>
      <p id="profile-success" class="auth-success" role="status"></p>
      
      <div class="profile-actions">
        <button type="submit" class="cta-btn full">Simpan Perubahan</button>
        <button type="button" id="profileCancel" class="secondary-btn full">Batal</button>
      </div>
    </form>
  </div>
</div>

<div id="landing-page" class="landing-page">
  <div class="landing-surface">
    <nav class="landing-nav">
      <div class="landing-logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
          <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" stroke="white" stroke-width="2" fill="none"/>
          <circle cx="16" cy="16" r="3" fill="white"/>
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stop-color="#fdb71a"/>
              <stop offset="100%" stop-color="#f39c12"/>
            </linearGradient>
          </defs>
        </svg>
  <span>SILab</span>
      </div>
      <div class="landing-nav-actions">
        <!-- Auth buttons (shown when NOT logged in) -->
        <button id="enterApp" class="cta-btn" type="button" style="display: none;"><span>Masuk Aplikasi</span></button>
        
        <!-- User info (shown when logged in) -->
        <div id="landing-user-info" class="landing-user-info" style="display: none;">
          <span id="landing-user-badge" class="user-badge"></span>
          <button id="landingProfileBtn" class="secondary-btn" type="button">Profile</button>
          <button id="landingLogoutBtn" class="secondary-btn" type="button">Logout</button>
        </div>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">📘 Information Systems Laboratory</span>
        <h1 class="hero-title">Platform Penelitian Sistem Informasi</h1>
        <p class="hero-subtitle">Kumpulan alat penelitian terintegrasi untuk Requirements Engineering, Enterprise Architecture, Interaction Design, dan Conceptual Modeling — semua dalam satu workspace.</p>
       <div class="hero-cta">
         <button id="getStarted" class="cta-btn large" type="button"><span>Mulai Sekarang</span></button>
         <button id="learnMore" class="secondary-btn large" type="button">Jelajahi Modul</button>
          <button id="openAdminPanel" data-action="open-admin" class="secondary-btn large admin-trigger" type="button">Panel Admin</button>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <strong>7</strong>
            <span>Modul Terintegrasi</span>
          </div>
          <div class="stat">
            <strong>4</strong>
            <span>Area Penelitian</span>
          </div>
          <div class="stat">
            <strong>100%</strong>
            <span>Open Source</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-card card-1">
          <span class="card-icon">📋</span>
          <span class="card-text">Requirements</span>
        </div>
        <div class="floating-card card-2">
          <span class="card-icon">🏛️</span>
          <span class="card-text">Architecture</span>
        </div>
        <div class="floating-card card-3">
          <span class="card-icon">🎨</span>
          <span class="card-text">Design</span>
        </div>
        <div class="floating-card card-4">
          <span class="card-icon">📊</span>
          <span class="card-text">Data Modeling</span>
        </div>
      </div>
    </section>

    <section id="features" class="features">
      <div class="section-header">
        <h2>Modul Lengkap untuk Penelitian SI</h2>
        <p>Dari analisis kebutuhan hingga pemodelan data, semua tersedia dalam satu platform yang mudah digunakan.</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
        <span class="feature-icon">📝</span>
          <h3>Requirements Engineering</h3>
          <p>Kelola user stories dengan MoSCoW prioritization. Drag & drop interface yang intuitif untuk mengorganisir requirements Anda.</p>
          <ul class="feature-list">
            <li>✓ Board interaktif drag & drop</li>
            <li>✓ Acceptance criteria template</li>
            <li>✓ Export ke CSV</li>
          </ul>
        </div>
        
        <div class="feature-card">
        <span class="feature-icon">🏗️</span>
          <h3>Enterprise Architecture</h3>
          <p>Mapping value stream dengan business capabilities. Visual heat indicator untuk analisis prioritas strategis.</p>
          <ul class="feature-list">
            <li>✓ Value stream mapping</li>
            <li>✓ Capability heat analysis</li>
            <li>✓ Stakeholder management</li>
          </ul>
        </div>

        <div class="feature-card">
          <span class="feature-icon">✏️</span>
          <h3>Interaction Design</h3>
          <p>Buat wireframe dan prototype interaktif. Event logging untuk usability testing dan evaluasi design.</p>
          <ul class="feature-list">
            <li>✓ Wireframe builder</li>
            <li>✓ Component library</li>
            <li>✓ Event log tracking</li>
          </ul>
        </div>

        <div class="feature-card">
        <span class="feature-icon">🎯</span>
          <h3>Diagram Builder</h3>
          <p>Tools profesional untuk membuat diagram flowchart, UML, dan diagram teknis lainnya dengan mudah.</p>
          <ul class="feature-list">
            <li>✓ Multiple shape library</li>
            <li>✓ Smart connectors</li>
            <li>✓ Export SVG/PNG</li>
          </ul>
        </div>

        <div class="feature-card">
        <span class="feature-icon">🧱</span>
          <h3>Conceptual Modeling</h3>
          <p>ERD editor dengan relationship cardinality. Visualisasi struktur database yang jelas dan profesional.</p>
          <ul class="feature-list">
            <li>✓ Entity management</li>
            <li>✓ Relationship mapping</li>
            <li>✓ JSON export</li>
          </ul>
        </div>

        <div class="feature-card">
        <span class="feature-icon">📘</span>
          <h3>Quiz & Assessment</h3>
          <p>Bank soal terintegrasi dengan auto-grading. Perfect untuk evaluasi pembelajaran dan research validation.</p>
          <ul class="feature-list">
            <li>✓ Multiple question types</li>
            <li>✓ Instant feedback</li>
            <li>✓ Score tracking</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="landing-announcement-section" class="landing-announcements" style="display:none;">
      <div class="section-header">
        <h2>Papan Pengumuman</h2>
        <p>Informasi terbaru seputar kegiatan laboratorium dan perkuliahan.</p>
      </div>
      <div id="landing-announcements-empty" class="announcement-empty" style="display:none;">
        <p class="muted">Belum ada pengumuman yang ditampilkan.</p>
      </div>
      <div id="landing-announcements" class="announcement-list"></div>
    </section>

    <section class="tech-stack">
      <div class="section-header">
        <h2>Dibangun dengan Teknologi Modern</h2>
        <p>Pure HTML5, CSS3, dan JavaScript. No framework bloat, just clean and efficient code.</p>
      </div>
      <div class="research-topics">
        <div class="topic-card">
          <span class="topic-icon">⚡</span>
          <h4>Performa Tinggi</h4>
          <p>Native JavaScript untuk kecepatan maksimal tanpa dependency yang berat.</p>
        </div>
        <div class="topic-card">
        <span class="topic-icon">⚡</span>
          <h4>Local Storage</h4>
          <p>Data tersimpan di browser Anda. Privacy terjaga, akses offline kapan saja.</p>
        </div>
        <div class="topic-card">
        <span class="topic-icon">🎨</span>
          <h4>Modern UI/UX</h4>
          <p>Interface yang clean, minimalis, dan fokus pada produktivitas penelitian.</p>
        </div>
      </div>
      <div class="tech-badges">
        <span class="tech-badge">HTML5</span>
        <span class="tech-badge">CSS3</span>
        <span class="tech-badge">JavaScript ES6+</span>
        <span class="tech-badge">SVG Graphics</span>
        <span class="tech-badge">LocalStorage API</span>
        <span class="tech-badge">Responsive Design</span>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-content">
        <h2>Siap Memulai Penelitian Anda?</h2>
        <p>Akses semua modul penelitian sistem informasi dalam satu platform. Gratis, open source, dan siap digunakan.</p>
        <div class="hero-cta">
          <button id="ctaLaunch" class="cta-btn large" type="button"><span>Buka Virtual Lab</span></button>
          <button class="secondary-btn large" type="button" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">Kembali ke Atas</button>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
  <p><strong>SILab Suite</strong> — Information Systems Laboratory</p>
      <p>Institut Teknologi Bandung · Platform Penelitian Sistem Informasi</p>
      <p style="margin-top:12px; font-size:13px; opacity:0.7">Built with ❤️ for research and education</p>
    </footer>
  </div>
</div>

<div id="main-app" class="main-app" style="display:none;">
<header class="app-header">
  <nav class="app-navbar">
    <div class="app-logo">
      <span>SILab Suite</span>
    </div>
    
    <div class="app-nav-center">
      <div class="app-nav-controls">
        <button id="saveAll" class="nav-btn"><span>💾</span> Save</button>
        <button id="loadAll" class="nav-btn"><span>📂</span> Load</button>
        <button id="exportAll" class="nav-btn"><span>📤</span> Export JSON</button>
        <button id="resetAll" class="nav-btn danger"><span>♻️</span> Reset</button>
      </div>
    </div>
    
    <div class="app-nav-right">
      <div class="user-controls">
        <span id="userBadge" class="user-badge">Belum Masuk</span>
        <button id="profileBtn" class="nav-btn secondary" type="button" style="display:none" data-test="profile-button">Profile</button>
        <button id="logoutBtn" class="nav-btn secondary" type="button">Keluar</button>
        <button id="backToLanding" class="nav-btn secondary" type="button">Beranda</button>
      </div>
    </div>
  </nav>
  
  <nav class="app-tabs" role="tablist" aria-label="Modul">
    <div class="tabs-container">
      <button role="tab" aria-selected="true" class="tab active" data-tab="req">
        <span class="tab-icon">📝</span>
        <span class="tab-text">Requirements Engineering</span>
      </button>
      <button role="tab" aria-selected="false" class="tab" data-tab="ea">
        <span class="tab-icon">🏗️</span>
        <span class="tab-text">Enterprise Architecture</span>
      </button>
      <button role="tab" aria-selected="false" class="tab" data-tab="ixd">
        <span class="tab-icon">✏️</span>
        <span class="tab-text">Interaction Design</span>
      </button>
      <button role="tab" aria-selected="false" class="tab" data-tab="diagram">
        <span class="tab-icon">🎯</span>
        <span class="tab-text">Diagram Builder</span>
      </button>
      <button role="tab" aria-selected="false" class="tab" data-tab="erd">
        <span class="tab-icon">🧱</span>
        <span class="tab-text">Conceptual Modeling</span>
      </button>
      <button role="tab" aria-selected="false" class="tab" data-tab="quiz">
        <span class="tab-icon">📘</span>
        <span class="tab-text">Quiz & Assessment</span>
      </button>
      <button role="tab" aria-selected="false" class="tab" data-tab="assignments">
        <span class="tab-icon">🎓</span>
        <span class="tab-text">Tugas & Penilaian</span>
      </button>
    </div>
  </nav>
</header>

<main>
  <section id="tab-req" role="tabpanel" class="tab-panel active">
    <aside class="side">
      <h2>Requirements Engineering</h2>
      <form id="req-form" class="card">
        <label>Judul Requirement<input required name="title" placeholder="Contoh: Login Pelanggan"/></label>
        <label>Actor/Stakeholder<input name="actor" placeholder="Contoh: Customer"/></label>
        <label>Acceptance Criteria<textarea name="ac" rows="3" placeholder="Given-When-Then / DoD"></textarea></label>
        <button type="submit">Tambah Requirement</button>
      </form>

      <section class="card tips">
        <h3>MoSCoW Prioritization</h3>
        <ul>
          <li><b>M</b>ust-have: Kritis untuk MVP, wajib ada.</li>
          <li><b>S</b>hould-have: Penting, dapat ditunda.</li>
          <li><b>C</b>ould-have: Nice-to-have, jika ada waktu.</li>
          <li><b>W</b>on't-have: Tidak prioritas saat ini.</li>
        </ul>
        <p style="margin-top:12px; font-size:13px">Drag & drop untuk mengubah prioritas requirement.</p>
      </section>
    </aside>

    <section class="content">
      <h2>MoSCoW Board (Drag & Drop)</h2>
      <div class="moscow">
        <div class="col" data-bucket="M"><h3>Must</h3><div class="list" id="m-list" aria-label="Must list"></div></div>
        <div class="col" data-bucket="S"><h3>Should</h3><div class="list" id="s-list" aria-label="Should list"></div></div>
        <div class="col" data-bucket="C"><h3>Could</h3><div class="list" id="c-list" aria-label="Could list"></div></div>
        <div class="col" data-bucket="W"><h3>Won't</h3><div class="list" id="w-list" aria-label="Won't list"></div></div>
      </div>

      <div class="actions">
        <button id="export-req-csv">Export CSV</button>
      </div>
    </section>
  </section>

  <section id="tab-ea" role="tabpanel" class="tab-panel">
    <aside class="side">
      <h2>EA Repository</h2>
      <div class="card">
        <label>Value Stream Stage
          <input id="vs-name" placeholder="Contoh: Acquire → Onboard → Serve → Retain">
        </label>
        <button id="add-vs">Tambah Stage</button>
      </div>
      <div class="card">
        <label>Business Capability
          <input id="cap-name" placeholder="Contoh: Identity & Access, Payment, Analytics">
        </label>
        <button id="add-cap">Tambah Capability</button>
      </div>
      <div class="card">
        <h3>Stakeholders</h3>
        <div id="stake-list" class="mini-list"></div>
        <div class="row">
          <input id="stake-input" placeholder="Nama stakeholder">
          <button id="stake-add">+</button>
        </div>
      </div>
      <div class="card tips">
        <h3>Integrasi Bisnis-TI</h3>
        <p>Seret <b>capability</b> ke <b>value stream stage</b> untuk mapping. Pindahkan antar stage atau lepaskan ke kolom capability untuk menghapus. Atur intensitas dukungan dengan <b>heat slider</b> (0-100).</p>
      </div>
    </aside>

    <section class="content">
      <h2>Value Stream × Capability Mapping</h2>
      <div class="vs-grid" id="vs-grid">
      </div>
      <div class="cap-pool" id="cap-pool">
      </div>
    </section>
  </section>

  <section id="tab-ixd" role="tabpanel" class="tab-panel">
    <aside class="side">
      <h2>UI Components</h2>
      <div class="palette card">
        <button class="comp" data-type="button">Button</button>
        <button class="comp" data-type="input">Input</button>
        <button class="comp" data-type="card">Card</button>
        <button class="comp" data-type="checkbox">Checkbox</button>
      </div>
      <div class="card">
        <label>Mode
          <select id="ixd-mode">
            <option value="move">Move/Arrange</option>
            <option value="wire">Connect/Wire</option>
          </select>
        </label>
        <button id="ixd-export-svg">Export SVG</button>
      </div>
      <div class="card tips">
        <h3>Wireframe & Prototyping</h3>
        <ol>
          <li>Klik komponen untuk spawn di canvas.</li>
          <li>Drag untuk mengatur posisi.</li>
          <li>Double-click teks untuk edit label.</li>
          <li>Mode <b>Wire</b>: klik komponen A → B untuk hubungkan.</li>
          <li>Simulasi: klik button untuk trigger event.</li>
        </ol>
      </div>
    </aside>

    <section class="content ixd-wrap">
      <svg id="ixd-wires" aria-hidden="true"></svg>
      <section id="ixd-board" class="board" aria-label="Wireframe Board"></section>
      <aside class="log">
        <h3>Event Log</h3>
        <div id="ixd-log"></div>
      </aside>
    </section>
  </section>

  
<section id="tab-diagram" role="tabpanel" class="tab-panel">
    <section class="content">
      <h2>Canvas Diagram</h2>
      <div class="diagram-canvas-wrapper">
        <svg id="diagram-canvas" class="diagram-canvas" width="1200" height="700" role="region" aria-label="Diagram Canvas">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#86c5ff"/>
            </marker>
          </defs>
        </svg>
        <div class="diagram-overlay" aria-hidden="true">
          <button id="diagram-undo" class="ghost">Undo</button>
          <button id="diagram-redo" class="ghost">Redo</button>
          <button id="diagram-clear" class="ghost danger">Clear</button>
        </div>
      </div>
      <div class="diagram-inspector">
        <div>
          <h3>Layer & History</h3>
          <div id="diagram-history" class="history"></div>
        </div>
        <div>
          <h3>Snap Settings</h3>
          <label class="check-inline"><input type="checkbox" id="diagram-snap" checked> Snap to grid</label>
          <label>Grid size
            <input type="number" id="diagram-grid" value="20" min="5" max="60" />
          </label>
        </div>
      </div>
    </section>

    <aside class="side">
      <h2>Diagram Tools</h2>
      <div class="card">
        <h3>Shapes</h3>
        <div class="shape-palette">
          <button class="shape-btn" data-shape="rectangle" title="Rectangle">
            <svg width="40" height="30"><rect x="5" y="5" width="30" height="20" fill="#7dd3fc" stroke="#3b82f6" stroke-width="2" rx="3"/></svg>
          </button>
          <button class="shape-btn" data-shape="circle" title="Circle">
            <svg width="40" height="30"><circle cx="20" cy="15" r="12" fill="#a78bfa" stroke="#7c3aed" stroke-width="2"/></svg>
          </button>
          <button class="shape-btn" data-shape="diamond" title="Diamond">
            <svg width="40" height="30"><path d="M20,3 L35,15 L20,27 L5,15 Z" fill="#fcd34d" stroke="#f59e0b" stroke-width="2"/></svg>
          </button>
          <button class="shape-btn" data-shape="triangle" title="Triangle">
            <svg width="40" height="30"><path d="M20,5 L35,25 L5,25 Z" fill="#34d399" stroke="#059669" stroke-width="2"/></svg>
          </button>
          <button class="shape-btn" data-shape="hexagon" title="Hexagon">
            <svg width="40" height="30"><path d="M10,15 L15,5 L25,5 L30,15 L25,25 L15,25 Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/></svg>
          </button>
          <button class="shape-btn" data-shape="cylinder" title="Cylinder">
            <svg width="40" height="30"><ellipse cx="20" cy="8" rx="12" ry="5" fill="#60a5fa" stroke="#2563eb" stroke-width="2"/><rect x="8" y="8" width="24" height="14" fill="#60a5fa" stroke="none"/><path d="M8,8 L8,22 Q20,27 32,22 L32,8" fill="#60a5fa" stroke="#2563eb" stroke-width="2"/></svg>
          </button>
          <button class="shape-btn" data-shape="star" title="Star">
            <svg width="40" height="30"><path d="M20,3 L23,12 L32,12 L25,18 L28,27 L20,21 L12,27 L15,18 L8,12 L17,12 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/></svg>
          </button>
          <button class="shape-btn" data-shape="arrow" title="Arrow">
            <svg width="40" height="30"><path d="M5,15 L25,15 L25,8 L35,15 L25,22 L25,15" fill="#86c5ff" stroke="#3b82f6" stroke-width="2"/></svg>
          </button>
        </div>
      </div>

      <div class="card">
        <h3>Tools</h3>
        <div class="tool-buttons">
          <button id="diagram-select-tool" class="tool-btn active">
            <span>🔍</span> Select
          </button>
          <button id="diagram-connector-tool" class="tool-btn">
            <span>↗️</span> Connector
          </button>
          <button id="diagram-text-tool" class="tool-btn">
            <span>T</span> Text
          </button>
          <button id="diagram-delete-tool" class="tool-btn danger">
            <span>🗑️</span> Delete
          </button>
        </div>
      </div>

      <div class="card">
        <h3>Properties</h3>
        <div id="diagram-props">
          <div id="shape-props" style="display:none;">
            <label>Fill Color
              <input type="color" id="shape-fill" value="#7dd3fc">
            </label>
            <label>Stroke Color
              <input type="color" id="shape-stroke" value="#3b82f6">
            </label>
            <label>Stroke Width
              <input type="range" id="shape-stroke-width" min="1" max="8" value="2">
              <span id="stroke-width-value">2</span>
            </label>
            <label>Font Size
              <input type="range" id="shape-font-size" min="8" max="48" value="14">
              <span id="font-size-value">14</span>
            </label>
            <label>Text Color
              <input type="color" id="shape-text-color" value="#e6ecff">
            </label>
            <label>Rotation
              <input type="range" id="shape-rotation" min="0" max="360" value="0">
              <span id="rotation-value">0°</span>
            </label>
            <label>Width
              <input type="number" id="shape-width" min="20" max="500" value="120">
            </label>
            <label>Height
              <input type="number" id="shape-height" min="20" max="500" value="80">
            </label>
          </div>
          <div id="default-props">
            <label>Fill Color
              <input type="color" id="diagram-fill" value="#7dd3fc">
            </label>
            <label>Stroke Color
              <input type="color" id="diagram-stroke" value="#3b82f6">
            </label>
            <label>Stroke Width
              <input type="range" id="diagram-stroke-width" min="1" max="8" value="2">
              <span id="default-stroke-width-value">2</span>
            </label>
            <label>Font Size
              <input type="range" id="diagram-font-size" min="8" max="48" value="14">
              <span id="default-font-size-value">14</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  </section>


  <section id="tab-quiz" role="tabpanel" class="tab-panel">
    <section class="content">
      <div class="quiz-topic-bar">
        <div>
          <h2 id="quiz-topic-title">Soal Quiz</h2>
          <p id="quiz-topic-description" class="muted">Pilih topik untuk mulai menjawab.</p>
        </div>
        <label class="quiz-topic-selector">
          <span>Topik</span>
          <select id="quiz-topic-select"></select>
        </label>
      </div>
      <div id="quiz-container" class="quiz-container"></div>
    </section>

    <aside class="side">
      <h2>Quiz ISL</h2>
      <div class="card">
        <h3>Informasi</h3>
        <p style="font-size:13px; line-height:1.6; color:var(--muted)">
          Uji pemahaman Anda tentang Information System Lab, pengembangan SI, analisis data, dan pemodelan konseptual.
        </p>
        <div style="margin-top:12px; padding:12px; background:rgba(125,211,252,0.1); border-radius:8px; border:1px solid rgba(125,211,252,0.2)">
          <p style="font-size:13px; margin:0"><strong>Total Soal:</strong> <span id="quiz-total">0</span></p>
          <p style="font-size:13px; margin:6px 0 0"><strong>Terjawab:</strong> <span id="quiz-answered">0</span></p>
        </div>
      </div>

      <div class="card">
        <h3>Hasil Quiz</h3>
        <div id="quiz-result" style="display:none">
          <div style="text-align:center; padding:16px">
            <div style="font-size:48px; font-weight:800; background:linear-gradient(135deg,var(--accent),var(--accent-2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text" id="quiz-score">0</div>
            <p style="margin:8px 0; font-size:14px; color:var(--muted)">Skor Anda</p>
            <p id="quiz-feedback" style="margin-top:12px; font-weight:600"></p>
          </div>
          <button id="quiz-retry" class="secondary-btn" style="width:100%; margin-top:12px">Ulangi Quiz</button>
        </div>
        <div id="quiz-submit-area">
          <button id="quiz-submit" style="width:100%">Submit Jawaban</button>
        </div>
      </div>

      <div class="card tips">
        <h3>Tips</h3>
        <ul style="font-size:13px; line-height:1.6">
          <li>Pilih jawaban yang paling tepat</li>
          <li>Isian singkat case-sensitive</li>
          <li>Klik Submit untuk melihat hasil</li>
        </ul>
      </div>

      <div id="quiz-builder" class="card quiz-builder" style="display:none;">
        <h3>Kelola Kuis (Asisten)</h3>

        <section class="quiz-builder-section">
          <h4>Topik Kuis</h4>
          <form id="quiz-topic-form" class="quiz-builder-form">
            <input type="hidden" id="quiz-topic-id" />
            <label>Judul Topik
              <input id="quiz-topic-title-input" placeholder="Misal: Pengantar Enterprise Architecture" />
            </label>
            <label>Deskripsi
              <textarea id="quiz-topic-description-input" rows="2" placeholder="Ringkas fokus kuis"></textarea>
            </label>
            <p id="quiz-topic-form-message" class="muted"></p>
            <div class="form-actions">
              <button type="submit">Simpan Topik</button>
              <button type="button" id="quiz-topic-cancel" class="secondary-btn">Batal</button>
            </div>
          </form>
          <div id="quiz-topic-list" class="quiz-builder-list"></div>
        </section>

        <section class="quiz-builder-section">
          <h4>Soal</h4>
          <form id="quiz-question-form" class="quiz-builder-form">
            <input type="hidden" id="quiz-question-id" />
            <label>Topik
              <select id="quiz-question-topic"></select>
            </label>
            <label>Jenis Soal
              <select id="quiz-question-type">
                <option value="multiple">Pilihan Ganda</option>
                <option value="text">Isian Singkat</option>
              </select>
            </label>
            <label>Pertanyaan
              <textarea id="quiz-question-text" rows="3" placeholder="Tulis pertanyaan"></textarea>
            </label>
            <div id="quiz-question-options-group" class="quiz-builder-grid">
              <label>Opsi Jawaban (satu per baris)
                <textarea id="quiz-question-options" rows="3" placeholder="Opsi 1&#10;Opsi 2&#10;Opsi 3"></textarea>
              </label>
              <label>Jawaban Benar
                <input id="quiz-question-correct" placeholder="Nomor opsi / jawaban benar" />
              </label>
            </div>
            <p id="quiz-question-form-message" class="muted"></p>
            <div class="form-actions">
              <button type="submit">Simpan Soal</button>
              <button type="button" id="quiz-question-cancel" class="secondary-btn">Batal</button>
            </div>
          </form>
          <div id="quiz-question-list" class="quiz-builder-list"></div>
        </section>
      </div>
    </aside>
  </section>

  <section id="tab-erd" role="tabpanel" class="tab-panel">
    <section class="content erd-wrap">
      <svg id="erd-wires" aria-hidden="true"></svg>
      <section id="erd-board" class="board erd-board" aria-label="Kanvas ERD"></section>
      <aside class="log erd-log">
        <h3>Relasi & Mode</h3>
        <p id="erd-info" class="muted">Tambahkan entitas untuk mulai pemodelan konseptual.</p>
        <div class="card compact">
          <label>Mode
            <select id="erd-mode">
              <option value="move">Move Entity</option>
              <option value="relate">Create Relation</option>
            </select>
          </label>
          <div class="row wrap">
            <button id="erd-export-json">Export JSON</button>
            <button id="erd-reset" class="danger">Reset ERD</button>
          </div>
        </div>
        <div class="card">
          <h4>Daftar Relasi</h4>
          <div id="erd-rel-list" class="mini-list"></div>
        </div>
      </aside>
    </section>

    <aside class="side">
      <h2>Conceptual Modeling</h2>
      <form id="erd-entity-form" class="card">
        <label>Nama Entitas
          <input id="erd-entity-name" placeholder="Contoh: Mahasiswa, Dosen, MataKuliah" />
        </label>
        <button type="submit">Tambah Entitas</button>
      </form>

      <section class="card">
        <h3>Daftar Entitas</h3>
        <div id="erd-entity-list" class="pill-stack"></div>
      </section>

      <section class="card">
        <h3>Entitas Terpilih</h3>
        <p id="erd-selected-name" class="muted">Belum ada entitas terpilih</p>
        <form id="erd-attr-form" class="attr-form">
          <label>Nama Atribut
            <input id="erd-attr-name" placeholder="Contoh: nim, nama, tanggal_lahir" />
          </label>
          <label>Tipe Data
            <input id="erd-attr-type" placeholder="Contoh: varchar(12), int, date" />
          </label>
          <label class="check-inline">
            <input type="checkbox" id="erd-attr-pk" /> Primary Key
          </label>
          <button type="submit">Tambah Atribut</button>
        </form>
        <div id="erd-attr-list" class="attr-panel"></div>
      </section>
    </aside>
  </section>

  <section id="tab-assignments" role="tabpanel" class="tab-panel">
    <aside class="side">
      <h2>Manajemen Tugas</h2>
      <div class="card">
        <h3>Akun Aktif</h3>
        <p id="account-name" class="account-name">Belum masuk</p>
        <p id="account-role" class="account-role muted"></p>
      </div>
      <div class="card tips" id="assignment-tip-student">
        <h3>Panduan Mahasiswa</h3>
        <ul>
          <li>Pilih tugas penelitian yang tersedia.</li>
          <li>Masukkan tautan artefak atau catatan.</li>
          <li>Kirim ulang jika perlu pembaruan.</li>
          <li>Nilai dan feedback dari asisten akan muncul otomatis.</li>
        </ul>
      </div>
      <div class="card tips" id="assignment-tip-assistant">
        <h3>Panduan Asisten</h3>
        <ul>
          <li>Pantau setiap pengumpulan mahasiswa.</li>
          <li>Pilih pengumpulan lalu isi nilai dan feedback.</li>
          <li>Simpan penilaian untuk memperbarui status mahasiswa.</li>
          <li>Gunakan Hapus Penilaian untuk reset jika diperlukan.</li>
        </ul>
      </div>
    </aside>

    <section class="content assignments-content">
      <section class="card announcements-card">
        <header class="announcements-header">
          <h2>Papan Pengumuman</h2>
          <p class="muted">Simak informasi terbaru dari tim asisten laboratorium.</p>
        </header>
        <form id="announcement-form" class="announcement-form" style="display:none;">
          <div class="announcement-form-grid">
            <label>Judul Pengumuman
              <input name="title" placeholder="Contoh: Jadwal asistensi tambahan" required />
            </label>
            <label>Isi Pengumuman
              <textarea name="content" rows="3" placeholder="Tulis detail informasi untuk mahasiswa." required></textarea>
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" class="cta-btn small">Publikasikan</button>
          </div>
        </form>
        <p id="announcement-form-message" class="muted" aria-live="polite"></p>
        <div id="app-announcements" class="announcement-list">
          <p class="muted announcement-placeholder">Belum ada pengumuman.</p>
        </div>
      </section>

      <div id="assignment-guest-panel" class="assignment-panel">
        <div class="card empty-state">
          <h3>Login Diperlukan</h3>
          <p>Silakan masuk sebagai mahasiswa atau asisten untuk mengakses modul penugasan.</p>
          <button id="assignment-login-btn" class="cta-btn small" type="button">Masuk Sekarang</button>
        </div>
      </div>

      <div id="assignment-student-panel" class="assignment-panel">
        <h2>Tugas Mahasiswa</h2>
        <section class="card catalog-card">
          <h3>Daftar Tugas</h3>
          <div id="assignment-catalog" class="assignment-list"></div>
        </section>
        <form id="assignment-submit-form" class="card assignment-form">
          <h3>Kumpulkan / Perbarui Tugas</h3>
          <label>Pilih Tugas
            <select id="assignment-select" name="assignmentId" required></select>
          </label>
          <label>Tautan Artefak
            <input type="url" id="assignment-link" name="link" placeholder="https://contoh.com/artefak" />
          </label>
          <label>Catatan Tambahan
            <textarea id="assignment-notes" name="notes" rows="3" placeholder="Ringkaskan pekerjaan yang Anda lakukan"></textarea>
          </label>
          <label>Upload Dokumen (opsional)
            <input type="file" id="assignment-file" name="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.md,.png,.jpg,.jpeg" />
          </label>
          <div id="assignment-file-info" class="file-info empty">Belum ada file yang dipilih.</div>
          <div class="file-actions">
            <button type="button" id="assignment-file-clear" class="secondary-btn small" disabled>Hapus Dokumen</button>
          </div>
          <p class="form-hint">Mengirim ulang tugas akan menggantikan kiriman sebelumnya dan meminta penilaian ulang.</p>
          <button type="submit">Kirim / Perbarui Pengumpulan</button>
        </form>
        <section class="card submissions-card">
          <h3>Status Pengumpulan</h3>
          <div id="student-submissions" class="submission-list"></div>
        </section>
      </div>

      <div id="assignment-assistant-panel" class="assignment-panel">
        <h2>Penilaian Tugas Mahasiswa</h2>
        <form id="assistant-assignment-create" class="card assignment-create-card">
          <h3>Buat Tugas Baru</h3>
          <p class="form-hint">Tugas baru akan langsung tersedia di daftar mahasiswa dan form pengumpulan.</p>
          <label>Judul Tugas
            <input id="assistant-assignment-title" name="title" placeholder="Contoh: Analisis Sistem Layanan" required />
          </label>
          <label>Fokus / Modul
            <input id="assistant-assignment-focus" name="focus" placeholder="Contoh: Requirements, Enterprise Architecture" />
          </label>
          <label>Deskripsi Singkat
            <textarea id="assistant-assignment-desc" name="description" rows="3" placeholder="Jelaskan outcome, artefak yang diharapkan, atau panduan penilaian."></textarea>
          </label>
          <button type="submit">Tambah Tugas</button>
        </form>

        <section class="card assistant-assignment-list-card">
          <h3>Daftar Tugas Aktif</h3>
          <div id="assistant-assignment-list" class="assignment-list"></div>
        </section>

        <div class="assistant-layout">
          <section class="card assistant-column">
            <h3>Pengumpulan Masuk</h3>
            <div id="assistant-submission-list" class="submission-list"></div>
          </section>
          <form id="assistant-grade-form" class="card assistant-column">
            <h3>Form Penilaian</h3>
            <input type="hidden" name="submissionId" id="grade-submission-id" />
            <p id="assistant-grade-info" class="muted">Pilih pengumpulan untuk mulai menilai.</p>
            <label>Nilai (0 - 100)
              <input type="number" id="grade-score" name="score" min="0" max="100" step="1" />
            </label>
            <label>Catatan / Feedback
              <textarea id="grade-feedback" name="feedback" rows="4" placeholder="Berikan catatan kualitas pekerjaan"></textarea>
            </label>
            <div class="form-actions">
              <button type="submit">Simpan Penilaian</button>
              <button type="button" id="grade-clear" class="secondary-btn">Hapus Penilaian</button>
            </div>
          </form>
        </div>
      </div>

      <div id="admin-panel" class="assignment-panel">
        <h2>Manajemen Pengguna</h2>
        <form id="admin-user-form" class="card admin-form">
          <h3>Tambah Pengguna</h3>
          <div class="admin-form-grid">
            <label>Nama Lengkap
              <input name="name" placeholder="Nama lengkap" required />
            </label>
            <label>Username
              <input name="username" placeholder="Username unik" required />
            </label>
            <label>Role
              <select name="role" required>
                <option value="student">Mahasiswa</option>
                <option value="assistant">Asisten</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>Password
              <input type="password" name="password" placeholder="Wajib untuk non-mahasiswa" />
            </label>
            <label>Email
              <input type="email" name="email" placeholder="Email (opsional)" />
            </label>
            <label>Nomor Mahasiswa
              <input type="text" name="studentId" placeholder="Opsional" />
            </label>
            <label>Departemen
              <input type="text" name="department" placeholder="Opsional" />
            </label>
            <label>Telepon
              <input type="text" name="phone" placeholder="Opsional" />
            </label>
            <label>Bio
              <textarea name="bio" rows="2" placeholder="Opsional"></textarea>
            </label>
          </div>
          <p id="admin-user-form-message" class="muted"></p>
          <div class="form-actions">
            <button type="submit">Tambah Pengguna</button>
          </div>
          <p class="form-hint">Admin dapat mengubah role pengguna pada daftar di bawah, termasuk mempromosikan menjadi asisten atau menurunkan menjadi mahasiswa.</p>
        </form>

        <section class="card admin-users-card">
          <h3>Daftar Pengguna</h3>
      <div id="admin-user-list" class="admin-user-list"></div>
    </section>
  </div>
</section>
</section>

<!-- Admin Management Modal -->
<div id="admin-modal" class="admin-modal" aria-hidden="true">
  <div id="adminModalBackdrop" class="admin-modal__backdrop"></div>
  <div class="admin-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="adminModalTitle">
    <button type="button" id="adminModalClose" class="admin-modal__close" aria-label="Tutup panel admin">&times;</button>
    <header class="admin-modal__header">
      <h2 id="adminModalTitle">Panel Admin</h2>
      <p>Kelola akun pengguna. Panel ini hanya tersedia untuk administrator.</p>
    </header>
    <div id="landing-admin-content" class="admin-modal__content">
      <form id="landing-admin-form" class="card admin-form">
        <h3>Tambah Pengguna</h3>
        <div class="admin-form-grid">
          <label>Nama Lengkap
            <input name="name" placeholder="Nama lengkap" required />
          </label>
          <label>Username
            <input name="username" placeholder="Username unik" required />
          </label>
          <label>Role
            <select name="role" required>
              <option value="student">Mahasiswa</option>
              <option value="assistant">Asisten</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Password
            <input type="password" name="password" placeholder="Wajib untuk non-mahasiswa" />
          </label>
          <label>Email
            <input type="email" name="email" placeholder="Email (opsional)" />
          </label>
          <label>Nomor Mahasiswa
            <input type="text" name="studentId" placeholder="Opsional" />
          </label>
          <label>Departemen
            <input type="text" name="department" placeholder="Opsional" />
          </label>
          <label>Telepon
            <input type="text" name="phone" placeholder="Opsional" />
          </label>
          <label>Bio
            <textarea name="bio" rows="2" placeholder="Opsional"></textarea>
          </label>
        </div>
        <p id="landing-admin-form-message" class="muted"></p>
        <div class="form-actions">
          <button type="submit">Tambah Pengguna</button>
        </div>
      </form>

      <section class="card admin-users-card">
        <h3>Daftar Pengguna</h3>
        <div id="landing-admin-list" class="admin-user-list"></div>
      </section>
    </div>
  </div>
</div>
</main>

<footer>
  <p>SILab — Penelitian Sistem Informasi (HTML5 • CSS3 • JavaScript)</p>
</footer>
</div>
`;
