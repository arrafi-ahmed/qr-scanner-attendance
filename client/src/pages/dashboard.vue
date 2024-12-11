<script setup>
import BarChart from "@/components/BarChart.vue";
import LineChart from "@/components/LineChart.vue";
import NoItems from "@/components/NoItems.vue";
import { useStore } from "vuex";
import { formatDateTime, getDateOnly, getHourOnly } from "@/others/util.js";

definePage({
  name: "dashboard",
  meta: {
    layout: "default",
  },
});
const store = useStore();

const dashboard = computed(() => store.state.scan.coreDashboardData);
const employeeListWScanCount = computed(() =>
  store.state.scan.employeeListWScanCount.map((item) => ({
    ...item,
    createdAt: formatDateTime(item.createdAt),
  })),
);
const busListWScanCount = computed(() =>
  store.state.scan.busListWScanCount.map((item) => ({
    ...item,
    createdAt: formatDateTime(item.createdAt),
  })),
);
const headers = ref([
  {
    title: "Name",
    align: "start",
    key: "name",
  },
  {
    title: "Date of creation",
    align: "start",
    key: "createdAt",
  },
  {
    title: "Scans",
    align: "start",
    key: "scanCount",
  },
]);
const employeeHeaders = ref([
  {
    title: "Employee ID",
    align: "start",
    key: "employeeId",
  },
  ...headers.value,
]);
const busHeaders = ref([
  {
    title: "Bus ID",
    align: "start",
    key: "busId",
  },
  ...headers.value,
]);

const employeeBarChartData = computed(() => {
  let hours = [];
  let totalEmployeesHourly = [];
  let activeEmployeesHourly = [];

  dashboard.value.employeeAnalytics?.forEach((item) => {
    hours.push(getHourOnly(item.hour));
    totalEmployeesHourly.push(item.totalEmployeesHourly);
    activeEmployeesHourly.push(item.activeEmployeesHourly);
  });

  return {
    labels: hours,
    datasets: [
      {
        label: "Total employees",
        data: totalEmployeesHourly, // Example data
        backgroundColor: "#0088ff", // Color for Dataset 1
        borderColor: "#0088ff",
        borderWidth: 1,
      },
      {
        label: "Employees working today",
        data: activeEmployeesHourly, /// Example data
        backgroundColor: "#fb8c00", // Color for Dataset 1
        borderColor: "#fb8c00",
        borderWidth: 1,
      },
    ],
  };
});

const busBarChartData = computed(() => {
  let hours = [];
  let totalBusesHourly = [];
  let activeBusesHourly = [];

  dashboard.value.busAnalytics?.forEach((item) => {
    hours.push(getHourOnly(item.hour));
    totalBusesHourly.push(item.totalBusesHourly);
    activeBusesHourly.push(item.activeBusesHourly);
  });

  return {
    labels: hours,
    datasets: [
      {
        label: "Total buses",
        data: totalBusesHourly, // Example data
        backgroundColor: "#d445ff", // Color for Dataset 1
        borderColor: "#d445ff",
        borderWidth: 1,
      },
      {
        label: "Active buses today",
        data: activeBusesHourly, /// Example data
        backgroundColor: "#711ff5", // Color for Dataset 1
        borderColor: "#711ff5",
        borderWidth: 1,
      },
    ],
  };
});

const scanLineChartData = computed(() => {
  let scanDates = [];
  let scanCounts = [];

  dashboard.value.employeeScanDaily?.forEach((item) => {
    const date = new Date(item.scanDate); // Convert to Date object
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;

    scanDates.push(formattedDate);
    scanCounts.push(item.scanCount);
  });

  return {
    labels: scanDates,
    datasets: [
      {
        data: scanCounts,
        borderColor: "#711ff5", // Border color
        backgroundColor: "rgba(113, 31, 245, 0.2)", // Area fill color
        fill: true, // Enable area fill
        tension: 0.4, // Smooth curve
      },
    ],
  };
});

const barChartOptions = reactive({
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true, // Use dots instead of rectangles
        pointStyle: "circle", // Shape of the dot (default is 'circle')
      },
    },
  },
});

const lineChartOptions = reactive({
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      ticks: {
        stepSize: 50,
      },
      beginAtZero: true,
    },
  },
});

// employee list with scan table
const pageEmployee = ref(1);
const employeeDateRange = ref(null);
const employeeItemsPerPage = ref(5);
const totalCountEmployee = ref(0);
const totalPagesEmployee = computed(() =>
  Math.ceil(totalCountEmployee.value / employeeItemsPerPage.value),
);
const employeeLoading = ref(false);
const employeeSearch = ref("");

//{ page, itemsPerPage, sortBy }
// safe destructure
const loadEmployeeItems = ({ fetchTotalCount = false } = {}) => {
  const rangeLength = employeeDateRange.value?.length;
  const endDate =
    rangeLength != null
      ? getDateOnly(employeeDateRange.value[rangeLength - 1])
      : null;
  const interval = rangeLength != null ? rangeLength - 1 : null;
  const offset = (pageEmployee.value - 1) * employeeItemsPerPage.value;
  const limit = employeeItemsPerPage.value;

  return store.dispatch("scan/setEmployeeListWScanCount", {
    endDate,
    interval,
    offset,
    limit,
    fetchTotalCount,
  });
};

const updateEmployeeDateRange = async () => {
  const rangeLength = employeeDateRange.value?.length;
  if (!rangeLength) return;

  const { totalCount } = await loadEmployeeItems({ fetchTotalCount: true });
  totalCountEmployee.value = totalCount;
};

const goNextEmployee = async () => {
  await loadEmployeeItems();
};
const goPrevEmployee = async () => {
  await loadEmployeeItems();
};
const goFirstEmployee = async () => {
  await loadEmployeeItems();
};
const goLastEmployee = async () => {
  await loadEmployeeItems();
};

// bus list with scan table
const pageBus = ref(1);
const busDateRange = ref(null);
const busItemsPerPage = ref(5);
const totalCountBus = ref(0);
const totalPagesBus = computed(() =>
  Math.ceil(totalCountBus.value / busItemsPerPage.value),
);
const busLoading = ref(false);
const busSearch = ref("");

const loadBusItems = ({ fetchTotalCount = false } = {}) => {
  const rangeLength = busDateRange.value?.length;

  const endDate =
    rangeLength != null
      ? getDateOnly(busDateRange.value[rangeLength - 1])
      : null;
  const interval = rangeLength != null ? rangeLength - 1 : null;
  const offset = (pageBus.value - 1) * busItemsPerPage.value;
  const limit = busItemsPerPage.value;

  return store.dispatch("scan/setBusListWScanCount", {
    endDate,
    interval,
    offset,
    limit,
    fetchTotalCount,
  });
};

const updateBusDateRange = async () => {
  const rangeLength = busDateRange.value?.length;
  if (!rangeLength) return;

  const { totalCount } = await loadBusItems({ fetchTotalCount: true });
  totalCountBus.value = totalCount;
};

const goNextBus = async () => {
  await loadBusItems();
};
const goPrevBus = async () => {
  await loadBusItems();
};
const goFirstBus = async () => {
  await loadBusItems();
};
const goLastBus = async () => {
  await loadBusItems();
};

const fetchData = async () => {
  return Promise.all([
    store.dispatch("scan/setCoreDashboardData"),
    loadBusItems(),
    loadEmployeeItems(),
  ]);
};
onMounted(async () => {
  await fetchData();
  totalCountEmployee.value = dashboard.value?.employeeStat?.totalEmployees;
  totalCountBus.value = dashboard.value?.busStat?.totalBuses;
});
</script>

<template>
  <v-container class="bg-grey-lighten-4">
    <v-row>
      <v-col>
        <h2>Dashboard</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet class="pa-3" rounded>
          <div class="text-body-2 text-disabled">TOTAL EMPLOYEES</div>
          <div class="d-flex justify-space-between align-center">
            <h2>{{ dashboard.employeeStat?.totalEmployees || 0 }}</h2>
            <v-icon class="bg-deep-purple-lighten-1 pa-6 rounded-circle">
              mdi-account-multiple
            </v-icon>
          </div>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet class="pa-3" rounded>
          <div class="text-body-2 text-disabled">TOTAL BUSES</div>
          <div class="d-flex justify-space-between align-center">
            <h2>{{ dashboard.busStat?.totalBuses || 0 }}</h2>
            <v-icon class="bg-orange-darken-1 pa-6 rounded-circle">
              mdi-bus
            </v-icon>
          </div>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet class="pa-3" rounded>
          <div class="text-body-2 text-disabled">EMPLOYEES ACTIVE TODAY</div>
          <div class="d-flex justify-space-between align-center">
            <h2>{{ dashboard.employeeStat?.employeesActiveToday || 0 }}</h2>
            <v-icon class="bg-green-accent-3 pa-6 rounded-circle">
              mdi-account-hard-hat
            </v-icon>
          </div>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet class="pa-3" rounded>
          <div class="text-body-2 text-disabled">BUSES ACTIVE TODAY</div>
          <div class="d-flex justify-space-between align-center">
            <h2>{{ dashboard.busStat?.busesActiveToday || 0 }}</h2>
            <v-icon class="bg-green-accent-2 pa-6 rounded-circle">
              mdi-bus-side
            </v-icon>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet color="white" class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2 mb-md-4">
            <div class="text-body-1 font-weight-bold">Employees</div>
            <div style="width: 250px">
              <v-date-input
                v-model="employeeDateRange"
                label="Select Date"
                multiple="range"
                prepend-icon=""
                append-inner-icon="mdi-calendar"
                variant="outlined"
                density="compact"
                hide-details="auto"
                @update:model-value="updateEmployeeDateRange"
              ></v-date-input>
            </div>
          </div>
          <!--          {{ totalCountEmployee }}-{{ totalPagesEmployee }}-->
          <v-data-table-server
            v-if="employeeListWScanCount.length"
            :headers="employeeHeaders"
            :items="employeeListWScanCount"
            :items-length="totalCountEmployee"
            :loading="employeeLoading"
            :search="employeeSearch"
            item-value="name"
            :items-per-page="employeeItemsPerPage"
            disable-sort
            hide-default-footer
            hide-no-data
          >
            <template #bottom>
              <div class="text-center">
                <v-pagination
                  v-model="pageEmployee"
                  :total-visible="1"
                  :length="totalPagesEmployee"
                  density="compact"
                  class="mt-2"
                  show-first-last-page
                  @first="goFirstEmployee"
                  @last="goLastEmployee"
                  @next="goNextEmployee"
                  @prev="goPrevEmployee"
                ></v-pagination>
              </div>
            </template>
          </v-data-table-server>
          <no-items v-else variant="icon" />
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet color="white" class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2 mb-md-4">
            <div class="text-body-1 font-weight-bold">Buses</div>
            <div style="width: 250px">
              <v-date-input
                v-model="busDateRange"
                label="Select Date"
                multiple="range"
                prepend-icon=""
                append-inner-icon="mdi-calendar"
                variant="outlined"
                density="compact"
                hide-details="auto"
                @update:model-value="updateBusDateRange"
              ></v-date-input>
            </div>
          </div>
          <!--          {{ totalCountBus }}-{{ totalPagesBus }}-->
          <v-data-table-server
            v-if="busListWScanCount.length"
            :headers="busHeaders"
            :items="busListWScanCount"
            :items-length="totalCountBus"
            :loading="busLoading"
            :search="busSearch"
            item-value="name"
            :items-per-page="busItemsPerPage"
            disable-sort
            hide-default-footer
            hide-no-data
          >
            <template #bottom>
              <div class="text-center">
                <v-pagination
                  v-model="pageBus"
                  :total-visible="1"
                  :length="totalPagesBus"
                  density="compact"
                  class="mt-2"
                  show-first-last-page
                  @first="goFirstBus"
                  @last="goLastBus"
                  @next="goNextBus"
                  @prev="goPrevBus"
                ></v-pagination>
                <!--                  :length="15"-->
                <!--                  show-first-last-page-->
                <!--                  @first="goFirstBus"-->
                <!--                  @last="goLastBus"-->
              </div>
            </template>
          </v-data-table-server>
          <no-items v-else variant="icon" />
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet color="white" class="pa-3">
          <div class="text-body-1 font-weight-bold mb-2 mb-md-4">
            Analytics of Employees
          </div>
          <bar-chart
            v-if="employeeBarChartData.datasets?.[0]?.data?.length"
            :chart-options="barChartOptions"
            :chart-data="employeeBarChartData"
          />
          <no-items v-else variant="icon" />
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet color="white" class="pa-3">
          <div class="text-body-1 font-weight-bold mb-2 mb-md-4">
            Analytics of Buses
          </div>
          <bar-chart
            v-if="busBarChartData.datasets?.[0]?.data?.length"
            :chart-options="barChartOptions"
            :chart-data="busBarChartData"
          />
          <no-items v-else variant="icon" />
        </v-sheet>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-sheet color="white" class="pa-3">
          <div class="text-body-1 font-weight-bold mb-2 mb-md-4">
            Employees Scanned Daily
          </div>
          <line-chart
            v-if="scanLineChartData.datasets?.[0]?.data?.length"
            :chart-data="scanLineChartData"
            :chart-options="lineChartOptions"
            :height="80"
          />
          <no-items v-else variant="icon" />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
