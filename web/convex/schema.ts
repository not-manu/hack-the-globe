import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  listings: defineTable({
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
  }).searchIndex("by_category", {
    searchField: "title",
    filterFields: ["category"],
  }),

  requests: defineTable({
    title: v.string(),
    category: v.string(),
    budget: v.string(),
    urgency: v.string(),
    requester: v.string(),
  }),
});
