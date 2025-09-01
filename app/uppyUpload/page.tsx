"use client";
import { Uppy } from '@uppy/core';
import AWSS3 from '@uppy/aws-s3';
import { useEffect, useState } from 'react';
import { useUppyState } from './useUppyState';
import { Upload, Button, Card, Image, message, Spin } from 'antd';
import { InboxOutlined, FileOutlined } from '@ant-design/icons';
import { trpcClient } from '@/utils/api';
import type { UploadFile, UploadProps } from 'antd';
import styles from './page.module.css';
import { useQuery } from '@tanstack/react-query';

export default function UppyUpload() {
  const [uppy, setUppy] = useState(() => {
    const uppy = new Uppy();
    uppy.use(AWSS3, {
      shouldUseMultipart: false,
      getUploadParameters(file) {
        return trpcClient.file.createPresignedUrl.mutate({
          filename: file.name || "",
          contentType: file.type || "",
          size: file.size || 0,
        });
      },
    });
    return uppy;
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取已上传的文件列表
  const { data: filesData, refetch } = useQuery({
    queryKey: ['files'],
    queryFn: () => trpcClient.file.getFiles.query({
      page: 1,
      limit: 50,
    }),
  });

  useEffect(() => {
    const handler = (file: any, resp: { uploadURL?: string }) => {
      if (file) {
        trpcClient.file.saveFile.mutate({
          name: file.data instanceof File ? file.data.name : "test",
          path: resp.uploadURL ?? "",
          type: file.data.type,
        }).then(() => {
          message.success('文件上传成功！');
          refetch(); // 重新获取文件列表
        }).catch(() => {
          message.error('文件保存失败！');
        });
      }
    };
    uppy.on("upload-success", handler);

    return () => {
      uppy.off("upload-success", handler);
    };
  }, [uppy, refetch]);

  const files = useUppyState(uppy, (s) => Object.values(s.files));
  const progress = useUppyState(uppy, (s) => s.totalProgress);

  // 自定义上传处理
  const customRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      setLoading(true);
      const fileObj = file as File;
      
      // 添加到 Uppy
      uppy.addFile({
        data: fileObj,
        name: fileObj.name,
      });
      
      // 开始上传
      await uppy.upload();
      
      onSuccess?.('ok');
    } catch (error) {
      onError?.(error as Error);
      message.error('上传失败！');
    } finally {
      setLoading(false);
    }
  };

  // 判断是否为图片
  const isImage = (contentType: string) => {
    return contentType.startsWith('image/');
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">文件上传管理</h1>
        
        {/* 上传区域 */}
        <Card className="mb-8">
          <Upload.Dragger
            name="file"
            multiple
            customRequest={customRequest}
            showUploadList={false}
            pastable={true}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className={styles.uploadDragger}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-4xl text-blue-500" />
            </p>
            <p className="ant-upload-text text-lg font-medium">
              点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint text-gray-500">
              支持单个或批量上传。支持图片、PDF、Word文档等格式
            </p>
          </Upload.Dragger>
          
          {progress > 0 && progress < 100 && (
            <div className="mt-4">
              <div className="text-center text-sm text-gray-600 mb-2">
                上传进度: {Math.round(progress)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${styles.progressBar}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </Card>

        {/* 文件预览区域 */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">已上传文件</h2>
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <div className={styles.masonryContainer}>
              {filesData?.files?.map((file: any) => (
                <div key={file.id} className={styles.masonryItem}>
                  <Card 
                    size="small" 
                    className={styles.fileCard}
                    cover={
                      isImage(file.contentType) ? (
                        <Image
                          src={file.url}
                          alt={file.name}
                          width={100}
                          height={100}
                          className="object-cover"
                          placeholder={
                            <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                              <Spin />
                            </div>
                          }
                        />
                      ) : (
                        <div className={`w-full h-24 ${styles.filePlaceholder}`}>
                          <FileOutlined className="text-2xl text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500 truncate px-2">
                            {file.name}
                          </span>
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={
                        <span className="text-sm font-medium truncate block" title={file.name}>
                          {file.name}
                        </span>
                      }
                      description={
                        <div className="text-xs text-gray-500">
                          <div>{file.contentType}</div>
                          <div>{new Date(file.createdAt).toLocaleDateString()}</div>
                        </div>
                      }
                    />
                  </Card>
                </div>
              ))}
            </div>
          )}
          
          {filesData?.files?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无上传文件
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}