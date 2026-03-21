import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_listingId", (q) => q.eq("listingId", args.listingId))
      .order("asc")
      .collect()
  },
})

export const send = mutation({
  args: {
    listingId: v.id("listings"),
    sender: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      listingId: args.listingId,
      sender: args.sender,
      body: args.body,
    })
  },
})
