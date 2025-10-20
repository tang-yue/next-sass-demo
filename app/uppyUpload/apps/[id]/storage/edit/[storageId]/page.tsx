"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@/utils/api";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
  bucket: z.string().min(1, "存储桶名称不能为空"),
  region: z.string().min(1, "区域不能为空"),
  accessKeyId: z.string().min(1, "Access Key ID不能为空"),
  secretAccessKey: z.string().min(1, "Secret Access Key不能为空"),
  apiEndpoint: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    id: string;
    storageId: string;
  }>;
}

export default function EditStorageConfigPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resolvedParams = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bucket: "",
      region: "",
      accessKeyId: "",
      secretAccessKey: "",
      apiEndpoint: "",
    },
  });

  // 获取存储配置信息
  const { data: storageData, isLoading, error } = useQuery({
    queryKey: ['storage', 'getById', parseInt(resolvedParams.storageId)],
    queryFn: () => trpcClient.storage.getById.query({ id: parseInt(resolvedParams.storageId) }),
    enabled: !!resolvedParams.storageId
  });

  // 更新表单数据
  useEffect(() => {
    if (storageData?.storage) {
      const storage = storageData.storage;
      form.reset({
        name: storage.name,
        bucket: storage.configuration.bucket,
        region: storage.configuration.region,
        accessKeyId: storage.configuration.accessKeyId,
        secretAccessKey: storage.configuration.secretAccessKey,
        apiEndpoint: storage.configuration.apiEndpoint || "",
      });
    }
  }, [storageData, form]);

  const updateStorageMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { name, bucket, region, accessKeyId, secretAccessKey, apiEndpoint } = data;
      const result = await trpcClient.storage.update.mutate({
        id: parseInt(resolvedParams.storageId),
        name,
        configuration: {
          bucket,
          region,
          accessKeyId,
          secretAccessKey,
          apiEndpoint: apiEndpoint || undefined,
        },
      });
      return result;
    },
    onSuccess: (data: any) => {
      console.log("Storage updated successfully:", data);
      // 清除存储配置缓存
      queryClient.invalidateQueries({ queryKey: ['storage', 'getAll'] });
      queryClient.invalidateQueries({ queryKey: ['storage', 'getById'] });
      // 跳转回存储配置管理页面
      router.push(`/uppyUpload/apps/${resolvedParams.id}/storage`);
    },
    onError: (error: any) => {
      console.error("Failed to update storage:", error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await updateStorageMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error updating storage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToStorage = () => {
    router.push(`/uppyUpload/apps/${resolvedParams.id}/storage`);
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
          <Button onClick={handleBackToStorage} className="mt-4">
            返回存储配置
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={handleBackToStorage}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                返回存储配置
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">编辑存储配置</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">编辑存储配置</CardTitle>
              <CardDescription>
                修改S3兼容的存储服务信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>配置名称</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入配置名称"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bucket"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>存储桶名称</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入存储桶名称"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>区域</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入区域，如：us-east-1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="accessKeyId"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Access Key ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入Access Key ID"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secretAccessKey"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Secret Access Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请输入Secret Access Key"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiEndpoint"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>API端点 (可选)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入API端点，如：https://s3.amazonaws.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleBackToStorage}
                    >
                      返回存储配置
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          更新中...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          更新配置
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
