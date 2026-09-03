import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  gratitude: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserGratitudeEntries(ctx.user.id)),
    sync: protectedProcedure
      .input(z.object({ entries: z.array(z.object({ id: z.string().max(64), text: z.string().min(1).max(1000), createdAt: z.coerce.date() })).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertGratitudeEntries(ctx.user.id, input.entries);
        const cloudEntries = await db.getUserGratitudeEntries(ctx.user.id);
        return cloudEntries.length > 0 || input.entries.length === 0 ? cloudEntries : input.entries.map((entry) => ({ ...entry, userId: ctx.user.id, updatedAt: new Date() }));
      }),
    delete: protectedProcedure.input(z.object({ ids: z.array(z.string().max(64)).max(1000) })).mutation(({ ctx, input }) => db.deleteUserGratitudeEntries(ctx.user.id, input.ids)),
  }),
});

export type AppRouter = typeof appRouter;
