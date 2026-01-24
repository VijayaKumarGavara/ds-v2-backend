exports.generateId = function (prefix) {
  return `${prefix}${Date.now()}`;
};
