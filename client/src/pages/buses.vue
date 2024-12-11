<script setup>
import NoItems from "@/components/NoItems.vue";
import {formatDateTime, getDateOnly} from "@/others/util.js";
import {useStore} from "vuex";

definePage({
  name: "buses",
  meta: {
    layout: "default",
  },
});
const store = useStore();

const busListWScanCount = computed(() =>
  store.state.scan.busListWScanCount.map((item) => ({
    ...item,
    createdAt: formatDateTime(item.createdAt),
  })),
);

const pageBus = ref(1);
const busDateRange = ref(null);
const busItemsPerPage = ref(20);
const totalCountBus = ref(0);
const totalPagesBus = computed(() =>
  Math.ceil(totalCountBus.value / busItemsPerPage.value),
);
const busLoading = ref(false);
const busSearch = ref("");

const loadBusItems = ({fetchTotalCount = false} = {}) => {
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

  const {totalCount} = await loadBusItems({fetchTotalCount: true});
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
  const {totalCount} = await loadBusItems({fetchTotalCount: true});
  totalCountBus.value = totalCount;
};
onMounted(async () => {
  fetchData();
});
</script>

<template>
  <v-container>
    <v-row justify="space-between" align="center">
      <v-col>
        <h2>Buses</h2>
      </v-col>
      <v-col cols="auto">
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
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-sheet color="white" class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2 mb-md-4">

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
              </div>
            </template>
          </v-data-table-server>
          <no-items v-else variant="icon"/>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
