import { defineComponent, onMounted, onUnmounted, ref, h } from 'vue'
import { jsx } from 'preact/jsx-runtime'
import { render } from 'preact'

/**
 * 创建一个通用的 Preact 到 Vue 的包装器函数
 * @param preactComponent Preact 组件
 * @param name Vue 组件名称
 * @returns Vue 组件
 */
export function createPreactWrapper(preactComponent: any, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false, // 禁用默认的 attrs 继承
    setup(_, { attrs, expose }) {
      const containerRef = ref<HTMLElement | null>(null)
      let preactContainer: HTMLElement | null = null

      onMounted(() => {
        if (containerRef.value) {
          preactContainer = document.createElement('div')
          preactContainer.style.width = '100%'
          containerRef.value.appendChild(preactContainer)

          // 创建一个函数来重新渲染 Preact 组件
          const Component = jsx(preactComponent, attrs as any)
          render(Component, preactContainer)
        }
      })

      onUnmounted(() => {
        if (preactContainer) {
          render(null, preactContainer)
        }
      })

      expose({
        refresh: () => {
          // 刷新组件
          if (preactContainer && containerRef.value) {
            const Component = jsx(preactComponent, attrs as any)
            render(Component, preactContainer)
          }
        }
      })

      return () => h('div', { ref: containerRef })
    }
  })
}

// 导出包装器函数
export default createPreactWrapper
