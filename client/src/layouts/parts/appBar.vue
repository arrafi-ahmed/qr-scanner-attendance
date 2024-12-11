<script setup>
import Logo from "@/components/Logo.vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { getClientPublicImgUrl, getToLink } from "@/others/util";
import { useDisplay } from "vuetify";
import UserAvatar from "@/components/UserAvatar.vue";

const store = useStore();
const { mobile } = useDisplay();
const router = useRouter();

const signedin = computed(() => store.getters["user/signedin"]);
const currentUser = computed(() => store.getters["user/getCurrentUser"]);
const calcHome = computed(() => store.getters["user/calcHome"]);

const isSudo = computed(() => store.getters["user/isSudo"]);
const isManager = computed(() => store.getters["user/isManager"]);

const menuItemsSudo = [
  {
    title: "Dashboard",
    to: { name: "dashboard" },
    icon: "mdi-view-dashboard-outline",
  },
  {
    title: "Employees",
    to: { name: "employees" },
    icon: "mdi-account-multiple-outline",
  },
  {
    title: "Buses",
    to: { name: "buses" },
    icon: "mdi-bus",
  },
];
const menuItemsManager = [
  {
    title: "QR Code Scanner",
    to: { name: "scanner" },
    icon: "mdi-qrcode",
  },
  {
    title: "Scanned List",
    to: { name: "scanned-list" },
    icon: "mdi-format-list-bulleted",
  },
];

const menuItems = computed(() => {
  let items = [];
  if (isSudo.value) {
    items = items.concat(menuItemsSudo);
  } else if (isManager.value) {
    items = items.concat(menuItemsManager);
  }
  items.push({
    title: "Logout",
    to: { name: "signout" },
    icon: "mdi-exit-to-app",
  });
  return items;
});

const drawer = ref(true);
</script>

<template>
  <v-app-bar
    class="px-2 px-md-5 border-b"
    dense
    density="compact"
    flat
  >
    <logo
      :img-src="getClientPublicImgUrl('logo.png')"
      :title="true"
      :width="40"
      container-class="clickable"
      img-class="mx-auto"
      @click="router.push(calcHome)"
    />

    <template #append>
      <v-btn
        v-if="signedin"
        @click="drawer = !drawer"
      >
        <div class="d-flex align-center">
          <user-avatar :img-src="currentUser.image" />
          <span class="ml-1">
            {{ currentUser.name }}
          </span>
        </div>
      </v-btn>
    </template>
  </v-app-bar>
  <v-navigation-drawer
    v-if="signedin"
    v-model="drawer"
    :width="200"
    location="start"
    permanent
  >
    <v-list
      color="primary"
      density="comfortable"
      nav
    >
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="index"
        :prepend-icon="item.icon"
        :to="getToLink(item)"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped></style>
