const { query } = require('../database/postgresql.js');

async function updateStudent(id, newCoins, newXp) {
  // Fetch the student's current coins and XP
  const fetchQuery = 'SELECT "totalCoins", "xp", "level" FROM "Student" WHERE id = $1';
  const fetchValues = [id];

  try {
    const fetchRes = await query(fetchQuery, fetchValues);
    
    if (fetchRes.rows.length === 0) {
      throw new Error(`Student with id ${id} not found.`);
    }

    const { totalCoins: currentCoins, xp: currentXp, level:currentLevel } = fetchRes.rows[0];

    // Calculate the new values
    const updatedCoins = currentCoins + newCoins;
    const updatedXp = currentXp + newXp;
    const updatedLevel = updatedXp >= currentLevel*currentLevel*1000 ? currentLevel+1: currentLevel;

    // Update the student's record
    const updateQuery = 'UPDATE "Student" SET "totalCoins" = $1, "xp" = $2, "level" = $3 WHERE id = $4 RETURNING *';
    const updateValues = [updatedCoins, updatedXp, updatedLevel, id];

    const updateRes = await query(updateQuery, updateValues);
    // console.log('Student record updated:', updateRes.rows[0]);
  } catch (err) {
    console.error('Error updating student record:', err);
  }
}

module.exports = { updateStudent };
