import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from "@/server/router";
import { getServerSession } from '@/server/auth';

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 允许所有域名，生产环境应该指定具体域名
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, api-key',
  'Access-Control-Max-Age': '86400', // 24小时
};

const handler = async (req: Request) => {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => ({
      session: await getServerSession(),
    }),
  });

  // 添加CORS头到响应
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST, handler as OPTIONS };