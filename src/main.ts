import { createSSRApp } from "vue";
import App from "./App.vue";
import { loadIconFont } from "./utils/loadIconFont";

export function createApp() {
  const app = createSSRApp(App);

  // 启动即加载 Material Symbols 字体,失败也不阻塞
  loadIconFont();

  return {
    app,
  };
}
