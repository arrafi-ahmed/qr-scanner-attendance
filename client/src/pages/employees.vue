<script setup>
import NoItems from "@/components/NoItems.vue";
import { formatDateTime, getDateOnly } from "@/others/util.js";
import { useStore } from "vuex";

definePage({
  name: "employees",
  meta: {
    layout: "default",
  },
});
const store = useStore();

const employeeListWScanCount = computed(() =>
  store.state.scan.employeeListWScanCount.map((item) => ({
    ...item,
    createdAt: formatDateTime(item.createdAt),
  })),
);

const pageEmployee = ref(1);
const employeeDateRange = ref(null);
const employeeItemsPerPage = ref(20);
const totalCountEmployee = ref(0);
const totalPagesEmployee = computed(() =>
  Math.ceil(totalCountEmployee.value / employeeItemsPerPage.value),
);
const employeeLoading = ref(false);
const employeeSearch = ref("");

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

const fetchData = async () => {
  const { totalCount } = await loadEmployeeItems({ fetchTotalCount: true });
  totalCountEmployee.value = totalCount;
};
onMounted(async () => {
  fetchData();
});
</script>

<template>
  <v-container>
    <v-row
      align="center"
      justify="space-between"
    >
      <v-col>
        <h2>Employees</h2>
      </v-col>
      <v-col cols="auto">
        <div style="width: 250px">
          <v-date-input
            v-model="employeeDateRange"
            append-inner-icon="mdi-calendar"
            density="compact"
            hide-details="auto"
            label="Select Date"
            multiple="range"
            prepend-icon=""
            variant="outlined"
            @update:model-value="updateEmployeeDateRange"
          />
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-sheet
          class="pa-3"
          color="white"
        >
          <div
            class="d-flex justify-space-between align-center mb-2 mb-md-4"
          />
          <!--          {{ totalCountEmployee }}-{{ totalPagesEmployee }}-->
          <v-data-table-server
            v-if="employeeListWScanCount.length"
            :headers="employeeHeaders"
            :items="employeeListWScanCount"
            :items-length="totalCountEmployee"
            :items-per-page="employeeItemsPerPage"
            :loading="employeeLoading"
            :search="employeeSearch"
            disable-sort
            hide-default-footer
            hide-no-data
            item-value="name"
          >
            <template #bottom>
              <div class="text-center">
                <v-pagination
                  v-model="pageEmployee"
                  :length="totalPagesEmployee"
                  :total-visible="1"
                  class="mt-2"
                  density="compact"
                  show-first-last-page
                  @first="goFirstEmployee"
                  @last="goLastEmployee"
                  @next="goNextEmployee"
                  @prev="goPrevEmployee"
                />
              </div>
            </template>
          </v-data-table-server>
          <no-items
            v-else
            variant="icon"
          />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
