import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new parking spot
export const createSpot = mutation({
  args: {
    location_text: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    leaving_time: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const spotId = await ctx.db.insert("spots_leaving", {
      ...args,
      created_at: Date.now(),
    });
    return spotId;
  },
});

// Get all available spots
export const getAvailableSpots = query({
  handler: async (ctx) => {
    return await ctx.db.query("spots_leaving").collect();
  },
});

// Seed demo data
export const seedDemoData = mutation({
  handler: async (ctx) => {
    // Clear existing data
    const existingSpots = await ctx.db.query("spots_leaving").collect();
    for (const spot of existingSpots) {
      await ctx.db.delete(spot._id);
    }

    // Create demo spots
    const now = new Date();
    const spots = [
      {
        location_text: "Mission & 16th Street",
        lat: 37.7649,
        lng: -122.4194,
        leaving_time: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
        notes: "Blue Honda Civic, near the coffee shop",
        created_at: Date.now(),
      },
      {
        location_text: "Dolores Park entrance",
        lat: 37.7596,
        lng: -122.4269,
        leaving_time: new Date(now.getTime() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        notes: "White Toyota Prius, by the playground",
        created_at: Date.now(),
      },
      {
        location_text: "Valencia & 24th",
        lat: 37.7524,
        lng: -122.4211,
        leaving_time: new Date(now.getTime() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
        notes: "Red Tesla Model 3",
        created_at: Date.now(),
      },
    ];

    const spotIds = [];
    for (const spot of spots) {
      const id = await ctx.db.insert("spots_leaving", spot);
      spotIds.push(id);
    }
    
    return { created: spotIds.length };
  },
});
