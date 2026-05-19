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
        // 全局注入：每个 SCSS 编译单元（vue style 块 + 独立 .scss）开头自动追加，
        // 使得任何文件都可直接使用 $primary 等变量与 page-shell 等 mixin，
        // 无需手动 @import '@/uni.scss' 或 '@/styles/mixins.scss'。
        additionalData: `@import "@/uni.scss"; @import "@/styles/mixins.scss";`,
      },
    },
  },
});
