"use client";

import { use, useState } from "react";
import { trpcClientReact } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, KeyRound, ArrowLeft, Trash2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApiKeysPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  // 使用 TRPC React Query hooks
  const { data, isLoading, error, refetch } = trpcClientReact.apiKeys.getByAppId.useQuery({ 
    appId: resolvedParams.id 
  });

  const createMutation = trpcClientReact.apiKeys.create.useMutation({
    onSuccess: async () => {
      setName("");
      // 使用 refetch 方法刷新数据
      await refetch();
    },
  });

  const deleteMutation = trpcClientReact.apiKeys.delete.useMutation({
    onSuccess: async () => {
      // 使用 refetch 方法刷新数据
      await refetch();
    },
  });

  const list = data?.apiKeys || [];

  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/uppyUpload/apps/${resolvedParams.id}`)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回应用详情
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">API Keys</h1>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  新建 API Key
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">名称</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="给你的Key起个名字" />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!name || createMutation.isPending}
                    onClick={() => createMutation.mutate({ appId: resolvedParams.id, name })}
                  >
                    {createMutation.isPending ? '创建中...' : '创建'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              当前应用的 API Keys
            </CardTitle>
            <CardDescription>仅显示未删除的 Keys</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>加载中...</p>
            ) : error ? (
              <p className="text-red-600">加载失败</p>
            ) : list.length === 0 ? (
              <p className="text-gray-500">暂无 Key，点击右上角创建。</p>
            ) : (
              <div className="space-y-3">
                {list.map((k: any) => (
                  <div key={k.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium">{k.name}</div>
                      <div className="text-xs text-gray-500 break-all">api-key: {k.key}</div>
                      <div className="text-xs text-gray-500 break-all">clientId: {k.clientId}</div>
                      <div className="text-xs text-gray-400 mt-1">创建时间：{k.createdAt ? new Date(k.createdAt).toLocaleString() : ''}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700" 
                      onClick={() => deleteMutation.mutate({ id: k.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


