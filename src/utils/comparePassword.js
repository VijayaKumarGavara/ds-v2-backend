const bcrypt = require("bcrypt");

async function comparePassword(plainPassword, storedHash) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    return isMatch;
  } catch (error) {
    return error;
  }
}
module.exports = { comparePassword };
