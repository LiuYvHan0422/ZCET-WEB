# 精品独立站 - Nuxt.js 前端项目

## 项目简介

本项目是基于 Nuxt.js 3 构建的前端独立网站，用于展示和销售精品商品。网站包含首页、商品展示、关于我们、新闻动态、荣誉资质等多个功能模块。

## 技术栈

- **框架**: Nuxt.js 3
- **语言**: TypeScript
- **状态管理**: Pinia
- **样式**: CSS (原生CSS变量系统)
- **构建工具**: Vite

## 项目结构

```
frontend/
├── assets/
│   └── css/
│       ├── main.css           # 主样式入口
│       ├── base.css           # 基础样式和变量
│       ├── responsive.css      # 响应式样式
│       ├── sections.css        # 页面区块样式
│       └── components/        # 组件样式
│           ├── button.css
│           ├── card.css
│           ├── form.css
│           └── modal.css
├── components/
│   ├── AppHeader.vue          # 页头组件
│   ├── AppFooter.vue          # 页脚组件
│   └── InquiryModal.vue       # 询盘弹窗组件
├── composables/
│   ├── useModal.ts            # 弹窗组合式函数
│   └── useApi.ts              # API请求封装
├── layouts/
│   └── default.vue            # 默认布局
├── pages/
│   ├── index.vue              # 首页
│   ├── about.vue              # 关于我们
│   ├── certificates.vue       # 荣誉资质
│   ├── product/
│   │   ├── index.vue          # 全部商品
│   │   └── [id].vue           # 商品详情
│   └── news/
│       ├── index.vue          # 新闻列表
│       └── [id].vue           # 新闻详情
├── stores/
│   └── products.ts           # 商品状态管理
├── app.vue                    # 应用入口
├── nuxt.config.ts            # Nuxt配置
├── package.json              # 依赖配置
└── tsconfig.json             # TypeScript配置
```

## 功能特点

1. **模块化设计**: 采用组件化开发，易于维护和扩展
2. **响应式布局**: 完美适配桌面端、平板和移动设备
3. **SEO优化**: 使用 Nuxt 的 useHead 进行页面元信息管理
4. **状态管理**: 使用 Pinia 进行商品数据状态管理
5. **询盘系统**: 内置询盘弹窗表单，支持商品询盘

## 安装和运行

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 页面说明

1. **首页 (/)**: 包含 Banner、特色区域、商品展示、关于我们和联系信息
2. **关于我们 (/about)**: 公司介绍、发展历程、核心价值观
3. **新闻动态 (/news)**: 公司新闻列表和详情页
4. **荣誉资质 (/certificates)**: 资质证书和企业资质展示
5. **全部商品 (/product)**: 商品列表，支持分类筛选和排序
6. **商品详情 (/product/:id)**: 单个商品的详细信息

## API集成

项目已集成 API 请求封装 (`composables/useApi.ts`)，可通过以下方式调用：

```typescript
import { apiGet, apiPost } from '~/composables/useApi'

// GET 请求
const products = await apiGet('/products')

// POST 请求
const result = await apiPost('/inquiry', formData)
```

## 注意事项

1. 本项目为前端展示页面，API 接口需要后端支持
2. 商品数据目前为静态数据，实际使用时需要对接后端 API
3. 询盘表单提交目前为模拟提交，需要配置后端接口

## 浏览器兼容性

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License
