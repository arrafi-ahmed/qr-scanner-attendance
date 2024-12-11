import $axios from "@/plugins/axios";

export const namespaced = true;

export const state = {
  employees: [],
  employee: {},
  tempEmployees: [],
  searchEmployees: [],
};

export const mutations = {
  setEmployees(state, payload) {
    state.employees = payload;
  },
  setEmployee(state, payload) {
    state.employee = payload;
  },
  saveEmployee(state, payload) {
    const foundIndex = state.employees.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.employees[foundIndex] = payload;
    } else {
      state.employees.push(payload);
    }
  },
  saveTempEmployee(state, payload) {
    const foundIndex = state.tempEmployees.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.tempEmployees[foundIndex] = payload;
    } else {
      state.tempEmployees.push(payload);
    }
  },
  removeTempEmployee(state, payload) {
    const foundIndex = state.tempEmployees.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.tempEmployees.splice(foundIndex, 1);
    }
  },
  removeEmployee(state, payload) {
    const foundIndex = state.employees.findIndex(
      (item) => item.id == payload.id,
    );
    if (foundIndex !== -1) {
      state.employees.splice(foundIndex, 1);
    }
  },
  setSearchEmployees(state, payload) {
    state.searchEmployees = payload;
  },
  concatTempEmployees(state) {
    state.employees = state.employees.concat(state.tempEmployees);
  },
  resetEmployees(state) {
    state.employees = [];
  },
  resetTempEmployees(state) {
    state.tempEmployees = [];
  },
};

export const actions = {
  setEmployees({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/employee/getAllEmployees", { params: { clubId: request } })
        .then((response) => {
          commit("setEmployees", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setActiveEmployees({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/employee/getAllActiveEmployees", {
          params: {
            clubId: request.clubId,
            currentDate: request.currentDate,
          },
        })
        .then((response) => {
          commit("setEmployees", response.data?.payload);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  setEmployee({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/employee/getEmployee", {
          params: { employeeId: request.employeeId },
        })
        .then((response) => {
          commit("setEmployee", response.data?.payload);
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
        .post("/api/employee/save", request)
        .then((response) => {
          commit("saveEmployee", response.data?.payload);
          resolve(response.data?.payload);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  removeEmployee({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/employee/removeEmployee", {
          params: { employeeId: request.employeeId },
        })
        .then((response) => {
          commit("removeEmployee", request);
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  searchEmployee({ commit }, request) {
    return new Promise((resolve, reject) => {
      $axios
        .get("/api/employee/search", {
          params: { query: request.query },
        })
        .then((response) => {
          commit("setSearchEmployees", response.data?.payload);
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
        .post("/api/employee/verifyQrcode", { qrCodeData: request.qrCodeData })
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
  getEmployeeById: (state) => (id) => {
    return state.employees.find((item) => item.id == id);
  },
};
