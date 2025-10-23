import { fileRoutes } from "./routes/file";
import { openFileRoutes } from "./routes/open-file";
import { router } from "./trpc";

export const openRouter = router({
    open: openFileRoutes,
});

export type OpenRouter = typeof openRouter;
