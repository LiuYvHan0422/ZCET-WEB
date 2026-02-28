# 管理后台

精品独立站管理后台前端项目

## 技术栈

- Vue 3 + Composition API
- TypeScript
- Pinia 状态管理
- Vue Router
- Vite 构建工具
- WangEditor 富文本编辑器

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:8010 启动

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── pages/           # 页面组件
├── components/      # 可复用组件
├── composables/     # 组合式函数
├── stores/         # Pinia 状态管理
├── router/         # Vue Router
├── utils/          # 工具函数
├── styles/         # 样式文件
├── App.vue         # 根组件
└── main.ts         # 入口文件
```

## API 配置

需要在后端服务运行的情况下使用，API 地址通过环境变量配置。
