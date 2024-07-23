const { query } = require('../database/postgresql.js');

async function createOrUpdateQuizAttempt(quizId, studentId, completedTasks) {
  const text = `
    INSERT INTO "QuizAttempt" ("quizId", "studentId", "completedTasks")
    VALUES ($1, $2, $3)
    ON CONFLICT ("quizId", "studentId")
    DO UPDATE SET
      "completedTasks" = EXCLUDED."completedTasks"
    RETURNING *;
  `;

  const values = [quizId, studentId, completedTasks];

  try {
    const res = await query(text, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting or updating quiz attempt:', err);
    throw err;
  }
}


async function updateQuizAttemptScore(quizId, studentId, score) {
    const text = `
      UPDATE "QuizAttempt"
      SET "score" = $1
      WHERE "quizId" = $2 AND "studentId" = $3
      RETURNING *;
    `;
  
    const values = [score, quizId, studentId];
  
    try {
      const res = await query(text, values);
      return res.rows[0];
    } catch (err) {
      console.error('Error updating quiz attempt score:', err);
      throw err;
    }
  }

module.exports = {
  createOrUpdateQuizAttempt, updateQuizAttemptScore
};
