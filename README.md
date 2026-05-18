# 约个钓 - 微信小程序

> 找钓点、约钓友、晒鱼获 —— 基于位置的钓鱼社区

## 项目状态

🚧 **基座搭建完成，等待设计稿后开始 UI 实现**

- ✅ 需求文档：[../约个钓-需求文档-v1.md](../约个钓-需求文档-v1.md)
- ✅ 页面设计文档：[../约个钓-页面设计-v1.md](../约个钓-页面设计-v1.md)
- ✅ uniapp 脚手架（Vue3 + Vite + TS）
- ✅ 全部路由 + 页面占位
- ✅ 主题色变量
- ✅ 自定义 TabBar（含中间凸起 + 号）
- ⏳ 等待 GPT 5.5 + Pencli 出图
- ⏳ UI 实现
- ⏳ 后端方案（uniCloud / 独立后端待定）

## 技术栈

- **框架**：uniapp + Vue 3 + TypeScript
- **构建**：Vite 5
- **状态**：Pinia（待引入）
- **目标平台**：微信小程序（主）/ H5 / App
- **预留**：腾讯地图、和风天气、百度 AI 识图

## 项目结构

```
yue-ge-diao/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.vue              # 全局样式入口
    ├── main.ts              # 应用入口
    ├── manifest.json        # uniapp 应用配置
    ├── pages.json           # 路由 & 全局样式
    ├── uni.scss             # 主题色 / 字号 / 间距变量
    ├── components/
    │   └── CustomTabBar.vue # 自定义 TabBar（含中间凸起 + ）
    ├── pages/
    │   ├── index/index      # Tab 1: 钓点首页（地图）
    │   ├── community/index  # Tab 2: 社区 Feed
    │   ├── message/index    # Tab 4: 消息
    │   ├── profile/         # Tab 5: 我的
    │   │   ├── index        # 我的主页
    │   │   ├── edit         # 编辑资料
    │   │   └── setting      # 设置
    │   ├── publish/index    # 发布入口（备用）
    │   ├── spot/            # 钓点
    │   │   ├── detail
    │   │   └── create
    │   ├── catch/           # 鱼获
    │   │   ├── detail
    │   │   └── create
    │   ├── team/            # 组队
    │   │   ├── list
    │   │   ├── detail
    │   │   └── create
    │   ├── nearby/users     # 附近钓友
    │   └── user/detail      # 钓友主页（他人）
    └── static/
        └── logo.png         # （待替换）
```

## 主题色（已配置 uni.scss）

| 变量 | 色值 | 用途 |
|---|---|---|
| `$primary` | `#2D8F87` | 主色 - 湖水墨绿 |
| `$secondary` | `#5BA9C4` | 辅色 - 天空蓝 |
| `$accent` | `#F5A623` | 强调 - 夕阳橙（CTA） |
| `$bg-page` | `#F7F9FA` | 页面背景 |
| `$bg-card` | `#FFFFFF` | 卡片背景 |

## 启动开发

```bash
# 安装依赖（首次）
npm install

# 微信小程序开发模式
npm run dev:mp-weixin

# H5 开发模式
npm run dev:h5

# 编译生产包
npm run build:mp-weixin
```

**微信开发者工具**：打开 `dist/dev/mp-weixin` 目录即可预览。

## 下一步路线图

1. **设计稿确认**：用 GPT 5.5 + Pencli 出 5 个 Tab 主页面设计图
2. **TabBar 图标**：设计稿出来后替换 `CustomTabBar.vue` 里的 emoji 占位
3. **首页地图实现**：接入腾讯位置服务 SDK
4. **登录系统**：微信授权登录 + 用户信息完善流程
5. **后端确认**：uniCloud 还是独立 Node 后端
6. **核心功能**：F1 用户 → F2 钓点 → F3 鱼获 → F5 天气 → F6/F7 社交

## 备注

- **TabBar 中间 "+" 按钮**：用 `position: fixed` 实现凸起 20rpx 上浮，不走 uniapp 内置 tabBar 配置（内置不支持凸起）
- **每个 Tab 页面引用 `<CustomTabBar />`**：注意 4 个 Tab 页面的 `current` 属性不同
- **pages.json 没有 tabBar 字段**：因为我们用自定义实现，避免双重 TabBar
