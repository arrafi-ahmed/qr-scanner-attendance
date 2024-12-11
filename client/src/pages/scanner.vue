<script setup>
import { QrcodeStream } from "vue-qrcode-reader";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { formatDateTime } from "@/others/util.js";
import NoItems from "@/components/NoItems.vue";

definePage({
  name: "scanner",
  meta: {
    layout: "default",
  },
});

const store = useStore();
const route = useRoute();
const router = useRouter();

const isPaused = ref(false);
const showCamera = ref(false);
const showScannedEmployees = ref(false);

const handleScan = async ([decodedString]) => {
  isPaused.value = true; // pause the camera stream
  if (route.query.entity === "bus") {
    await store
      .dispatch("bus/verifyQrcode", {
        qrCodeData: decodedString.rawValue,
      })
      .then((result) => {
        store.commit("bus/setBus", {
          ...result,
          createdAt: new Date(),
        });
        return router.push({ name: "scanned-list" });
      })
      .catch((err) => {})
      .finally(() => {
        isPaused.value = false;
      });
  } else {
    await store
      .dispatch("employee/verifyQrcode", {
        qrCodeData: decodedString.rawValue,
      })
      .then((result) => {
        store.commit("employee/saveTempEmployee", {
          ...result,
          createdAt: new Date(),
        });
        showScannedEmployees.value = !showScannedEmployees.value;
        return router.push({ query: {} });
      })
      .catch((err) => {})
      .finally(() => {
        isPaused.value = false;
      });
  }
};
const onError = (err) => {
  console.error(99, err);
};

const handleRemoveScannedEmployee = ({ id }) => {
  store.commit("employee/removeTempEmployee", { id });
};

const handleSubmitScans = () => {
  store.commit("employee/concatTempEmployees");
  router.push({ name: "scanned-list" });
};

const goScanBusSection = () => {
  router.push({ query: { entity: "bus" } });
};

const goScanEmployeeSection = () => {
  router.push({ query: { entity: "employee" } });
};

const goScanEmployeeFromList = () => {
  router.push({ query: { entity: "employee" } });
};

const tempEmployees = computed(() => store.state.employee.tempEmployees);

watch(
  () => route.query.entity,
  (newVal) => {
    if (newVal === "employee" || newVal === "bus") {
      showScannedEmployees.value = false;
      showCamera.value = true;
    } else {
      showCamera.value = false;
    }
  },
);

onMounted(() => {
  if (route.query.entity === "employee" || route.query.entity === "bus") {
    showScannedEmployees.value = false;
    showCamera.value = true;
  }
});
</script>

<template>
  <v-container class="fill-height">
    <v-row
      v-if="!showScannedEmployees"
      justify="center"
      align="center"
      class="fill-height"
      no-gutters
    >
      <v-col
        cols="12"
        lg="6"
        md="8"
        sm="10"
      >
        <v-card
          :max-width="450"
          :elevation="2"
        >
          <v-card-title class="text-center">
            QR Code Scanner
          </v-card-title>
          <v-card-text class="d-flex justify-center">
            <qrcode-stream
              v-if="showCamera"
              :paused="isPaused"
              @detect="handleScan"
              @error="onError"
            />
            <!--            <v-img-->
            <!--              v-else-->
            <!--              class="mx-auto"-->
            <!--              :max-width="250"-->
            <!--              :src="getClientPublicImgUrl('sample-qr-code.png')"-->
            <!--            />-->
            <v-icon
              v-else
              :size="200"
            >
              mdi-qrcode-scan
            </v-icon>
          </v-card-text>
          <v-card-actions>
            <span
              v-if="!showCamera"
              class="mx-auto"
            >
              <v-btn
                color="primary"
                variant="flat"
                @click="goScanEmployeeSection"
              >
                Scan Employees
              </v-btn>
              <v-btn
                class="ml-2"
                color="primary"
                variant="flat"
                @click="goScanBusSection"
              >
                Scan Bus
              </v-btn>
            </span>
            <span
              v-else
              class="mx-auto"
            >
              <v-btn
                color="primary"
                variant="flat"
                @click="router.push({ query: {} })"
              >
                Close
              </v-btn>
            </span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      v-else
      align="start"
      justify="center"
      class="fill-height"
      no-gutters
    >
      <v-col
        cols="12"
        lg="6"
        md="8"
        sm="10"
      >
        <h2 class="mb-2 mb-md-4">
          Scanned QR Codes
        </h2>
        <v-card>
          <v-card-title>Scanned Employees</v-card-title>
          <v-card-text>
            <v-table
              v-if="tempEmployees.length"
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
                  <th class="text-left" />
                  <th class="text-left" />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in tempEmployees"
                  :key="item.id"
                >
                  <td>{{ item.employeeId }}</td>
                  <td>{{ formatDateTime(item.createdAt) }}</td>
                  <td><span class="text-success">Accepted</span></td>
                  <td>
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      density="comfortable"
                      color="error"
                      @click="handleRemoveScannedEmployee({ id: item.id })"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
            <no-items v-else />
          </v-card-text>
          <v-card-actions>
            <span class="mx-auto">
              <v-btn
                color="primary"
                variant="flat"
                @click="goScanEmployeeFromList"
              >
                Scan Again
              </v-btn>
              <v-btn
                class="ml-2"
                color="primary"
                variant="flat"
                @click="handleSubmitScans"
              >
                Submit Scans
              </v-btn>
            </span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
