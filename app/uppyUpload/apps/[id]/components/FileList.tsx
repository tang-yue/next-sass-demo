"use client";

import { useState } from "react";
import { trpcClientReact } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  File,
  Video,
  Music,
  Archive,
  Copy,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface FileListProps {
  appId: string;
}

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
  if (contentType.startsWith('video/')) return <Video className="h-5 w-5" />;
  if (contentType.startsWith('audio/')) return <Music className="h-5 w-5" />;
  if (contentType.includes('zip') || contentType.includes('rar')) return <Archive className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileList({ appId }: FileListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const limit = 10;

  console.log('FileList component rendered, appId:', appId, 'currentPage:', currentPage);

  // 使用 TRPC React Query hooks
  const { data: filesData, isLoading, error, refetch } = trpcClientReact.file.getFilesByAppId.useQuery({
    appId,
    page: currentPage,
    limit
  });

  const deleteFileMutation = trpcClientReact.file.deleteFile.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      console.error('删除文件失败:', error);
      alert(error.message || '删除文件失败');
    },
  });

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (fileId: string) => {
    if (confirm('确定要删除这个文件吗？')) {
      deleteFileMutation.mutate({ fileId });
    }
  };

  const handleCopyLink = async (url: string, fileId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFileId(fileId);
      // 2秒后重置复制状态
      setTimeout(() => {
        setCopiedFileId(null);
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：使用传统的复制方法
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedFileId(fileId);
      setTimeout(() => {
        setCopiedFileId(null);
      }, 2000);
    }
  };

  const isImageFile = (contentType: string) => {
    return contentType.startsWith('image/');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">加载文件中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">加载文件列表失败</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          重试
        </Button>
      </div>
    );
  }

  const files = filesData?.files || [];
  const total = filesData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* 文件统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">文件列表</h3>
          <Badge variant="secondary">
            共 {total} 个文件
          </Badge>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="h-75 overflow-y-auto border rounded-lg">
        {files.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无文件
              </h3>
              <p className="text-gray-600">
                还没有上传任何文件到该应用
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {files.map((file: any) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow py-2">
                <CardContent className="p-4 py-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500">
                        {getFileIcon(file.contentType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{file.contentType}</span>
                          <span>
                            {file.createdAt ? formatDistanceToNow(new Date(file.createdAt), { 
                              addSuffix: true, 
                              locale: zhCN 
                            }) : '未知时间'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file.url, file.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {isImageFile(file.contentType) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(file.url, file.id)}
                          className={copiedFileId === file.id ? "text-green-600" : "text-blue-600 hover:text-blue-700"}
                          title="复制图片链接"
                        >
                          {copiedFileId === file.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <span className="text-sm text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
