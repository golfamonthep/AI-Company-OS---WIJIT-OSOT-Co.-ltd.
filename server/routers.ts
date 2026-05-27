import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getSiteSettingsMap,
  listProducts,
  updateProduct,
  upsertSiteSettings,
} from "./db";

const productInputSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  subtitle: z.string().max(255).nullish(),
  shortDesc: z.string().nullish(),
  benefits: z.array(z.string()).default([]),
  size: z.string().max(100).nullish(),
  price: z.string().max(50).nullish(),
  promoPrice: z.string().max(100).nullish(),
  rating: z.number().int().min(0).max(50).default(0),
  sold: z.string().max(100).nullish(),
  image: z.string().nullish(),
  category: z.string().max(100).nullish(),
  badge: z.string().max(100).nullish(),
  shopeeUrl: z.string().nullish(),
  tiktokUrl: z.string().nullish(),
  lineUrl: z.string().nullish(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    listPublic: publicProcedure.query(async () => {
      return await listProducts({ activeOnly: true });
    }),
    listAll: adminProcedure.query(async () => {
      return await listProducts();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return await getProductById(input.id);
      }),
    create: adminProcedure.input(productInputSchema).mutation(async ({ input }) => {
      const id = await createProduct(input);
      return { id };
    }),
    update: adminProcedure
      .input(z.object({ id: z.number().int(), data: productInputSchema.partial() }))
      .mutation(async ({ input }) => {
        await updateProduct(input.id, input.data as any);
        return { success: true } as const;
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true } as const;
      }),
  }),

  siteSettings: router({
    getAll: publicProcedure.query(async () => {
      return await getSiteSettingsMap();
    }),
    update: adminProcedure
      .input(
        z.object({
          items: z.array(z.object({ settingKey: z.string().min(1), value: z.string() })),
        }),
      )
      .mutation(async ({ input }) => {
        await upsertSiteSettings(input.items);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
