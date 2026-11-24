// User authentication controller
function authenticateUser(db, username, password) {
  // Potential vulnerability: raw query concatenation
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return db.query(query);
}

module.exports = { authenticateUser };
