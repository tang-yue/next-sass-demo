"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="flex items-center space-x-2"
        >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">退出登录</span>
        </Button>
    );
}
