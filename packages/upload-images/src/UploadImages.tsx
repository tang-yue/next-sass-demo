import { useState, useRef } from 'preact/hooks';

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

export function UploadImages({
  onFilesSelected,
  onUploadComplete,
  onUploadCompleteAll,
  multiple = true,
  accept = 'image/*',
  className = '',
  showProgress = true,
  dragAreaClassName = '',
  uploadFunction,
}: UploadImagesProps) {
  const [uploadImages, setUploadImages] = useState<UploadImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // 调用文件选择回调
    if (onFilesSelected) {
      onFilesSelected(fileArray);
    }

    const newImages: UploadImage[] = fileArray.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadImages(prev => [...prev, ...newImages]);

    // 开始上传每个文件
    newImages.forEach(uploadImage => {
      if (uploadFunction) {
        uploadImageToServer(uploadImage);
      }
    });
  };

  const uploadImageToServer = async (uploadImage: UploadImage) => {
    try {
      // 模拟进度更新
      const uploadInterval = setInterval(() => {
        setUploadImages(prev =>
          prev.map(img =>
            img.id === uploadImage.id && img.progress < 90
              ? { ...img, progress: img.progress + 10 }
              : img
          )
        );
      }, 200);

      let url: string;

      if (uploadFunction) {
        // 使用自定义上传函数
        url = await uploadFunction(uploadImage.file);
      } else {
        // 生成预览URL（本地预览）
        url = URL.createObjectURL(uploadImage.file);
      }

      clearInterval(uploadInterval);

      setUploadImages(prev =>
        prev.map(img =>
          img.id === uploadImage.id
            ? { ...img, progress: 100, status: 'success', url }
            : img
        )
      );

      // 调用成功回调
      if (onUploadComplete) {
        onUploadComplete(url);
      }

      // 检查是否所有上传完成
      setUploadImages(current => {
        const completed = current.filter(img => img.status === 'success');
        if (completed.length === current.length && onUploadCompleteAll) {
          const urls = completed.map(img => img.url!);
          onUploadCompleteAll(urls);
        }
        return current;
      });

    } catch (error) {
      setUploadImages(prev =>
        prev.map(img =>
          img.id === uploadImage.id
            ? { ...img, status: 'error', error: error instanceof Error ? error.message : '上传失败' }
            : img
        )
      );
    }
  };

  const removeImage = (id: string) => {
    setUploadImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const defaultDragAreaClass = `border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
    isDragOver
      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg scale-[1.02]'
      : 'border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50'
  }`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div
        className={dragAreaClassName || defaultDragAreaClass}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">
            拖拽图片到此处
          </p>
          <p className="text-gray-500 mb-6">或</p>
          <button
            type="button"
            onClick={openFileDialog}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium shadow-md hover:shadow-lg transition-all"
          >
            选择图片
          </button>
          <p className="text-xs text-gray-400 mt-4">
            支持 JPG、PNG、GIF 等格式
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileSelect((e.target as HTMLInputElement).files)}
        />
      </div>

      {/* 上传进度 */}
      {uploadImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-700">上传进度</h3>
            <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
          {uploadImages.map((uploadImage) => (
            <div key={uploadImage.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    uploadImage.status === 'success' ? 'bg-green-100' :
                    uploadImage.status === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {uploadImage.status === 'success' ? (
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    ) : uploadImage.status === 'error' ? (
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {uploadImage.file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(uploadImage.id)}
                  className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {showProgress && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      uploadImage.status === 'success' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      uploadImage.status === 'error' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                      'bg-gradient-to-r from-blue-400 to-purple-600'
                    }`}
                    style={{ width: `${uploadImage.progress}%` }}
                  />
                </div>
              )}
              
              {uploadImage.status === 'error' && uploadImage.error && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <svg className="h-4 w-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-600">{uploadImage.error}</p>
                </div>
              )}
              
              {uploadImage.status === 'success' && uploadImage.url && (
                <div className="mt-3 rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                  <img
                    src={uploadImage.url}
                    alt={uploadImage.file.name}
                    className="w-full max-h-40 object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

