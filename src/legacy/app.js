import { loginWithCredentials } from '../services/authApi.js';
import {
  fetchAssignments,
  fetchMySubmissions,
  fetchAssignmentSubmissions,
  submitAssignment,
  requestSubmissionUpload,
  confirmSubmissionFile,
  listSubmissionFilesApi,
  getSubmissionFileDownloadUrl,
  deleteSubmissionFile,
  gradeSubmission,
  clearSubmissionGrade
} from '../services/assignmentsApi.js';
import {
  listUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi
} from '../services/usersApi.js';
import {
  fetchAnnouncements,
  createAnnouncement
} from '../services/announcementsApi.js';
import {
  listQuizTopicsApi,
  createQuizTopicApi,
  updateQuizTopicApi,
  deleteQuizTopicApi,
  createQuizQuestionApi,
  updateQuizQuestionApi,
  deleteQuizQuestionApi
} from '../services/quizApi.js';

let initialized = false;
let cachedState = null;

export function initApp() {
  if (initialized) {
    return cachedState;
  }
  initialized = true;

  // Global helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 9);

  // ====== Auth & Assignment Data ======
  const USERS = [
    { id: 'admin-isl', role: 'admin', username: 'admin', password: 'admin123', name: 'Administrator ISL' },
    { id: 'assistant-isl', role: 'assistant', username: 'asisten', password: 'asisten123', name: 'Asisten ISL' },
    { id: 'student-01', role: 'student', username: 'mahasiswa', password: 'mahasiswa123', name: 'Mahasiswa ISL' },
    { id: 'student-02', role: 'student', username: 'mahasiswa2', password: 'mahasiswa234', name: 'Mahasiswa Alternatif' }
  ];

  const ASSIGNMENTS_CATALOG = [
    {
      id: 'asg-req',
      title: 'Analisis Requirement',
      description: 'Susun minimal tiga user story beserta acceptance criteria untuk modul Sistem Informasi pilihan Anda.',
      focus: 'Requirements'
    },
    {
      id: 'asg-ea',
      title: 'Value Stream Mapping',
      description: 'Pemetaan value stream dan capability yang relevan untuk organisasi fiktif yang Anda rancang.',
      focus: 'Enterprise Architecture'
    },
    {
      id: 'asg-proto',
      title: 'Prototype Wireframe',
      description: 'Bangun wireframe interaktif dan jelaskan alur interaksi utama pada canvas prototyping.',
      focus: 'Interaction Design'
    }
  ];

  // ====== Quiz Defaults ======
  const QUIZ_MANAGER_ROLES = new Set(['assistant', 'admin']);

  const quizQuestions = [
    {
      id: 'q1',
      type: 'multiple',
      question: 'Apa tujuan utama dari Information System Laboratory (ISL)?',
      options: [
        'Mengembangkan hardware komputer',
        'Menyediakan teknologi untuk masyarakat informasi dan ekonomi digital',
        'Membuat aplikasi mobile',
        'Mengelola server dan jaringan'
      ],
      correct: 1
    },
    {
      id: 'q2',
      type: 'multiple',
      question: 'Manakah yang BUKAN termasuk topik inti penelitian ISL?',
      options: [
        'Pengembangan Sistem Informasi',
        'Analisis Data',
        'Pemodelan Konseptual',
        'Desain Hardware Elektronik'
      ],
      correct: 3
    },
    {
      id: 'q3',
      type: 'text',
      question:
        'Sebutkan metode prioritasi requirements yang digunakan dalam modul Requirements Engineering! (singkatan 4 huruf)',
      correct: 'MoSCoW'
    },
    {
      id: 'q4',
      type: 'multiple',
      question: 'Dalam MoSCoW prioritization, apa arti dari huruf "M"?',
      options: ['Maybe-have', 'Must-have', 'Might-have', 'Minor-have'],
      correct: 1
    },
    {
      id: 'q5',
      type: 'multiple',
      question: 'Apa fungsi utama dari Enterprise Architecture dalam pengembangan SI?',
      options: [
        'Membuat desain UI/UX',
        'Integrasi bisnis-teknologi dan optimalisasi value stream',
        'Testing aplikasi',
        'Menulis kode program'
      ],
      correct: 1
    },
    {
      id: 'q6',
      type: 'text',
      question: 'Dalam ERD, simbol apa yang digunakan untuk menandai Primary Key? (emoji)',
      correct: 'dY"`'
    },
    {
      id: 'q7',
      type: 'multiple',
      question: 'Apa kepanjangan dari ERD?',
      options: [
        'Entity Relationship Database',
        'Entity Relationship Diagram',
        'Enterprise Resource Design',
        'Extended Relational Database'
      ],
      correct: 1
    },
    {
      id: 'q8',
      type: 'multiple',
      question: 'Dalam Value Stream mapping, apa fungsi dari "heat intensity" pada capability?',
      options: [
        'Menunjukkan suhu server',
        'Mengukur kecepatan proses',
        'Menunjukkan intensitas dukungan capability terhadap stage',
        'Menghitung biaya operasional'
      ],
      correct: 2
    },
    {
      id: 'q9',
      type: 'text',
      question: 'Sebutkan salah satu bentuk (shape) yang tersedia di Diagram Builder! (lowercase)',
      correct: ['rectangle', 'circle', 'diamond', 'triangle', 'hexagon', 'cylinder', 'star', 'arrow']
    },
    {
      id: 'q10',
      type: 'multiple',
      question: 'Apa tujuan dari pemodelan konseptual dalam pengembangan SI?',
      options: [
        'Membuat dokumentasi user manual',
        'Representasi abstrak sistem dan proses bisnis untuk analisis',
        'Mendesain logo perusahaan',
        'Melakukan testing security'
      ],
      correct: 1
    },
    {
      id: 'q11',
      type: 'multiple',
      question: 'Format export apa yang tersedia untuk Diagram Builder?',
      options: ['Hanya PDF', 'Hanya JSON', 'SVG dan PNG', 'Hanya TXT'],
      correct: 2
    },
    {
      id: 'q12',
      type: 'text',
      question: 'Dalam wireframe, apa nama fitur yang menghubungkan dua komponen dengan garis/arrow?',
      correct: ['wiring', 'wire', 'connector', 'connection']
    },
    {
      id: 'q13',
      type: 'multiple',
      question: 'Apa fokus utama penelitian ISL terkait data?',
      options: [
        'Data Mining cryptocurrency',
        'Manajemen data dan analisis informasi',
        'Database administration',
        'Data entry manual'
      ],
      correct: 1
    },
    {
      id: 'q14',
      type: 'multiple',
      question: 'Dalam konteks ISL, apa yang dimaksud dengan "integrasi bisnis-teknologi"?',
      options: [
        'Menggabungkan beberapa perangkat hardware',
        'Alignment strategis antara kebutuhan bisnis dan solusi TI',
        'Membuat website e-commerce',
        'Instalasi software bisnis'
      ],
      correct: 1
    },
    {
      id: 'q15',
      type: 'text',
      question: 'Berapa jumlah modul yang tersedia di SILab Suite? (angka)',
      correct: ['6', '6 modul', 'enam']
    }
  ];

  const DEFAULT_QUIZ_TOPICS = [
    {
      id: 'quiz-isl-basics',
      title: 'Dasar Information System Lab',
      description: 'Pertanyaan pengantar seputar modul dan aktivitas utama di ISL.',
      updatedAt: Date.now(),
      questions: quizQuestions.map((q) => ({
        ...q,
        options: q.options ? [...q.options] : undefined,
        correct: Array.isArray(q.correct) ? [...q.correct] : q.correct
      }))
    }
  ];

  function cloneQuizTopics(source) {
    return source.map((topic) => ({
      ...topic,
      questions: topic.questions.map((q) => ({
        ...q,
        options: q.options ? [...q.options] : undefined,
        correct: Array.isArray(q.correct) ? [...q.correct] : q.correct
      }))
    }));
  }

  const initialQuizTopics = cloneQuizTopics(DEFAULT_QUIZ_TOPICS);
  const initialActiveQuizTopicId = initialQuizTopics[0]?.id || null;

  // ====== Landing & Auth Elements ======
  const landingPage = $('#landing-page');
  const mainApp = $('#main-app');
  const authModal = $('#auth-modal');
  const loginForm = $('#login-form');
  const loginError = $('#login-error');
  const loginUsername = $('#login-username');
  const loginPassword = $('#login-password');
  const loginCancel = $('#loginCancel');
  const loginClose = $('#loginClose');
  const userBadge = $('#userBadge');
  const logoutBtn = $('#logoutBtn');
  const profileBtn = $('#profileBtn');
  const accountNameEl = $('#account-name');
  const accountRoleEl = $('#account-role');
  const guestPanel = $('#assignment-guest-panel');
  const studentPanel = $('#assignment-student-panel');
  const assistantPanel = $('#assignment-assistant-panel');
  const adminPanel = $('#admin-panel');
  const adminUserForm = $('#admin-user-form');
  const adminUserFormMessage = $('#admin-user-form-message');
  const adminUserList = $('#admin-user-list');
  const adminModal = $('#admin-modal');
  const adminModalClose = $('#adminModalClose');
  const adminModalBackdrop = $('#adminModalBackdrop');
  const adminOpenButtons = Array.from(document.querySelectorAll('[data-action="open-admin"]'));
  const landingAdminContent = $('#landing-admin-content');
  const landingAdminForm = $('#landing-admin-form');
  const landingAdminFormMessage = $('#landing-admin-form-message');
  const landingAdminList = $('#landing-admin-list');
  const adminInterfaces = [
    { panel: adminPanel, form: adminUserForm, message: adminUserFormMessage, list: adminUserList },
    { panel: adminModal, form: landingAdminForm, message: landingAdminFormMessage, list: landingAdminList }
  ].filter((iface) => iface.form || iface.list);
  const landingAnnouncementSection = $('#landing-announcement-section');
  const landingAnnouncementList = $('#landing-announcements');
  const landingAnnouncementEmpty = $('#landing-announcements-empty');
  const appAnnouncementList = $('#app-announcements');
  const announcementForm = $('#announcement-form');
  const announcementFormMessage = $('#announcement-form-message');
  const tipStudent = $('#assignment-tip-student');
  const tipAssistant = $('#assignment-tip-assistant');
  const assignmentSelect = $('#assignment-select');
  const assignmentCatalogEl = $('#assignment-catalog');
  const studentSubmissionsEl = $('#student-submissions');
  const assignmentForm = $('#assignment-submit-form');
  const assistantSubmissionList = $('#assistant-submission-list');
  const gradeForm = $('#assistant-grade-form');
  const gradeInfo = $('#assistant-grade-info');
  const gradeScore = $('#grade-score');
  const gradeFeedback = $('#grade-feedback');
  const gradeSubmissionId = $('#grade-submission-id');
  const gradeClear = $('#grade-clear');
  const assignmentLoginBtn = $('#assignment-login-btn');
  const assignmentFileInput = $('#assignment-file');
  const assignmentFileInfo = $('#assignment-file-info');
  const assignmentFileClear = $('#assignment-file-clear');
  const assistantAssignmentList = $('#assistant-assignment-list');
  const assignmentCreateForm = $('#assistant-assignment-create');
  const quizTopicSelect = $('#quiz-topic-select');
  const quizTopicTitle = $('#quiz-topic-title');
  const quizTopicDescription = $('#quiz-topic-description');
  const quizBuilderCard = $('#quiz-builder');
  const quizTopicForm = $('#quiz-topic-form');
  const quizTopicIdInput = $('#quiz-topic-id');
  const quizTopicTitleInput = $('#quiz-topic-title-input');
  const quizTopicDescriptionInput = $('#quiz-topic-description-input');
  const quizTopicFormMessage = $('#quiz-topic-form-message');
  const quizTopicCancelBtn = $('#quiz-topic-cancel');
  const quizTopicList = $('#quiz-topic-list');
  const quizQuestionForm = $('#quiz-question-form');
  const quizQuestionIdInput = $('#quiz-question-id');
  const quizQuestionTopicSelect = $('#quiz-question-topic');
  const quizQuestionType = $('#quiz-question-type');
  const quizQuestionText = $('#quiz-question-text');
  const quizQuestionOptions = $('#quiz-question-options');
  const quizQuestionCorrect = $('#quiz-question-correct');
  const quizQuestionFormMessage = $('#quiz-question-form-message');
  const quizQuestionCancelBtn = $('#quiz-question-cancel');
  const quizQuestionList = $('#quiz-question-list');
  const quizQuestionOptionsGroup = $('#quiz-question-options-group');

  function revealApp() {
    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    document.body.style.overflow = 'auto';
  }

  function hideLogin() {
    if (!authModal) return;
    authModal.classList.add('is-hidden');
    if (loginError) loginError.textContent = '';
    loginForm?.reset();
  }

  function showLanding() {
    if (landingPage) landingPage.style.display = 'block';
    if (mainApp) mainApp.style.display = 'none';
    hideLogin();
    // Update landing page auth UI when showing landing
    updateLandingAuthUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showLogin() {
    if (!authModal) return;
    authModal.classList.remove('is-hidden');
    setTimeout(() => loginUsername?.focus(), 60);
  }

  // ====== State ======
  const state = {
    auth: { currentUser: null },
    assignments: {
      catalog: ASSIGNMENTS_CATALOG.map((item) => ({ ...item })),
      submissions: [],
      selectedSubmissionId: null,
      pendingAttachment: null,
      backendEnabled: false,
      backendLoading: false,
      backendError: null,
      removeAttachment: false,
      attachmentLoading: false,
      editingId: null,
      editingDraft: null
    },
    announcements: {
      list: [],
      loading: false,
      error: null,
      loaded: false
    },
    users: {
      list: [],
      loading: false,
      error: null,
      loaded: false
    },
    req: { items: [] }, // {id,title,actor,ac,bucket}
    ea: { stages: [], caps: [], map: {}, stakeholders: [] }, // map key: stage -> [{id, heat}]
    ixd: { mode: 'move', nodes: [], wires: [] }, // nodes: {id,type,x,y,w,h,label}
    diagram: { tool: 'select', shapes: [], connectors: [], selected: null, tempConnector: null }, // draw.io-like
    erd: { mode: 'move', entities: [], relations: [], selected: null, pending: null },
    quiz: {
      topics: initialQuizTopics,
      activeTopicId: initialActiveQuizTopicId,
      answers: {},
      submitted: false,
      score: 0,
      editingQuestionId: null,
      editingTopicId: null,
      loading: false
    }
  };

  const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20MB (matches backend limit)
  const ROLE_OPTIONS = ['admin', 'assistant', 'student'];
  const ROLE_LABELS = {
    admin: 'Admin',
    assistant: 'Asisten',
    student: 'Mahasiswa'
  };

  function sanitizeUser(raw) {
    if (!raw) return null;
    const { password, ...rest } = raw;
    return { ...rest };
  }

  function getAssignmentMeta(id) {
    return state.assignments.catalog.find((item) => item.id === id) || null;
  }

  function formatTimestamp(value) {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString();
    } catch (err) {
      return value;
    }
  }

  function canManageQuiz() {
    const role = state.auth.currentUser?.role;
    return role ? QUIZ_MANAGER_ROLES.has(role) : false;
  }

  function getQuizTopics() {
    if (!state.quiz.topics) state.quiz.topics = [];
    return state.quiz.topics;
  }

  function getQuizTopicById(id) {
    return getQuizTopics().find((topic) => topic.id === id) || null;
  }

  function getActiveQuizTopic() {
    const topics = getQuizTopics();
    if (!topics.length) return null;
    const current = getQuizTopicById(state.quiz.activeTopicId);
    return current || topics[0];
  }

  function getActiveQuizQuestions() {
    const topic = getActiveQuizTopic();
    return topic ? topic.questions : [];
  }

  function resetQuizProgress() {
    state.quiz.answers = {};
    state.quiz.submitted = false;
    state.quiz.score = 0;
    const resultEl = $('#quiz-result');
    if (resultEl) resultEl.style.display = 'none';
    const submitArea = $('#quiz-submit-area');
    if (submitArea) submitArea.style.display = 'block';
  }

  function ensureActiveQuizTopic() {
    const active = getActiveQuizTopic();
    state.quiz.activeTopicId = active ? active.id : null;
  }

  function setActiveQuizTopic(topicId) {
    const selected = getQuizTopicById(topicId);
    const fallback = getActiveQuizTopic();
    state.quiz.activeTopicId = (selected || fallback)?.id || null;
    resetQuizProgress();
    initQuiz();
    updateQuizTopicUI();
  }

  function resetQuizTopicForm() {
    if (!quizTopicForm) return;
    quizTopicForm.reset();
    state.quiz.editingTopicId = null;
    if (quizTopicIdInput) quizTopicIdInput.value = '';
    if (quizTopicFormMessage) {
      quizTopicFormMessage.textContent = '';
      quizTopicFormMessage.className = 'muted';
    }
  }

  function resetQuizQuestionForm() {
    if (!quizQuestionForm) return;
    quizQuestionForm.reset();
    state.quiz.editingQuestionId = null;
    if (quizQuestionIdInput) quizQuestionIdInput.value = '';
    if (quizQuestionFormMessage) {
      quizQuestionFormMessage.textContent = '';
      quizQuestionFormMessage.className = 'muted';
    }
    updateQuizQuestionFormState();
  }

  function updateQuizTopicUI() {
    ensureActiveQuizTopic();
    const topics = getQuizTopics();
    const active = getActiveQuizTopic();

    if (quizTopicSelect) {
      quizTopicSelect.innerHTML = topics
        .map((topic) => `<option value="${topic.id}">${topic.title}</option>`)
        .join('');
      if (active) {
        quizTopicSelect.value = active.id;
      }
      quizTopicSelect.disabled = topics.length <= 1;
    }

    if (quizTopicTitle) {
      quizTopicTitle.textContent = active ? `Soal Quiz - ${active.title}` : 'Belum ada topik kuis';
    }
    if (quizTopicDescription) {
      quizTopicDescription.textContent =
        active?.description || 'Tambahkan topik kuis melalui panel pengelola asisten.';
    }

    if (quizQuestionTopicSelect) {
      quizQuestionTopicSelect.innerHTML = topics
        .map((topic) => `<option value="${topic.id}">${topic.title}</option>`)
        .join('');
      if (active) {
        quizQuestionTopicSelect.value = active.id;
      }
    }

    renderQuizTopicList();
    renderQuizQuestionList();
  }

  function populateQuizTopicForm(topic) {
    if (!quizTopicForm || !topic) return;
    state.quiz.editingTopicId = topic.id;
    if (quizTopicIdInput) quizTopicIdInput.value = topic.id;
    if (quizTopicTitleInput) quizTopicTitleInput.value = topic.title || '';
    if (quizTopicDescriptionInput) quizTopicDescriptionInput.value = topic.description || '';
    if (quizTopicFormMessage) {
      quizTopicFormMessage.textContent = 'Mengedit topik kuis terpilih.';
      quizTopicFormMessage.className = 'muted';
    }
  }

  function populateQuizQuestionForm(topicId, question) {
    if (!quizQuestionForm || !question) return;
    state.quiz.editingQuestionId = question.id;
    if (quizQuestionIdInput) quizQuestionIdInput.value = question.id;
    if (quizQuestionTopicSelect) quizQuestionTopicSelect.value = topicId;
    if (quizQuestionType) quizQuestionType.value = question.type;
    updateQuizQuestionFormState();
    if (quizQuestionText) quizQuestionText.value = question.question || '';
    if (quizQuestionOptions && question.options) {
      quizQuestionOptions.value = question.options.join('\n');
    } else if (quizQuestionOptions) {
      quizQuestionOptions.value = '';
    }
    if (quizQuestionCorrect) {
      if (question.type === 'multiple') {
        quizQuestionCorrect.value =
          typeof question.correct === 'number' && Number.isFinite(question.correct) ? question.correct + 1 : '';
      } else {
        const correctText = Array.isArray(question.correct) ? question.correct.join('\n') : question.correct || '';
        quizQuestionCorrect.value = correctText;
      }
    }
    if (quizQuestionFormMessage) {
      quizQuestionFormMessage.textContent = 'Mengedit soal kuis terpilih.';
      quizQuestionFormMessage.className = 'muted';
    }
  }

  function updateQuizManagerVisibility() {
    const visible = canManageQuiz();
    if (quizBuilderCard) {
      quizBuilderCard.style.display = visible ? 'block' : 'none';
    }
    if (!visible) {
      resetQuizTopicForm();
      resetQuizQuestionForm();
    } else {
      updateQuizTopicUI();
    }
  }

  function renderQuizTopicList() {
    if (!quizTopicList) return;
    const topics = getQuizTopics();
    quizTopicList.innerHTML = '';

    if (!topics.length) {
      quizTopicList.innerHTML = '<p class="muted">Belum ada topik kuis.</p>';
      return;
    }

    topics.forEach((topic) => {
      const questionCount =
        typeof topic.questionCount === 'number'
          ? topic.questionCount
          : Array.isArray(topic.questions)
          ? topic.questions.length
          : 0;
      const row = document.createElement('div');
      row.className = 'quiz-builder-row';
      row.dataset.topicId = topic.id;
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(topic.title || 'Tanpa judul')}</strong>
          <p class="muted">${questionCount} soal &bull; ${escapeHtml(topic.description || 'Tidak ada deskripsi')}</p>
        </div>
        <div class="quiz-builder-actions">
          <button type="button" data-action="set-active-topic" class="secondary-btn small">Pilih</button>
          <button type="button" data-action="edit-topic" class="secondary-btn small">Edit</button>
          <button type="button" data-action="delete-topic" class="danger small">Hapus</button>
        </div>
      `;
      quizTopicList.appendChild(row);
    });
  }

  function renderQuizQuestionList() {
    if (!quizQuestionList) return;
    quizQuestionList.innerHTML = '';

    const selectedId = quizQuestionTopicSelect?.value || state.quiz.activeTopicId;
    const topic = selectedId ? getQuizTopicById(selectedId) : getActiveQuizTopic();

    if (!topic) {
      quizQuestionList.innerHTML = '<p class="muted">Belum ada topik kuis.</p>';
      return;
    }

    const questions = Array.isArray(topic.questions) ? topic.questions : [];

    if (!questions.length) {
      quizQuestionList.innerHTML = '<p class="muted">Belum ada soal pada topik ini.</p>';
      return;
    }

    questions.forEach((q, idx) => {
      const row = document.createElement('div');
      row.className = 'quiz-builder-row';
      row.dataset.questionId = q.id;
      row.dataset.topicId = topic.id;
      row.innerHTML = `
        <div>
          <strong>${idx + 1}. ${escapeHtml(q.question || '')}</strong>
          <p class="muted">Tipe: ${q.type === 'multiple' ? 'Pilihan Ganda' : 'Isian'}</p>
        </div>
        <div class="quiz-builder-actions">
          <button type="button" data-action="edit-question" class="secondary-btn small">Edit</button>
          <button type="button" data-action="delete-question" class="danger small">Hapus</button>
        </div>
      `;
      quizQuestionList.appendChild(row);
    });
  }

  async function refreshQuizTopics({ includeQuestions = true, silent = false } = {}) {
    try {
      if (!silent) state.quiz.loading = true;
      const topics = await listQuizTopicsApi({ includeQuestions });
      const normalized = (topics || []).map((topic) => {
        const apiQuestions =
          includeQuestions && Array.isArray(topic.questions)
            ? topic.questions
            : includeQuestions && Array.isArray(topic.quiz_questions)
            ? topic.quiz_questions
            : [];
        const questions = includeQuestions
          ? apiQuestions.map((question) => ({
              id: question.id,
              topicId: question.topicId || question.topic_id || topic.id,
              type: question.type,
              question: question.question,
              options: Array.isArray(question.options) ? question.options : [],
              correct: question.correct,
              order: question.order ?? question.order_index ?? 0,
              createdAt: question.createdAt || question.created_at || null,
              updatedAt: question.updatedAt || question.updated_at || null
            }))
          : [];
        return {
          id: topic.id,
          title: topic.title,
          description: topic.description || '',
          createdBy: topic.createdBy || topic.created_by || null,
          createdAt: topic.createdAt || topic.created_at || null,
          updatedAt: topic.updatedAt || topic.updated_at || null,
          questions,
          questionCount:
            typeof topic.questionCount === 'number'
              ? topic.questionCount
              : includeQuestions
              ? questions.length
              : topic.question_count || 0
        };
      });
      state.quiz.topics = normalized;
      if (!state.quiz.activeTopicId && normalized.length) {
        state.quiz.activeTopicId = normalized[0].id;
      }
      ensureActiveQuizTopic();
      updateQuizTopicUI();
      initQuiz();
    } catch (err) {
      console.error('[Quiz] Gagal memuat topik:', err);
      if (!silent) {
        toast(err.message || 'Gagal memuat data kuis.', 'danger');
      }
    } finally {
      state.quiz.loading = false;
    }
  }

  function updateQuizQuestionFormState() {
    if (!quizQuestionType || !quizQuestionOptionsGroup) return;
    const isMultiple = quizQuestionType.value === 'multiple';
    quizQuestionOptionsGroup.style.display = isMultiple ? 'grid' : 'none';
    if (quizQuestionOptions) {
      quizQuestionOptions.disabled = !isMultiple;
    }
    if (quizQuestionCorrect) {
      quizQuestionCorrect.placeholder = isMultiple
        ? 'Nomor opsi yang benar (mis. 1)'
        : 'Jawaban benar (pisahkan dengan baris baru)';
    }
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    const precision = size >= 10 || unitIndex === 0 ? 0 : 1;
    return `${size.toFixed(precision)} ${units[unitIndex]}`;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applyHeatStyle(chip, heat) {
    const heatValue = Number.isFinite(Number(heat)) ? Number(heat) : 50;
    const hue = Math.max(0, 220 - heatValue * 1.8);
    chip.style.borderColor = `hsl(${hue} 60% 45%)`;
    if (chip?.dataset) chip.dataset.heat = String(Math.round(heatValue));
  }

  function buildCapDragPayload(capId, fromStage = null) {
    return JSON.stringify({ capId, fromStage });
  }

  function readCapDragData(dataTransfer) {
    if (!dataTransfer) return null;
    const raw = dataTransfer.getData('application/json') || dataTransfer.getData('text/plain');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.capId) return parsed;
    } catch (err) {
      const trimmed = raw.trim();
      if (trimmed) return { capId: trimmed };
    }
    return null;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  function normalizeAssignment(raw) {
    if (!raw) return null;
    const normalized = {
      id: raw.id || `asg-${uid()}`,
      title: (raw.title || '').trim(),
      focus: (raw.focus || '').trim(),
      description: (raw.description || '').trim(),
      createdAt: raw.createdAt || new Date().toISOString()
    };
    if (!normalized.title) normalized.title = 'Tugas Baru';
    if (!normalized.focus) normalized.focus = 'General';
    return normalized;
  }

  state.assignments.catalog = state.assignments.catalog.map((item) => normalizeAssignment(item)).filter(Boolean);

  async function synchronizeAssignmentsFromBackend() {
    const user = state.auth.currentUser;
    const token = localStorage.getItem('isl-token');
    if (!user || !token) {
      state.assignments.backendEnabled = false;
      return;
    }

    try {
      state.assignments.backendLoading = true;
      const assignments = await fetchAssignments();
      if (Array.isArray(assignments) && assignments.length) {
        state.assignments.catalog = assignments.map((item) => normalizeAssignment(item)).filter(Boolean);
      }

      let submissions = [];
      if (user.role === 'student') {
        submissions = await fetchMySubmissions();
      } else if (user.role === 'assistant' || user.role === 'admin') {
        const perAssignment = await Promise.all(
          state.assignments.catalog.map(async (assignment) => {
            try {
              const result = await fetchAssignmentSubmissions(assignment.id);
              return result.submissions || [];
            } catch (err) {
              console.error('[Assignments] Gagal memuat submissions:', assignment.id, err);
              return [];
            }
          })
        );
        submissions = perAssignment.flat();
      }

      state.assignments.submissions = Array.isArray(submissions) ? submissions : [];
      state.assignments.backendEnabled = true;
      state.assignments.backendError = null;
    } catch (err) {
      console.error('[Assignments] Sinkronisasi backend gagal:', err);
      state.assignments.backendEnabled = false;
      state.assignments.backendError = err.message || 'Gagal memuat data dari server.';
      toast(state.assignments.backendError, 'danger');
    } finally {
      state.assignments.backendLoading = false;
      ensureAssignmentOptions();
      renderStudentAssignments();
      renderAssistantAssignments();
      updateAttachmentStatus();
      if (state.auth.currentUser?.role === 'admin') {
        state.users.loaded = false;
        await refreshAdminUsers({ force: true });
      }
    }
  }

  function getActiveStudentSubmission() {
    const user = state.auth.currentUser;
    if (!user || user.role !== 'student' || !assignmentSelect) return null;
    const assignmentId = assignmentSelect.value;
    if (!assignmentId) return null;
    return (
      state.assignments.submissions.find(
        (item) => item.assignmentId === assignmentId && item.studentId === user.id
      ) || null
    );
  }

  function setAttachmentMessage(text, mode = 'default') {
    if (!assignmentFileInfo) return;
    assignmentFileInfo.textContent = text;
    assignmentFileInfo.classList.toggle('empty', mode === 'empty');
    assignmentFileInfo.classList.toggle('notice', mode === 'notice');
  }

  function toDisplayAttachment(attachment) {
    if (!attachment) return null;
    return {
      id: attachment.id || null,
      name: attachment.name || attachment.originalName || 'dokumen',
      size: Number.isFinite(attachment.size) ? attachment.size : attachment.sizeBytes || 0
    };
  }

  async function downloadSubmissionFile(submissionId, file) {
    try {
      const url = await getSubmissionFileDownloadUrl(submissionId, file.id);
      if (!url) throw new Error('URL unduhan tidak tersedia.');
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      console.error('[Assignments] Download file failed:', err);
      toast(err.message || 'Gagal mengunduh file.');
    }
  }

  function appendSubmissionFiles(container, submission) {
  if (!container || !submission?.files?.length) return;

  const list = document.createElement('div');
  list.className = 'attachment-info attachment-list';

    submission.files.forEach((file) => {
      const item = document.createElement('div');
      item.className = 'attachment-item';

      const label = document.createElement('span');
      label.className = 'file-label';
      label.textContent = 'Lampiran:';
      item.appendChild(label);

      const name = document.createElement('span');
      name.className = 'file-name';
      name.textContent = file.originalName || 'dokumen';
      item.appendChild(name);

      if (Number.isFinite(file.sizeBytes)) {
        const size = document.createElement('span');
        size.className = 'file-size';
        size.textContent = `(${formatBytes(file.sizeBytes)})`;
        item.appendChild(size);
      }

      const download = document.createElement('button');
      download.type = 'button';
      download.className = 'button-link';
      download.textContent = 'Unduh';
      download.addEventListener('click', (evt) => {
        evt.preventDefault();
        download.disabled = true;
        download.textContent = 'Mengunduh...';
        downloadSubmissionFile(submission.id, file)
          .catch(() => {})
          .finally(() => {
            download.disabled = false;
            download.textContent = 'Unduh';
          });
      });
      item.appendChild(download);

      list.appendChild(item);
    });

  container.appendChild(list);
}

  function createAdminUserCard(user) {
    const card = document.createElement('article');
    card.className = 'admin-user-card';
    card.dataset.id = user.id;

    const roleLabel = ROLE_LABELS[user.role] || user.role;
    const roleOptions = ROLE_OPTIONS.map(
      (option) =>
        `<option value="${option}" ${option === user.role ? 'selected' : ''}>${ROLE_LABELS[option] || option}</option>`
    ).join('');

    card.innerHTML = `
      <header class="admin-user-header">
        <div>
          <h4>${escapeHtml(user.name || user.username)}</h4>
          <p class="muted">@${escapeHtml(user.username)}${user.email ? ` â€¢ ${escapeHtml(user.email)}` : ''}</p>
        </div>
        <span class="badge badge-role-${escapeHtml(user.role)}">${escapeHtml(roleLabel)}</span>
      </header>
      <div class="admin-user-grid">
        <label>Nama
          <input type="text" class="admin-user-name" value="${escapeHtml(user.name || '')}" />
        </label>
        <label>Email
          <input type="email" class="admin-user-email" value="${escapeHtml(user.email || '')}" placeholder="opsional" />
        </label>
        <label>Role
          <select class="admin-user-role">
            ${roleOptions}
          </select>
        </label>
        <label>Password Baru
          <input type="password" class="admin-user-password" placeholder="Biarkan kosong jika tidak diubah" />
        </label>
        <label>Nomor Mahasiswa
          <input type="text" class="admin-user-student-id" value="${escapeHtml(user.studentId || '')}" placeholder="opsional" />
        </label>
        <label>Departemen
          <input type="text" class="admin-user-department" value="${escapeHtml(user.department || '')}" placeholder="opsional" />
        </label>
        <label>Telepon
          <input type="text" class="admin-user-phone" value="${escapeHtml(user.phone || '')}" placeholder="opsional" />
        </label>
        <label>Bio
          <textarea class="admin-user-bio" rows="2" placeholder="opsional">${escapeHtml(user.bio || '')}</textarea>
        </label>
      </div>
      <div class="admin-user-actions">
        <button type="button" class="secondary-btn small admin-user-delete">Hapus</button>
        <button type="button" class="small admin-user-save">Simpan</button>
      </div>
    `;

    const deleteBtn = card.querySelector('.admin-user-delete');
    if (deleteBtn && user.id === state.auth.currentUser?.id) {
      deleteBtn.disabled = true;
      deleteBtn.title = 'Tidak dapat menghapus akun sendiri';
    }

    return card;
  }

  function renderAdminList(listElem) {
    if (!listElem) return;
    listElem.innerHTML = '';

    if (state.users.loading) {
      const loading = document.createElement('p');
      loading.className = 'muted';
      loading.textContent = 'Memuat daftar pengguna...';
      listElem.appendChild(loading);
      return;
    }

    if (state.users.error) {
      const error = document.createElement('p');
      error.className = 'form-error';
      error.textContent = state.users.error;
      listElem.appendChild(error);
      return;
    }

    if (!state.users.list.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Belum ada pengguna lain.';
      listElem.appendChild(empty);
      return;
    }

    state.users.list.forEach((user) => {
      listElem.appendChild(createAdminUserCard(user));
    });
  }

  function openAdminModal(forceRefresh = false) {
    if (!adminModal) return;
    if (!state.auth.currentUser || state.auth.currentUser.role !== 'admin') {
      showLogin();
      return;
    }
    adminModal.classList.add('is-open');
    adminModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (forceRefresh || !state.users.loaded) {
      refreshAdminUsers({ force: true });
    }
  }

  function closeAdminModal() {
    if (!adminModal) return;
    adminModal.classList.remove('is-open');
    adminModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  if (typeof window !== 'undefined') {
    window.openAdminPanel = () => openAdminModal(true);
    window.closeAdminPanel = closeAdminModal;
  }

  if (adminModal && adminModal.parentElement !== document.body) {
    document.body.appendChild(adminModal);
    adminModal.setAttribute('role', 'dialog');
    adminModal.setAttribute('aria-modal', 'true');
  }

  function renderAdminUsers() {
    const isAdmin = state.auth.currentUser?.role === 'admin';

    adminOpenButtons.forEach((btn) => {
      if (!btn) return;
      btn.classList.toggle('is-visible', isAdmin);
      btn.setAttribute('aria-hidden', isAdmin ? 'false' : 'true');
    });

    adminInterfaces.forEach(({ panel }) => {
      if (panel && panel !== adminModal) {
        setPanelVisibility(panel, isAdmin);
      }
    });

    if (!isAdmin) {
      closeAdminModal();
      adminInterfaces.forEach(({ list, message }) => {
        if (list) list.innerHTML = '';
        if (message) {
          message.textContent = '';
          message.className = 'muted';
        }
      });
      return;
    }

    adminInterfaces.forEach(({ message }) => {
      if (!message) return;
      message.textContent = state.users.error || '';
      message.className = state.users.error ? 'form-error' : 'muted';
    });

    adminInterfaces.forEach(({ list }) => renderAdminList(list));
  }

  async function refreshAdminUsers({ force = false } = {}) {
    if (!state.auth.currentUser || state.auth.currentUser.role !== 'admin') {
      renderAdminUsers();
      return;
    }
    if (state.users.loading) return;
    if (state.users.loaded && !force) {
      renderAdminUsers();
      return;
    }

    try {
      state.users.loading = true;
      renderAdminUsers();
      const data = await listUsersApi();
      state.users.list = Array.isArray(data.users) ? data.users : [];
      state.users.error = null;
      state.users.loaded = true;
    } catch (err) {
      state.users.error = err.message || 'Gagal memuat pengguna.';
      state.users.list = [];
      state.users.loaded = false;
    } finally {
      state.users.loading = false;
      renderAdminUsers();
    }
  }

  async function handleAdminCreate(formElem, messageElem) {
    if (!state.auth.currentUser || state.auth.currentUser.role !== 'admin') {
      showLogin();
      return;
    }

    const formData = new FormData(formElem);
    const name = String(formData.get('name') || '').trim();
    const username = String(formData.get('username') || '').trim();
    const role = String(formData.get('role') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const studentId = String(formData.get('studentId') || '').trim();
    const department = String(formData.get('department') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const bio = String(formData.get('bio') || '').trim();

    const setMessage = (text, cls = 'muted') => {
      if (messageElem) {
        messageElem.textContent = text;
        messageElem.className = cls;
      }
    };

    if (!name || !username || !role) {
      setMessage('Nama, username, dan role wajib diisi.', 'form-error');
      return;
    }

    if (!ROLE_OPTIONS.includes(role)) {
      setMessage('Role tidak valid.', 'form-error');
      return;
    }

    if (role !== 'student' && !password) {
      setMessage('Password wajib diisi untuk akun non-mahasiswa.', 'form-error');
      return;
    }

    try {
      setMessage('Menyimpan pengguna baru...', 'muted');
      await createUserApi({
        name,
        username,
        role,
        email: email || null,
        password: password || undefined,
        studentId: studentId || null,
        department: department || null,
        phone: phone || null,
        bio: bio || null
      });
      formElem.reset();
      setMessage('', 'muted');
      toast('Pengguna baru berhasil ditambahkan.', 'success');
      state.users.loaded = false;
      await refreshAdminUsers({ force: true });
    } catch (err) {
      console.error('[Admin] Gagal membuat pengguna:', err);
      setMessage(err.message || 'Gagal membuat pengguna.', 'form-error');
      toast(err.message || 'Gagal membuat pengguna.', 'danger');
    }
  }

  async function handleAdminListClick(e) {
    const currentUser = state.auth.currentUser;
    if (!currentUser || currentUser.role !== 'admin') {
      showLogin();
      return;
    }

    const saveBtn = e.target.closest('.admin-user-save');
    const deleteBtn = e.target.closest('.admin-user-delete');
    if (!saveBtn && !deleteBtn) return;

    const card = (saveBtn || deleteBtn)?.closest('.admin-user-card');
    if (!card) return;
    const userId = card.dataset.id;
    if (!userId) return;

    if (saveBtn) {
      const nameInput = card.querySelector('.admin-user-name');
      const emailInput = card.querySelector('.admin-user-email');
      const roleSelect = card.querySelector('.admin-user-role');
      const passwordInput = card.querySelector('.admin-user-password');
      const studentIdInput = card.querySelector('.admin-user-student-id');
      const departmentInput = card.querySelector('.admin-user-department');
      const phoneInput = card.querySelector('.admin-user-phone');
      const bioInput = card.querySelector('.admin-user-bio');

      const nameValue = nameInput?.value.trim() || '';
      const emailValue = emailInput?.value.trim() || '';
      const roleValue = roleSelect?.value.trim() || '';
      const passwordValue = passwordInput?.value || '';
      const studentIdValue = studentIdInput?.value.trim() || '';
      const departmentValue = departmentInput?.value.trim() || '';
      const phoneValue = phoneInput?.value.trim() || '';
      const bioValue = bioInput?.value.trim() || '';

      if (!nameValue) {
        toast('Nama tidak boleh kosong.', 'danger');
        return;
      }

      if (!ROLE_OPTIONS.includes(roleValue)) {
        toast('Role tidak valid.', 'danger');
        return;
      }

      try {
        await updateUserApi(userId, {
          name: nameValue,
          email: emailValue || null,
          role: roleValue,
          password: passwordValue || undefined,
          studentId: studentIdValue || null,
          department: departmentValue || null,
          phone: phoneValue || null,
          bio: bioValue || null
        });
        toast('Perubahan pengguna disimpan.', 'success');
        state.users.loaded = false;
        await refreshAdminUsers({ force: true });
      } catch (err) {
        console.error('[Admin] Gagal memperbarui pengguna:', err);
        toast(err.message || 'Gagal memperbarui pengguna.', 'danger');
      }
      return;
    }

    if (deleteBtn) {
      if (deleteBtn.disabled) return;
      const targetName = card.querySelector('.admin-user-name')?.value || '';
      if (!window.confirm(`Hapus akun "${targetName || 'pengguna'}"?`)) return;
      try {
        await deleteUserApi(userId);
        toast('Pengguna berhasil dihapus.', 'info');
        state.users.loaded = false;
        await refreshAdminUsers({ force: true });
      } catch (err) {
        console.error('[Admin] Gagal menghapus pengguna:', err);
        toast(err.message || 'Gagal menghapus pengguna.', 'danger');
      }
    }
  }

  function createAnnouncementCard(item) {
    const card = document.createElement('article');
    card.className = 'announcement-card';
    card.innerHTML = `
      <header>
        <h4>${escapeHtml(item.title)}</h4>
        <span class="announcement-meta">${formatTimestamp(item.createdAt)} â€¢ ${escapeHtml(item.createdByName || 'Pengumuman')}</span>
      </header>
      <p>${escapeHtml(item.content)}</p>
    `;
    return card;
  }

  function renderAnnouncements() {
    const { list, loading, error } = state.announcements;

    const updateContainer = (listElem, emptyElem) => {
      if (!listElem) return;
      listElem.innerHTML = '';
      if (loading) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'Memuat pengumuman...';
        listElem.appendChild(p);
        if (emptyElem) emptyElem.style.display = 'none';
        return;
      }
      if (error) {
        const p = document.createElement('p');
        p.className = 'form-error';
        p.textContent = error;
        listElem.appendChild(p);
        if (emptyElem) emptyElem.style.display = 'none';
        return;
      }
      if (!list.length) {
        if (emptyElem) {
          emptyElem.style.display = 'block';
        } else if (listElem === appAnnouncementList) {
          const p = document.createElement('p');
          p.className = 'muted announcement-placeholder';
          p.textContent = 'Belum ada pengumuman.';
          listElem.appendChild(p);
        }
        return;
      }
      if (emptyElem) emptyElem.style.display = 'none';
      list.forEach((item) => listElem.appendChild(createAnnouncementCard(item)));
    };

    updateContainer(landingAnnouncementList, landingAnnouncementEmpty);
    updateContainer(appAnnouncementList, null);

    if (announcementForm) {
      const isAssistant = state.auth.currentUser && (state.auth.currentUser.role === 'assistant' || state.auth.currentUser.role === 'admin');
      announcementForm.style.display = isAssistant ? 'block' : 'none';
      if (!isAssistant && announcementFormMessage) {
        announcementFormMessage.textContent = '';
        announcementFormMessage.className = 'muted';
      }
    }

    if (landingAnnouncementSection) {
      const shouldShow = loading || error || state.announcements.loaded;
      landingAnnouncementSection.style.display = shouldShow ? 'block' : 'none';
    }
  }

  async function refreshAnnouncements({ force = false } = {}) {
    if (state.announcements.loading) return;
    if (state.announcements.loaded && !force) {
      renderAnnouncements();
      return;
    }
    try {
      state.announcements.loading = true;
      renderAnnouncements();
      const items = await fetchAnnouncements();
      state.announcements.list = items;
      state.announcements.error = null;
      state.announcements.loaded = true;
    } catch (err) {
      state.announcements.error = err.message || 'Gagal memuat pengumuman.';
      state.announcements.list = [];
      state.announcements.loaded = false;
    } finally {
      state.announcements.loading = false;
      renderAnnouncements();
    }
  }

  async function handleAnnouncementCreate(e) {
    e.preventDefault();
    if (!state.auth.currentUser || (state.auth.currentUser.role !== 'assistant' && state.auth.currentUser.role !== 'admin')) {
      showLogin();
      return;
    }
    if (!announcementForm) return;
    const formData = new FormData(announcementForm);
    const title = String(formData.get('title') || '').trim();
    const content = String(formData.get('content') || '').trim();

    if (!title || !content) {
      if (announcementFormMessage) {
        announcementFormMessage.textContent = 'Judul dan isi pengumuman wajib diisi.';
        announcementFormMessage.className = 'form-error';
      }
      return;
    }

    try {
      if (announcementFormMessage) {
        announcementFormMessage.textContent = 'Menyimpan pengumuman...';
        announcementFormMessage.className = 'muted';
      }
      const announcement = await createAnnouncement({ title, content });
      announcementForm.reset();
      if (announcementFormMessage) {
        announcementFormMessage.textContent = '';
        announcementFormMessage.className = 'muted';
      }
      state.announcements.list = [announcement, ...state.announcements.list];
      state.announcements.loaded = true;
      renderAnnouncements();
      toast('Pengumuman baru ditambahkan.', 'success');
    } catch (err) {
      console.error('[Announcements] create failed:', err);
      if (announcementFormMessage) {
        announcementFormMessage.textContent = err.message || 'Gagal menambahkan pengumuman.';
        announcementFormMessage.className = 'form-error';
      }
      toast(err.message || 'Gagal menambahkan pengumuman.', 'danger');
    }
  }

  function resetAssignmentState({ clearData = false } = {}) {
    state.assignments.selectedSubmissionId = null;
    state.assignments.pendingAttachment = null;
    state.assignments.removeAttachment = false;
    state.assignments.attachmentLoading = false;
    state.assignments.editingId = null;
    state.assignments.editingDraft = null;
    state.assignments.backendError = null;
    if (clearData) {
      state.assignments.submissions = [];
    }
    if (assignmentFileInput) assignmentFileInput.value = '';
    state.users = {
      list: [],
      loading: false,
      error: null,
      loaded: false
    };
  }

  function upsertSubmissionInState(submission) {
    if (!submission) return;
    const index = state.assignments.submissions.findIndex((item) => item.id === submission.id);
    if (index >= 0) {
      state.assignments.submissions[index] = { ...submission };
    } else {
      state.assignments.submissions.push({ ...submission });
    }
  }

  function setAttachmentInfo(label, attachment, mode = 'default') {
    if (!assignmentFileInfo) return;
    assignmentFileInfo.innerHTML = '';
    assignmentFileInfo.classList.toggle('empty', mode === 'empty');
    assignmentFileInfo.classList.toggle('notice', mode === 'notice');

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    assignmentFileInfo.appendChild(labelEl);

    const displayAttachment = toDisplayAttachment(attachment);
    if (displayAttachment) {
      const nameEl = document.createElement('span');
      nameEl.className = 'file-name';
      nameEl.textContent = displayAttachment.name;
      assignmentFileInfo.appendChild(nameEl);

      const sizeEl = document.createElement('span');
      sizeEl.className = 'file-size';
      sizeEl.textContent = `(${formatBytes(displayAttachment.size)})`;
      assignmentFileInfo.appendChild(sizeEl);
    }
  }

  function updateAttachmentStatus() {
    if (state.assignments.attachmentLoading) {
      setAttachmentMessage('Memproses dokumen...', 'notice');
      if (assignmentFileClear) {
        assignmentFileClear.disabled = true;
        assignmentFileClear.textContent = 'Hapus Dokumen';
      }
      return;
    }

    const pending = state.assignments.pendingAttachment;
    const removing = state.assignments.removeAttachment;
    const existingSubmission = getActiveStudentSubmission();
    const existingAttachment = existingSubmission?.files?.[0] || null;

    if (pending) {
      setAttachmentInfo('Akan diunggah:', pending);
    } else if (removing) {
      setAttachmentMessage('Dokumen akan dihapus saat pengumpulan disimpan.', 'notice');
    } else if (existingAttachment) {
      setAttachmentInfo('Dokumen tersimpan:', existingAttachment);
    } else {
      setAttachmentMessage('Belum ada file yang dipilih.', 'empty');
    }

    if (assignmentFileClear) {
      if (pending) {
        assignmentFileClear.disabled = false;
        assignmentFileClear.textContent = 'Batalkan Dokumen';
      } else if (removing) {
        assignmentFileClear.disabled = false;
        assignmentFileClear.textContent = 'Batalkan Penghapusan';
      } else if (existingAttachment) {
        assignmentFileClear.disabled = false;
        assignmentFileClear.textContent = 'Hapus Dokumen';
      } else {
        assignmentFileClear.disabled = true;
        assignmentFileClear.textContent = 'Hapus Dokumen';
      }
    }
  }

  function setPanelVisibility(panel, show) {
    if (!panel) return;
    panel.classList.toggle('is-visible', !!show);
  }

  function toggleDisplay(el, show) {
    if (!el) return;
    el.style.display = show ? '' : 'none';
  }

  function ensureAssignmentOptions() {
    if (!assignmentSelect) return;
    const previous = assignmentSelect.value;
    assignmentSelect.innerHTML = '';
    state.assignments.catalog.forEach((assignment, idx) => {
      const option = document.createElement('option');
      option.value = assignment.id;
      option.textContent = assignment.title;
      if (!previous && idx === 0) option.selected = true;
      assignmentSelect.appendChild(option);
    });
    if (previous) {
      assignmentSelect.value = previous;
    }
    updateAttachmentStatus();
  }

  function clearGradeForm() {
    if (!gradeForm) return;
    if (gradeSubmissionId) gradeSubmissionId.value = '';
    if (gradeScore) {
      gradeScore.value = '';
      gradeScore.disabled = true;
    }
    if (gradeFeedback) {
      gradeFeedback.value = '';
      gradeFeedback.disabled = true;
    }
    const submitBtn = gradeForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (gradeClear) gradeClear.disabled = true;
    if (gradeInfo) {
      gradeInfo.textContent = 'Pilih pengumpulan untuk mulai menilai.';
      gradeInfo.style.color = 'var(--muted)';
    }
  }

  function populateGradeForm(submission) {
    if (!gradeForm || !submission) return;
    if (gradeSubmissionId) gradeSubmissionId.value = submission.id;
    if (gradeScore) {
      gradeScore.disabled = false;
      gradeScore.value = submission.grade?.score ?? '';
    }
    if (gradeFeedback) {
      gradeFeedback.disabled = false;
      gradeFeedback.value = submission.grade?.feedback || '';
    }
    const submitBtn = gradeForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
    if (gradeClear) gradeClear.disabled = false;
    if (gradeInfo) {
      gradeInfo.textContent = submission.grade
        ? `Terakhir dinilai ${formatTimestamp(submission.grade.gradedAt)} oleh ${submission.grade.graderName}`
        : 'Siap untuk dinilai.';
      gradeInfo.style.color = '';
    }
  }

  function renderAssistantCatalog() {
    if (!assistantAssignmentList) return;
    assistantAssignmentList.innerHTML = '';
    const assignments = state.assignments.catalog.map((item) => ({ ...item }));
    if (!assignments.length) {
      const empty = document.createElement('p');
      empty.className = 'assignment-status';
      empty.textContent = 'Belum ada tugas. Tambahkan tugas baru untuk memulai.';
      assistantAssignmentList.appendChild(empty);
      return;
    }

    const editingId = state.assignments.editingId;

    assignments.forEach((assignment) => {
      const card = document.createElement('article');
      card.className = 'assignment-card';
      const isEditing = editingId === assignment.id;
      if (isEditing) card.classList.add('editing');

      const header = document.createElement('header');
      const title = document.createElement('h4');
      title.textContent = assignment.title || 'Tugas';
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = assignment.focus || 'General';
      header.appendChild(title);
      header.appendChild(badge);
      card.appendChild(header);

      if (!isEditing && assignment.description) {
        const desc = document.createElement('p');
        desc.textContent = assignment.description;
        card.appendChild(desc);
      }

      const createdMeta = document.createElement('p');
      createdMeta.className = 'submission-meta';
      createdMeta.textContent = `Dibuat ${formatTimestamp(assignment.createdAt)}`;
      card.appendChild(createdMeta);

      const submissionCount = state.assignments.submissions.filter((item) => item.assignmentId === assignment.id).length;
      const status = document.createElement('p');
      status.className = 'assignment-status';
      status.textContent = submissionCount
        ? `${submissionCount} pengumpulan`
        : 'Belum ada pengumpulan dari mahasiswa.';
      card.appendChild(status);

      if (isEditing) {
        const draft =
          state.assignments.editingDraft && state.assignments.editingDraft.id === assignment.id
            ? state.assignments.editingDraft
            : { ...assignment };
        const form = document.createElement('form');
        form.className = 'edit-form';
        form.dataset.id = assignment.id;
        form.innerHTML = `
          <label>Judul Tugas
            <input name="title" required value="${escapeHtml(draft.title || '')}" />
          </label>
          <label>Fokus / Modul
            <input name="focus" value="${escapeHtml(draft.focus || '')}" />
          </label>
          <label>Deskripsi Singkat
            <textarea name="description">${escapeHtml(draft.description || '')}</textarea>
          </label>
          <div class="form-actions">
            <button type="submit">Simpan</button>
            <button type='button' class="secondary-btn" data-action="cancel-edit-assignment" data-id="${assignment.id}">Batal</button>
          </div>
        `;
        card.appendChild(form);
      } else {
        const actions = document.createElement('div');
        actions.className = 'row-actions';
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'secondary-btn small';
        editBtn.dataset.action = 'edit-assignment';
        editBtn.dataset.id = assignment.id;
        editBtn.textContent = 'Edit';
        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'danger';
        deleteBtn.dataset.action = 'delete-assignment';
        deleteBtn.dataset.id = assignment.id;
        deleteBtn.textContent = 'Hapus';
        actions.appendChild(deleteBtn);

        card.appendChild(actions);
      }

      assistantAssignmentList.appendChild(card);
    });
  }

  function renderStudentAssignments() {
    const user = state.auth.currentUser;
    if (!user || user.role !== 'student') return;
    ensureAssignmentOptions();

    if (assignmentCatalogEl) {
      assignmentCatalogEl.innerHTML = '';
      state.assignments.catalog.forEach((assignment) => {
        const card = document.createElement('article');
        card.className = 'assignment-card';

        const header = document.createElement('header');
        const title = document.createElement('h4');
        title.textContent = assignment.title;
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = assignment.focus;
        header.appendChild(title);
        header.appendChild(badge);
        card.appendChild(header);

        const desc = document.createElement('p');
        desc.textContent = assignment.description;
        card.appendChild(desc);

        const submission = state.assignments.submissions.find(
          (item) => item.assignmentId === assignment.id && item.studentId === user.id
        );
        let statusText = 'Belum dikumpulkan';
        if (submission) {
          statusText = submission.grade
            ? `Sudah dinilai ${submission.grade.score}/100 oleh ${submission.grade.graderName}`
            : 'Menunggu penilaian asisten';
          const timestamp = formatTimestamp(submission.submittedAt);
          if (timestamp) statusText += ` â€¢ ${timestamp}`;
        }
        const status = document.createElement('p');
        status.className = 'assignment-status';
        status.textContent = statusText;
        card.appendChild(status);

        appendSubmissionFiles(card, submission);

        assignmentCatalogEl.appendChild(card);
      });
    }

    if (studentSubmissionsEl) {
      studentSubmissionsEl.innerHTML = '';
      const items = state.assignments.submissions
        .filter((item) => item.studentId === user.id)
        .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

      if (!items.length) {
        const empty = document.createElement('p');
        empty.className = 'assignment-status';
        empty.textContent = 'Belum ada pengumpulan.';
        studentSubmissionsEl.appendChild(empty);
        return;
      }

      items.forEach((submission) => {
        const card = document.createElement('article');
        card.className = 'submission-card';
        if (submission.grade) card.classList.add('graded');

        const assignment = getAssignmentMeta(submission.assignmentId);

        const title = document.createElement('h4');
        title.textContent = assignment ? assignment.title : submission.assignmentId;
        card.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'submission-meta';
        meta.textContent = `Dikirim ${formatTimestamp(submission.submittedAt)}`;
        card.appendChild(meta);

        if (submission.link) {
          const link = document.createElement('a');
          link.href = submission.link;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = submission.link;
          card.appendChild(link);
        }

        if (submission.notes) {
          const notes = document.createElement('p');
          notes.textContent = submission.notes;
          card.appendChild(notes);
        }

        appendSubmissionFiles(card, submission);

        const status = document.createElement('p');
        status.className = 'submission-meta';
        status.textContent = submission.grade
          ? `Nilai ${submission.grade.score}/100 â€¢ ${submission.grade.graderName}`
          : 'Menunggu penilaian.';
        card.appendChild(status);

        studentSubmissionsEl.appendChild(card);
      });
    }

    updateAttachmentStatus();
  }

  function renderAssistantAssignments() {
    const user = state.auth.currentUser;
    if (!assistantSubmissionList) return;

    renderAssistantCatalog();

    assistantSubmissionList.innerHTML = '';
    const items = state.assignments.submissions
      .slice()
      .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'assignment-status';
      empty.textContent = 'Belum ada pengumpulan mahasiswa.';
      assistantSubmissionList.appendChild(empty);
      if (user?.role === 'assistant') clearGradeForm();
      return;
    }

    let selectedSubmission = null;

    items.forEach((submission) => {
      const card = document.createElement('article');
      card.className = 'submission-card';
      card.dataset.id = submission.id;
      if (submission.grade) card.classList.add('graded');
      if (submission.id === state.assignments.selectedSubmissionId) {
        card.classList.add('is-selected');
        selectedSubmission = submission;
      }

      const assignment = getAssignmentMeta(submission.assignmentId);

      const title = document.createElement('h4');
      title.textContent = `${submission.studentName || submission.studentId} â€¢ ${
        assignment ? assignment.title : submission.assignmentId
      }`;
      card.appendChild(title);

      const meta = document.createElement('div');
      meta.className = 'submission-meta';
      meta.textContent = `Dikirim ${formatTimestamp(submission.submittedAt)}`;
      card.appendChild(meta);

      if (submission.link) {
        const link = document.createElement('a');
        link.href = submission.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = submission.link;
        card.appendChild(link);
      }

      if (submission.notes) {
        const notes = document.createElement('p');
        notes.textContent = submission.notes;
        card.appendChild(notes);
      }

      appendSubmissionFiles(card, submission);

      const status = document.createElement('div');
      status.className = 'submission-meta';
      status.textContent = submission.grade
        ? `Nilai ${submission.grade.score}/100 oleh ${submission.grade.graderName}`
        : 'Menunggu penilaian';
      card.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'actions';
      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = 'secondary-btn small grade-open-btn';
      selectBtn.dataset.id = submission.id;
      selectBtn.textContent = 'Penilaian';
      actions.appendChild(selectBtn);
      card.appendChild(actions);

      assistantSubmissionList.appendChild(card);
    });

    if (user?.role === 'assistant' && selectedSubmission) {
      populateGradeForm(selectedSubmission);
    } else if (user?.role === 'assistant') {
      clearGradeForm();
    }
  }

  function updateAuthUI() {
    const user = state.auth.currentUser;
    document.body.dataset.role = user?.role || '';

    if (userBadge) {
      if (user) {
        const roleLabel = user.role === 'assistant' ? 'Asisten' : 'Mahasiswa';
        userBadge.textContent = `${user.name} (${roleLabel})`;
      } else {
        userBadge.textContent = 'Belum Masuk';
      }
    }

    if (logoutBtn) logoutBtn.style.display = user ? '' : 'none';
    
    // Show/hide profile button based on login status - AGGRESSIVE approach
    const profileBtnEl = profileBtn || document.getElementById('profileBtn');
    if (profileBtnEl) {
      if (user) {
        profileBtnEl.style.display = 'block';
        profileBtnEl.style.visibility = 'visible';
        profileBtnEl.style.opacity = '1';
      } else {
        profileBtnEl.style.display = 'none';
        profileBtnEl.style.visibility = 'hidden';
      }
      console.log('[App] Profile button display:', user ? 'SHOWN' : 'HIDDEN', profileBtnEl);
    } else {
      console.error('[App] profileBtn element NOT FOUND in DOM!');
    }

    // Update landing page UI
    updateLandingAuthUI();

    if (accountNameEl) accountNameEl.textContent = user ? user.name : 'Belum masuk';
    if (accountRoleEl) {
      accountRoleEl.textContent = user ? (ROLE_LABELS[user.role] || user.role) : '';
    }

    setPanelVisibility(guestPanel, !user);
    setPanelVisibility(studentPanel, user?.role === 'student');
    setPanelVisibility(assistantPanel, user && (user.role === 'assistant' || user.role === 'admin'));
    setPanelVisibility(adminPanel, user?.role === 'admin');

    if (tipStudent) toggleDisplay(tipStudent, !user || user.role === 'student');
    if (tipAssistant) toggleDisplay(tipAssistant, user && (user.role === 'assistant' || user.role === 'admin'));
    if (assignmentLoginBtn) toggleDisplay(assignmentLoginBtn, !user);

    if (user?.role === 'student') {
      renderStudentAssignments();
      clearGradeForm();
    } else if (studentSubmissionsEl) {
      studentSubmissionsEl.innerHTML = '';
    }

    if (user && (user.role === 'assistant' || user.role === 'admin')) {
      renderAssistantAssignments();
    } else if (assistantSubmissionList) {
      assistantSubmissionList.innerHTML = '';
      clearGradeForm();
    }

    updateAttachmentStatus();
    if ((!user || (user.role !== 'assistant' && user.role !== 'admin')) && assistantAssignmentList) {
      assistantAssignmentList.innerHTML = '';
    }

    if (user?.role === 'admin') {
      refreshAdminUsers();
    } else {
      state.users.list = [];
      state.users.loaded = false;
      state.users.error = null;
      renderAdminUsers();
    }

    updateQuizManagerVisibility();
    updateQuizTopicUI();

    renderAnnouncements();
  }

  // Update landing page auth UI (navbar buttons)
  function updateLandingAuthUI() {
    const user = state.auth.currentUser;
    const enterAppBtn = $('#enterApp');
    const landingUserInfo = $('#landing-user-info');
    const landingUserBadge = $('#landing-user-badge');
    const landingProfileBtn = $('#landingProfileBtn');
    const landingLogoutBtn = $('#landingLogoutBtn');

    if (enterAppBtn) {
      enterAppBtn.style.display = user ? 'none' : 'inline-flex';
    }

    if (landingUserInfo) {
      landingUserInfo.style.display = user ? 'flex' : 'none';
    }

    if (user && landingUserBadge) {
      const roleLabel = ROLE_LABELS[user.role] || user.role;
      landingUserBadge.textContent = `${user.name} (${roleLabel})`;
    }

    // Event listeners for landing page buttons (only add once)
    if (landingProfileBtn && !landingProfileBtn.dataset.listenerAdded) {
      landingProfileBtn.addEventListener('click', () => {
        window.profileManager?.openProfileModal();
      });
      landingProfileBtn.dataset.listenerAdded = 'true';
    }

    if (landingLogoutBtn && !landingLogoutBtn.dataset.listenerAdded) {
      landingLogoutBtn.addEventListener('click', doLogout);
      landingLogoutBtn.dataset.listenerAdded = 'true';
    }
  }

  function attemptEnterApp(evt) {
    evt?.preventDefault?.();
    if (state.auth.currentUser) {
      revealApp();
    } else {
      showLogin();
    }
  }

  function doLogout() {
    state.auth.currentUser = null;
    resetAssignmentState({ clearData: true });
    state.assignments.backendEnabled = false;
    state.assignments.backendLoading = false;
    state.assignments.backendError = null;
    
    // Clear localStorage for Google OAuth
    localStorage.removeItem('isl-token');
    localStorage.removeItem('isl-user');
    
    updateAuthUI();
    showLanding();
    toast('Anda telah keluar.', 'info');
  }

  // Landing & auth events
  $('#enterApp')?.addEventListener('click', attemptEnterApp);
  $('#getStarted')?.addEventListener('click', attemptEnterApp);
  $('#ctaLaunch')?.addEventListener('click', attemptEnterApp);
  $('#backToLanding')?.addEventListener('click', showLanding);
  assignmentLoginBtn?.addEventListener('click', attemptEnterApp);

  loginCancel?.addEventListener('click', () => {
    hideLogin();
    if (!state.auth.currentUser) showLanding();
  });
  loginClose?.addEventListener('click', () => {
    hideLogin();
    if (!state.auth.currentUser) showLanding();
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (loginUsername?.value || '').trim();
    const password = (loginPassword?.value || '').trim();
    if (!username || !password) {
      if (loginError) loginError.textContent = 'Silakan isi username dan password.';
      return;
    }
    if (loginError) loginError.textContent = '';
    try {
      const { token, user } = await loginWithCredentials(username, password);
      localStorage.setItem('isl-token', token);
      localStorage.setItem('isl-user', JSON.stringify(user));
      state.auth.currentUser = user;
      resetAssignmentState();
      synchronizeAssignmentsFromBackend();
      hideLogin();
      updateAuthUI();
      revealApp();
      toast(`Selamat datang, ${user.name}`, 'success');
    } catch (err) {
      console.error('[Auth] Login gagal:', err);
      if (loginError) {
        loginError.textContent = err.message || 'Login gagal. Coba lagi.';
      }
      state.auth.currentUser = null;
      localStorage.removeItem('isl-token');
      localStorage.removeItem('isl-user');
    }
  });

  logoutBtn?.addEventListener('click', doLogout);

  assignmentSelect?.addEventListener('change', () => {
    state.assignments.pendingAttachment = null;
    state.assignments.removeAttachment = false;
    state.assignments.attachmentLoading = false;
    state.assignments.editingId = null;
    state.assignments.editingDraft = null;
    if (assignmentFileInput) assignmentFileInput.value = '';
    updateAttachmentStatus();
  });

  assignmentFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      state.assignments.pendingAttachment = null;
      state.assignments.removeAttachment = false;
      state.assignments.attachmentLoading = false;
      updateAttachmentStatus();
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast(`Ukuran dokumen melebihi ${formatBytes(MAX_ATTACHMENT_SIZE)}.`);
      if (assignmentFileInput) assignmentFileInput.value = '';
      state.assignments.pendingAttachment = null;
      state.assignments.removeAttachment = false;
      state.assignments.attachmentLoading = false;
      updateAttachmentStatus();
      return;
    }
    state.assignments.pendingAttachment = {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      file
    };
    state.assignments.removeAttachment = false;
    state.assignments.attachmentLoading = false;
    updateAttachmentStatus();
  });

  assignmentFileClear?.addEventListener('click', () => {
    if (assignmentFileClear.disabled) return;
    if (state.assignments.pendingAttachment) {
      state.assignments.pendingAttachment = null;
      state.assignments.attachmentLoading = false;
      if (assignmentFileInput) assignmentFileInput.value = '';
    } else if (state.assignments.removeAttachment) {
      state.assignments.removeAttachment = false;
    } else {
      const submission = getActiveStudentSubmission();
      if (submission?.files?.length) {
        state.assignments.removeAttachment = true;
        state.assignments.attachmentLoading = false;
        if (assignmentFileInput) assignmentFileInput.value = '';
      }
    }
    updateAttachmentStatus();
  });

  quizTopicSelect?.addEventListener('change', (e) => {
    setActiveQuizTopic(e.target.value);
  });

  quizQuestionTopicSelect?.addEventListener('change', () => {
    renderQuizQuestionList();
  });

  quizTopicForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!canManageQuiz()) {
      toast('Hanya asisten/admin yang dapat mengelola kuis.', 'warning');
      return;
    }
    const title = (quizTopicTitleInput?.value || '').trim();
    const description = (quizTopicDescriptionInput?.value || '').trim();
    if (!title) {
      if (quizTopicFormMessage) {
        quizTopicFormMessage.textContent = 'Judul topik wajib diisi.';
        quizTopicFormMessage.className = 'form-error';
      }
      return;
    }
    const topicId = (quizTopicIdInput?.value || '').trim();
    try {
      if (quizTopicFormMessage) {
        quizTopicFormMessage.textContent = 'Menyimpan topik...';
        quizTopicFormMessage.className = 'muted';
      }
      if (topicId) {
        await updateQuizTopicApi(topicId, { title, description });
        toast('Topik kuis diperbarui.', 'success');
      } else {
        const topic = await createQuizTopicApi({ title, description });
        state.quiz.activeTopicId = topic?.id || state.quiz.activeTopicId;
        toast('Topik kuis baru ditambahkan.', 'success');
      }
      resetQuizTopicForm();
      await refreshQuizTopics({ includeQuestions: true });
      if (quizTopicFormMessage) {
        quizTopicFormMessage.textContent = '';
        quizTopicFormMessage.className = 'muted';
      }
    } catch (err) {
      console.error('[Quiz] Gagal menyimpan topik:', err);
      if (quizTopicFormMessage) {
        quizTopicFormMessage.textContent = err.message || 'Gagal menyimpan topik.';
        quizTopicFormMessage.className = 'form-error';
      }
      toast(err.message || 'Gagal menyimpan topik.', 'danger');
    }
  });

  quizTopicCancelBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    resetQuizTopicForm();
  });

  quizTopicList?.addEventListener('click', async (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    const row = e.target.closest('[data-topic-id]');
    if (!row) return;
    const topicId = row.dataset.topicId;
    const topic = getQuizTopicById(topicId);
    if (!topic) return;

    if (action === 'set-active-topic') {
      setActiveQuizTopic(topic.id);
      toast(`Topik "${topic.title}" dipilih.`, 'info');
    } else if (action === 'edit-topic') {
      populateQuizTopicForm(topic);
    } else if (action === 'delete-topic') {
      if (!canManageQuiz()) {
        toast('Tidak memiliki akses.', 'danger');
        return;
      }
      if (getQuizTopics().length <= 1) {
        toast('Minimal harus ada satu topik kuis.', 'warning');
        return;
      }
      if (!window.confirm(`Hapus topik "${topic.title}" beserta semua soalnya?`)) return;
      try {
        await deleteQuizTopicApi(topic.id);
        toast('Topik kuis dihapus.', 'info');
        resetQuizTopicForm();
        resetQuizQuestionForm();
        await refreshQuizTopics({ includeQuestions: true });
      } catch (err) {
        console.error('[Quiz] Gagal menghapus topik:', err);
        toast(err.message || 'Gagal menghapus topik.', 'danger');
      }
    }
  });

  quizQuestionType?.addEventListener('change', updateQuizQuestionFormState);

  quizQuestionForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!canManageQuiz()) {
      toast('Hanya asisten/admin yang dapat mengelola kuis.', 'warning');
      return;
    }
    const topicId = quizQuestionTopicSelect?.value || state.quiz.activeTopicId;
    const topic = topicId ? getQuizTopicById(topicId) : null;
    if (!topic) {
      if (quizQuestionFormMessage) {
        quizQuestionFormMessage.textContent = 'Pilih topik kuis terlebih dahulu.';
        quizQuestionFormMessage.className = 'form-error';
      }
      return;
    }
    const type = quizQuestionType?.value || 'multiple';
    const questionText = (quizQuestionText?.value || '').trim();
    if (!questionText) {
      if (quizQuestionFormMessage) {
        quizQuestionFormMessage.textContent = 'Pertanyaan wajib diisi.';
        quizQuestionFormMessage.className = 'form-error';
      }
      return;
    }

    const payload = {
      type,
      question: questionText
    };

    if (type === 'multiple') {
      const options = (quizQuestionOptions?.value || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      const correctIndex = parseInt((quizQuestionCorrect?.value || '').trim(), 10) - 1;
      if (options.length < 2) {
        if (quizQuestionFormMessage) {
          quizQuestionFormMessage.textContent = 'Masukkan minimal dua opsi jawaban.';
          quizQuestionFormMessage.className = 'form-error';
        }
        return;
      }
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
        if (quizQuestionFormMessage) {
          quizQuestionFormMessage.textContent = 'Isi jawaban benar dengan nomor opsi yang valid.';
          quizQuestionFormMessage.className = 'form-error';
        }
        return;
      }
      payload.options = options;
      payload.correct = correctIndex;
    } else {
      const answers = (quizQuestionCorrect?.value || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      if (!answers.length) {
        if (quizQuestionFormMessage) {
          quizQuestionFormMessage.textContent = 'Masukkan minimal satu jawaban benar.';
          quizQuestionFormMessage.className = 'form-error';
        }
        return;
      }
      payload.options = [];
      payload.correct = answers.length === 1 ? answers[0] : answers;
    }

    try {
      if (quizQuestionFormMessage) {
        quizQuestionFormMessage.textContent = 'Menyimpan soal...';
        quizQuestionFormMessage.className = 'muted';
      }
      if (state.quiz.editingQuestionId) {
        await updateQuizQuestionApi(topic.id, state.quiz.editingQuestionId, payload);
        toast('Soal kuis diperbarui.', 'success');
      } else {
        await createQuizQuestionApi(topic.id, payload);
        toast('Soal kuis ditambahkan.', 'success');
      }
      resetQuizQuestionForm();
      await refreshQuizTopics({ includeQuestions: true });
      setActiveQuizTopic(topic.id);
    } catch (err) {
      console.error('[Quiz] Gagal menyimpan soal:', err);
      if (quizQuestionFormMessage) {
        quizQuestionFormMessage.textContent = err.message || 'Gagal menyimpan soal.';
        quizQuestionFormMessage.className = 'form-error';
      }
      toast(err.message || 'Gagal menyimpan soal.', 'danger');
    }
  });

  quizQuestionCancelBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    resetQuizQuestionForm();
  });

  quizQuestionList?.addEventListener('click', async (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    const row = e.target.closest('[data-question-id]');
    if (!row) return;
    const topicId = row.dataset.topicId;
    const questionId = row.dataset.questionId;
    const topic = getQuizTopicById(topicId);
    if (!topic) return;
    const question = topic.questions.find((q) => q.id === questionId);
    if (!question) return;

    if (action === 'edit-question') {
      populateQuizQuestionForm(topic.id, question);
    } else if (action === 'delete-question') {
      if (!window.confirm('Hapus soal ini?')) return;
      try {
        await deleteQuizQuestionApi(topic.id, question.id);
        toast('Soal kuis dihapus.', 'info');
        await refreshQuizTopics({ includeQuestions: true });
        setActiveQuizTopic(topic.id);
      } catch (err) {
        console.error('[Quiz] Gagal menghapus soal:', err);
        toast(err.message || 'Gagal menghapus soal.', 'danger');
      }
    }
  });

  adminOpenButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminModal(true);
    });
  });

  adminModalClose?.addEventListener('click', (e) => {
    e.preventDefault();
    closeAdminModal();
  });

  adminModalBackdrop?.addEventListener('click', () => {
    closeAdminModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal && adminModal.classList.contains('is-open')) {
      closeAdminModal();
    }
  });

  announcementForm?.addEventListener('submit', handleAnnouncementCreate);
  if (announcementForm && announcementFormMessage) {
    announcementForm.addEventListener('input', () => {
      if (announcementFormMessage.textContent) {
        announcementFormMessage.textContent = '';
        announcementFormMessage.className = 'muted';
      }
    });
  }

  adminInterfaces.forEach(({ form, message }) => {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAdminCreate(form, message);
    });
  });

  adminInterfaces.forEach(({ list }) => {
    if (!list) return;
    list.addEventListener('click', handleAdminListClick);
  });

  assignmentCreateForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = state.auth.currentUser;
    if (!user || user.role !== 'assistant') {
      showLogin();
      return;
    }
    const fd = new FormData(assignmentCreateForm);
    const title = String(fd.get('title') || '').trim();
    const focus = String(fd.get('focus') || '').trim();
    const description = String(fd.get('description') || '').trim();

    if (!title) {
      toast('Judul tugas wajib diisi.');
      return;
    }

    const assignment = normalizeAssignment({
      id: `asg-${uid()}`,
      title,
      focus: focus || 'General',
      description,
      createdAt: new Date().toISOString()
    });

    state.assignments.editingId = null;
    state.assignments.editingDraft = null;
    state.assignments.catalog.push(assignment);
    assignmentCreateForm.reset();
    toast('Tugas baru ditambahkan.');

    ensureAssignmentOptions();
    renderAssistantAssignments();
  });

  assistantAssignmentList?.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    const editBtn = target.closest('[data-action="edit-assignment"]');
    if (editBtn) {
      const user = state.auth.currentUser;
      if (!user || user.role !== 'assistant') {
        showLogin();
        return;
      }
      const id = editBtn.dataset.id;
      const assignment = state.assignments.catalog.find((item) => item.id === id);
      if (!assignment) return;
      state.assignments.editingId = id;
      state.assignments.editingDraft = { ...assignment };
      renderAssistantCatalog();
      const firstInput = assistantAssignmentList.querySelector('.edit-form input[name="title"]');
      firstInput?.focus();
      return;
    }

    const cancelBtn = target.closest('[data-action="cancel-edit-assignment"]');
    if (cancelBtn) {
      const id = cancelBtn.dataset.id;
      if (state.assignments.editingId === id) {
        state.assignments.editingId = null;
        state.assignments.editingDraft = null;
        renderAssistantCatalog();
      }
      return;
    }

    const deleteBtn = target.closest('[data-action="delete-assignment"]');
    if (deleteBtn) {
      const user = state.auth.currentUser;
      if (!user || user.role !== 'assistant') {
        showLogin();
        return;
      }
      const id = deleteBtn.dataset.id;
      const assignment = state.assignments.catalog.find((item) => item.id === id);
      if (!assignment) return;
      if (!window.confirm(`Hapus tugas "${assignment.title}" beserta seluruh pengumpulannya?`)) return;
      state.assignments.catalog = state.assignments.catalog.filter((item) => item.id !== id);
      state.assignments.submissions = state.assignments.submissions.filter((item) => item.assignmentId !== id);
      if (state.assignments.selectedSubmissionId) {
        const exists = state.assignments.submissions.some((item) => item.id === state.assignments.selectedSubmissionId);
        if (!exists) state.assignments.selectedSubmissionId = null;
      }
      state.assignments.editingId = null;
      state.assignments.editingDraft = null;
      ensureAssignmentOptions();
      renderStudentAssignments();
      renderAssistantAssignments();
      toast('Tugas dihapus.');
      return;
    }
  });

  assistantAssignmentList?.addEventListener('input', (e) => {
    const form = e.target.closest('.edit-form');
    if (!form) return;
    if (form.dataset.id !== state.assignments.editingId) return;
    const field = e.target.name;
    if (!field || !['title', 'focus', 'description'].includes(field)) return;
    if (!state.assignments.editingDraft || state.assignments.editingDraft.id !== state.assignments.editingId) {
      const current = state.assignments.catalog.find((item) => item.id === state.assignments.editingId);
      state.assignments.editingDraft = current ? { ...current } : null;
      if (!state.assignments.editingDraft) return;
    }
    state.assignments.editingDraft = {
      ...state.assignments.editingDraft,
      [field]: e.target.value
    };
  });

  assistantAssignmentList?.addEventListener('submit', (e) => {
    const form = e.target.closest('.edit-form');
    if (!form) return;
    e.preventDefault();
    const user = state.auth.currentUser;
    if (!user || user.role !== 'assistant') {
      showLogin();
      return;
    }
    const id = form.dataset.id;
    const assignment = state.assignments.catalog.find((item) => item.id === id);
    if (!assignment) return;

    const formData = new FormData(form);
    const title = String(formData.get('title') || '').trim();
    const focus = String(formData.get('focus') || '').trim();
    const description = String(formData.get('description') || '').trim();

    if (!title) {
      toast('Judul tugas wajib diisi.');
      return;
    }

    const updated = normalizeAssignment({
      ...assignment,
      title,
      focus: focus || 'General',
      description,
      createdAt: assignment.createdAt
    });
    updated.updatedAt = new Date().toISOString();

    state.assignments.catalog = state.assignments.catalog.map((item) =>
      item.id === id ? { ...updated } : item
    );
    state.assignments.editingId = null;
    state.assignments.editingDraft = null;

    ensureAssignmentOptions();
    renderStudentAssignments();
    renderAssistantAssignments();
    toast('Tugas diperbarui.');
  });

  assignmentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = state.auth.currentUser;
    if (!user || user.role !== 'student') {
      showLogin();
      return;
    }
    if (state.assignments.backendLoading) {
      toast('Sedang memproses pengumpulan sebelumnya. Tunggu sebentar.');
      return;
    }

    const fd = new FormData(assignmentForm);
    const assignmentId = String(fd.get('assignmentId') || '').trim();
    const link = String(fd.get('link') || '').trim();
    const notes = String(fd.get('notes') || '').trim();
    if (!assignmentId) return;

    const existing = state.assignments.submissions.find(
      (item) => item.assignmentId === assignmentId && item.studentId === user.id
    );
    const pendingAttachment = state.assignments.pendingAttachment;
    const removingAttachment = state.assignments.removeAttachment;
    const hasExistingFiles = existing?.files?.length;

    if (!link && !notes && !pendingAttachment && !hasExistingFiles) {
      toast('Sertakan tautan, catatan, atau lampiran untuk pengumpulan.');
      return;
    }

    try {
      state.assignments.backendLoading = true;
      const { submission: savedSubmission } = await submitAssignment(assignmentId, { link, notes });
      const submissionId = savedSubmission?.id;
      if (!submissionId) {
        throw new Error('Server tidak mengembalikan data pengumpulan.');
      }

      if (removingAttachment && existing?.files?.length) {
        await Promise.all(
          existing.files.map((file) =>
            deleteSubmissionFile(submissionId, file.id).catch((err) => {
              console.error('[Assignments] Gagal menghapus file:', file.id, err);
              throw err;
            })
          )
        );
      }

      if (pendingAttachment?.file) {
        const upload = await requestSubmissionUpload(submissionId, {
          fileName: pendingAttachment.name,
          fileSize: pendingAttachment.size,
          contentType: pendingAttachment.type || 'application/octet-stream'
        });

        const uploadResponse = await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': pendingAttachment.type || 'application/octet-stream',
            'x-upsert-token': upload.token
          },
          body: pendingAttachment.file
        });

        if (!uploadResponse.ok) {
          throw new Error('Gagal mengunggah dokumen. Coba lagi.');
        }

        await confirmSubmissionFile(submissionId, {
          fileId: upload.fileId,
          storagePath: upload.storagePath,
          fileName: pendingAttachment.name,
          contentType: pendingAttachment.type || 'application/octet-stream',
          fileSize: pendingAttachment.size
        });
      }

      let files = [];
      try {
        files = await listSubmissionFilesApi(submissionId);
      } catch (err) {
        if (err?.status === 503) {
          console.warn('[Assignments] Storage tidak dikonfigurasi:', err.message);
          toast(err.message || 'Penyimpanan file belum dikonfigurasi.', 'warning');
        } else {
          throw err;
        }
      }
      const latestSubmission = {
        ...savedSubmission,
        files
      };

      upsertSubmissionInState(latestSubmission);
      state.assignments.selectedSubmissionId = submissionId;

      assignmentForm.reset();
      if (assignmentSelect) assignmentSelect.value = assignmentId;

      state.assignments.pendingAttachment = null;
      state.assignments.removeAttachment = false;
      state.assignments.attachmentLoading = false;
      if (assignmentFileInput) assignmentFileInput.value = '';

      renderStudentAssignments();
      renderAssistantAssignments();
      updateAttachmentStatus();
      toast('Pengumpulan tersimpan.', 'success');
    } catch (err) {
      console.error('[Assignments] Gagal menyimpan pengumpulan:', err);
      toast(err.message || 'Gagal menyimpan pengumpulan.', 'danger');
    } finally {
      state.assignments.backendLoading = false;
    }
  });

  assistantSubmissionList?.addEventListener('click', (e) => {
    const btn = e.target.closest('.grade-open-btn');
    if (!btn) return;
    e.preventDefault();
    const user = state.auth.currentUser;
    if (!user || user.role !== 'assistant') {
      showLogin();
      return;
    }
    const submission = state.assignments.submissions.find((item) => item.id === btn.dataset.id);
    if (!submission) return;
    state.assignments.selectedSubmissionId = submission.id;
    populateGradeForm(submission);
    renderAssistantAssignments();
  });

  gradeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = state.auth.currentUser;
    if (!user || user.role !== 'assistant') {
      showLogin();
      return;
    }
    const submissionId = gradeSubmissionId?.value;
    if (!submissionId) return;

    const rawScore = gradeScore?.value ?? '';
    if (rawScore === '') {
      if (gradeInfo) {
        gradeInfo.textContent = 'Masukkan nilai sebelum menyimpan.';
        gradeInfo.style.color = 'var(--danger)';
      }
      return;
    }
    const scoreValue = Number(rawScore);
    if (Number.isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      if (gradeInfo) {
        gradeInfo.textContent = 'Masukkan nilai antara 0 hingga 100.';
        gradeInfo.style.color = 'var(--danger)';
      }
      return;
    }

    try {
      state.assignments.backendLoading = true;
      const updatedSubmission = await gradeSubmission(submissionId, {
        score: Math.round(scoreValue),
        feedback: (gradeFeedback?.value || '').trim()
      });

      if (!updatedSubmission) {
        throw new Error('Server tidak mengembalikan data penilaian.');
      }

      upsertSubmissionInState(updatedSubmission);
      populateGradeForm(updatedSubmission);
      renderAssistantAssignments();
      renderStudentAssignments();
      if (gradeInfo) {
        gradeInfo.textContent = 'Penilaian tersimpan.';
        gradeInfo.style.color = 'var(--success)';
      }
      toast('Penilaian tersimpan.', 'success');
    } catch (err) {
      console.error('[Assignments] Gagal menyimpan penilaian:', err);
      if (gradeInfo) {
        gradeInfo.textContent = err.message || 'Gagal menyimpan penilaian.';
        gradeInfo.style.color = 'var(--danger)';
      }
      toast(err.message || 'Gagal menyimpan penilaian.', 'danger');
    } finally {
      state.assignments.backendLoading = false;
    }
  });

  gradeClear?.addEventListener('click', async () => {
    const user = state.auth.currentUser;
    if (!user || user.role !== 'assistant') {
      showLogin();
      return;
    }
    const submissionId = gradeSubmissionId?.value;
    if (!submissionId) return;
    const submission = state.assignments.submissions.find((item) => item.id === submissionId);
    if (!submission || !submission.grade) return;

    try {
      state.assignments.backendLoading = true;
      const updatedSubmission = await clearSubmissionGrade(submissionId);
      if (!updatedSubmission) {
        throw new Error('Server tidak mengembalikan data setelah penghapusan nilai.');
      }
      upsertSubmissionInState(updatedSubmission);
      populateGradeForm(updatedSubmission);
      renderAssistantAssignments();
      renderStudentAssignments();
      toast('Penilaian dihapus.', 'info');
    } catch (err) {
      console.error('[Assignments] Gagal menghapus penilaian:', err);
      toast(err.message || 'Gagal menghapus penilaian.', 'danger');
    } finally {
      state.assignments.backendLoading = false;
    }
  });

  // Smooth scroll for Learn More
  $('#learnMore')?.addEventListener('click', () => {
    $('#features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  ensureAssignmentOptions();
  clearGradeForm();
  refreshAnnouncements();
  refreshQuizTopics({ includeQuestions: true, silent: true });
  renderAdminUsers();
  updateQuizTopicUI();
  updateQuizManagerVisibility();
  updateQuizQuestionFormState();

  // Restore session from localStorage (for Google OAuth)
  const savedToken = localStorage.getItem('isl-token');
  const savedUser = localStorage.getItem('isl-user');
  if (savedToken && savedUser) {
    try {
      state.auth.currentUser = JSON.parse(savedUser);
      console.log('[App] Session restored:', state.auth.currentUser.name);
      resetAssignmentState({ clearData: true });
      synchronizeAssignmentsFromBackend();
    } catch (err) {
      console.error('[App] Failed to restore session:', err);
      localStorage.removeItem('isl-token');
      localStorage.removeItem('isl-user');
    }
  }
  
  updateAuthUI();

  // Listen for Google OAuth login success
  window.addEventListener('google-login-success', (event) => {
    console.log('[App] Google login success event received');
    const { user } = event.detail;
    state.auth.currentUser = user;
    resetAssignmentState({ clearData: true });
    synchronizeAssignmentsFromBackend();
    updateAuthUI();
  });

  // Listen for profile update
  window.addEventListener('profile-updated', (event) => {
    console.log('[App] Profile updated event received');
    const { user } = event.detail;
    state.auth.currentUser = user;
    updateAuthUI();
  });

  window.addEventListener('auth-state-changed', () => {
    const savedToken = localStorage.getItem('isl-token');
    const savedUser = localStorage.getItem('isl-user');
    if (!savedToken || !savedUser) return;
    try {
      state.auth.currentUser = JSON.parse(savedUser);
      resetAssignmentState({ clearData: true });
      synchronizeAssignmentsFromBackend();
      updateAuthUI();
    } catch (err) {
      console.error('[App] Failed to handle auth-state-changed:', err);
    }
  });

  // WORKAROUND: Force profile button visibility check
  setInterval(() => {
    const btn = document.getElementById('profileBtn');
    const user = state.auth.currentUser;
    if (btn && user) {
      const currentDisplay = window.getComputedStyle(btn).display;
      if (currentDisplay === 'none') {
        btn.style.display = 'block';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
        console.log('[App] FORCED profile button to show');
      }
    }
  }, 1000);

  // Check if user wants to go directly to app (from localStorage or URL)
  if (localStorage.getItem('si_suite_skip_landing') === 'true' || window.location.hash === '#app') {
    attemptEnterApp();
  }

  // ====== Tabs ======
  $$('.tab').forEach((t) =>
    t.addEventListener('click', () => {
      $$('.tab').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      $$('.tab-panel').forEach((p) => p.classList.remove('active'));
      $('#tab-' + t.dataset.tab).classList.add('active');
    })
  );

  // ====== REQUIREMENTS ======
  $('#req-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = {
      id: uid(),
      title: (fd.get('title') || '').trim(),
      actor: (fd.get('actor') || '').trim(),
      ac: (fd.get('ac') || '').trim(),
      bucket: 'S'
    };
    if (!item.title) return;
    state.req.items.push(item);
    e.target.reset();
    drawReq();
  });

  function drawReq() {
    const buckets = { M: $('#m-list'), S: $('#s-list'), C: $('#c-list'), W: $('#w-list') };
    Object.values(buckets).forEach((el) => (el.innerHTML = ''));

    state.req.items.forEach((it) => {
      const el = document.createElement('article');
      el.className = 'ticket';
      el.draggable = true;
      el.dataset.id = it.id;
      el.innerHTML = `
      <header>
        <span class="badge">${it.actor || 'Actor'}</span>
        <div style="display:flex; gap:6px">
          <button class="del danger" title="Delete">&times;</button>
        </div>
      </header>
      <div contenteditable="true" class="title">${it.title}</div>
      <label>Acceptance Criteria</label>
      <textarea>${it.ac || ''}</textarea>
    `;
      // drag
      el.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/plain', it.id);
      });
      // edits
      el.querySelector('.title').addEventListener('input', (ev) => {
        it.title = ev.target.textContent.trim();
      });
      el.querySelector('textarea').addEventListener('input', (ev) => {
        it.ac = ev.target.value;
      });
      el.querySelector('.del').addEventListener('click', () => {
        state.req.items = state.req.items.filter((x) => x.id !== it.id);
        drawReq();
      });
      buckets[it.bucket].appendChild(el);
    });

    $$('.col .list').forEach((list) => {
      list.addEventListener('dragover', (e) => e.preventDefault());
      list.addEventListener('drop', (e) => {
        const id = e.dataTransfer.getData('text/plain');
        const item = state.req.items.find((x) => x.id === id);
        if (item) {
          item.bucket = list.closest('.col').dataset.bucket;
          drawReq();
        }
      });
    });
  }

  $('#export-req-csv')?.addEventListener('click', () => {
    const rows = [['ID', 'Title', 'Actor', 'AC', 'Bucket']].concat(
      state.req.items.map((i) => [i.id, i.title, i.actor, (i.ac || '').replace(/\n/g, ' '), i.bucket])
    );
    const csv = rows
      .map((r) => r.map((v) => `"${(v || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'requirements.csv');
  });

  // ====== EA: Value Stream × Capability ======
  $('#add-vs')?.addEventListener('click', () => {
    const name = ($('#vs-name').value || '').trim();
    if (!name) return;
    state.ea.stages.push({ id: uid(), name });
    $('#vs-name').value = '';
    drawEA();
  });
  $('#add-cap')?.addEventListener('click', () => {
    const name = ($('#cap-name').value || '').trim();
    if (!name) return;
    const cap = { id: uid(), name };
    state.ea.caps.push(cap);
    drawEA();
    $('#cap-name').value = '';
  });

  $('#stake-add')?.addEventListener('click', () => {
    const name = ($('#stake-input').value || '').trim();
    if (!name) return;
    state.ea.stakeholders.push({ id: uid(), name });
    $('#stake-input').value = '';
    drawEA();
  });

  function drawEA() {
    const s = $('#stake-list');
    if (s) {
      s.innerHTML = "";
      state.ea.stakeholders.forEach((k) => {
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `<span style="flex:1">${escapeHtml(k.name)}</span><button data-id="${k.id}" class="danger">A-</button>`;
        row.querySelector('button').onclick = () => {
          state.ea.stakeholders = state.ea.stakeholders.filter((x) => x.id !== k.id);
          drawEA();
        };
        s.appendChild(row);
      });
    }

    const grid = $('#vs-grid');
    if (grid) {
      grid.innerHTML = "";
      state.ea.stages.forEach((st) => {
        const wrap = document.createElement('section');
        wrap.className = 'stage';
        wrap.dataset.id = st.id;
        wrap.innerHTML = `
      <header><h3 contenteditable="true">${escapeHtml(st.name || 'Stage')}</h3>
      <button class="danger del" type="button">A-</button></header>
      <div class="drop" aria-label="Drop capabilities here"></div>`;
        const title = wrap.querySelector('h3');
        title.oninput = (e) => {
          st.name = e.target.textContent.trim();
        };
        wrap.querySelector('.del').onclick = () => {
          state.ea.stages = state.ea.stages.filter((x) => x.id !== st.id);
          delete state.ea.map[st.id];
          drawEA();
        };
        const drop = wrap.querySelector('.drop');
        drop.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });
        drop.addEventListener('drop', (e) => {
          e.preventDefault();
          const data = readCapDragData(e.dataTransfer);
          if (!data?.capId) return;
          const { capId, fromStage = null } = data;
          if (fromStage === st.id) return;
          const sourceList = fromStage && state.ea.map[fromStage] ? state.ea.map[fromStage] : null;
          const sourceEntry = sourceList?.find((x) => x.id === capId) || null;
          if (fromStage && fromStage !== st.id && sourceList) {
            state.ea.map[fromStage] = sourceList.filter((x) => x.id !== capId);
            if (state.ea.map[fromStage] && !state.ea.map[fromStage].length) delete state.ea.map[fromStage];
          }
          if (!state.ea.map[st.id]) state.ea.map[st.id] = [];
          const targetList = state.ea.map[st.id];
          const existing = targetList.find((x) => x.id === capId);
          if (!existing) {
            targetList.push({ id: capId, heat: sourceEntry?.heat ?? 50 });
          } else if (sourceEntry && sourceEntry.heat != null) {
            existing.heat = sourceEntry.heat;
          }
          drawEA();
        });

        const mapped = (state.ea.map[st.id] || [])
          .map((m) => {
            const cap = state.ea.caps.find((c) => c.id === m.id);
            if (!cap) {
              state.ea.map[st.id] = (state.ea.map[st.id] || []).filter((x) => x.id !== m.id);
              return null;
            }
            const chip = document.createElement('div');
            chip.className = 'cap-chip stage-item';
            chip.draggable = true;
            chip.dataset.id = m.id;
            chip.dataset.stageId = st.id;
            chip.title = `Heat: ${m.heat}`;
            chip.innerHTML = `
          <span class="cap-name">${escapeHtml(cap.name)}</span>
          <div class="heat-wrap">
            <input class="heat" type="range" min="0" max="100" value="${m.heat}">
            <span class="heat-label">${m.heat}</span>
          </div>
          <button class="danger rm" type="button">A-</button>`;
            chip.addEventListener('dragstart', (evt) => {
              const payload = buildCapDragPayload(m.id, st.id);
              evt.dataTransfer.setData('application/json', payload);
              evt.dataTransfer.setData('text/plain', payload);
              evt.dataTransfer.effectAllowed = 'move';
            });
            const heatInput = chip.querySelector('.heat');
            const heatLabel = chip.querySelector('.heat-label');
            heatInput.addEventListener('input', (evt) => {
              m.heat = +evt.target.value;
              heatLabel.textContent = m.heat;
              applyHeatStyle(chip, m.heat);
              chip.title = `Heat: ${m.heat}`;
            });
            chip.querySelector('.rm').onclick = () => {
              state.ea.map[st.id] = (state.ea.map[st.id] || []).filter((x) => x.id !== m.id);
              if (state.ea.map[st.id] && !state.ea.map[st.id].length) delete state.ea.map[st.id];
              drawEA();
            };
            applyHeatStyle(chip, m.heat);
            return chip;
          })
          .filter(Boolean);
        mapped.forEach((c) => drop.appendChild(c));
        grid.appendChild(wrap);
      });
    }

    const pool = $('#cap-pool');
    if (pool) {
      pool.innerHTML = "";
      state.ea.caps.forEach((cap) => {
        const chip = document.createElement('div');
        chip.className = 'cap-chip pool';
        chip.draggable = true;
        chip.dataset.id = cap.id;
        chip.innerHTML = `<span>${escapeHtml(cap.name)}</span>`;
        chip.addEventListener('dragstart', (e) => {
          const payload = buildCapDragPayload(cap.id);
          e.dataTransfer.setData('application/json', payload);
          e.dataTransfer.setData('text/plain', payload);
          e.dataTransfer.effectAllowed = 'move';
        });
        pool.appendChild(chip);
      });
      if (!pool.dataset.dropBound) {
        pool.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });
        pool.addEventListener('drop', (e) => {
          e.preventDefault();
          const data = readCapDragData(e.dataTransfer);
          if (!data?.capId || !data.fromStage) return;
          const list = state.ea.map[data.fromStage];
          if (!list) return;
          state.ea.map[data.fromStage] = list.filter((x) => x.id !== data.capId);
          if (state.ea.map[data.fromStage] && !state.ea.map[data.fromStage].length) {
            delete state.ea.map[data.fromStage];
          }
          drawEA();
        });
        pool.dataset.dropBound = 'true';
      }
    }
  }

  // ====== IXD: Wireframe + Wiring + Event log ======
  const ixdWires = $('#ixd-wires');
  (function initDefs() {
    if (!ixdWires) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L10,3.5 L0,7 z');
    path.setAttribute('fill', '#86c5ff');
    marker.appendChild(path);
    defs.appendChild(marker);
    ixdWires.appendChild(defs);
  })();

  $('#ixd-mode')?.addEventListener('change', (e) => (state.ixd.mode = e.target.value));
  $('.palette')?.addEventListener('click', (e) => {
    const b = e.target.closest('.comp');
    if (!b) return;
    spawnNode(b.dataset.type, 40 + state.ixd.nodes.length * 16, 60 + state.ixd.nodes.length * 12);
  });

  const ixdBoard = $('#ixd-board');
  function spawnNode(type, x, y) {
    if (!ixdBoard) return;
    const id = uid();
    const el = document.createElement('article');
    el.className = 'wf';
    el.tabIndex = 0;
    el.dataset.id = id;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.innerHTML = renderNodeInner(type);
    ixdBoard.appendChild(el);

    const n = { id, type, x, y, w: el.offsetWidth, h: el.offsetHeight, label: type };
    state.ixd.nodes.push(n);
    bindNode(el);
    redrawIXD();
  }
  function renderNodeInner(type) {
    if (type === 'button')
      return `<header contenteditable="true">Button</header><button class="sim">Click me</button>`;
    if (type === 'input')
      return `<header contenteditable="true">Input</header><input placeholder="Type..." />`;
    if (type === 'card')
      return `<header contenteditable="true">Card</header><div contenteditable="true">Some content...</div>`;
    if (type === 'checkbox')
      return `<header contenteditable="true">Checkbox</header><label><input type="checkbox"> Option</label>`;
    return `<header contenteditable="true">${type}</header>`;
  }

  function bindNode(el) {
    if (!el) return;
    const id = el.dataset.id;
    const header = el.querySelector('header');
    let dragging = false,
      dx = 0,
      dy = 0;
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('input,textarea,button')) return;
      dragging = true;
      el.setPointerCapture(e.pointerId);
      dx = e.clientX - el.offsetLeft;
      dy = e.clientY - el.offsetTop;
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const nx = Math.max(0, e.clientX - dx);
      const ny = Math.max(0, e.clientY - dy);
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
      const node = state.ixd.nodes.find((n) => n.id === id);
      if (node) {
        node.x = nx;
        node.y = ny;
      }
      redrawIXD();
    });
    el.addEventListener('pointerup', () => (dragging = false));

    header?.addEventListener('input', () => {
      const node = state.ixd.nodes.find((n) => n.id === id);
      if (node) node.label = header.textContent.trim();
    });

    // runtime events -> log
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('sim')) {
        const label = state.ixd.nodes.find((n) => n.id === id)?.label || 'Button';
        logIXD(`Button "${label}" clicked`);
      }
    });

    // connect in Wire mode
    el.addEventListener('click', () => {
      if (state.ixd.mode !== 'wire') return;
      if (!state._pending) {
        state._pending = id;
        el.style.outline = '2px solid #22d3ee';
        return;
      }
      if (state._pending === id) {
        el.style.outline = '';
        state._pending = null;
        return;
      }
      state.ixd.wires.push({ id: uid(), a: state._pending, b: id });
      const prev = $(`.wf[data-id="${state._pending}"]`);
      if (prev) prev.style.outline = '';
      state._pending = null;
      redrawIXD();
    });
  }

  function redrawIXD() {
    if (!ixdWires || !ixdBoard) return;
    ixdWires.innerHTML = ixdWires.querySelector('defs')?.outerHTML || '';
    const center = (el) => {
      const r = el.getBoundingClientRect();
      const b = ixdBoard.getBoundingClientRect();
      return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
    };
    state.ixd.wires.forEach((w) => {
      const a = $(`.wf[data-id="${w.a}"]`),
        b = $(`.wf[data-id="${w.b}"]`);
      if (!a || !b) return;
      const ca = center(a),
        cb = center(b);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ca.x);
      line.setAttribute('y1', ca.y);
      line.setAttribute('x2', cb.x);
      line.setAttribute('y2', cb.y);
      line.classList.add('connection');
      line.setAttribute('marker-end', 'url(#arrow)');
      ixdWires.appendChild(line);
    });
  }

  function logIXD(msg) {
    const box = $('#ixd-log');
    if (!box) return;
    const t = new Date().toLocaleTimeString();
    const row = document.createElement('div');
    row.textContent = `${t} | ${msg}`;
    box.prepend(row);
  }

  $('#ixd-export-svg')?.addEventListener('click', () => {
    if (!ixdBoard) return;
    const b = ixdBoard.getBoundingClientRect();
    const doc = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', null);
    const root = doc.documentElement;
    root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    root.setAttribute('width', b.width);
    root.setAttribute('height', b.height);
    // nodes as rect + label
    state.ixd.nodes.forEach((n) => {
      const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
      const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', n.x);
      rect.setAttribute('y', n.y);
      rect.setAttribute('width', n.w || 140);
      rect.setAttribute('height', n.h || 80);
      rect.setAttribute('rx', '10');
      rect.setAttribute('fill', '#151936');
      rect.setAttribute('stroke', '#2e356a');
      const text = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', n.x + 10);
      text.setAttribute('y', n.y + 24);
      text.setAttribute('fill', '#e6e6f0');
      text.textContent = n.label || n.type;
      g.appendChild(rect);
      g.appendChild(text);
      root.appendChild(g);
    });
    // wires
    state.ixd.wires.forEach((w) => {
      const a = state.ixd.nodes.find((n) => n.id === w.a),
        b = state.ixd.nodes.find((n) => n.id === w.b);
      if (!a || !b) return;
      const line = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x + (a.w || 140) / 2);
      line.setAttribute('y1', a.y + (a.h || 80) / 2);
      line.setAttribute('x2', b.x + (b.w || 140) / 2);
      line.setAttribute('y2', b.y + (b.h || 80) / 2);
      line.setAttribute('stroke', '#86c5ff');
      line.setAttribute('stroke-width', '2.5');
      root.appendChild(line);
    });
    const xml = new XMLSerializer().serializeToString(root);
    downloadBlob(new Blob([xml], { type: 'image/svg+xml' }), 'wireframe.svg');
  });

  // ====== DIAGRAM BUILDER (like draw.io) ======
  const diagramCanvas = $('#diagram-canvas');
  let diagramDragging = false;
  let diagramDragTarget = null;
  let diagramDragOffset = { x: 0, y: 0 };

  // Shape definitions
  const shapeTemplates = {
    rectangle: (x, y, w, h, fill, stroke, sw) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="5"/>`,
    circle: (x, y, w, h, fill, stroke, sw) =>
      `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
    diamond: (x, y, w, h, fill, stroke, sw) =>
      `<path d="M${x + w / 2},${y} L${x + w},${y + h / 2} L${x + w / 2},${y + h} L${x},${y + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
    triangle: (x, y, w, h, fill, stroke, sw) =>
      `<path d="M${x + w / 2},${y} L${x + w},${y + h} L${x},${y + h} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
    hexagon: (x, y, w, h, fill, stroke, sw) =>
      `<path d="M${x + w * 0.25},${y} L${x + w * 0.75},${y} L${x + w},${y + h / 2} L${x + w * 0.75},${y + h} L${x + w * 0.25},${y + h} L${x},${y + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
    cylinder: (x, y, w, h, fill, stroke, sw) =>
      `<ellipse cx="${x + w / 2}" cy="${y + h * 0.15}" rx="${w / 2}" ry="${h * 0.15}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><rect x="${x}" y="${y + h * 0.15}" width="${w}" height="${h * 0.7}" fill="${fill}" stroke="none"/><path d="M${x},${y + h * 0.15} L${x},${y + h * 0.85} Q${x + w / 2},${y + h} ${x + w},${y + h * 0.85} L${x + w},${y + h * 0.15}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
    star: (x, y, w, h, fill, stroke, sw) => {
      const cx = x + w / 2,
        cy = y + h / 2,
        r = Math.min(w, h) / 2;
      let path = 'M';
      for (let i = 0; i < 10; i++) {
        const angle = (i * 36 - 90) * (Math.PI / 180);
        const rad = i % 2 === 0 ? r : r * 0.5;
        path += `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)} ${i < 9 ? 'L' : ''}`;
      }
      return `<path d="${path}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    },
    arrow: (x, y, w, h, fill, stroke, sw) =>
      `<path d="M${x},${y + h / 2} L${x + w * 0.7},${y + h / 2} L${x + w * 0.7},${y} L${x + w},${y + h / 2} L${x + w * 0.7},${y + h} L${x + w * 0.7},${y + h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
  };

  // Add shape buttons
  $$('.shape-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const shape = btn.dataset.shape;
      const fill = $('#diagram-fill')?.value || '#7dd3fc';
      const stroke = $('#diagram-stroke')?.value || '#3b82f6';
      const sw = $('#diagram-stroke-width')?.value || 2;
      addDiagramShape(
        shape,
        100 + state.diagram.shapes.length * 20,
        100 + state.diagram.shapes.length * 20,
        120,
        80,
        fill,
        stroke,
        sw
      );
    });
  });

  // Initialize diagram builder
  function initializeDiagramBuilder() {
    // Ensure select tool is active by default
    const selectTool = $('#diagram-select-tool');
    if (selectTool) {
      $$('.tool-btn').forEach((b) => b.classList.remove('active'));
      selectTool.classList.add('active');
      state.diagram.tool = 'select';
    }
    
    // Initial draw
    drawDiagram();
    updatePropertiesPanel();
  }

  // Tool buttons
  $$('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.tool-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.id === 'diagram-select-tool') state.diagram.tool = 'select';
      if (btn.id === 'diagram-connector-tool') state.diagram.tool = 'connector';
      if (btn.id === 'diagram-text-tool') state.diagram.tool = 'text';
      if (btn.id === 'diagram-delete-tool') state.diagram.tool = 'delete';
    });
  });

  // Initialize diagram builder when page loads
  setTimeout(initializeDiagramBuilder, 100);

  function addDiagramShape(type, x, y, w, h, fill, stroke, strokeWidth) {
    const id = uid();
    const shape = {
      id,
      type,
      x,
      y,
      w,
      h,
      fill,
      stroke,
      strokeWidth: +strokeWidth,
      text: type.charAt(0).toUpperCase() + type.slice(1),
      fontSize: 14,
      textColor: '#e6ecff',
      rotation: 0,
      locked: false
    };
    state.diagram.shapes.push(shape);
    drawDiagram();
  }

  function drawDiagram() {
    const canvas = diagramCanvas;
    if (!canvas) return;

    // Clear (keep defs)
    const defs = canvas.querySelector('defs')?.outerHTML || '';
    canvas.innerHTML = defs;

    // Draw connectors
    state.diagram.connectors.forEach((conn) => {
      const from = state.diagram.shapes.find((s) => s.id === conn.from);
      const to = state.diagram.shapes.find((s) => s.id === conn.to);
      if (!from || !to) return;

      const x1 = from.x + from.w / 2;
      const y1 = from.y + from.h / 2;
      const x2 = to.x + to.w / 2;
      const y2 = to.y + to.h / 2;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('diagram-connector');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      line.dataset.id = conn.id;
      line.addEventListener('click', () => {
        if (state.diagram.tool === 'delete') {
          state.diagram.connectors = state.diagram.connectors.filter((c) => c.id !== conn.id);
          drawDiagram();
        }
      });
      canvas.appendChild(line);
    });

    state.diagram.shapes.forEach((shape) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('diagram-shape');
      g.dataset.id = shape.id;
      if (state.diagram.selected === shape.id) g.classList.add('selected');
      if (state.diagram.resizing === shape.id) g.classList.add('resizing');

      if (shape.rotation) {
        const centerX = shape.x + shape.w / 2;
        const centerY = shape.y + shape.h / 2;
        g.setAttribute('transform', `rotate(${shape.rotation} ${centerX} ${centerY})`);
      }

      const shapeEl = shapeTemplates[shape.type](
        shape.x,
        shape.y,
        shape.w,
        shape.h,
        shape.fill,
        shape.stroke,
        shape.strokeWidth
      );
      g.innerHTML = shapeEl;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.classList.add('diagram-text');
      text.setAttribute('x', shape.x + shape.w / 2);
      text.setAttribute('y', shape.y + shape.h / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', shape.fontSize || 14);
      text.setAttribute('fill', shape.textColor || '#e6ecff');
      text.textContent = shape.text || '';
      text.style.pointerEvents = 'all';
      text.style.userSelect = 'none';
      
      text.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        editShapeText(shape, text);
      });
      

      text.addEventListener('click', (e) => {
        if (state.diagram.tool === 'text') {
          e.stopPropagation();
          editShapeText(shape, text);
        }
      });
      
      g.appendChild(text);

      if (state.diagram.selected === shape.id && state.diagram.tool === 'select') {
        addResizeHandles(g, shape);
      }

      g.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (state.diagram.tool === 'select') {
          state.diagram.selected = shape.id;
          
          if (e.target.classList.contains('resize-handle')) {
            return;
          }
          
          diagramDragging = true;
          diagramDragTarget = shape;
          const pt = getSVGPoint(canvas, e);
          diagramDragOffset = { x: pt.x - shape.x, y: pt.y - shape.y };
          updatePropertiesPanel();
          drawDiagram();
        } else if (state.diagram.tool === 'connector') {
          if (!state.diagram.tempConnector) {
            state.diagram.tempConnector = { from: shape.id };
          } else {
            state.diagram.connectors.push({
              id: uid(),
              from: state.diagram.tempConnector.from,
              to: shape.id
            });
            state.diagram.tempConnector = null;
            drawDiagram();
          }
        } else if (state.diagram.tool === 'delete') {
          state.diagram.shapes = state.diagram.shapes.filter((s) => s.id !== shape.id);
          state.diagram.connectors = state.diagram.connectors.filter(
            (c) => c.from !== shape.id && c.to !== shape.id
          );
          if (state.diagram.selected === shape.id) {
            state.diagram.selected = null;
          }
          updatePropertiesPanel();
          drawDiagram();
        }
      });

      canvas.appendChild(g);
    });
  }

  function addResizeHandles(shapeGroup, shape) {
    const handles = [
      { x: shape.x, y: shape.y, cursor: 'nw-resize' }, // top-left
      { x: shape.x + shape.w, y: shape.y, cursor: 'ne-resize' }, // top-right
      { x: shape.x + shape.w, y: shape.y + shape.h, cursor: 'se-resize' }, // bottom-right
      { x: shape.x, y: shape.y + shape.h, cursor: 'sw-resize' }, // bottom-left
      { x: shape.x + shape.w / 2, y: shape.y, cursor: 'n-resize' }, // top
      { x: shape.x + shape.w, y: shape.y + shape.h / 2, cursor: 'e-resize' }, // right
      { x: shape.x + shape.w / 2, y: shape.y + shape.h, cursor: 's-resize' }, // bottom
      { x: shape.x, y: shape.y + shape.h / 2, cursor: 'w-resize' } // left
    ];

    handles.forEach((handle, index) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.classList.add('resize-handle');
      rect.setAttribute('x', handle.x - 4);
      rect.setAttribute('y', handle.y - 4);
      rect.setAttribute('width', 8);
      rect.setAttribute('height', 8);
      rect.setAttribute('rx', 2);
      rect.style.cursor = handle.cursor;
      rect.dataset.handleIndex = index;
      
      rect.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        handleResizeStart(e, shape);
      });
      
      shapeGroup.appendChild(rect);
    });
  }

  function handleResizeStart(e, shape) {
    e.stopPropagation();
    state.diagram.resizing = shape.id;
    state.diagram.resizeHandle = parseInt(e.target.dataset.handleIndex);
    state.diagram.resizeStartPos = getSVGPoint(diagramCanvas, e);
    state.diagram.resizeStartShape = { ...shape };
    drawDiagram();
  }

  function editShapeText(shape, textElement) {
    const existingEditors = diagramCanvas.querySelectorAll('foreignObject');
    existingEditors.forEach(editor => editor.remove());
    
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', Math.max(0, shape.x + 5));
    foreignObject.setAttribute('y', Math.max(0, shape.y + shape.h / 2 - 15));
    foreignObject.setAttribute('width', Math.max(100, shape.w - 10));
    foreignObject.setAttribute('height', 30);
    foreignObject.style.overflow = 'visible';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = shape.text || '';
    input.style.cssText = `
      width: 100%; 
      height: 30px; 
      border: 2px solid #7dd3fc; 
      background: rgba(26, 30, 56, 0.95); 
      color: #e6ecff; 
      text-align: center; 
      font-size: ${shape.fontSize || 14}px;
      font-family: inherit;
      border-radius: 4px;
      outline: none;
      padding: 0 8px;
      box-sizing: border-box;
    `;

    foreignObject.appendChild(input);
    diagramCanvas.appendChild(foreignObject);

    setTimeout(() => {
      input.focus();
      input.select();
    }, 10);

    const finishEdit = () => {
      const newText = input.value.trim();
      shape.text = newText;
      foreignObject.remove();
      updatePropertiesPanel();
      drawDiagram();
      
      if (window.showToast) {
        showToast('Text updated successfully!', 'success');
      }
    };

    const cancelEdit = () => {
      foreignObject.remove();
      drawDiagram();
    };

    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        finishEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });
  }

  diagramCanvas?.addEventListener('mousemove', (e) => {
    if (diagramDragging && diagramDragTarget) {
      const pt = getSVGPoint(diagramCanvas, e);
      diagramDragTarget.x = Math.max(0, pt.x - diagramDragOffset.x);
      diagramDragTarget.y = Math.max(0, pt.y - diagramDragOffset.y);
      drawDiagram();
    } else if (state.diagram.resizing) {
      const shape = state.diagram.shapes.find(s => s.id === state.diagram.resizing);
      if (shape) {
        handleResize(e, shape);
      }
    }
  });

  function handleResize(e, shape) {
    const pt = getSVGPoint(diagramCanvas, e);
    const handleIndex = state.diagram.resizeHandle;
    const startPos = state.diagram.resizeStartPos;
    const startShape = state.diagram.resizeStartShape;
    
    const dx = pt.x - startPos.x;
    const dy = pt.y - startPos.y;
    
    const minSize = 20;
    
    switch (handleIndex) {
      case 0: // top-left
        shape.x = Math.min(startShape.x + dx, startShape.x + startShape.w - minSize);
        shape.y = Math.min(startShape.y + dy, startShape.y + startShape.h - minSize);
        shape.w = startShape.w - (shape.x - startShape.x);
        shape.h = startShape.h - (shape.y - startShape.y);
        break;
      case 1: // top-right
        shape.y = Math.min(startShape.y + dy, startShape.y + startShape.h - minSize);
        shape.w = Math.max(minSize, startShape.w + dx);
        shape.h = startShape.h - (shape.y - startShape.y);
        break;
      case 2: // bottom-right
        shape.w = Math.max(minSize, startShape.w + dx);
        shape.h = Math.max(minSize, startShape.h + dy);
        break;
      case 3: // bottom-left
        shape.x = Math.min(startShape.x + dx, startShape.x + startShape.w - minSize);
        shape.w = startShape.w - (shape.x - startShape.x);
        shape.h = Math.max(minSize, startShape.h + dy);
        break;
      case 4: // top
        shape.y = Math.min(startShape.y + dy, startShape.y + startShape.h - minSize);
        shape.h = startShape.h - (shape.y - startShape.y);
        break;
      case 5: // right
        shape.w = Math.max(minSize, startShape.w + dx);
        break;
      case 6: // bottom
        shape.h = Math.max(minSize, startShape.h + dy);
        break;
      case 7: // left
        shape.x = Math.min(startShape.x + dx, startShape.x + startShape.w - minSize);
        shape.w = startShape.w - (shape.x - startShape.x);
        break;
    }
    
    // Ensure minimum size
    shape.w = Math.max(minSize, shape.w);
    shape.h = Math.max(minSize, shape.h);
    
    drawDiagram();
  }

  diagramCanvas?.addEventListener('mouseup', () => {
    diagramDragging = false;
    diagramDragTarget = null;
    
    if (state.diagram.resizing) {
      state.diagram.resizing = null;
      state.diagram.resizeHandle = null;
      state.diagram.resizeStartPos = null;
      state.diagram.resizeStartShape = null;
      drawDiagram();
    }
  });

  diagramCanvas?.addEventListener('click', (e) => {
    if (e.target === diagramCanvas) {
      state.diagram.selected = null;
      state.diagram.tempConnector = null;
      updatePropertiesPanel();
      drawDiagram();
    }

    if (state.diagram.tool === 'text' && e.target === diagramCanvas) {
      const pt = getSVGPoint(diagramCanvas, e);
      const text = window.prompt('Enter text:');
      if (text) {
        const fill = $('#diagram-fill')?.value || '#7dd3fc';
        const stroke = $('#diagram-stroke')?.value || '#3b82f6';
        const sw = $('#diagram-stroke-width')?.value || 2;
        const fontSize = $('#diagram-font-size')?.value || 14;
        
        const id = uid();
        const shape = {
          id,
          type: 'rectangle',
          x: pt.x - 60,
          y: pt.y - 20,
          w: 120,
          h: 40,
          fill: 'transparent',
          stroke,
          strokeWidth: +sw,
          text,
          fontSize: +fontSize,
          textColor: '#e6ecff',
          rotation: 0,
          locked: false
        };
        state.diagram.shapes.push(shape);
        state.diagram.selected = shape.id;
        updatePropertiesPanel();
        drawDiagram();
      }
    }
  });

  function getSVGPoint(svg, evt) {
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  //======Splash Screen=====
  function initSplashScreen() {
    const splashScreen = $('#splash-screen');
    if (!splashScreen) return;
    
    splashScreen.style.display = 'flex';
    
    const hideSplash = () => {
      setTimeout(() => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
          splashScreen.style.display = 'none';
        }, 800);
      }, 6500); // Show for 6.5 seconds - optimal timing
    };
    
    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
    }
    
    splashScreen.addEventListener('click', () => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        splashScreen.style.display = 'none';
      }, 300);
    });
  }

  initSplashScreen();
  
  function enhanceSplashExperience() {
    const logo = $('.splash-logo');
    const title = $('.splash-title');
    
    if (logo) {
      logo.addEventListener('click', () => {
        logo.style.animation = 'none';
        logo.offsetHeight;
        logo.style.animation = 'logoFloat 0.6s ease-out';
      });
    }
    
    if (title) {
      const originalText = title.textContent;
      title.textContent = '';
      let i = 0;
      
      const typeWriter = () => {
        if (i < originalText.length) {
          title.textContent += originalText.charAt(i);
          i++;
          setTimeout(typeWriter, 100);
        }
      };
      
      setTimeout(typeWriter, 1000);
    }
    
    const particlesContainer = $('.splash-particles');
    if (particlesContainer) {
      setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particle.style.animationDelay = '0s';
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 8000);
      }, 800);
    }
  }
  
  setTimeout(enhanceSplashExperience, 500);

  window.testDiagramBuilder = () => {
    console.log('Testing diagram builder...');
    console.log('Canvas:', diagramCanvas);
    console.log('State:', state.diagram);
    console.log('Current tool:', state.diagram.tool);
    console.log('Shapes:', state.diagram.shapes.length);
    
    if (state.diagram.shapes.length === 0) {
      const testShape = {
        id: uid(),
        type: 'rectangle',
        x: 100,
        y: 100,
        w: 120,
        h: 80,
        fill: '#7dd3fc',
        stroke: '#3b82f6',
        strokeWidth: 2,
        text: 'Test Shape',
        fontSize: 14,
        textColor: '#e6ecff',
        rotation: 0,
        locked: false
      };
      state.diagram.shapes.push(testShape);
      state.diagram.selected = testShape.id;
      drawDiagram();
      updatePropertiesPanel();
      console.log('Added test shape:', testShape);
    }
  };

  $('#diagram-export-svg')?.addEventListener('click', () => {
    if (!diagramCanvas) return;
    const clone = diagramCanvas.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const xml = new XMLSerializer().serializeToString(clone);
    downloadBlob(new Blob([xml], { type: 'image/svg+xml' }), 'diagram.svg');
  });

  $('#diagram-export-png')?.addEventListener('click', () => {
    if (!diagramCanvas) return;
    const clone = diagramCanvas.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const xml = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement('canvas');
    canvas.width = diagramCanvas.clientWidth * 2;
    canvas.height = diagramCanvas.clientHeight * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => downloadBlob(blob, 'diagram.png'));
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
  });

  $('#diagram-clear')?.addEventListener('click', () => {
    if (window.confirm('Clear all shapes and connectors?')) {
      state.diagram.shapes = [];
      state.diagram.connectors = [];
      state.diagram.selected = null;
      drawDiagram();
    }
  });

  function updatePropertiesPanel() {
    const shapeProps = $('#shape-props');
    const defaultProps = $('#default-props');
    
    if (state.diagram.selected) {
      const shape = state.diagram.shapes.find(s => s.id === state.diagram.selected);
      if (shape) {
        shapeProps.style.display = 'block';
        defaultProps.style.display = 'none';
        
        const fillInput = $('#shape-fill');
        const strokeInput = $('#shape-stroke');
        const strokeWidthInput = $('#shape-stroke-width');
        const fontSizeInput = $('#shape-font-size');
        const textColorInput = $('#shape-text-color');
        const rotationInput = $('#shape-rotation');
        const widthInput = $('#shape-width');
        const heightInput = $('#shape-height');
        
        if (fillInput) fillInput.value = shape.fill;
        if (strokeInput) strokeInput.value = shape.stroke;
        if (strokeWidthInput) {
          strokeWidthInput.value = shape.strokeWidth;
          const valueSpan = $('#stroke-width-value');
          if (valueSpan) valueSpan.textContent = shape.strokeWidth;
        }
        if (fontSizeInput) {
          fontSizeInput.value = shape.fontSize || 14;
          const valueSpan = $('#font-size-value');
          if (valueSpan) valueSpan.textContent = shape.fontSize || 14;
        }
        if (textColorInput) textColorInput.value = shape.textColor || '#e6ecff';
        if (rotationInput) {
          rotationInput.value = shape.rotation || 0;
          const valueSpan = $('#rotation-value');
          if (valueSpan) valueSpan.textContent = (shape.rotation || 0) + 'Â°';
        }
        if (widthInput) widthInput.value = shape.w;
        if (heightInput) heightInput.value = shape.h;
      }
    } else {
      shapeProps.style.display = 'none';
      defaultProps.style.display = 'block';
    }
  }

  ['shape-fill', 'shape-stroke', 'shape-text-color'].forEach(id => {
    const input = $(`#${id}`);
    if (input) {
      input.addEventListener('input', (e) => {
        const shape = state.diagram.shapes.find(s => s.id === state.diagram.selected);
        if (shape) {
          if (id === 'shape-fill') shape.fill = e.target.value;
          else if (id === 'shape-stroke') shape.stroke = e.target.value;
          else if (id === 'shape-text-color') shape.textColor = e.target.value;
          drawDiagram();
        }
      });
    }
  });

  ['shape-stroke-width', 'shape-font-size', 'shape-rotation'].forEach(id => {
    const input = $(`#${id}`);
    if (input) {
      input.addEventListener('input', (e) => {
        const shape = state.diagram.shapes.find(s => s.id === state.diagram.selected);
        if (shape) {
          const value = parseInt(e.target.value);
          if (id === 'shape-stroke-width') {
            shape.strokeWidth = value;
            const valueSpan = $('#stroke-width-value');
            if (valueSpan) valueSpan.textContent = value;
          } else if (id === 'shape-font-size') {
            shape.fontSize = value;
            const valueSpan = $('#font-size-value');
            if (valueSpan) valueSpan.textContent = value;
          } else if (id === 'shape-rotation') {
            shape.rotation = value;
            const valueSpan = $('#rotation-value');
            if (valueSpan) valueSpan.textContent = value + 'Â°';
          }
          drawDiagram();
        }
      });
    }
  });

  ['shape-width', 'shape-height'].forEach(id => {
    const input = $(`#${id}`);
    if (input) {
      input.addEventListener('input', (e) => {
        const shape = state.diagram.shapes.find(s => s.id === state.diagram.selected);
        if (shape) {
          const value = Math.max(20, parseInt(e.target.value) || 20);
          if (id === 'shape-width') shape.w = value;
          else if (id === 'shape-height') shape.h = value;
          drawDiagram();
        }
      });
    }
  });

  const strokeWidthDefault = $('#diagram-stroke-width');
  if (strokeWidthDefault) {
    strokeWidthDefault.addEventListener('input', (e) => {
      const valueSpan = $('#default-stroke-width-value');
      if (valueSpan) valueSpan.textContent = e.target.value;
    });
  }

  const fontSizeDefault = $('#diagram-font-size');
  if (fontSizeDefault) {
    fontSizeDefault.addEventListener('input', (e) => {
      const valueSpan = $('#default-font-size-value');
      if (valueSpan) valueSpan.textContent = e.target.value;
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' && state.diagram.selected) {
      state.diagram.shapes = state.diagram.shapes.filter((s) => s.id !== state.diagram.selected);
      state.diagram.connectors = state.diagram.connectors.filter(
        (c) => c.from !== state.diagram.selected && c.to !== state.diagram.selected
      );
      state.diagram.selected = null;
      updatePropertiesPanel();
      drawDiagram();
    } else if (e.key === 'Escape') {
      state.diagram.selected = null;
      state.diagram.tempConnector = null;
      updatePropertiesPanel();
      drawDiagram();
    }
  });

  // ====== QUIZ & ASSESSMENT ======

  function initQuiz() {
    const container = $('#quiz-container');
    if (!container) return;

    const topic = getActiveQuizTopic();
    const questions = topic && Array.isArray(topic.questions) ? topic.questions : [];
    container.innerHTML = '';

    if (!topic) {
      container.innerHTML =
        '<p class="muted">Belum ada topik kuis. Asisten dapat menambahkan topik melalui panel pengelola.</p>';
      updateQuizStats();
      return;
    }

    if (!questions.length) {
      container.innerHTML = '<p class="muted">Topik ini belum memiliki soal. Tambahkan lewat panel asisten.</p>';
      updateQuizStats();
      return;
    }

    questions.forEach((q, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-question';
      qDiv.dataset.id = q.id;

      let optionsHTML = '';
      if (q.type === 'multiple') {
        const opts = Array.isArray(q.options) ? q.options : [];
        optionsHTML = opts
          .map(
            (opt, i) => `
        <div class="quiz-option" data-option="${i}">
          <input type="radio" name="${q.id}" id="${q.id}_${i}" value="${i}">
          <label for="${q.id}_${i}">${opt}</label>
        </div>
      `
          )
          .join('');
      } else {
        optionsHTML = `<input type="text" class="quiz-input" data-qid="${q.id}" placeholder="Masukkan jawaban Anda...">`;
      }

      qDiv.innerHTML = `
      <div class="quiz-q-header">
        <div class="quiz-q-number">${idx + 1}</div>
        <div class="quiz-q-text">${escapeHtml(q.question || '')}</div>
        <div class="quiz-q-type">${q.type === 'multiple' ? 'Pilgan' : 'Isian'}</div>
      </div>
      <div class="quiz-options">
        ${optionsHTML}
      </div>
      <div class="quiz-correct-answer"></div>
    `;

      container.appendChild(qDiv);
    });

    // Add event listeners
    $$('.quiz-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const radio = opt.querySelector('input[type="radio"]');
        if (radio && !state.quiz.submitted) {
          radio.checked = true;
          state.quiz.answers[radio.name] = parseInt(radio.value, 10);
          updateQuizStats();
        }
      });
    });

    $$('.quiz-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        if (!state.quiz.submitted) {
          state.quiz.answers[e.target.dataset.qid] = e.target.value.trim();
          updateQuizStats();
        }
      });
    });

    updateQuizStats();
  }

  function updateQuizStats() {
    const questions = getActiveQuizQuestions();
    const total = questions.length;
    const answered = questions.filter((q) => {
      const value = state.quiz.answers[q.id];
      return value !== undefined && value !== '';
    }).length;

    const totalEl = $('#quiz-total');
    const answeredEl = $('#quiz-answered');
    if (totalEl) totalEl.textContent = total;
    if (answeredEl) answeredEl.textContent = answered;
  }

  $('#quiz-submit')?.addEventListener('click', () => {
    if (state.quiz.submitted) return;

    const questions = getActiveQuizQuestions();
    if (!questions.length) {
      toast('Belum ada soal pada topik ini.', 'warning');
      return;
    }

    let correct = 0;

    questions.forEach((q) => {
      const userAnswer = state.quiz.answers[q.id];
      const qDiv = $(`.quiz-question[data-id="${q.id}"]`);
      const answerDiv = qDiv?.querySelector('.quiz-correct-answer');

      if (q.type === 'multiple') {
        const isCorrect = userAnswer === q.correct;
        if (isCorrect) correct++;

        // Mark options
        qDiv?.querySelectorAll('.quiz-option').forEach((opt, i) => {
          if (i === q.correct) {
            opt.classList.add('correct');
          } else if (i === userAnswer && !isCorrect) {
            opt.classList.add('incorrect');
          }
          opt.style.pointerEvents = 'none';
        });

        if (answerDiv) {
          answerDiv.textContent = `\u2713 Jawaban benar: ${q.options[q.correct]}`;
        }
      } else {
        // Text answer
        const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];
        const isCorrect = correctAnswers.some((ans) => userAnswer?.toLowerCase() === ans.toLowerCase());

        if (isCorrect) {
          correct++;
          qDiv?.classList.add('answered');
        } else {
          qDiv?.classList.add('wrong');
        }

        if (answerDiv) {
          const correctText = Array.isArray(q.correct) ? q.correct.join(' / ') : q.correct;
          answerDiv.textContent = `\u2713 Jawaban benar: ${correctText}`;
        }

        const input = qDiv?.querySelector('.quiz-input');
        if (input) input.readOnly = true;
      }

      qDiv?.classList.add('show-answer');
    });

    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    state.quiz.score = score;
    state.quiz.submitted = true;

    // Show result
    const scoreEl = $('#quiz-score');
    if (scoreEl) scoreEl.textContent = score;
    const feedback = $('#quiz-feedback');
    if (feedback) {
      if (score >= 90) feedback.textContent = '\uD83D\uDD25 Excellent! Pemahaman Anda sangat baik!';
      else if (score >= 75) feedback.textContent = '\u26A1 Great! Anda memahami materi dengan baik!';
      else if (score >= 60) feedback.textContent = '\uD83D\uDCD8 Good! Tingkatkan lagi pemahaman Anda!';
      else feedback.textContent = '\uD83D\uDCDA Keep learning! Pelajari kembali materinya!';
    }

    const resultEl = $('#quiz-result');
    if (resultEl) resultEl.style.display = 'block';
    const submitArea = $('#quiz-submit-area');
    if (submitArea) submitArea.style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('#quiz-retry')?.addEventListener('click', () => {
    resetQuizProgress();

    const resultEl = $('#quiz-result');
    if (resultEl) resultEl.style.display = 'none';
    const submitArea = $('#quiz-submit-area');
    if (submitArea) submitArea.style.display = 'block';

    initQuiz();
  });

  // ====== ERD: Data Modeling ======
  const erdBoard = $('#erd-board');
  const erdWires = $('#erd-wires');
  let erdRedrawRaf = null;

  function scheduleErdRedraw() {
    if (erdRedrawRaf) return;
    erdRedrawRaf = requestAnimationFrame(() => {
      erdRedrawRaf = null;
      redrawERD();
    });
  }

  erdBoard?.addEventListener('click', (e) => {
    if (e.target !== erdBoard) return;
    if (state.erd.mode === 'relate' && state.erd.pending) {
      state.erd.pending = null;
      drawERD();
    }
  });

  (function initErdDefs() {
    if (!erdWires) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'erd-arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L10,3 L0,6 z');
    path.setAttribute('fill', '#fcd34d');
    marker.appendChild(path);
    defs.appendChild(marker);
    erdWires.appendChild(defs);
  })();

  $('#erd-entity-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = ($('#erd-entity-name').value || '').trim();
    if (!name) return;
    const entity = {
      id: uid(),
      name,
      attrs: [],
      x: 60 + state.erd.entities.length * 36,
      y: 80 + state.erd.entities.length * 24
    };
    state.erd.entities.push(entity);
    state.erd.selected = entity.id;
    $('#erd-entity-name').value = '';
    drawERD();
  });

  $('#erd-mode')?.addEventListener('change', (e) => {
    state.erd.mode = e.target.value;
    state.erd.pending = null;
    drawERD();
  });

  $('#erd-attr-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ent = getSelectedEntity();
    if (!ent) return toast('Pilih entitas terlebih dahulu');
    const name = ($('#erd-attr-name').value || '').trim();
    const type = ($('#erd-attr-type').value || '').trim();
    const pk = !!$('#erd-attr-pk').checked;
    if (!name) return;
    ent.attrs.push({ id: uid(), name, type: type || 'varchar', pk });
    $('#erd-attr-name').value = '';
    $('#erd-attr-pk').checked = false;
    drawERD();
  });

  $('#erd-export-json')?.addEventListener('click', () => {
    downloadBlob(new Blob([JSON.stringify(state.erd, null, 2)], { type: 'application/json' }), 'erd-model.json');
  });

  $('#erd-reset')?.addEventListener('click', () => {
    if (!window.confirm('Hapus semua entitas dan relasi ERD?')) return;
    state.erd.entities = [];
    state.erd.relations = [];
    state.erd.selected = null;
    state.erd.pending = null;
    drawERD();
  });

  function drawERD() {
    if (!erdBoard) return;
    const list = $('#erd-entity-list');
    if (list) {
      list.innerHTML = '';
      state.erd.entities.forEach((ent) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'entity-pill';
        if (ent.id === state.erd.selected) btn.classList.add('active');
        btn.textContent = ent.name || 'Entitas';
        btn.addEventListener('click', () => {
          state.erd.selected = ent.id;
          drawERD();
        });
        list.appendChild(btn);
      });
      if (!state.erd.entities.some((e) => e.id === state.erd.selected)) {
        state.erd.selected = state.erd.entities[0]?.id || null;
      }
    }

    const modeSel = $('#erd-mode');
    if (modeSel && modeSel.value !== state.erd.mode) {
      modeSel.value = state.erd.mode;
    }

    renderSelectedEntityPanel();
    renderRelationPanel();

    erdBoard.innerHTML = '';
    state.erd.entities.forEach((ent) => {
      const card = document.createElement('article');
      card.className = 'entity-card';
      if (ent.id === state.erd.selected) card.classList.add('selected');
      if (state.erd.pending === ent.id) card.classList.add('pending');
      card.dataset.id = ent.id;
      card.style.left = (ent.x || 60) + 'px';
      card.style.top = (ent.y || 60) + 'px';
      card.innerHTML = `
      <header contenteditable="true">${ent.name || 'Entitas'}</header>
      <ul class="attr-list">${
        ent.attrs
          .map(
            (attr) => `
        <li>
          <span>${attr.pk ? 'ðŸ”‘ ' : ''}${attr.name}<small>${attr.type}</small></span>
        </li>
      `
          )
          .join('') || '<li class="muted">Tambahkan atribut di panel kiri</li>'
      }
      </ul>
    `;
      const header = card.querySelector('header');
      header.addEventListener('input', () => {
        ent.name = header.textContent.trim() || 'Entitas';
        drawERD();
      });
      bindEntityCard(card, ent);
      erdBoard.appendChild(card);
    });

    redrawERD();
  }

  function bindEntityCard(card, ent) {
    let dragging = false;
    let dx = 0;
    let dy = 0;
    let boardBounds = null;
    card.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'HEADER' && state.erd.mode !== 'move') return;
      if (state.erd.mode === 'move') {
        dragging = true;
        card.setPointerCapture(e.pointerId);
        dx = e.clientX - card.offsetLeft;
        dy = e.clientY - card.offsetTop;
        boardBounds = erdBoard.getBoundingClientRect();
        card.classList.add('dragging');
      }
    });
    card.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (!boardBounds) boardBounds = erdBoard.getBoundingClientRect();
      const nx = Math.max(0, Math.min(boardBounds.width - card.offsetWidth, e.clientX - dx));
      const ny = Math.max(0, Math.min(boardBounds.height - card.offsetHeight, e.clientY - dy));
      card.style.left = nx + 'px';
      card.style.top = ny + 'px';
      ent.x = nx;
      ent.y = ny;
      scheduleErdRedraw();
    });
    const stopDragging = () => {
      if (!dragging) return;
      dragging = false;
      boardBounds = null;
      card.classList.remove('dragging');
      scheduleErdRedraw();
    };
    card.addEventListener('pointerup', stopDragging);
    card.addEventListener('pointercancel', stopDragging);
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.erd.mode === 'relate') {
        handleRelationClick(ent.id);
        return;
      }
      state.erd.selected = ent.id;
      drawERD();
    });
  }

  function handleRelationClick(entityId) {
    if (!state.erd.pending) {
      state.erd.pending = entityId;
      drawERD();
      return;
    }
    if (state.erd.pending === entityId) {
      state.erd.pending = null;
      drawERD();
      return;
    }
    const a = state.erd.entities.find((e) => e.id === state.erd.pending);
    const b = state.erd.entities.find((e) => e.id === entityId);
    if (!a || !b) {
      state.erd.pending = null;
      drawERD();
      return;
    }
    const name = window.prompt(`Nama relasi ${a.name} â†” ${b.name}?`, `${a.name}_${b.name}`);
    if (name === null) {
      state.erd.pending = null;
      drawERD();
      return;
    }
    const cardA = window.prompt(`Kardinalitas dari ${a.name} ke ${b.name}? (cth: 1, 0..1, 1..N)`, `1..N`) || '1..N';
    const cardB = window.prompt(`Kardinalitas dari ${b.name} ke ${a.name}?`, `1..N`) || '1..N';
    state.erd.relations.push({
      id: uid(),
      a: a.id,
      b: b.id,
      name: name.trim() || `${a.name}_${b.name}`,
      cardA,
      cardB
    });
    state.erd.pending = null;
    drawERD();
  }

  function renderSelectedEntityPanel() {
    const nameEl = $('#erd-selected-name');
    const attrsEl = $('#erd-attr-list');
    const ent = getSelectedEntity();
    if (nameEl) nameEl.textContent = ent ? ent.name : 'Belum ada entitas terpilih';
    if (!attrsEl) return;
    attrsEl.innerHTML = '';
    if (!ent) {
      const msg = document.createElement('p');
      msg.className = 'muted';
      msg.textContent = 'Tambahkan entitas dan pilih salah satunya untuk mengelola atribut.';
      attrsEl.appendChild(msg);
      return;
    }
    if (!ent.attrs.length) {
      const msg = document.createElement('p');
      msg.className = 'muted';
      msg.textContent = 'Belum ada atribut. Gunakan form untuk menambah.';
      attrsEl.appendChild(msg);
    }
    ent.attrs.forEach((attr) => {
      const row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML = `
      <span>${attr.pk ? 'ðŸ”‘ ' : ''}${attr.name} <small>${attr.type}</small></span>
      <div class="actions">
        <button type='button' data-action="toggle">${attr.pk ? 'PK' : 'Set PK'}</button>
        <button type='button' data-action="delete" class="danger">Hapus</button>
      </div>
    `;
      row.querySelector('[data-action="toggle"]').onclick = () => {
        attr.pk = !attr.pk;
        if (attr.pk) {
          ent.attrs = ent.attrs.map((a) => (a.id === attr.id ? attr : { ...a, pk: false }));
        }
        drawERD();
      };
      row.querySelector('[data-action="delete"]').onclick = () => {
        ent.attrs = ent.attrs.filter((a) => a.id !== attr.id);
        drawERD();
      };
      attrsEl.appendChild(row);
    });
  }

  function renderRelationPanel() {
    const info = $('#erd-info');
    const relList = $('#erd-rel-list');
    if (info) {
      if (!state.erd.entities.length) {
        info.textContent = 'Tambahkan entitas lalu atur atribut, posisi, dan relasi untuk menyusun ERD.';
      } else {
        info.textContent =
          state.erd.mode === 'relate'
            ? 'Mode Relasi: klik entitas pertama lalu kedua untuk membuat relationship.'
            : 'Mode Move: seret entitas untuk mengatur tata letak. Ubah mode untuk membuat relasi.';
      }
    }
    if (!relList) return;
    relList.innerHTML = '';
    if (!state.erd.relations.length) {
      const hint = document.createElement('p');
      hint.className = 'muted';
      hint.textContent = 'Belum ada relasi.';
      relList.appendChild(hint);
      return;
    }
    state.erd.relations.forEach((rel) => {
      const a = state.erd.entities.find((e) => e.id === rel.a);
      const b = state.erd.entities.find((e) => e.id === rel.b);
      if (!a || !b) return;
      const row = document.createElement('div');
      row.className = 'rel-row';
      row.innerHTML = `
      <span><b>${escapeHtml(a.name)}</b> (${escapeHtml(String(rel.cardA ?? ''))}) &mdash; <em>${escapeHtml(
        rel.name || ''
      )}</em> &mdash; (${escapeHtml(String(rel.cardB ?? ''))}) <b>${escapeHtml(b.name)}</b></span>
      <button class="danger">A&times;</button>
    `;
      row.querySelector('button').onclick = () => {
        state.erd.relations = state.erd.relations.filter((r) => r.id !== rel.id);
        drawERD();
      };
      relList.appendChild(row);
    });
  }

  function redrawERD() {
    if (!erdWires || !erdBoard) return;
    const defs = erdWires.querySelector('defs')?.outerHTML || '';
    erdWires.innerHTML = defs;
    state.erd.relations.forEach((rel) => {
      const aEl = erdBoard.querySelector(`.entity-card[data-id="${rel.a}"]`);
      const bEl = erdBoard.querySelector(`.entity-card[data-id="${rel.b}"]`);
      if (!aEl || !bEl) return;
      const aRect = aEl.getBoundingClientRect();
      const bRect = bEl.getBoundingClientRect();
      const boardRect = erdBoard.getBoundingClientRect();
      const ax = aRect.left - boardRect.left + aRect.width / 2;
      const ay = aRect.top - boardRect.top + aRect.height / 2;
      const bx = bRect.left - boardRect.left + bRect.width / 2;
      const by = bRect.top - boardRect.top + bRect.height / 2;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ax);
      line.setAttribute('y1', ay);
      line.setAttribute('x2', bx);
      line.setAttribute('y2', by);
      line.classList.add('erd-connection');
      line.setAttribute('marker-end', 'url(#erd-arrow)');
      erdWires.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.classList.add('erd-label');
      label.setAttribute('x', (ax + bx) / 2);
      label.setAttribute('y', (ay + by) / 2 - 6);
      label.textContent = `${rel.name} [${rel.cardA}:${rel.cardB}]`;
      erdWires.appendChild(label);
    });
  }

  function getSelectedEntity() {
    if (!state.erd.selected) return null;
    return state.erd.entities.find((e) => e.id === state.erd.selected) || null;
  }

  function buildSerializableState() {
    return {
      ...state,
    assignments: {
      ...state.assignments,
      pendingAttachment: null,
      removeAttachment: false,
      attachmentLoading: false,
      editingId: null,
      editingDraft: null
    }
  };
}

  // ====== Save/Load/Export/Reset ======
  $('#saveAll')?.addEventListener('click', () => {
    localStorage.setItem('si_suite', JSON.stringify(buildSerializableState()));
    toast('Data berhasil disimpan', 'success');
  });
  $('#loadAll')?.addEventListener('click', () => {
    const raw = localStorage.getItem('si_suite');
    if (!raw) return toast('No saved data');
    const data = JSON.parse(raw);
    Object.assign(state.req, data.req || {});
    Object.assign(state.ea, data.ea || {});
    Object.assign(state.ixd, data.ixd || {});
    Object.assign(state.diagram, data.diagram || { shapes: [], connectors: [], selected: null });
    Object.assign(state.erd, data.erd || {});
    if (data.assignments?.submissions) {
      state.assignments.submissions = data.assignments.submissions
        .filter((item) => item && item.assignmentId && item.studentId)
        .map((item) => {
          const files = Array.isArray(item.files)
            ? item.files.map((file) => ({
                id: file.id || uid(),
                originalName: file.originalName || file.name || 'dokumen',
                contentType: file.contentType || file.type || 'application/octet-stream',
                sizeBytes: Number(file.sizeBytes ?? file.size ?? 0),
                storagePath: file.storagePath || '',
                uploadedBy: file.uploadedBy || null,
                createdAt: file.createdAt || new Date().toISOString()
              }))
            : [];

          if (!files.length && item.attachment && item.attachment.dataUrl) {
            files.push({
              id: uid(),
              originalName: item.attachment.name || 'dokumen',
              contentType: item.attachment.type || 'application/octet-stream',
              sizeBytes: Number(item.attachment.size) || 0,
              storagePath: item.attachment.dataUrl,
              uploadedBy: item.studentId,
              createdAt: item.submittedAt || new Date().toISOString()
            });
          }

          return {
            id: item.id || uid(),
            assignmentId: item.assignmentId,
            studentId: item.studentId,
            studentName: item.studentName || item.studentId,
            link: item.link || '',
            notes: item.notes || '',
            submittedAt: item.submittedAt || new Date().toISOString(),
            updatedAt: item.updatedAt || item.submittedAt || new Date().toISOString(),
            files,
            grade: item.grade
              ? {
                  score: Number(item.grade.score) || 0,
                  feedback: item.grade.feedback || '',
                  gradedAt: item.grade.gradedAt || new Date().toISOString(),
                  graderId: item.grade.graderId || '',
                  graderName: item.grade.graderName || ''
                }
              : null
          };
        });
    } else {
      state.assignments.submissions = [];
    }
    state.assignments.selectedSubmissionId = null;
    state.assignments.pendingAttachment = null;
    state.assignments.removeAttachment = false;
    state.assignments.attachmentLoading = false;
    state.assignments.editingId = null;
    state.assignments.editingDraft = null;
    if (assignmentFileInput) assignmentFileInput.value = '';

    resetQuizProgress();
    state.quiz.editingQuestionId = null;
    state.quiz.editingTopicId = null;

    if (data.auth?.currentUser) {
      const restored =
        USERS.find((user) => user.id === data.auth.currentUser.id) ||
        USERS.find((user) => user.username === data.auth.currentUser.username);
      state.auth.currentUser = sanitizeUser(restored || null);
    } else {
      state.auth.currentUser = null;
    }

    drawReq();
    drawEA();
    redrawIXD();
    drawDiagram();
    drawERD();
    updateQuizTopicUI();
    updateQuizManagerVisibility();
    initQuiz();
    ensureAssignmentOptions();
    updateAuthUI();
    updateAttachmentStatus();
    refreshQuizTopics({ includeQuestions: true, silent: true });
    toast('Data berhasil dimuat', 'success');
  });
  $('#exportAll')?.addEventListener('click', () => {
    downloadBlob(
      new Blob([JSON.stringify(buildSerializableState(), null, 2)], { type: 'application/json' }),
      'si-virtual-lab-suite.json'
    );
  });
  $('#resetAll')?.addEventListener('click', () => {
    if (!window.confirm('Reset semua modul?')) return;
    state.req.items = [];
    state.ea.stages = [];
    state.ea.caps = [];
    state.ea.map = {};
    state.ea.stakeholders = [];
    state.ixd.nodes = [];
    state.ixd.wires = [];
    state.diagram.shapes = [];
    state.diagram.connectors = [];
    state.diagram.selected = null;
    state.erd.entities = [];
    state.erd.relations = [];
    state.erd.selected = null;
    state.erd.pending = null;
    state.quiz.topics = cloneQuizTopics(DEFAULT_QUIZ_TOPICS);
    state.quiz.activeTopicId = DEFAULT_QUIZ_TOPICS[0]?.id || null;
    state.quiz.answers = {};
    state.quiz.submitted = false;
    state.quiz.score = 0;
    state.quiz.editingQuestionId = null;
    state.quiz.editingTopicId = null;
    state.assignments.submissions = [];
    state.assignments.selectedSubmissionId = null;
    state.assignments.pendingAttachment = null;
    state.assignments.removeAttachment = false;
    state.assignments.attachmentLoading = false;
    state.assignments.editingId = null;
    state.assignments.editingDraft = null;
    if (assignmentFileInput) assignmentFileInput.value = '';
    state.auth.currentUser = null;
    drawReq();
    drawEA();
    redrawIXD();
    drawDiagram();
    drawERD();
    updateQuizTopicUI();
    updateQuizManagerVisibility();
    initQuiz();
    ensureAssignmentOptions();
    updateAuthUI();
    updateAttachmentStatus();
    refreshQuizTopics({ includeQuestions: true, silent: true });
    showLanding();
  });

  // ====== Utils ======
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function toast(msg, type = 'info') {
    if (window?.console) console.log(msg);
    
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    toastEl.style.cssText = `
      background: linear-gradient(135deg, var(--bg-card), var(--bg-card-hover));
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 500;
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(20px);
      transform: translateX(100%);
      transition: all var(--transition-base);
      pointer-events: auto;
      max-width: 300px;
      position: relative;
      overflow: hidden;
    `;
    
    if (type === 'success') {
      toastEl.style.borderColor = 'var(--success)';
      toastEl.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))';
    } else if (type === 'error') {
      toastEl.style.borderColor = 'var(--danger)';
      toastEl.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
    } else if (type === 'warning') {
      toastEl.style.borderColor = 'var(--warning)';
      toastEl.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))';
    }
    
    toastEl.textContent = msg;
    toastContainer.appendChild(toastEl);
    
    requestAnimationFrame(() => {
      toastEl.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      toastEl.style.transform = 'translateX(100%)';
      toastEl.style.opacity = '0';
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, 3000);
    
    toastEl.addEventListener('click', () => {
      toastEl.style.transform = 'translateX(100%)';
      toastEl.style.opacity = '0';
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    });
  }

  drawReq();
  drawEA();
  redrawIXD();
  drawDiagram();
  updatePropertiesPanel();
  drawERD();
  initQuiz();

  cachedState = state;
  return state;
}











