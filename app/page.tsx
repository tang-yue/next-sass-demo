// import Image from "next/image";
'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usersTable } from "@/server/db/schema-back";
import { db } from "@/server/db/db";
import { UserInfo, UserInfoProvider } from "./UserInfo";
import { LoginButton } from "./LoginButton";
// import { getServerSession } from "@/server/auth";
// import { redirect } from "next/navigation";
import { cache, useEffect   } from "react";
import { useQuery, dehydrate } from "@tanstack/react-query";
import { makeQueryClient, useTRPC } from "./TrpcProvider";
import { success } from "zod/v4";
// import { trpc } from "@/utils/api";

// type User = typeof usersTable.$inferSelect;

export default function Home() {
  // 获取现有用户，而不是每次都插入新数据
 
  const trpc = useTRPC();
  const { data, isLoading, error, isSuccess } = useQuery(trpc.hello.queryOptions());
  // if (isSuccess) {
    console.log(data, "data isSuccess")
  // }
  // const _queryClient = cache(makeQueryClient);
  // void _queryClient().prefetchQuery(trpc.hello.queryOptions());
  // const queryClient = _queryClient();
  // const { data } = useQuery(trpc.hello.queryOptions());
  // console.log(data, "data")
  // console.log(dehydrate(_queryClient), "dehydrate")
  return (
    <UserInfoProvider>
      <div className="h-screen flex flex-col gap-8 p-4">
        <form className="w-full flex flex-col gap-4 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-center">Hello World</h1>
          <p className="text-sm text-gray-500 text-center">🚀 CI/CD 自动化测试</p>
          <Input name="name" type="text" placeholder="Enter your name" />
          <Textarea name="message" placeholder="Enter your message" />
          <Button type="submit">Submit</Button>
        </form>
        
        {/* GitHub 登录区域 */}
        <div className="w-full max-w-xl mx-auto">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">GitHub 认证</h2>
            <LoginButton />
          </div>
        </div>

        {/* 用户信息区域 */}
        <div className="w-full max-w-xl mx-auto">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">用户信息</h2>
            <UserInfo />
          </div>
        </div>

         {/* <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
           <h2 className="text-xl font-semibold">Users:</h2>
           {users.length > 0 ? (
             users.map((user) => (
               <div key={user.id} className="p-4 border rounded-lg">
                 <p><strong>Name:</strong> {user.name}</p>
                 <p><strong>Age:</strong> {user.age}</p>
                 <p><strong>Email:</strong> {user.email}</p>
               </div>
             ))
           ) : (
             <p className="text-gray-500">No users found. Make sure to run database migrations.</p>
           )}
         </div> */}
      </div>
    </UserInfoProvider>
  );
}
