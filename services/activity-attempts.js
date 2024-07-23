const { query } = require('../database/postgresql.js');

/**
 * Creates a new ActivityAttempt record.
 * @param {Object} data - The data to create the ActivityAttempt.
 * @param {number} data.activityId - The ID of the associated activity.
 * @param {number} data.studentId - The ID of the associated student.
 * @param {string} data.userAnswer - The user's answer.
 * @param {boolean} data.isCleared - Whether the activity attempt is cleared.
 * @returns {Promise<Object>} The created ActivityAttempt record.
 */
async function createActivityAttempt(data) {
  const text = `
    INSERT INTO "ActivityAttempt" ("activityId", "studentId", "userAnswer", "isCleared")
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [data.activityId, data.studentId, data.userAnswer, data.isCleared];

  try {
    const res = await query(text, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting activity attempt:', err);
    throw err;
  }
}

module.exports = {
  createActivityAttempt,
};