"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpcClientReact } from "@/utils/api";
import { Plus, FolderOpen, Trash2, AlertTriangle } from "lucide-react";
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

export default function AppsPage() {
  const router = useRouter();
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);

  // 使用 TRPC React Query hooks
  const { data: appsData, isLoading, error, refetch } = trpcClientReact.app.getAll.useQuery();

  // 删除应用mutation
  const deleteAppMutation = trpcClientReact.app.delete.useMutation({
    onSuccess: () => {
      setDeletingAppId(null);
      refetch();
    },
    onError: (error: any) => {
      console.error('删除应用失败:', error);
      alert(error.message || '删除应用失败');
    },
  });

  // 获取应用文件数量
  const { data: filesCountData } = trpcClientReact.app.getFilesCount.useQuery(
    { id: deletingAppId! },
    { enabled: !!deletingAppId }
  );

  const handleAppSelect = (appId: string) => {
    setSelectedAppId(appId);
    if (appId) {
      router.push(`/uppyUpload/apps/${appId}`);
    }
  };

  const handleCreateNew = () => {
    router.push("/uppyUpload/apps/new");
  };

  const handleDeleteApp = (appId: string) => {
    setDeletingAppId(appId);
  };

  const confirmDeleteApp = () => {
    if (deletingAppId) {
      deleteAppMutation.mutate({ id: deletingAppId });
    }
  };

  const filesCount = filesCountData?.count || 0;

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
                    ''
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
                  className="hover:shadow-md transition-shadow relative group"
                >
                  <div onClick={() => handleAppSelect(app.id)} className="cursor-pointer">
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
                  </div>
                  
                  {/* 删除按钮 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApp(app.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            确认删除应用
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            {filesCount > 0 ? (
                              <div className="space-y-2">
                                <p className="text-red-600 font-medium">
                                  无法删除此应用！
                                </p>
                                <p>
                                  该应用下还有 <strong>{filesCount}</strong> 个文件。
                                  请先删除应用下的所有文件，然后再删除应用。
                                </p>
                              </div>
                            ) : (
                              <div>
                                确定要删除应用 <strong>"{app.name}"</strong> 吗？
                                <br />
                                此操作无法撤销。
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          {filesCount === 0 && (
                            <AlertDialogAction
                              onClick={confirmDeleteApp}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteAppMutation.isPending}
                            >
                              {deleteAppMutation.isPending ? "删除中..." : "确认删除"}
                            </AlertDialogAction>
                          )}
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
