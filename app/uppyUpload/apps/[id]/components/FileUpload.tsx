"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
  appId: string;
  onUploadComplete?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUpload({ appId, onUploadComplete }: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const createPresignedUrlMutation = useMutation({
    mutationFn: (data: { filename: string; contentType: string; size: number }) =>
      trpcClient.file.createPresignedUrl.mutate(data),
  });

  const saveFileMutation = useMutation({
    mutationFn: (data: { name: string; path: string; type: string; appId: string }) =>
      trpcClient.file.saveFile.mutate(data),
    onSuccess: () => {
      console.log('File saved successfully, invalidating queries for appId:', appId);
      queryClient.invalidateQueries({ 
        queryKey: ['files', 'getFilesByAppId', appId],
        exact: false // 清除所有包含这个 queryKey 的查询
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // 开始上传每个文件
    newFiles.forEach(uploadFile => {
      uploadFileToS3(uploadFile);
    });
  };

  const uploadFileToS3 = async (uploadFile: UploadFile) => {
    try {
      // 1. 获取预签名URL
      const presignedData = await createPresignedUrlMutation.mutateAsync({
        filename: uploadFile.file.name,
        contentType: uploadFile.file.type,
        size: uploadFile.file.size,
      });

      // 2. 上传到S3
      const response = await fetch(presignedData.url, {
        method: 'PUT',
        body: uploadFile.file,
        headers: {
          'Content-Type': uploadFile.file.type,
        },
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      // 3. 保存文件信息到数据库
      // 清理URL，去掉查询参数，只保留路径部分
      const cleanUrl = new URL(presignedData.url);
      const cleanPath = cleanUrl.origin + cleanUrl.pathname;
      
      await saveFileMutation.mutateAsync({
        name: uploadFile.file.name,
        path: cleanPath,
        type: uploadFile.file.type,
        appId,
      });

      // 4. 更新状态为成功
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, progress: 100, status: 'success' }
            : f
        )
      );

      // 5. 触发上传完成回调
      onUploadComplete?.();

      // 6. 3秒后移除成功项
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.id !== uploadFile.id));
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : '上传失败' }
            : f
        )
      );
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传文件
          </CardTitle>
          <CardDescription>
            拖拽文件到此处或点击选择文件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              拖拽文件到此处
            </p>
            <p className="text-gray-600 mb-4">
              或
            </p>
            <Button onClick={openFileDialog}>
              选择文件
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 上传进度 */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">上传进度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1">
                    {uploadFile.file.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={uploadFile.progress} className="h-2" />
                {uploadFile.status === 'error' && uploadFile.error && (
                  <p className="text-xs text-red-600">{uploadFile.error}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
