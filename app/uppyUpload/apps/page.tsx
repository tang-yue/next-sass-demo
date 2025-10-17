"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@/utils/api";
import { Plus, FolderOpen } from "lucide-react";

export default function AppsPage() {
  const router = useRouter();
  const [selectedAppId, setSelectedAppId] = useState<string>("");

  const { data: appsData, isLoading, error } = useQuery({
    queryKey: ['apps', 'getAll'],
    queryFn: () => trpcClient.app.getAll.query(),
  });

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    if (appId) {
      router.push(`/uppyUpload/apps/${appId}`);
    }
  };

  const handleCreateNew = () => {
    router.push("/uppyUpload/apps/new");
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
          <p className="text-red-600">加载应用列表失败</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    );
  }

  const apps = appsData?.apps || [];

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的应用</h1>
          <p className="mt-2 text-gray-600">选择或创建一个应用来管理您的文件</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 应用选择卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                选择应用
              </CardTitle>
              <CardDescription>
                从下拉列表中选择一个现有的应用
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedAppId} onValueChange={handleAppSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择一个应用" />
                </SelectTrigger>
                <SelectContent>
                  {apps.length === 0 ? (
                    <SelectItem value="" disabled>
                      暂无应用
                    </SelectItem>
                  ) : (
                    apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedAppId && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleAppSelect(selectedAppId)}
                    className="w-full"
                  >
                    进入应用
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 创建新应用卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                创建新应用
              </CardTitle>
              <CardDescription>
                创建一个新的应用来开始管理文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateNew}
                className="w-full"
                size="lg"
              >
                创建新应用
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 应用列表 */}
        {apps.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">所有应用</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <Card
                  key={app.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAppSelect(app.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    {app.description && (
                      <CardDescription className="text-sm">
                        {app.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-500">
                      创建时间: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
