const { query } = require('../database/postgresql.js');

async function createLeaderboards(quizId, dataArray) {
  const text = `
    INSERT INTO "Leaderboards" ("quizId", "studentId", "position", "earnedCoins")
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  try {
    const results = [];

    for (let i=0; i<dataArray.length; i++) {
      const values = [quizId, dataArray[i].studentId, i+1, dataArray[i].coins];
      const res = await query(text, values);
      results.push(res.rows[0]);
    }

    return results;
  } catch (err) {
    console.error('Error inserting leaderboard values:', err);
    throw err;
  }
}

module.exports = {
  createLeaderboards,
};
