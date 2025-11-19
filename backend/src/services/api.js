const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  // ... existing methods (login, register, etc.) ...

  // Quiz Generation
  async generateQuiz(fileIds, options = {}) {
    const response = await fetch(`${API_URL}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        fileIds: Array.isArray(fileIds) ? fileIds : [fileIds],
        questionCount: options.questionCount || 10,
        difficulty: options.difficulty || 'all'
      })
    });
    return response.json();
  }

  // Get specific quiz
  async getQuiz(quizId) {
    const response = await fetch(`${API_URL}/quiz/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Submit quiz attempt
  async submitQuiz(quizId, answers, timeSpent) {
    const response = await fetch(`${API_URL}/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ answers, timeSpent })
    });
    return response.json();
  }

  // Get all user quizzes
  async getUserQuizzes() {
    const response = await fetch(`${API_URL}/quiz/user/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // ... rest of existing methods ...
}

export default new ApiService();
