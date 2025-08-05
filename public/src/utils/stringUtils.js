export const stringUtils = {
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  limparEspacos(str) {
    return str.trim().replace(/\s+/g, ' ');
  },

  padLeft(str, size, char = '0') {
    str = String(str);
    while (str.length < size) str = char + str;
    return str;
  }
};
