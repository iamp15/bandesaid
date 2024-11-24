export const storageUtils = {
  setUser: (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
  },

  getUser: () => {
    const user = sessionStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    sessionStorage.removeItem("user");
  },

  setAuthToken: (token) => {
    sessionStorage.setItem("authToken", token);
  },

  getAuthToken: () => {
    return sessionStorage.getItem("authToken");
  },

  clearAuth: () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
  },

  clearStorage: () => {
    console.log("Clearing storage");
    sessionStorage.clear();
  },
};
