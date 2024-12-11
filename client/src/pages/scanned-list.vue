<script setup>
import { formatDateTime } from "@/others/util.js";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import qrcodeVue3 from "qrcode-vue3";
import NoItems from "@/components/NoItems.vue";
import { useTheme } from "vuetify";

definePage({
  name: "scanned-list",
  meta: {
    layout: "default",
  },
});
const theme = useTheme();
const router = useRouter();
const store = useStore();

const employees = computed(() => store.state.employee.employees);
const bus = computed(() => store.state.bus.bus);

const selectedSearchEmployee = ref(null);
const searchEmployeeQuery = ref(null);
const searchEmployeeLoading = ref(false);
const searchEmployeeList = computed(() => store.state.employee.searchEmployees);

const handleSearchEmployee = () => {
  if (!searchEmployeeQuery.value) return;

  store.dispatch("employee/searchEmployee", {
    query: searchEmployeeQuery.value,
  });
};
const handleAddEmployeeToScanList = () => {
  store.commit("employee/saveEmployee", {
    ...selectedSearchEmployee.value,
    createdAt: new Date(),
  });
};

const selectedSearchBus = ref(null);
const searchBusQuery = ref(null);
const searchBusLoading = ref(false);
const searchBusList = computed(() => store.state.bus.searchBuses);

const handleSearchBus = () => {
  if (!searchBusQuery.value) return;

  store.dispatch("bus/searchBus", {
    query: searchBusQuery.value,
  });
};
const handleAddBusToScanList = () => {
  store.commit("bus/setBus", {
    ...selectedSearchBus.value,
    createdAt: new Date(),
  });
};

const handleGoScan = () => {
  router.push({ name: "scanner", query: { entity: "bus" } });
};

const newEmployee = reactive({
  employeeId: null,
  name: null,
});

const newBus = reactive({
  busId: null,
  name: null,
});

const employeeDialog = ref(false);
const addEmployeeForm = ref(null);
const isEmployeeFormValid = ref(true);

const handleSubmitEmployeeAdd = async () => {
  await addEmployeeForm.value.validate();
  if (!isEmployeeFormValid.value) return;

  store.dispatch("employee/save", newEmployee).then((res) => {
    employeeDialog.value = !employeeDialog.value;
  });
};
const busDialog = ref(false);
const addBusForm = ref(null);
const isBusFormValid = ref(true);

const handleSubmitBusAdd = async () => {
  await addBusForm.value.validate();
  if (!isBusFormValid.value) return;

  store.dispatch("bus/save", newBus).then((res) => {
    store.commit("bus/setBus", { ...res, createdAt: new Date() });
    busDialog.value = !busDialog.value;
  });
};

const handleSubmitForm = () => {
  if (!employees.value.length || !bus.value.id) return;

  store
    .dispatch("scan/save", { employees: employees.value, bus: bus.value })
    .then((res) => {
      router.push({ name: "scanner" });
    });
};
</script>

<template>
  <v-container>
    <v-row
      align="start"
      class="fill-height"
      justify="center"
      no-gutters
    >
      <v-col
        cols="12"
        lg="6"
        md="8"
        sm="10"
      >
        <h2 class="mb-2 mb-md-4">
          Scanned List
        </h2>

        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center">
              <span> Scanned Employees</span>
              <v-btn
                class="ml-1"
                density="comfortable"
                icon="mdi-plus"
                rounded
                tile
                variant="tonal"
                @click="employeeDialog = !employeeDialog"
              />
            </div>
          </v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <v-autocomplete
                v-model="selectedSearchEmployee"
                v-model:search="searchEmployeeQuery"
                :items="searchEmployeeList"
                :loading="searchEmployeeLoading"
                density="compact"
                hide-details="auto"
                item-id="id"
                item-title="employeeId"
                label="Search Employees"
                no-filter
                return-object
                variant="outlined"
                @update:search="handleSearchEmployee"
                @update:model-value="handleAddEmployeeToScanList"
              />
            </div>

            <v-table
              v-if="employees.length"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th class="text-left">
                    Employee ID
                  </th>
                  <th class="text-left">
                    Time
                  </th>
                  <th class="text-left">
                    QR Code
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in employees"
                  :key="item.id"
                >
                  <td>{{ item.employeeId }}</td>
                  <td>{{ formatDateTime(item.createdAt) }}</td>
                  <td>
                    <qrcodeVue3
                      v-if="item.uuid"
                      :dots-options="{
                        type: 'dot',
                        color: theme.global.current.value.colors.primary,
                      }"
                      :download="true"
                      :download-options="{
                        name: item.employeeId,
                        extension: 'png',
                      }"
                      :margin="4"
                      :value="
                        JSON.stringify({
                          id: item.id,
                          type: 'employee',
                          employeeId: item.employeeId,
                          uuid: item.uuid,
                        })
                      "
                      download-button="v-btn v-theme--light v-btn--density-compact v-btn--size-small pa-0 v-btn--variant-text"
                      imgclass="d-none"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
            <no-items v-else />
          </v-card-text>
        </v-card>

        <v-card class="mt-2 mt-md-4">
          <v-card-title class="d-flex justify-space-between">
            <span>Scanned Bus</span>
            <span>
              <v-btn
                density="comfortable"
                icon="mdi-qrcode-scan"
                rounded
                tile
                variant="tonal"
                @click="handleGoScan"
              />
              <v-btn
                class="ml-1"
                density="comfortable"
                icon="mdi-plus"
                rounded
                tile
                variant="tonal"
                @click="busDialog = !busDialog"
              />
            </span>
          </v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <v-autocomplete
                v-model="selectedSearchBus"
                v-model:search="searchBusQuery"
                :items="searchBusList"
                :loading="searchBusLoading"
                density="compact"
                hide-details="auto"
                item-id="id"
                item-title="busId"
                label="Search Bus"
                no-filter
                return-object
                variant="outlined"
                @update:search="handleSearchBus"
                @update:model-value="handleAddBusToScanList"
              />
            </div>
            <v-table
              v-if="bus.id"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th class="text-left">
                    Bus ID
                  </th>
                  <th class="text-left">
                    Time
                  </th>
                  <th class="text-left">
                    QR Code
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ bus.busId }}</td>
                  <td>{{ formatDateTime(bus.createdAt) }}</td>
                  <td>
                    <qrcodeVue3
                      v-if="bus.uuid"
                      :dots-options="{
                        type: 'dot',
                        color: theme.global.current.value.colors.primary,
                      }"
                      :download="true"
                      :download-options="{
                        name: bus.busId,
                        extension: 'png',
                      }"
                      :margin="4"
                      :value="
                        JSON.stringify({
                          id: bus.id,
                          type: 'bus',
                          busId: bus.busId,
                          uuid: bus.uuid,
                        })
                      "
                      download-button="v-btn v-theme--light v-btn--density-compact v-btn--size-small pa-0 v-btn--variant-text"
                      imgclass="d-none"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
            <no-items v-else />
          </v-card-text>
        </v-card>

        <v-btn
          class="d-block mx-auto mt-2 mt-md-4"
          color="primary"
          size="large"
          @click="handleSubmitForm"
        >
          Submit
        </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog
    v-model="employeeDialog"
    :width="450"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <span>Add new employee</span>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="employeeDialog = !employeeDialog"
        />
      </v-card-title>
      <v-card-text>
        <v-form
          ref="addEmployeeForm"
          v-model="isEmployeeFormValid"
          fast-fail
          @submit.prevent="handleSubmitEmployeeAdd"
        >
          <v-text-field
            v-model="newEmployee.employeeId"
            :rules="[(v) => !!v || 'ID is required!']"
            class="mt-2"
            clearable
            density="comfortable"
            hide-details="auto"
            label="ID"
            variant="outlined"
          />
          <v-text-field
            v-model="newEmployee.name"
            :rules="[(v) => !!v || 'Name is required!']"
            class="mt-2"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Name"
            variant="outlined"
          />

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              type="submit"
              variant="flat"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="busDialog"
    :width="450"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <span>Add new bus</span>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="busDialog = !busDialog"
        />
      </v-card-title>
      <v-card-text>
        <v-form
          ref="addBusForm"
          v-model="isBusFormValid"
          fast-fail
          @submit.prevent="handleSubmitBusAdd"
        >
          <v-text-field
            v-model="newBus.busId"
            :rules="[(v) => !!v || 'ID is required!']"
            class="mt-2"
            clearable
            density="comfortable"
            hide-details="auto"
            label="ID"
            variant="outlined"
          />
          <v-text-field
            v-model="newBus.name"
            :rules="[(v) => !!v || 'Name is required!']"
            class="mt-2"
            clearable
            density="comfortable"
            hide-details="auto"
            label="Name"
            variant="outlined"
          />

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              type="submit"
              variant="flat"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
