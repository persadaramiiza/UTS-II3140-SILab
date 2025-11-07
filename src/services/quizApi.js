import { apiFetch } from './apiClient.js';

export async function listQuizTopicsApi({ includeQuestions = false } = {}) {
  const params = includeQuestions ? '?includeQuestions=1' : '';
  const data = await apiFetch(`/quizzes/topics${params}`);
  return Array.isArray(data.topics) ? data.topics : [];
}

export async function getQuizTopicApi(topicId, { includeQuestions = true } = {}) {
  const params = includeQuestions ? '?includeQuestions=1' : '';
  const data = await apiFetch(`/quizzes/topics/${topicId}${params}`);
  return data.topic;
}

export async function createQuizTopicApi(payload) {
  const data = await apiFetch('/quizzes/topics', {
    method: 'POST',
    body: payload
  });
  return data.topic;
}

export async function updateQuizTopicApi(topicId, payload) {
  const data = await apiFetch(`/quizzes/topics/${topicId}`, {
    method: 'PUT',
    body: payload
  });
  return data.topic;
}

export async function deleteQuizTopicApi(topicId) {
  await apiFetch(`/quizzes/topics/${topicId}`, { method: 'DELETE' });
}

export async function listQuizQuestionsApi(topicId) {
  const data = await apiFetch(`/quizzes/topics/${topicId}/questions`);
  return Array.isArray(data.questions) ? data.questions : [];
}

export async function createQuizQuestionApi(topicId, payload) {
  const data = await apiFetch(`/quizzes/topics/${topicId}/questions`, {
    method: 'POST',
    body: payload
  });
  return data.question;
}

export async function updateQuizQuestionApi(topicId, questionId, payload) {
  const data = await apiFetch(`/quizzes/topics/${topicId}/questions/${questionId}`, {
    method: 'PUT',
    body: payload
  });
  return data.question;
}

export async function deleteQuizQuestionApi(topicId, questionId) {
  await apiFetch(`/quizzes/topics/${topicId}/questions/${questionId}`, {
    method: 'DELETE'
  });
}
