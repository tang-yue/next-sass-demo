import * as _trpc_server from '@trpc/server';
import * as next_auth from 'next-auth';

declare const openRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: {
        session: next_auth.Session | null;
    };
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: false;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    open: _trpc_server.TRPCBuiltRouter<{
        ctx: {
            session: next_auth.Session | null;
        };
        meta: object;
        errorShape: _trpc_server.TRPCDefaultErrorShape;
        transformer: false;
    }, _trpc_server.TRPCDecorateCreateRouterOptions<{
        getFiles: _trpc_server.TRPCQueryProcedure<{
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
        createPresignedUrl: _trpc_server.TRPCMutationProcedure<{
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
        saveFile: _trpc_server.TRPCMutationProcedure<{
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
        deleteFile: _trpc_server.TRPCMutationProcedure<{
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
        getAppInfo: _trpc_server.TRPCQueryProcedure<{
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
}>>;
type OpenRouter = typeof openRouter;

export type { OpenRouter };
