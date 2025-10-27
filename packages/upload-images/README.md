# @next-sass-demo/upload-images

一个使用 Preact 开发的图片上传组件，支持拖拽上传、进度显示和自定义上传函数。

## 特性

- 📦 轻量级：基于 Preact，体积小
- 🎨 美观的 UI：渐变设计和现代化样式
- 🔄 拖拽上传：支持拖拽文件到指定区域
- 📊 进度显示：实时显示上传进度
- 🎯 自定义上传：支持自定义上传函数
- 📱 响应式设计：适配各种屏幕尺寸
- 🎭 状态反馈：上传成功/失败状态图标
- ⚡ 类型安全：完整的 TypeScript 类型定义

## 安装

```bash
pnpm install @next-sass-demo/upload-images
```

## 使用

### 基础使用

```tsx
import { UploadImages } from '@next-sass-demo/upload-images';

function MyComponent() {
  const handleUpload = async (file: File): Promise<string> => {
    // 实现你的上传逻辑
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url;
  };

  return (
    <UploadImages
      uploadFunction={handleUpload}
      onUploadComplete={(url) => console.log('Uploaded:', url)}
      onUploadCompleteAll={(urls) => console.log('All uploaded:', urls)}
    />
  );
}
```

### API

#### UploadImagesProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onFilesSelected` | `(files: File[]) => void` | - | 文件选择回调 |
| `onUploadComplete` | `(url: string) => void` | - | 单文件上传成功回调 |
| `onUploadCompleteAll` | `(urls: string[]) => void` | - | 所有文件上传成功回调 |
| `multiple` | `boolean` | `true` | 是否允许多选 |
| `accept` | `string` | `'image/*'` | 接受的文件类型 |
| `className` | `string` | `''` | 自定义样式类名 |
| `showProgress` | `boolean` | `true` | 是否显示进度条 |
| `dragAreaClassName` | `string` | - | 拖拽区域自定义样式 |
| `uploadFunction` | `(file: File) => Promise<string>` | - | 自定义上传函数 |

### 状态管理

组件内部管理以下状态：

- `uploading`: 上传中
- `success`: 上传成功
- `error`: 上传失败

每个状态都有对应的图标和样式反馈。

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
```

## 文件结构

```
packages/upload-images/
├── src/
│   ├── UploadImages.tsx    # 主组件
│   └── index.ts            # 导出文件
├── dist/                   # 构建输出
├── package.json
├── tsconfig.json
└── README.md
```

## 注意事项

1. 此组件使用 Preact，确保你的项目已安装 `preact` 作为依赖
2. 样式使用 Tailwind CSS，确保项目中已配置 Tailwind
3. 组件会自动清理上传完成的 URL（3秒后）

## License

MIT

