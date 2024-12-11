import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  coreDashboardData: {},
  employeeListWScanCount: [],
  busListWScanCount: [],
};

export const mutations = {
  setCoreDashboardData(state, payload) {
    state.coreDashboardData = payload;
  },
  setEmployeeListWScanCount(state, payload) {
    state.employeeListWScanCount = payload.list;
  },
  setBusListWScanCount(state, payload) {
    state.busListWScanCount = payload.list;
  },
};

export const actions = {
  save({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/scan/save", request)
        .then((response) => {
          commit("employee/resetEmployees", null, {
            root: true,
          });
          commit("employee/resetTempEmployees", null, {
            root: true,
          });
          commit("bus/resetBus", null, {
            root: true,
          });
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setCoreDashboardData({ commit }) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/scan/getCoreDashboardData")
        .then((response) => {
          commit("setCoreDashboardData", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setEmployeeListWScanCount({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/scan/getEmployeeListWScanCount", {
          params: {
            endDate: request?.endDate,
            interval: request?.interval,
            offset: request?.offset,
            limit: request?.limit,
            fetchTotalCount: request?.fetchTotalCount,
          },
        })
        .then((response) => {
          commit("setEmployeeListWScanCount", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setBusListWScanCount({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/scan/getBusListWScanCount", {
          params: {
            endDate: request?.endDate,
            interval: request?.interval,
            offset: request?.offset,
            fetchTotalCount: request?.fetchTotalCount,
            limit: request?.limit,
          },
        })
        .then((response) => {
          commit("setBusListWScanCount", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {};
