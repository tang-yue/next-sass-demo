# Next SaaS Demo - 文件管理系统

一个基于 Next.js 15 构建的现代化 SaaS 文件管理系统，提供完整的文件上传、管理和 API 访问功能。

## ✨ 特性

- 🚀 **现代化技术栈**: Next.js 15, React 19, TypeScript
- 🔐 **认证系统**: GitHub OAuth 登录 (NextAuth.js)
- 📁 **文件管理**: 支持应用级文件组织和管理
- ☁️ **云存储**: 支持 S3 兼容存储（AWS S3, 腾讯云 COS 等）
- 🔑 **API Key 管理**: 为应用生成和管理 API Keys
- 🌐 **开放 API**: 提供完整的 RESTful API 接口
- 📦 **Monorepo**: 模块化设计，支持多包复用
- 🎨 **现代 UI**: Tailwind CSS + Radix UI 组件库
- 🔒 **类型安全**: tRPC 提供端到端类型安全

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React 框架
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无障碍组件
- **tRPC** - 类型安全的 API 调用
- **React Query** - 数据获取和缓存
- **Zod** - 运行时类型验证

### 后端
- **tRPC** - 类型安全的 API 框架
- **NextAuth.js** - 身份验证
- **Drizzle ORM** - 数据库 ORM
- **Neon PostgreSQL** - 服务器less 数据库
- **AWS SDK** - S3 存储集成

### 数据库
- **PostgreSQL** (Neon) - 主数据库
- **Drizzle ORM** - 数据库管理

### 存储
- **S3 兼容存储** - 支持 AWS S3、腾讯云 COS 等

## 📁 项目结构

```
next-sass-demo/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── auth/             # NextAuth 认证
│   │   ├── trpc/             # tRPC 主路由
│   │   └── open/             # 开放 API 路由
│   ├── uppyUpload/           # 文件管理主页面
│   │   └── apps/             # 应用管理
│   └── dashBoard/            # 仪表板
├── server/                   # 服务端代码
│   ├── routes/               # tRPC 路由定义
│   │   ├── app.ts            # 应用管理
│   │   ├── file.ts           # 文件管理
│   │   ├── storage.ts        # 存储配置
│   │   ├── apiKeys.ts        # API Key 管理
│   │   └── open-file.ts      # 开放 API
│   ├── db/                   # 数据库
│   │   ├── schema.ts         # Drizzle schema
│   │   └── db.ts             # 数据库连接
│   └── auth/                 # 认证配置
├── packages/                 # Monorepo 包
│   ├── api/                  # API 客户端包
│   ├── upload-images/        # 图片上传组件 (Preact)
│   └── vue-upload-wrapper/   # Vue 组件包装器
├── components/               # 共享组件
├── utils/                    # 工具函数
└── examples/                 # 示例项目
    └── nuxt/                 # Nuxt.js 示例
```

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm/yarn
- PostgreSQL 数据库 (本地或 Neon)

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

创建 `.env` 文件：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEON_DB_URL="postgresql://..." # 可选：Neon 数据库

# GitHub OAuth
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key" # 运行: openssl rand -base64 32

# S3 存储配置 (可选，如使用腾讯云 COS)
COS_APP_ID="your_cos_app_id"
COS_APP_SECRET="your_cos_app_secret"
COS_BUCKET="your_bucket_name"
COS_REGION="ap-beijing"
COS_API_ENDPOINT="https://cos.ap-beijing.myqcloud.com"
```

### 数据库迁移

```bash
# 使用本地数据库
pnpm db:push

# 或使用 Neon 数据库
pnpm db:neon
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📚 主要功能

### 1. 应用管理
- 创建和管理多个应用
- 为每个应用配置独立的存储
- 应用级别的文件隔离

### 2. 文件上传
- 支持拖拽上传
- 批量文件上传
- 上传进度显示
- 支持多种文件类型

### 3. 存储配置
- 配置 S3 兼容存储
- 支持多个存储提供商
- 应用级存储隔离

### 4. API Key 管理
- 为应用生成 API Keys
- API Key 权限管理
- 支持 JWT Token 认证

### 5. 开放 API
- RESTful API 接口
- 完整的类型定义
- 支持文件上传、下载、删除等操作

## 🔧 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器 (Turbopack)

# 构建
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器

# 数据库
pnpm db:generate      # 生成数据库迁移
pnpm db:migrate       # 执行数据库迁移
pnpm db:push          # 推送 schema 到数据库
pnpm db:studio        # 打开 Drizzle Studio
pnpm db:neon          # 推送到 Neon 数据库

# 代码质量
pnpm lint             # 运行 ESLint
```

## 📦 Monorepo 包

### @next-sass-demo/api
类型安全的 API 客户端，支持开放 API 调用。

```bash
pnpm add @next-sass-demo/api
```

### @next-sass-demo/upload-images
基于 Preact 的图片上传组件，支持拖拽上传。

```bash
pnpm add @next-sass-demo/upload-images
```

### @next-sass-demo/vue-upload-wrapper
Vue 组件包装器，用于在 Vue 项目中使用 Preact 组件。

```bash
pnpm add @next-sass-demo/vue-upload-wrapper
```

## 🌐 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 环境变量配置

在 Vercel 项目设置中添加所有 `.env` 中的环境变量。

### GitHub OAuth 配置

1. 在 GitHub 创建 OAuth App
2. 设置回调 URL: `https://your-domain.com/api/auth/callback/github`
3. 将 Client ID 和 Secret 添加到 Vercel 环境变量

## 📖 API 文档

### 认证

使用 GitHub OAuth 登录，获取用户会话。

### tRPC API

所有 API 通过 `/api/trpc` 访问，使用 tRPC 客户端调用。

```typescript
// 在 React 组件中使用 hooks
import { trpcClientReact } from '@/utils/api';

function MyComponent() {
  // 获取应用列表
  const { data: apps } = trpcClientReact.app.getAll.useQuery();

  // 创建应用
  const createApp = trpcClientReact.app.create.useMutation();
  
  const handleCreate = () => {
    createApp.mutate({
      name: 'My App',
      description: 'App description'
    });
  };
}

// 在服务端组件中使用
import { caller } from '@/utils/trpc';

const apps = await caller.app.getAll();
```

### 开放 API

开放 API 位于 `/api/open`，支持 API Key 或 JWT Token 认证。

详细文档请参考 [packages/api/README.md](./packages/api/README.md)

## 🔒 安全

- ✅ 用户认证和授权
- ✅ API Key 管理
- ✅ JWT Token 认证
- ✅ 文件访问权限控制
- ✅ 输入验证 (Zod)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)
- [Radix UI](https://www.radix-ui.com/)