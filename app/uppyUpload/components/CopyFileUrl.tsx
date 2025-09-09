"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { App } from "antd";

interface CopyFileUrlProps {
  fileUrl: string;
  fileName: string;
  disabled?: boolean;
}

export function CopyFileUrl({ 
  fileUrl, 
  fileName, 
  disabled = false 
}: CopyFileUrlProps) {
  const [copied, setCopied] = useState(false);
  const { message } = App.useApp();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      setCopied(true);
      console.log('复制的fileName', fileName);
      message.success(`已复制“${fileName}”的文件地址`);
      
      // 2秒后重置状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("复制失败:", error);
      message.error("复制失败，请手动复制");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      disabled={disabled}
      className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">
        {copied ? "已复制" : "复制文件地址"}
      </span>
    </Button>
  );
}
