"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpcClientReact } from "@/utils/api";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
  bucket: z.string().min(1, "存储桶名称不能为空"),
  region: z.string().min(1, "区域不能为空"),
  accessKeyId: z.string().min(1, "Access Key ID不能为空"),
  secretAccessKey: z.string().min(1, "Secret Access Key不能为空"),
  apiEndpoint: z.string().min(1, "API Endpoint不能为空")
});

type FormData = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewStorageConfigPage({ params }: PageProps) {
  const router = useRouter();
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

  const createStorageMutation = trpcClientReact.storage.create.useMutation({
    onSuccess: async (data: any) => {
      console.log("Storage created successfully:", data);
      // 跳转回存储配置管理页面
      router.push(`/uppyUpload/apps/${resolvedParams.id}/storage`);
    },
    onError: (error: any) => {
      console.error("Failed to create storage:", error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { name, bucket, region, accessKeyId, secretAccessKey, apiEndpoint } = data;
      await createStorageMutation.mutateAsync({
        name,
        configuration: {
          bucket,
          region,
          accessKeyId,
          secretAccessKey,
          apiEndpoint: apiEndpoint || undefined,
        },
      });
    } catch (error) {
      console.error("Error creating storage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToStorage = () => {
    router.push(`/uppyUpload/apps/${resolvedParams.id}/storage`);
  };

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
              <h1 className="text-xl font-semibold text-gray-900">创建存储配置</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">创建新存储配置</CardTitle>
              <CardDescription>
                配置S3兼容的存储服务信息
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
                          <FormLabel>Bucket</FormLabel>
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
                          <FormLabel>Region</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入Region，如：ap-shanghai"
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
                        <FormLabel>API Endpoint</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="请输入API Endpoint，如：https://s3.amazonaws.com"
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
                          创建中...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          创建配置
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
