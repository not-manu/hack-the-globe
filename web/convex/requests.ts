import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("requests").order("desc").take(100);
  },
});

export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("requests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .take(100);
  },
});

export const getById = query({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    budget: v.string(),
    urgency: v.string(),
    requester: v.string(),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("requests", {
      ...args,
      fulfilledQuantity: 0,
      status: "open",
    });
  },
});

export const remove = mutation({
  args: { id: v.id("requests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
