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
    // Legacy: plain URL string. New listings use `images` array.
    image: v.optional(v.string()),
    // New: array of Convex storage IDs
    images: v.optional(v.array(v.id("_storage"))),
    condition: v.string(),
    description: v.string(),
    location: v.string(),
    lat: v.number(),
    lng: v.number(),
    // Multi-item listings (from batch scanner)
    items: v.optional(v.array(v.object({
      title: v.string(),
      category: v.string(),
      price: v.number(),
      originalPrice: v.number(),
      condition: v.string(),
      description: v.string(),
      carbonSaved: v.number(),
    }))),
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
    quantity: v.optional(v.number()),
    unit: v.optional(v.string()),
    fulfilledQuantity: v.optional(v.number()),
    status: v.optional(v.string()), // "open" | "fulfilled" | "closed"
  }).index("by_status", ["status"]),

  contributions: defineTable({
    requestId: v.id("requests"),
    contributor: v.string(),
    quantity: v.number(),
    note: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
  }).index("by_requestId", ["requestId"]),

  waitlist: defineTable({
    seller: v.string(),
    category: v.string(),
    material: v.string(),
    quantity: v.number(),
    unit: v.string(),
    images: v.optional(v.array(v.id("_storage"))),
    status: v.string(), // "waiting" | "matched" | "cancelled"
  }).index("by_seller", ["seller"])
    .index("by_category_and_status", ["category", "status"]),

  messages: defineTable({
    listingId: v.id("listings"),
    sender: v.string(),
    body: v.string(),
  }).index("by_listingId", ["listingId"]),
});
