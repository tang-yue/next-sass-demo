/**
 * 创建一个通用的 Preact 到 Vue 的包装器函数
 * @param preactComponent Preact 组件
 * @param name Vue 组件名称
 * @returns Vue 组件
 */
export declare function createPreactWrapper(preactComponent: any, name: string): import("vue").DefineComponent<{}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default createPreactWrapper;
//# sourceMappingURL=index.d.ts.map