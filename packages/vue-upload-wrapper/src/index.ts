import { defineComponent, onMounted, onUnmounted, ref, h, watch } from 'vue'
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
      let currentAttrs = attrs

      // 创建一个函数来重新渲染 Preact 组件
      const renderPreactComponent = () => {
        console.log('preactContainer:', preactContainer)
        console.log('containerRef.value:', containerRef.value)
        if (preactContainer && containerRef.value) {
          // 将所有 attrs 传给 Preact 组件
          console.log('currentAttrs:', currentAttrs)
          const Component = jsx(preactComponent, currentAttrs as any)
          render(Component, preactContainer)
        }
      }

      onMounted(() => {
        console.log('onMounted', containerRef.value)
        if (containerRef.value) {
          preactContainer = document.createElement('div')
          preactContainer.style.width = '100%'
          containerRef.value.appendChild(preactContainer)

          renderPreactComponent()
        }
      })

      // 监听 attrs 变化，重新渲染组件
      watch(() => attrs, () => {
        if (preactContainer && containerRef.value) {
          currentAttrs = attrs
          renderPreactComponent()
        }
      }, { deep: true, immediate: false })

      onUnmounted(() => {
        if (preactContainer) {
          render(null, preactContainer)
        }
      })

      expose({
        refresh: () => {
          renderPreactComponent()
        }
      })

      return () => h('div', { ref: containerRef })
    }
  })
}

// 导出包装器函数
export default createPreactWrapper
