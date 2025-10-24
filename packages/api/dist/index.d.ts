export declare const apiClient: import("@trpc/client").TRPCClient<import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("next-auth").Session | null;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    open: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("next-auth").Session | null;
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getFiles: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                page?: number | undefined;
            };
            output: {
                files: {
                    id: string;
                    name: string;
                    type: string;
                    createdAt: Date | null;
                    deletedAt: Date | null;
                    path: string;
                    url: string;
                    userId: string;
                    contentType: string;
                    appId: string;
                }[];
                total: number;
                page: number;
                limit: number;
                app: {
                    id: any;
                    name: any;
                };
            };
            meta: object;
        }>;
        createPresignedUrl: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                contentType: string;
                filename: string;
                size: number;
                storageId?: number | undefined;
            };
            output: {
                url: string;
                method: "PUT";
                app: {
                    id: any;
                    name: any;
                };
            };
            meta: object;
        }>;
        saveFile: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                type: string;
                path: string;
            };
            output: {
                app: {
                    id: any;
                    name: any;
                };
                id: string;
                name: string;
                type: string;
                createdAt: Date | null;
                deletedAt: Date | null;
                path: string;
                url: string;
                userId: string;
                contentType: string;
                appId: string;
            };
            meta: object;
        }>;
        deleteFile: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                fileId: string;
            };
            output: {
                app: {
                    id: any;
                    name: any;
                };
                id: string;
                name: string;
                type: string;
                createdAt: Date | null;
                deletedAt: Date | null;
                path: string;
                url: string;
                userId: string;
                contentType: string;
                appId: string;
            };
            meta: object;
        }>;
        getAppInfo: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                app: {
                    id: any;
                    name: any;
                    description: any;
                    createdAt: any;
                };
                user: {
                    id: any;
                    name: any;
                    email: any;
                };
            };
            meta: object;
        }>;
    }>>;
}>>>;
