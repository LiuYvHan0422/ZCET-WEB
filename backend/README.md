# Web V1.0 后端 API

精品独立站后端 API - NestJS + TypeORM + MySQL

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 接口文档](#api-接口文档)
- [数据库表](#数据库表)
- [环境变量](#环境变量)
- [许可证](#许可证)

---

## 项目简介

本项目是精品独立站的后端 API 服务，采用 NestJS 框架开发，使用 TypeORM 连接 MySQL 数据库，提供完整的 RESTful API 接口。

## 技术栈

- **框架**: NestJS v10
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **认证**: JWT (passport-jwt)
- **验证**: class-validator
- **文档**: Swagger/OpenAPI
- **密码加密**: bcrypt

## 项目结构

```
backend/
├── src/
│   ├── main.ts                    # 应用启动入口
│   ├── app.module.ts              # 根模块
│   ├── config/                    # 配置文件
│   │   ├── database.config.ts     # 数据库配置
│   │   └── jwt.config.ts          # JWT配置
│   ├── common/                    # 公共模块
│   │   ├── dto/                   # 数据传输对象
│   │   │   └── pagination.dto.ts  # 分页DTO
│   │   ├── filters/               # 异常过滤器
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/                 # 验证管道
│   │   │   └── validation.pipe.ts
│   │   ├── entities/              # 实体基类
│   │   │   └── base.entity.ts
│   │   └── index.ts
│   ├── modules/                   # 业务模块
│   │   ├── products/             # 产品模块
│   │   ├── news/                  # 新闻模块
│   │   ├── certificates/          # 证书模块
│   │   ├── inquiries/             # 询盘模块
│   │   ├── categories/            # 分类模块
│   │   ├── company/               # 公司信息模块
│   │   ├── auth/                  # 认证模块
│   │   └── admin/                 # 管理员模块
│   └── entities/                  # 实体类目录
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```env
# 数据库配置
DB_HOST=101.126.71.124
DB_PORT=3306
DB_USERNAME=wangdi
DB_PASSWORD=your_password
DB_DATABASE=webv1

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=7d

# 应用配置
PORT=3000
NODE_ENV=development

# API 前缀
API_PREFIX=api/v1

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. 启动服务

开发模式：

```bash
npm run start:dev
```

生产模式：

```bash
npm run build
npm run start:prod
```

### 4. 访问 API 文档

启动服务后，访问 Swagger API 文档：

```
http://localhost:3000/docs
```

---

## API 接口文档

### 基础信息

- **API 前缀**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

### 响应格式

**成功响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": 1700000000000
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": { ... },
  "timestamp": 1700000000000,
  "path": "/api/v1/products"
}
```

---

### 接口列表

#### 1. 产品模块 (`/products`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/products` | 获取产品列表 | 否 |
| GET | `/products/:id` | 获取产品详情 | 否 |
| GET | `/products/categories` | 获取所有分类 | 否 |
| GET | `/products/featured` | 获取推荐产品 | 否 |
| POST | `/products` | 创建产品 | 是 |
| PATCH | `/products/:id` | 更新产品 | 是 |
| DELETE | `/products/:id` | 删除产品 | 是 |

**查询参数** (GET `/products`):
- `keyword`: 搜索关键词
- `category`: 分类筛选
- `sortBy`: 排序字段 (默认: createdAt)
- `sortOrder`: 排序方向 (ASC/DESC)
- `page`: 当前页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)

---

#### 2. 新闻模块 (`/news`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/news` | 获取新闻列表 | 否 |
| GET | `/news/:id` | 获取新闻详情 | 否 |
| GET | `/news/latest` | 获取最新新闻 | 否 |
| POST | `/news` | 创建新闻 | 是 |
| PATCH | `/news/:id` | 更新新闻 | 是 |
| DELETE | `/news/:id` | 删除新闻 | 否 |

---

#### 3. 证书模块 (`/certificates`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/certificates` | 获取证书列表 | 否 |
| GET | `/certificates/all` | 获取所有证书 | 否 |
| GET | `/certificates/:id` | 获取证书详情 | 否 |
| POST | `/certificates` | 创建证书 | 是 |
| PATCH | `/certificates/:id` | 更新证书 | 是 |
| DELETE | `/certificates/:id` | 删除证书 | 是 |

---

#### 4. 询盘模块 (`/inquiries`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/inquiries` | 提交询盘 | 否 |
| GET | `/inquiries` | 获取询盘列表 | 是 |
| GET | `/inquiries/:id` | 获取询盘详情 | 是 |
| GET | `/inquiries/pending-count` | 待处理数量 | 是 |
| PATCH | `/inquiries/:id` | 更新询盘状态 | 是 |
| DELETE | `/inquiries/:id` | 删除询盘 | 是 |

**询盘状态**:
- `pending`: 待处理
- `processing`: 处理中
- `processed`: 已处理

---

#### 5. 分类模块 (`/categories`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/categories` | 获取分类列表 | 否 |
| GET | `/categories/all` | 获取所有分类 | 否 |
| GET | `/categories/:id` | 获取分类详情 | 否 |
| POST | `/categories` | 创建分类 | 是 |
| PATCH | `/categories/:id` | 更新分类 | 是 |
| DELETE | `/categories/:id` | 删除分类 | 是 |

---

#### 6. 公司信息模块 (`/company`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/company` | 获取公司信息 | 否 |
| PUT | `/company` | 创建或更新公司信息 | 是 |
| PATCH | `/company` | 更新公司信息 | 是 |

---

#### 7. 认证模块 (`/auth`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/login` | 管理员登录 | 否 |
| GET | `/auth/profile` | 获取当前管理员信息 | 是 |

**登录请求**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**登录响应**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "nickname": "超级管理员",
    "role": "admin"
  }
}
```

---

#### 8. 管理员模块 (`/admins`)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/admins` | 获取管理员列表 | 是 |
| GET | `/admins/profile` | 获取当前管理员 | 是 |
| GET | `/admins/:id` | 获取管理员详情 | 是 |
| POST | `/admins` | 创建管理员 | 是 |
| PATCH | `/admins/:id` | 更新管理员 | 是 |
| PATCH | `/admins/profile` | 更新当前管理员 | 是 |
| DELETE | `/admins/:id` | 删除管理员 | 是 |

---

## 数据库表

### 1. products (产品表)
- `id`: 主键
- `name`: 产品名称
- `description`: 产品描述
- `price`: 价格
- `category`: 分类
- `icon`: 图标
- `is_active`: 是否上架
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 2. news (新闻表)
- `id`: 主键
- `title`: 标题
- `excerpt`: 摘要
- `content`: 内容
- `date`: 日期
- `icon`: 图标
- `is_published`: 是否发布
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 3. certificates (证书表)
- `id`: 主键
- `name`: 名称
- `description`: 描述
- `image`: 图片
- `icon`: 图标
- `sort_order`: 排序
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 4. inquiries (询盘表)
- `id`: 主键
- `product_name`: 意向产品
- `customer_name`: 客户姓名
- `customer_phone`: 联系电话
- `customer_email`: 邮箱
- `company_name`: 公司名称
- `message`: 留言
- `status`: 状态
- `remark`: 处理备注
- `processed_by`: 处理人
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 5. categories (分类表)
- `id`: 主键
- `name`: 名称
- `description`: 描述
- `icon`: 图标
- `sort_order`: 排序
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 6. company (公司信息表)
- `id`: 主键
- `name`: 公司名称
- `about_content`: 关于我们
- `phone`: 电话
- `email`: 邮箱
- `address`: 地址
- `logo`: Logo
- `wechat`: 微信
- `weibo`: 微博
- `douyin`: 抖音
- `created_at`: 创建时间
- `updated_at`: 更新时间

### 7. admins (管理员表)
- `id`: 主键
- `username`: 用户名
- `password`: 密码(加密)
- `nickname`: 昵称
- `role`: 角色
- `is_active`: 是否激活
- `last_login_ip`: 最后登录IP
- `last_login_at`: 最后登录时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

---

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | 101.126.71.124 |
| DB_PORT | 数据库端口 | 3306 |
| DB_USERNAME | 数据库用户名 | wangdi |
| DB_PASSWORD | 数据库密码 | - |
| DB_DATABASE | 数据库名称 | webv1 |
| JWT_SECRET | JWT密钥 | - |
| JWT_EXPIRATION | Token过期时间 | 7d |
| PORT | 服务端口 | 3000 |
| NODE_ENV | 环境 | development |
| API_PREFIX | API前缀 | api/v1 |
| CORS_ORIGIN | CORS来源 | http://localhost:3000 |

---

## 许可证

MIT License
