const bcrypt = require("bcrypt");

async function comparePassword(plainPassword, storedHash) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    console.log(isMatch);
    return isMatch;
  } catch (error) {
    console.log(error);
    return error;
  }
}
module.exports = { comparePassword };
