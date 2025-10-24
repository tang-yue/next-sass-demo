"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpcClientReact } from "@/utils/api";

const formSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(100, "名称不能超过100个字符"),
  description: z.string().max(500, "描述不能超过500个字符").optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewAppPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createAppMutation = trpcClientReact.app.create.useMutation({
    onSuccess: (data: any) => {
      console.log("App created successfully:", data);
      router.push(`/uppyUpload/apps/${data.app.id}`);
    },
    onError: (error: any) => {
      console.error("Failed to create app:", error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await createAppMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error creating app:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">创建新应用</CardTitle>
            <CardDescription>
              创建一个新的应用来管理您的文件
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
                      <FormLabel>应用名称</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入应用名称"
                          {...field}
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>应用描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入应用描述（可选）"
                          className="min-h-[100px]"
                          {...field}
                          maxLength={500}
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
                    onClick={() => router.push('/uppyUpload/apps')}
                  >
                    返回应用列表
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "创建中..." : "创建应用"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
