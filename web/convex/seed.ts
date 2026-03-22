import { mutation } from "./_generated/server"

/**
 * Coordinates reference:
 * - Demo map center: 43.644333, -79.377941 (Toronto waterfront)
 * - Sample data center: 43.66452, -79.39242 (Toronto, near U of T / Kensington)
 *
 * All sample listings are placed within ~2km of the sample data center.
 */

const SAMPLE_CENTER = { lat: 43.66452, lng: -79.39242 }

const SAMPLE_LISTINGS = [
  {
    title: "Reclaimed Oak Lumber",
    category: "lumber",
    quantity: "48",
    unit: "board ft",
    price: 180,
    originalPrice: 420,
    seller: "BuildRight Demo",
    sellerRating: 4.8,
    sellerVerified: true,
    sellerTransactions: 34,
    carbonSaved: 62,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
    condition: "Good",
    description: "Solid oak boards salvaged from a commercial renovation. Clean, denailed, various widths 4–8 in.",
    location: "Kensington Market, Toronto",
    lat: SAMPLE_CENTER.lat + 0.003,
    lng: SAMPLE_CENTER.lng - 0.004,
  },
  {
    title: "Steel I-Beams (W8x18)",
    category: "steel",
    quantity: "6",
    unit: "pieces",
    price: 320,
    originalPrice: 780,
    seller: "Metro Salvage",
    sellerRating: 4.9,
    sellerVerified: true,
    sellerTransactions: 67,
    carbonSaved: 145,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop",
    condition: "Excellent",
    description: "Structural steel beams from a 2023 warehouse demolition. 12 ft lengths, no rust, certified load-bearing.",
    location: "Queen West, Toronto",
    lat: SAMPLE_CENTER.lat - 0.005,
    lng: SAMPLE_CENTER.lng + 0.006,
  },
  {
    title: "Red Brick Pavers",
    category: "brick",
    quantity: "500",
    unit: "pieces",
    price: 150,
    originalPrice: 350,
    seller: "Heritage Reclaim",
    sellerRating: 4.6,
    sellerVerified: true,
    sellerTransactions: 22,
    carbonSaved: 38,
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&h=600&fit=crop",
    condition: "Good",
    description: "Vintage clay bricks from a 1920s row house demolition. Perfect for patios, garden walls, accent features.",
    location: "Dundas & Ossington, Toronto",
    lat: SAMPLE_CENTER.lat + 0.008,
    lng: SAMPLE_CENTER.lng + 0.002,
  },
  {
    title: "Tempered Glass Panels",
    category: "glass",
    quantity: "12",
    unit: "panels",
    price: 240,
    originalPrice: 600,
    seller: "GlassCo Surplus",
    sellerRating: 4.7,
    sellerVerified: false,
    sellerTransactions: 11,
    carbonSaved: 28,
    image: "https://images.unsplash.com/photo-1605117882932-f9e32ef0bab7?w=600&h=600&fit=crop",
    condition: "Like New",
    description: "Clear tempered glass panels, 4ft x 6ft, 1/4\" thick. Over-ordered for a condo project. Never installed.",
    location: "Liberty Village, Toronto",
    lat: SAMPLE_CENTER.lat - 0.012,
    lng: SAMPLE_CENTER.lng + 0.010,
  },
  {
    title: "Copper Piping (3/4\")",
    category: "pipe",
    quantity: "200",
    unit: "linear ft",
    price: 280,
    originalPrice: 520,
    seller: "PlumbSave TO",
    sellerRating: 4.5,
    sellerVerified: true,
    sellerTransactions: 45,
    carbonSaved: 52,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600&fit=crop",
    condition: "Good",
    description: "Type L copper tubing salvaged from a hospital renovation. Cleaned and tested, ready for reuse.",
    location: "Bathurst & College, Toronto",
    lat: SAMPLE_CENTER.lat + 0.001,
    lng: SAMPLE_CENTER.lng + 0.008,
  },
  {
    title: "Concrete Blocks (8\")",
    category: "concrete",
    quantity: "120",
    unit: "blocks",
    price: 90,
    originalPrice: 220,
    seller: "BlockYard",
    sellerRating: 4.4,
    sellerVerified: false,
    sellerTransactions: 8,
    carbonSaved: 34,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
    condition: "Good",
    description: "Standard 8\" CMU blocks from a retaining wall demo. Intact, no chips. Great for garden walls or foundations.",
    location: "Annex, Toronto",
    lat: SAMPLE_CENTER.lat + 0.010,
    lng: SAMPLE_CENTER.lng - 0.001,
  },
  {
    title: "Electrical Panel (200A)",
    category: "electrical",
    quantity: "1",
    unit: "unit",
    price: 175,
    originalPrice: 450,
    seller: "WattSavers",
    sellerRating: 4.8,
    sellerVerified: true,
    sellerTransactions: 29,
    carbonSaved: 18,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=600&fit=crop",
    condition: "Excellent",
    description: "200-amp main breaker panel, Square D brand. Removed during upgrade, fully functional with breakers included.",
    location: "Spadina & Dundas, Toronto",
    lat: SAMPLE_CENTER.lat - 0.002,
    lng: SAMPLE_CENTER.lng - 0.005,
  },
  {
    title: "Porcelain Sink (Vintage)",
    category: "fixtures",
    quantity: "2",
    unit: "pieces",
    price: 120,
    originalPrice: 350,
    seller: "RetroFixture",
    sellerRating: 4.3,
    sellerVerified: false,
    sellerTransactions: 6,
    carbonSaved: 15,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=600&fit=crop",
    condition: "Good",
    description: "Vintage cast-iron porcelain farmhouse sinks from a 1940s home. Minor patina, no cracks or chips.",
    location: "Harbord Village, Toronto",
    lat: SAMPLE_CENTER.lat + 0.006,
    lng: SAMPLE_CENTER.lng + 0.004,
  },
]

const SAMPLE_REQUESTS = [
  {
    title: "Need 2x6 lumber, 100+ board ft",
    category: "lumber",
    budget: "$200–300",
    urgency: "This week",
    requester: "Jake M.",
    quantity: 100,
    unit: "board ft",
    fulfilledQuantity: 35,
    status: "open",
  },
  {
    title: "Looking for stainless steel sheet",
    category: "steel",
    budget: "$150",
    urgency: "Flexible",
    requester: "Priya S.",
    quantity: 10,
    unit: "sheets",
    fulfilledQuantity: 0,
    status: "open",
  },
  {
    title: "Wanted: sliding barn door hardware",
    category: "fixtures",
    budget: "$80–120",
    urgency: "Urgent",
    requester: "Sam T.",
    quantity: 2,
    unit: "sets",
    fulfilledQuantity: 1,
    status: "open",
  },
]

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if listings already exist
    const existing = await ctx.db.query("listings").first()
    if (existing) {
      return { status: "skipped", message: "Listings already exist. Use resetAndSeed to replace." }
    }

    for (const listing of SAMPLE_LISTINGS) {
      await ctx.db.insert("listings", listing)
    }
    for (const req of SAMPLE_REQUESTS) {
      await ctx.db.insert("requests", req)
    }

    return { status: "seeded", listings: SAMPLE_LISTINGS.length, requests: SAMPLE_REQUESTS.length }
  },
})

export const resetAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing listings
    const allListings = await ctx.db.query("listings").collect()
    for (const l of allListings) {
      await ctx.db.delete(l._id)
    }
    // Delete all existing requests
    const allRequests = await ctx.db.query("requests").collect()
    for (const r of allRequests) {
      await ctx.db.delete(r._id)
    }

    // Re-seed
    for (const listing of SAMPLE_LISTINGS) {
      await ctx.db.insert("listings", listing)
    }
    for (const req of SAMPLE_REQUESTS) {
      await ctx.db.insert("requests", req)
    }

    return { status: "reset and seeded", listings: SAMPLE_LISTINGS.length, requests: SAMPLE_REQUESTS.length }
  },
})
