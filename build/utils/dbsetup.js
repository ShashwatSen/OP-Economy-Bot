const fs = require('fs');
const path = require('path');
const db = require('croxydb');
const templatePath = path.join(__dirname, '/databaseTemplate.json');

let userTemplate;
try {
  userTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  console.log('✅ Loaded database template successfully.');
} catch (err) {
  console.error('❌ Failed to load databaseTemplate.json:', err.message);
  process.exit(1);
}

function cloneTemplate() {
  return JSON.parse(JSON.stringify(userTemplate[0]));
}

/**
 * @param {string} userId - Discord user ID
 * @param {string} username - Discord username
 */
function initializeUser(userId, username) {
  const newUser = cloneTemplate();
  newUser.discord_user_id = userId;
  newUser.username = username || `Pirate_${userId}`;

  db.set(`user_${userId}`, newUser);
  console.log(`⚓ Created new user profile for ${username || userId}`);
  return newUser;
}


function ensureUserData(userId, username) {
  let data = db.get(`user_${userId}`);

  if (!data) {
    data = initializeUser(userId, username);
  } else {
    const templateBase = cloneTemplate();
    for (const key in templateBase) {
      if (data[key] === undefined) {
        data[key] = templateBase[key];
        console.log(`🔧 Added missing field "${key}" for user ${userId}`);
      }
    }
    db.set(`user_${userId}`, data);
  }

  return data;
}

function resetUser(userId) {
  db.delete(`user_${userId}`);
  console.log(`🗑️ Deleted user_${userId} from database.`);
}

function getAllUsers() {
  return db.all()
    .filter(entry => entry.ID.startsWith('user_'))
    .map(entry => entry.data);
}

module.exports = {
  initializeUser,
  ensureUserData,
  resetUser,
  getAllUsers
};
