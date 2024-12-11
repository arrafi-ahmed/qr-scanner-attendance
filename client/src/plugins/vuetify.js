/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */
// lab
import { VTimePicker } from "vuetify/labs/VTimePicker";
import { VDateInput } from 'vuetify/labs/VDateInput'
// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VTimePicker,
    VDateInput,
  },
  theme: {
    // defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: "#5277ff",
          secondary: "#f78166",
          tertiary: "#5CBBF6",
        },
      },
    },
  },
});
