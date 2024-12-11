import { createStore } from "vuex";
import * as user from "./modules/user";
import * as employee from "./modules/employee";
import * as bus from "./modules/bus";
import * as scan from "./modules/scan";

const store = createStore({
  modules: {
    user,
    employee,
    bus,
    scan,
  },
  state: () => ({
    progress: null,
    routeInfo: {},
  }),
  mutations: {
    setProgress(state, payload) {
      state.progress = payload;
    },
    setRouteInfo(state, payload) {
      state.routeInfo = payload;
    },
  },
  actions: {},
  getters: {},
});

export default store;
