declare namespace LocalStorage {
  type User = {
    name: string;
  };

  type Utils = {
    token: {
      get: () => string | null;
      set: (value: string) => void;
      clear: () => void;
    };
    user: {
      get: () => User;
      set: (value: User) => void;
      clear: () => void;
    };
    clearAll: () => void;
  };
}
