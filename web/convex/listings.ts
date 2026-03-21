import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").order("desc").collect();
    return Promise.all(
      listings.map(async (listing) => ({
        ...listing,
        imageUrl: await resolveImageUrl(ctx, listing),
      }))
    );
  },
});

export const getById = query({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) return null;
    // Resolve all image URLs
    const imageUrls: string[] = [];
    if (listing.images) {
      for (const storageId of listing.images) {
        const url = await ctx.storage.getUrl(storageId);
        if (url) imageUrls.push(url);
      }
    }
    return {
      ...listing,
      imageUrl: imageUrls[0] ?? listing.image ?? null,
      imageUrls,
    };
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
    return Promise.all(
      listings.map(async (listing) => ({
        ...listing,
        imageUrl: await resolveImageUrl(ctx, listing),
      }))
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    price: v.number(),
    condition: v.string(),
    description: v.string(),
    location: v.string(),
    carbonSaved: v.number(),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("listings", {
      title: args.title,
      category: args.category,
      price: args.price,
      originalPrice: Math.round(args.price * 1.6),
      condition: args.condition,
      description: args.description,
      location: args.location,
      carbonSaved: args.carbonSaved,
      images: args.images ?? [],
      // Defaults for fields the post form doesn't collect
      quantity: "1",
      unit: "piece",
      seller: "You",
      sellerRating: 5.0,
      sellerVerified: false,
      sellerTransactions: 0,
      lat: 43.65 + Math.random() * 0.05,
      lng: -79.38 + Math.random() * 0.05,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Helper: resolve the first displayable image URL for a listing
async function resolveImageUrl(
  ctx: { storage: { getUrl: (id: string) => Promise<string | null> } },
  listing: { images?: string[]; image?: string }
): Promise<string | null> {
  if (listing.images && listing.images.length > 0) {
    return await ctx.storage.getUrl(listing.images[0]);
  }
  return listing.image ?? null;
}
