"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Plus, Upload } from "lucide-react";

export default function UppyUploadPage() {
  const router = useRouter();

  const handleGoToApps = () => {
    router.push("/uppyUpload/apps");
  };

  const handleGoToNewApp = () => {
    router.push("/uppyUpload/apps/new");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">文件管理系统</h1>
          <p className="text-xl text-gray-600">管理您的应用和文件</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 应用管理卡片 */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGoToApps}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>应用管理</CardTitle>
              <CardDescription>
                查看和管理您的所有应用
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                进入应用管理
              </Button>
            </CardContent>
          </Card>

          {/* 创建新应用卡片 */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleGoToNewApp}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>创建新应用</CardTitle>
              <CardDescription>
                创建一个新的应用来管理文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                创建新应用
              </Button>
            </CardContent>
        </Card>

          {/* 文件上传卡片 */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-purple-600" />
            </div>
              <CardTitle>文件上传</CardTitle>
              <CardDescription>
                直接上传文件到系统
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                上传文件
              </Button>
            </CardContent>
          </Card>
                            </div>

        {/* 功能说明 */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>系统功能说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-lg mb-2">应用管理</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 创建和管理多个应用</li>
                    <li>• 每个应用独立管理文件</li>
                    <li>• 应用间快速切换</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">文件管理</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 支持多种文件类型</li>
                    <li>• 文件预览和下载</li>
                    <li>• 文件分类管理</li>
                  </ul>
            </div>
            </div>
            </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}