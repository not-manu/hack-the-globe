import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByRequest = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contributions")
      .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
      .order("desc")
      .take(100);
  },
});

export const contribute = mutation({
  args: {
    requestId: v.id("requests"),
    contributor: v.string(),
    quantity: v.number(),
    note: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    if (request.status && request.status !== "open") throw new Error("Request is no longer open");

    const totalQty = request.quantity ?? 0;
    const fulfilledQty = request.fulfilledQuantity ?? 0;
    const remaining = totalQty - fulfilledQty;
    if (totalQty > 0 && args.quantity > remaining) {
      throw new Error(`Only ${remaining} ${request.unit ?? "pcs"} remaining`);
    }

    // Insert the contribution
    await ctx.db.insert("contributions", {
      requestId: args.requestId,
      contributor: args.contributor,
      quantity: args.quantity,
      note: args.note,
      images: args.images,
    });

    // Update the request's fulfilled quantity
    const newFulfilled = fulfilledQty + args.quantity;
    const newStatus = totalQty > 0 && newFulfilled >= totalQty ? "fulfilled" : "open";

    await ctx.db.patch(args.requestId, {
      fulfilledQuantity: newFulfilled,
      status: newStatus,
    });

    return { newFulfilled, newStatus };
  },
});
