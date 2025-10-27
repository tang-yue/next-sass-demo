"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import CreateApp from "../../new/page";
import { useRouter } from "next/navigation";

export default function NewModal() {
    const router = useRouter();

    return (
        <Dialog 
            open
            onOpenChange={(open) => {
                if (!open) {
                    router.back();
                }
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogTitle className="sr-only">创建新应用</DialogTitle>
                <DialogDescription className="sr-only">
                    创建一个新的应用来管理您的文件
                </DialogDescription>
                <CreateApp />
            </DialogContent>
        </Dialog>
    );
}

