# @next-sass-demo/api

TRPC API 客户端，支持开放的 API 接口调用，包括文件管理、上传等功能。

## 特性

- 🚀 基于 TRPC 的类型安全 API 客户端
- 🔐 支持 JWT Token 认证
- 📦 开放 API 支持：文件上传、管理等功能
- 📝 完整的 TypeScript 类型定义
- 🌐 支持自定义请求头

## 安装

```bash
pnpm install @next-sass-demo/api
```

## 使用

### 基础使用

```tsx
import { apiClient } from '@next-sass-demo/api';

// 获取文件列表
const files = await apiClient.open.getFiles.query({
  page: 1,
  limit: 10,
});

// 创建预签名 URL
const presigned = await apiClient.open.createPresignedUrl.mutate({
  filename: 'image.jpg',
  contentType: 'image/jpeg',
  size: 1024,
});
```

### 使用自定义认证头

```tsx
import { createApiClient } from '@next-sass-demo/api';

// 创建带认证头的客户端
const apiClient = createApiClient({
  'signed-token': 'your-jwt-token-here',
});

// 现在可以安全地调用 API
const files = await apiClient.open.getFiles.query({
  page: 1,
  limit: 10,
});
```

### 完整的文件上传流程

```tsx
import { createApiClient } from '@next-sass-demo/api';

async function uploadFile(file: File): Promise<string> {
  // 1. 创建带认证头的客户端
  const apiClient = createApiClient({
    'signed-token': 'your-token',
  });

  // 2. 获取预签名 URL
  const { url, method } = await apiClient.open.createPresignedUrl.mutate({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  // 3. 上传到 S3
  await fetch(url, {
    method: method || 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  // 4. 保存文件信息
  const savedFile = await apiClient.open.saveFile.mutate({
    name: file.name,
    path: url.split('?')[0],
    type: file.type,
  });

  return savedFile.url;
}
```

## API 接口

### `apiClient.open.getFiles`

获取文件列表。

```tsx
const files = await apiClient.open.getFiles.query({
  page?: number;     // 页码，默认 1
  limit?: number;    // 每页数量，默认 10
});
```

### `apiClient.open.createPresignedUrl`

创建用于 S3 上传的预签名 URL。

```tsx
const presigned = await apiClient.open.createPresignedUrl.mutate({
  filename: string;
  contentType: string;
  size: number;
});
```

### `apiClient.open.saveFile`

保存文件信息到数据库。

```tsx
const file = await apiClient.open.saveFile.mutate({
  name: string;
  path: string;
  type: string;
});
```

### `apiClient.open.deleteFile`

删除文件。

```tsx
await apiClient.open.deleteFile.mutate({
  fileId: string;
});
```

### `apiClient.open.getAppInfo`

获取应用信息。

```tsx
const app = await apiClient.open.getAppInfo.query();
```

## 类型定义

所有类型都从 `@trpc/client` 自动推断，提供完整的类型安全。

```tsx
import type { OpenRouter } from '@next-sass-demo/api';

// 类型会自动推断
const client = createApiClient<OpenRouter>({
  'signed-token': 'token',
});
```

## 认证

### JWT Token 认证

使用 `signed-token` header 进行认证：

```tsx
const apiClient = createApiClient({
  'signed-token': 'your-jwt-token',
});
```

### API Key 认证

传统方式使用 `api-key` header：

```tsx
const apiClient = createApiClient({
  'api-key': 'your-api-key',
});
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（watch）
pnpm dev

# 构建
pnpm build

# 构建（watch 模式）
pnpm build:watch

# 清理
pnpm clean
```

## 文件结构

```
packages/api/
├── src/
│   ├── index.ts                 # 主入口
│   └── open-router-dts.d.ts     # TRPC 路由类型定义
├── dist/                        # 构建输出
├── package.json
├── tsconfig.json
└── README.md
```

## 注意事项

1. 确保后端 TRPC 服务正在运行（默认 `http://localhost:3000/api/open`）
2. 在使用前需要先获取有效的 `signed-token` 或 `api-key`
3. 预签名 URL 有有效期限制，请及时使用
4. 文件上传需要先调用 `createPresignedUrl` 获取上传 URL

## License

MIT

