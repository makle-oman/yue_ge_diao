import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        // uni-app 内部仍在用 legacy JS API + @import,
        // 在框架升级前先静默这两条 Sass 废弃警告,避免启动刷屏
        silenceDeprecations: ["legacy-js-api", "import"],
      },
    },
  },
});
