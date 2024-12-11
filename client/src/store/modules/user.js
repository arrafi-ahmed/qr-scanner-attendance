import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  token: localStorage.getItem("token") || null,
  currentUser: JSON.parse(localStorage.getItem("currentUser")) || {},
  users: [],
};

export const mutations = {
  setToken(state, payload) {
    localStorage.setItem("token", payload);
    state.token = payload;
  },
  setCurrentUser(state, payload) {
    state.currentUser = { ...state.currentUser, ...payload };
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    currentUser = { ...currentUser, ...payload };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  },
  removeToken(state) {
    localStorage.removeItem("token");
    state.token = null;
  },
  removeCurrentUser(state) {
    localStorage.removeItem("currentUser");
    state.currentUser = {};
  },
  setUsers(state, payload) {
    state.users = payload;
  },
  addUser(state, payload) {
    state.users.unshift(payload);
  },
  editUser(state, payload) {
    const foundIndex = state.users.findIndex((item) => item.id == payload.id);
    if (foundIndex !== -1) {
      state.users[foundIndex] = payload;
    }
  },
  removeUser(state, payload) {
    const foundIndex = state.users.findIndex((item) => item.id == payload.id);
    if (foundIndex !== -1) {
      state.users.splice(foundIndex, 1);
    }
  },
};

export const actions = {
  signin({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/user/signin", request)
        .then((response) => {
          commit("setToken", response.headers?.authorization);
          commit("setCurrentUser", response.data?.payload?.currentUser);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  signout({ commit }) {
    return new Promise((resolve, reject) => {
      commit("removeToken");
      commit("removeCurrentUser");
      resolve();
    });
  },
  save({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/user/save", request)
        .then((response) => {
          const actionType = request.id ? "edit" : "add";
          const actionName = `${actionType}User`;
          commit(actionName, response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setUsers({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/user/getUsers")
        .then((response) => {
          commit("setUsers", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  removeUser({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/user/removeUser", { params: { userId: request.id } })
        .then((response) => {
          commit("removeUser", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  requestResetPass({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/user/requestResetPass", request)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject();
        });
    });
  },
  submitResetPass({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/user/submitResetPass", request)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject();
        });
    });
  },
};

export const getters = {
  getToken(state) {
    return state.token;
  },
  getCurrentUser(state) {
    return state.currentUser;
  },
  isSudo(state) {
    return Number(state.currentUser.role) === 10;
  },
  isManager(state) {
    return Number(state.currentUser.role) === 20;
  },
  signedin(state) {
    return !!state.token;
  },
  calcHome(state, getters) {
    // add all the app roles here, and their default home page
    return getters.isSudo
      ? { name: "dashboard" }
      : getters.isManager
        ? { name: "scanner" }
        : { name: "signout" };
  },
};
