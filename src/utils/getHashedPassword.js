const bcrypt = require("bcrypt");

const saltRounds = 10;
async function getHashedPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    return error;
  }
}

module.exports = { getHashedPassword };
