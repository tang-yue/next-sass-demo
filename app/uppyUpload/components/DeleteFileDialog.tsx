"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { App } from "antd";

interface DeleteFileDialogProps {
  fileId: string;
  fileName: string;
  onDelete: (fileId: string) => Promise<void>;
  disabled?: boolean;
}

export function DeleteFileDialog({ 
  fileId, 
  fileName, 
  onDelete, 
  disabled = false 
}: DeleteFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { message } = App.useApp();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(fileId);
      setOpen(false);
    } catch (error) {
      console.error("删除文件失败:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">删除文件</span>
      </Button>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除文件</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除文件 <strong>"{fileName}"</strong> 吗？
            <br />
            此操作不可撤销，文件将被移动到回收站。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            {isDeleting ? "删除中..." : "删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
