"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * 开放API测试组件
 * 演示如何使用API Key访问开放的文件管理接口
 * 
 * 功能说明：
 * 1. 第三方应用通过API Key进行身份验证
 * 2. 无需用户登录即可访问文件管理功能
 * 3. 所有操作都基于API Key关联的应用进行权限控制
 */
export default function OpenApiTestComponent() {
    const [apiKey, setApiKey] = useState("");
    const [testResults, setTestResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    // 模拟API调用 - 在实际使用中，第三方应用需要设置请求头
    const makeApiCall = async (endpoint: string, method: string = "GET", body?: any) => {
        let url = `/api/open/${endpoint}`;
        const options: RequestInit = {
            method,
            headers: {
                "api-key": apiKey,
            },
        };

        if (method === "GET" && body) {
            // GET请求将参数添加到URL查询字符串
            const params = new URLSearchParams();
            params.append("input", JSON.stringify(body));
            url += `?${params.toString()}`;
        } else if (method === "POST" && body) {
            // POST请求添加Content-Type和请求体
            options.headers!["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        return response.json();
    };

    const runTest = async (testName: string, testFn: () => Promise<any>) => {
        if (!apiKey.trim()) {
            alert("请输入API Key");
            return;
        }

        setLoading(true);
        try {
            const result = await testFn();
            setTestResults(prev => ({
                ...prev,
                [testName]: { success: true, data: result }
            }));
        } catch (error: any) {
            setTestResults(prev => ({
                ...prev,
                [testName]: { success: false, error: error.message }
            }));
        } finally {
            setLoading(false);
        }
    };

    const tests = [
        {
            name: "getAppInfo",
            label: "获取应用信息",
            description: "通过API Key获取关联应用的基本信息",
            fn: () => makeApiCall("open.getAppInfo")
        },
        {
            name: "getFiles",
            label: "获取文件列表",
            description: "获取应用下的所有文件列表",
            fn: () => makeApiCall("open.getFiles", "GET", { page: 1, limit: 10 })
        },
        {
            name: "createPresignedUrl",
            label: "创建上传URL",
            description: "生成文件上传的预签名URL",
            fn: () => makeApiCall("open.createPresignedUrl", "POST", {
                filename: "test-file.jpg",
                contentType: "image/jpeg",
                size: 1024
            })
        }
    ];

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">开放API测试</h1>
                <p className="text-gray-600">
                    测试第三方应用通过API Key访问文件管理接口的功能
                </p>
            </div>

            <Alert>
                <AlertDescription>
                    <strong>使用说明：</strong>
                    这个测试页面演示了开放API的使用方式。第三方应用可以通过API Key进行身份验证，
                    无需用户登录即可访问文件管理功能。所有操作都基于API Key关联的应用进行权限控制。
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>API Key 配置</CardTitle>
                    <CardDescription>
                        请输入有效的API Key进行测试
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="请输入API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test) => (
                    <Card key={test.name}>
                        <CardHeader>
                            <CardTitle className="text-lg">{test.label}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => runTest(test.name, test.fn)}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? "测试中..." : "运行测试"}
                            </Button>
                            
                            {testResults[test.name] && (
                                <div className="mt-4">
                                    <div className={`text-sm font-medium mb-2 ${
                                        testResults[test.name].success ? "text-green-600" : "text-red-600"
                                    }`}>
                                        {testResults[test.name].success ? "✅ 成功" : "❌ 失败"}
                                    </div>
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                        {JSON.stringify(
                                            testResults[test.name].data || testResults[test.name].error,
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>实现说明</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">修改理由：</h3>
                        <ul className="text-sm space-y-1 text-gray-600">
                            <li>• <strong>扩展功能：</strong>在现有用户登录系统基础上，新增API Key认证方式</li>
                            <li>• <strong>第三方集成：</strong>允许第三方应用无需用户登录即可访问文件管理功能</li>
                            <li>• <strong>权限控制：</strong>通过API Key关联应用，确保数据隔离和安全性</li>
                            <li>• <strong>向后兼容：</strong>不影响现有的用户登录功能，两者并存</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-2">技术实现：</h3>
                        <ul className="text-sm space-y-1 text-gray-600">
                            <li>• <strong>中间件：</strong>创建withApiKeyMiddleware处理API Key认证</li>
                            <li>• <strong>数据库查询：</strong>通过API Key查询关联的应用和用户信息</li>
                            <li>• <strong>权限控制：</strong>所有操作基于API Key关联的应用进行权限验证</li>
                            <li>• <strong>路由分离：</strong>开放API使用独立的路由命名空间(/open)</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">使用方式：</h3>
                        <div className="bg-gray-100 p-3 rounded text-sm space-y-3">
                            <div>
                                <p className="font-medium text-gray-700 mb-1">获取文件列表 (GET):</p>
                                <pre className="whitespace-pre-wrap text-xs">
{`curl -H "api-key: YOUR_API_KEY" \\
     "http://localhost:3000/api/trpc/open.getFiles?input=%7B%22page%22%3A1%2C%22limit%22%3A10%7D"`}
                                </pre>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-1">创建上传URL (POST):</p>
                                <pre className="whitespace-pre-wrap text-xs">
{`curl -H "api-key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -X POST \\
     -d '{"filename":"test-file.jpg","contentType":"image/jpeg","size":1024}' \\
     http://localhost:3000/api/trpc/open.createPresignedUrl`}
                                </pre>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-1">获取应用信息 (GET):</p>
                                <pre className="whitespace-pre-wrap text-xs">
{`curl -H "api-key: YOUR_API_KEY" \\
     "http://localhost:3000/api/trpc/open.getAppInfo"`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}