const KEYS = {
  ACCESS_TOKEN: 'aat',
  USER: 'user',
};

export const ls: LocalStorage.Utils = {
  token: {
    get: () => localStorage.getItem(KEYS.ACCESS_TOKEN) || null,
    set: (values) => {
      localStorage.setItem(KEYS.ACCESS_TOKEN, values);
    },
    clear: () => {
      localStorage.removeItem(KEYS.ACCESS_TOKEN);
    },
  },
  user: {
    get: () => JSON.parse(localStorage.getItem(KEYS.USER) || 'null'),
    set: (value) => localStorage.setItem(KEYS.USER, JSON.stringify(value)),
    clear: () => localStorage.removeItem(KEYS.USER),
  },
  clearAll: () => {
    ls.token.clear();
    ls.user.clear();
  },
};
