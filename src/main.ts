import { createSSRApp } from "vue";
import App from "./App.vue";
import { setupPinia } from "@/stores";

export function createApp() {
  const app = createSSRApp(App);
  const Pinia = setupPinia();
  app.use(Pinia);
  // uni-app vue3 约定:必须把 Pinia 一并返出来,小程序端打包才能正确注入
  return { app, Pinia };
}
