import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { adAnalysisRouter } from "./routers/adAnalysis";
import { adCopyRouter } from "./routers/adCopy";
import { metaRouter } from "./routers/meta";
import { budgetAlertRouter } from "./routers/budgetAlert";
import { reportRouter } from "./routers/report";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  adAnalysis: adAnalysisRouter,
  adCopy: adCopyRouter,
  meta: metaRouter,
  budgetAlert: budgetAlertRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
