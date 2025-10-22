"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@/utils/api";
import { ArrowLeft, Plus, FolderOpen, Upload, Settings } from "lucide-react";
import FileList from "./components/FileList";
import FileUpload from "./components/FileUpload";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AppDetailPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const [selectedAppId, setSelectedAppId] = useState<string>(resolvedParams.id);
  const [activeTab, setActiveTab] = useState<'files' | 'upload'>('files');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['apps', 'getAll'],
    queryFn: () => trpcClient.app.getAll.query(),
    staleTime: 0, // 确保数据不会被认为是"新鲜的"
    refetchOnMount: true, // 组件挂载时重新获取数据
    refetchOnWindowFocus: true, // 窗口获得焦点时重新获取数据
  });
  const { data: appData, isLoading: appLoading, error: appError } = useQuery({
    queryKey: ['apps', 'getById', resolvedParams.id],
    queryFn: () => trpcClient.app.getById.query({ id: resolvedParams.id }),
    enabled: !!resolvedParams.id
  });

  // 获取存储配置信息
  const { data: storageData } = useQuery({
    queryKey: ['storage', 'getById', appData?.app?.storageId],
    queryFn: () => trpcClient.storage.getById.query({ id: appData?.app?.storageId! }),
    enabled: !!appData?.app?.storageId
  });

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    if (appId && appId !== resolvedParams.id) {
      router.push(`/uppyUpload/apps/${appId}`);
    }
  };

  const handleCreateNew = () => {
    router.push("/uppyUpload/apps/new");
  };

  const handleBackToApps = () => {
    router.push("/uppyUpload/apps");
  };

  const handleStorageConfig = () => {
    router.push(`/uppyUpload/apps/${resolvedParams.id}/storage`);
  };

  const handleUploadComplete = () => {
    console.log('handleUploadComplete');
    setActiveTab('files');
    // 直接清除文件列表的查询缓存
    queryClient.invalidateQueries({ 
      queryKey: ['files', 'getFilesByAppId', resolvedParams.id],
      exact: false 
    });
    setRefreshKey(prev => prev + 1); // 触发文件列表重新加载
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (appError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">应用不存在或无权限访问</p>
          <Button onClick={handleBackToApps} className="mt-4">
            返回应用列表
          </Button>
        </div>
      </div>
    );
  }

  const apps = appsData?.apps || [];
  const currentApp = appData?.app;
  const currentStorage = storageData?.storage;

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
                onClick={handleBackToApps}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回应用列表
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {currentApp?.name || "应用详情"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* 应用切换下拉框 */}
              <Select value={selectedAppId} onValueChange={handleAppSelect}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="切换应用" />
                </SelectTrigger>
                <SelectContent>
                  {apps
                    .filter((app) => app.id && app.id.trim() !== '') // 过滤掉空值或空字符串
                    .map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建应用
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentApp && (
          <div className="space-y-6 py-6">
            {/* 应用信息卡片 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    {currentApp.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/uppyUpload/apps/${resolvedParams.id}/api-key`)}
                  >
                    查看 API Keys
                  </Button>
                </div>
                {currentApp.description && (
                  <div className="text-sm text-gray-600 flex flex-row gap-2">
                    <CardDescription>描述：{currentApp.description}</CardDescription>
                    <CardDescription>应用id：{currentApp.id}</CardDescription>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">存储配置：</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {currentStorage ? currentStorage.name : "未配置"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStorageConfig}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {currentStorage ? "更换配置" : "配置存储"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 文件管理区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  文件管理
                </CardTitle>
                <CardDescription>
                  管理此应用下的所有文件
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 标签页切换 */}
                <div className="flex space-x-1 mb-6">
                  <Button
                    variant={activeTab === 'files' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('files')}
                  >
                    文件列表
                  </Button>
                  <Button
                    variant={activeTab === 'upload' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('upload')}
                  >
                    上传文件
                  </Button>
                </div>

                {/* 内容区域 */}
                {activeTab === 'files' ? (
                  <FileList key={refreshKey} appId={resolvedParams.id} />
                ) : (
                  <FileUpload 
                    appId={resolvedParams.id} 
                    onUploadComplete={handleUploadComplete}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
