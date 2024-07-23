const { query } = require('../database/postgresql.js');

async function updateQuizStatus(quizId, newStatus) {
  const updateQuery = 'UPDATE "Quiz" SET status = $1 WHERE id = $2 RETURNING *';
  const values = [newStatus, quizId];

  try {
    const res = await query(updateQuery, values);
    // console.log('Quiz status updated:', res.rows[0]);
  } catch (err) {
    console.error('Error updating quiz status:', err);
  }
}

module.exports = { updateQuizStatus };