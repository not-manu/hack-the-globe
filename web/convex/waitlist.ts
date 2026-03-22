import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    seller: v.string(),
    category: v.string(),
    material: v.string(),
    quantity: v.number(),
    unit: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("waitlist", {
      ...args,
      status: "waiting",
    });
  },
});

export const listBySeller = query({
  args: { seller: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("waitlist")
      .withIndex("by_seller", (q) => q.eq("seller", args.seller))
      .order("desc")
      .take(50);
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("waitlist")
      .withIndex("by_category_and_status", (q) =>
        q.eq("category", args.category).eq("status", "waiting"),
      )
      .take(50);
  },
});

export const remove = mutation({
  args: { id: v.id("waitlist") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const cancel = mutation({
  args: { id: v.id("waitlist") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});
