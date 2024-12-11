import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  buses: [],
  bus: {},
  tempBuses: [],
  searchBuses: [],
};

export const mutations = {
  setBuses(state, payload) {
    state.buses = payload;
  },
  setBus(state, payload) {
    state.bus = payload;
  },
  saveBus(state, payload) {
    const foundIndex = state.buses.findIndex((item) => item.id == payload.id);
    if (foundIndex !== -1) {
      state.buses[foundIndex] = payload;
    } else {
      state.buses.push(payload);
    }
  },
  saveTempBus(state, payload) {
    const foundIndex = state.tempBuses.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.tempBuses[foundIndex] = payload;
    } else {
      state.tempBuses.push(payload);
    }
  },
  removeTempBus(state, payload) {
    const foundIndex = state.tempBuses.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.tempBuses.splice(foundIndex, 1);
    }
  },
  removeBus(state, payload) {
    const foundIndex = state.buses.findIndex((item) => item.id == payload.id);
    if (foundIndex !== -1) {
      state.buses.splice(foundIndex, 1);
    }
  },
  setSearchBuses(state, payload) {
    state.searchBuses = payload;
  },
  concatTempBuses(state) {
    state.buses = state.buses.concat(state.tempBuses);
  },
  resetBus(state) {
    state.bus = {};
  },
};

export const actions = {
  setBuses({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/bus/getAllBuses", { params: { clubId: request } })
        .then((response) => {
          commit("setBuses", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setActiveBuses({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/bus/getAllActiveBuses", {
          params: {
            clubId: request.clubId,
            currentDate: request.currentDate,
          },
        })
        .then((response) => {
          commit("setBuses", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setBus({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/bus/getBus", {
          params: { busId: request.busId },
        })
        .then((response) => {
          commit("setBus", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  save({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/bus/save", request)
        .then((response) => {
          commit("saveBus", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  removeBus({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/bus/removeBus", {
          params: { busId: request.busId },
        })
        .then((response) => {
          commit("removeBus", request);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  searchBus({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/bus/search", {
          params: { query: request.query },
        })
        .then((response) => {
          commit("setSearchBuses", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  verifyQrcode({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .post("/api/bus/verifyQrcode", { qrCodeData: request.qrCodeData })
        .then((response) => {
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};

export const getters = {
  getBusById: (state) => (id) => {
    return state.buses.find((item) => item.id == id);
  },
};
