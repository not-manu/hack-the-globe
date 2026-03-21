import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("requests").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    budget: v.string(),
    urgency: v.string(),
    requester: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("requests", args);
  },
});

export const remove = mutation({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
