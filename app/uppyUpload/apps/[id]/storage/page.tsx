"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@/utils/api";
import { ArrowLeft, Plus, Settings, Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StorageConfigPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const [deletingStorageId, setDeletingStorageId] = useState<number | null>(null);

  // 获取应用信息
  const { data: appData } = useQuery({
    queryKey: ['apps', 'getById', resolvedParams.id],
    queryFn: () => trpcClient.app.getById.query({ id: resolvedParams.id }),
  });

  // 获取所有存储配置
  const { data: storagesData, isLoading, error } = useQuery({
    queryKey: ['storage', 'getAll'],
    queryFn: () => trpcClient.storage.getAll.query(),
  });

  // 删除存储配置mutation
  const deleteStorageMutation = useMutation({
    mutationFn: (storageId: number) => trpcClient.storage.delete.mutate({ id: storageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'getAll'] });
      setDeletingStorageId(null);
    },
    onError: (error: any) => {
      console.error('删除存储配置失败:', error);
      alert(error.message || '删除存储配置失败');
    },
  });

  // 更新应用存储配置mutation
  const updateAppStorageMutation = useMutation({
    mutationFn: ({ appId, storageId }: { appId: string; storageId: number | null }) => 
      trpcClient.storage.updateAppStorage.mutate({ appId, storageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps', 'getById', resolvedParams.id] });
      queryClient.invalidateQueries({ queryKey: ['storage', 'getById'] });
    },
  });

  const handleBackToApp = () => {
    router.push(`/uppyUpload/apps/${resolvedParams.id}`);
  };

  const handleCreateNew = () => {
    router.push(`/uppyUpload/apps/${resolvedParams.id}/storage/new`);
  };

  const handleDeleteStorage = (storageId: number) => {
    setDeletingStorageId(storageId);
  };

  const confirmDeleteStorage = () => {
    if (deletingStorageId) {
      deleteStorageMutation.mutate(deletingStorageId);
    }
  };

  const handleSelectStorage = (storageId: number) => {
    updateAppStorageMutation.mutate({
      appId: resolvedParams.id,
      storageId
    });
  };

  const handleRemoveStorage = () => {
    updateAppStorageMutation.mutate({
      appId: resolvedParams.id,
      storageId: null
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">加载存储配置失败</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    );
  }

  const storages = storagesData?.storages || [];
  const currentApp = appData?.app;
  const currentStorageId = currentApp?.storageId;

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToApp}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回应用详情
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {currentApp?.name} - 存储配置
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建存储配置
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 当前配置状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                当前存储配置
              </CardTitle>
              <CardDescription>
                管理此应用的存储配置信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStorageId ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      当前配置：{storages.find(s => s.id === currentStorageId)?.name || '未知配置'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      配置ID: {currentStorageId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveStorage}
                    disabled={updateAppStorageMutation.isPending}
                  >
                    {updateAppStorageMutation.isPending ? "处理中..." : "移除配置"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">当前未配置存储</p>
                  <p className="text-sm text-gray-400 mt-1">请选择一个存储配置</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 存储配置列表 */}
          <Card>
            <CardHeader>
              <CardTitle>可用存储配置</CardTitle>
              <CardDescription>
                选择或管理存储配置
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storages.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无存储配置
                  </h3>
                  <p className="text-gray-600 mb-4">
                    还没有创建任何存储配置
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建存储配置
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {storages.map((storage) => (
                    <Card
                      key={storage.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow relative group ${
                        currentStorageId === storage.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div onClick={() => handleSelectStorage(storage.id)}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {storage.name}
                            {currentStorageId === storage.id && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                当前使用
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {storage.configuration.bucket} ({storage.configuration.region})
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-gray-500">
                            创建时间: {storage.createdAt ? new Date(storage.createdAt).toLocaleDateString() : ''}
                          </p>
                        </CardContent>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/uppyUpload/apps/${resolvedParams.id}/storage/edit/${storage.id}`);
                            }}
                            title="编辑配置"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStorage(storage.id);
                                }}
                                title="删除配置"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <Trash2 className="h-5 w-5 text-red-600" />
                                  确认删除存储配置
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div>
                                    确定要删除存储配置 <strong>"{storage.name}"</strong> 吗？
                                    <br />
                                    此操作无法撤销。
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDeleteStorage}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteStorageMutation.isPending}
                                >
                                  {deleteStorageMutation.isPending ? "删除中..." : "确认删除"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
