// import Image from "next/image";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usersTable } from "@/server/db/schema-back";
import { db } from "@/server/db/db";
import { UserInfo, UserInfoProvider } from "./UserInfo";
import { LoginButton } from "./LoginButton";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";

type User = typeof usersTable.$inferSelect;

export default async function Home() {
  // 获取现有用户，而不是每次都插入新数据
  // let users: User[] = [];
  // const session = await getServerSession()

  // console.log(session)
  // if (!session?.user) {
  //   console.log("no session")
  //   redirect("/api/auth/signin")
  // }
  // try {
  //   users = await db.query.usersTable.findMany();
    
  //   // 只有在没有用户时才插入示例数据
  //   if (users.length === 0) {
  //     await db.insert(usersTable).values([
  //       {
  //         name: 'John',
  //         age: 30,
  //         email: 'john@example.com',
  //       },
  //     ]);
  //     // 重新获取用户列表
  //     users = await db.query.usersTable.findMany();
  //   }
  // } catch (error) {
  //   console.error('Database error:', error);
  //   users = [];
  // }
  
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
