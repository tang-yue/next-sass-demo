# @next-sass-demo/vue-upload-wrapper

通用的 Preact 到 Vue 包装器，可以将任何 Preact 组件转换为 Vue 组件。

## 特性

- 🎯 通用包装器：可包装任何 Preact 组件
- 📦 自动管理：自动处理组件的挂载和卸载
- 🔄 Props 透传：自动传递所有 Props 到 Preact 组件
- 📝 完整的 TypeScript 支持

## 安装

```bash
pnpm install @next-sass-demo/vue-upload-wrapper
```

## 使用

### 基本用法

```vue
<script setup lang="ts">
import { createPreactWrapper } from '@next-sass-demo/vue-upload-wrapper'
import YourPreactComponent from './YourPreactComponent'

// 创建 Vue 包装器组件
const YourComponentWrapper = createPreactWrapper(YourPreactComponent, 'YourComponentWrapper')
</script>

<template>
  <YourComponentWrapper
    :prop1="value1"
    :prop2="value2"
    @onEvent="handleEvent"
  />
</template>
```

### 完整示例 - 使用 UploadImages 组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { createPreactWrapper } from '@next-sass-demo/vue-upload-wrapper'
import { UploadImages } from '@next-sass-demo/upload-images'
import { createApiClient } from '@next-sass-demo/api'

// 创建 Vue 包装器组件
const UploadImagesWrapper = createPreactWrapper(UploadImages, 'UploadImagesWrapper')

const uploadedUrls = ref<string[]>([])

const uploadImageToServer = async (file: File): Promise<string> => {
  const apiClient = createApiClient({
    'signed-token': 'your-token'
  })

  const { url, method } = await apiClient.open.createPresignedUrl.mutate({
    filename: file.name,
    contentType: file.type,
    size: file.size,
  })

  await fetch(url, {
    method: method || 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  return url.split('?')[0]
}

const onUploadComplete = (url: string) => {
  uploadedUrls.value.push(url)
}

const onUploadCompleteAll = (urls: string[]) => {
  uploadedUrls.value.push(...urls)
}
</script>

<template>
  <UploadImagesWrapper
    :upload-function="uploadImageToServer"
    @onUploadComplete="onUploadComplete"
    @onUploadCompleteAll="onUploadCompleteAll"
  />
</template>
```

## API

### `createPreactWrapper(preactComponent, name)`

创建一个 Vue 包装器组件。

#### 参数

- `preactComponent`: Preact 组件函数
- `name`: Vue 组件名称

#### 返回值

一个 Vue 组件，可以使用所有 Preact 组件的 Props 和事件。

## 注意事项

1. 确保已安装 `preact` 和 `vue`
2. 所有传递给包装器的 Props 会自动传递给 Preact 组件
3. 事件监听器（如 `@onEvent`）会自动传递给 Preact 组件
4. 组件会自动处理挂载和卸载
5. 样式使用 Tailwind CSS，确保项目中已配置

## License

MIT
