import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("listings").collect();
  },
});

export const getById = query({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("listings")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    quantity: v.string(),
    unit: v.string(),
    price: v.number(),
    originalPrice: v.number(),
    seller: v.string(),
    sellerRating: v.number(),
    sellerVerified: v.boolean(),
    sellerTransactions: v.number(),
    carbonSaved: v.number(),
    image: v.string(),
    condition: v.string(),
    description: v.string(),
    location: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("listings", args);
  },
});

export const remove = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
