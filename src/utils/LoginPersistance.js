export const storageUtils = {
  setUser: (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
  },

  getUser: () => {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem("user");
  },

  setAuthToken: (token) => {
    localStorage.setItem("authToken", token);
  },

  getAuthToken: () => {
    return localStorage.getItem("authToken");
  },

  clearAuth: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  },

  clearStorage: () => {
    console.log("Clearing storage");
    localStorage.clear();
  },
};
