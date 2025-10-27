import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { openRouter } from '@/server/open-router';
import { Session } from 'next-auth';

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 允许所有域名，生产环境应该指定具体域名
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, api-key, signed-token',
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
    endpoint: "/api/open",
    router: openRouter,
    req,
    createContext: async () => ({ session: null } as { session: Session | null }),
  });

  // 添加CORS头到响应
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST, handler as OPTIONS };