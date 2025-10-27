import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const user = session.user as { name?: string; email?: string; image?: string };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with user avatar */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                               文件管理系统
                            </h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage 
                                        src={user.image || ""} 
                                        alt={user.name || "User"} 
                                    />
                                    <AvatarFallback>
                                        {user.name?.charAt(0).toUpperCase() || 
                                         user.email?.charAt(0).toUpperCase() || 
                                         "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                {children}
            </main>
        </div>
    );
}