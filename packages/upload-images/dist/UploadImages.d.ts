export interface UploadImage {
    file: File;
    id: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}
export interface UploadImagesProps {
    /** 文件选择回调，返回文件对象 */
    onFilesSelected?: (files: File[]) => void;
    /** 上传成功回调，返回图片URL */
    onUploadComplete?: (url: string) => void;
    /** 多文件上传成功回调，返回所有图片URL */
    onUploadCompleteAll?: (urls: string[]) => void;
    /** 是否允许多选 */
    multiple?: boolean;
    /** 接受的文件类型 */
    accept?: string;
    /** 自定义样式类名 */
    className?: string;
    /** 显示进度条 */
    showProgress?: boolean;
    /** 拖拽区域样式 */
    dragAreaClassName?: string;
    /** 自定义上传函数 */
    uploadFunction?: (file: File) => Promise<string>;
}
export declare function UploadImages({ onFilesSelected, onUploadComplete, onUploadCompleteAll, multiple, accept, className, showProgress, dragAreaClassName, uploadFunction, }: UploadImagesProps): import("preact").JSX.Element;
//# sourceMappingURL=UploadImages.d.ts.map