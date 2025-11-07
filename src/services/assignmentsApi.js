import { apiFetch } from './apiClient.js';

function mapAssignment(raw) {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    focus: raw.focus || 'General',
    createdAt: raw.createdAt || raw.created_at || null,
    updatedAt: raw.updatedAt || raw.updated_at || null
  };
}

function mapGrade(raw) {
  if (!raw) return null;
  return {
    score: raw.score ?? null,
    feedback: raw.feedback ?? '',
    gradedAt: raw.gradedAt || raw.graded_at || null,
    graderId: raw.graderId || raw.grader_id || null,
    graderName: raw.graderName || raw.grader_name || ''
  };
}

function mapFile(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    storagePath: raw.storagePath || raw.storage_path,
    originalName: raw.originalName || raw.original_name,
    contentType: raw.contentType || raw.content_type || 'application/octet-stream',
    sizeBytes: raw.sizeBytes || raw.size_bytes || null,
    uploadedBy: raw.uploadedBy || raw.uploaded_by || null,
    createdAt: raw.createdAt || raw.created_at || null
  };
}

function mapSubmission(raw) {
  return {
    id: raw.id,
    assignmentId: raw.assignmentId || raw.assignment_id,
    studentId: raw.studentId || raw.student_id,
    studentName: raw.studentName || raw.student_name || '',
    link: raw.link || '',
    notes: raw.notes || '',
    submittedAt: raw.submittedAt || raw.submitted_at || null,
    updatedAt: raw.updatedAt || raw.updated_at || null,
    grade: mapGrade(raw.grade),
    files: Array.isArray(raw.files) ? raw.files.map(mapFile).filter(Boolean) : []
  };
}

export async function fetchAssignments() {
  const data = await apiFetch('/assignments');
  return Array.isArray(data.assignments) ? data.assignments.map(mapAssignment) : [];
}

export async function fetchMySubmissions() {
  const data = await apiFetch('/submissions/mine');
  return Array.isArray(data.submissions) ? data.submissions.map(mapSubmission) : [];
}

export async function fetchAssignmentSubmissions(assignmentId) {
  const data = await apiFetch(`/assignments/${assignmentId}/submissions`);
  return {
    assignment: data.assignment ? mapAssignment(data.assignment) : null,
    submissions: Array.isArray(data.submissions) ? data.submissions.map(mapSubmission) : []
  };
}

export async function submitAssignment(assignmentId, payload) {
  const data = await apiFetch(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: {
      link: payload.link || '',
      notes: payload.notes || ''
    }
  });
  return {
    message: data.message || 'Pengumpulan tersimpan.',
    submission: data.submission ? mapSubmission(data.submission) : null
  };
}

export async function requestSubmissionUpload(submissionId, { fileName, fileSize, contentType }) {
  const data = await apiFetch(`/submissions/${submissionId}/files/upload-url`, {
    method: 'POST',
    body: {
      fileName,
      fileSize,
      contentType
    }
  });
  return data;
}

export async function confirmSubmissionFile(submissionId, payload) {
  const data = await apiFetch(`/submissions/${submissionId}/files`, {
    method: 'POST',
    body: {
      fileId: payload.fileId,
      storagePath: payload.storagePath,
      fileName: payload.fileName,
      contentType: payload.contentType,
      fileSize: payload.fileSize
    }
  });
  return data.file ? mapFile(data.file) : null;
}

export async function listSubmissionFilesApi(submissionId) {
  const data = await apiFetch(`/submissions/${submissionId}/files`);
  return Array.isArray(data.files) ? data.files.map(mapFile) : [];
}

export async function getSubmissionFileDownloadUrl(submissionId, fileId) {
  const data = await apiFetch(`/submissions/${submissionId}/files/${fileId}/download`);
  return data.url;
}

export async function deleteSubmissionFile(submissionId, fileId) {
  await apiFetch(`/submissions/${submissionId}/files/${fileId}`, { method: 'DELETE' });
}

export async function gradeSubmission(submissionId, { score, feedback }) {
  const data = await apiFetch(`/submissions/${submissionId}/grade`, {
    method: 'POST',
    body: {
      score,
      feedback
    }
  });
  return data.submission ? mapSubmission(data.submission) : null;
}

export async function clearSubmissionGrade(submissionId) {
  const data = await apiFetch(`/submissions/${submissionId}/grade`, {
    method: 'DELETE'
  });
  return data.submission ? mapSubmission(data.submission) : null;
}

export async function createAssignmentApi({ title, focus, description }) {
  const data = await apiFetch('/assignments', {
    method: 'POST',
    body: {
      title,
      focus,
      description
    }
  });
  return data.assignment ? mapAssignment(data.assignment) : null;
}

export async function updateAssignmentApi(id, { title, focus, description }) {
  const data = await apiFetch(`/assignments/${id}`, {
    method: 'PUT',
    body: {
      title,
      focus,
      description
    }
  });
  return data.assignment ? mapAssignment(data.assignment) : null;
}

export async function deleteAssignmentApi(id) {
  await apiFetch(`/assignments/${id}`, { method: 'DELETE' });
  return true;
}
