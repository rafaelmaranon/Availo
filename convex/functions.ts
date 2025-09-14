import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Driver seeking parking creates a request
export const createSeekingRequest = mutation({
  args: {
    driver_name: v.string(),
    destination: v.string(),
    arrival_time_estimate: v.string(),
    parking_duration_needed: v.string(),
    voice_message: v.optional(v.string()),
    requirements: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert("drivers_seeking", {
      ...args,
      status: "seeking",
      created_at: Date.now(),
    });
    return requestId;
  },
});

// Driver offering parking creates an offer
export const createOfferingRequest = mutation({
  args: {
    driver_name: v.string(),
    location_description: v.string(),
    car_brand: v.string(),
    car_color: v.string(),
    estimated_leave_time: v.string(),
    exact_location_known: v.boolean(),
    voice_message: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const offerId = await ctx.db.insert("drivers_offering", {
      ...args,
      status: "preparing",
      created_at: Date.now(),
    });
    return offerId;
  },
});

// Get all seeking drivers
export const getSeekingDrivers = query({
  handler: async (ctx) => {
    return await ctx.db.query("drivers_seeking")
      .filter((q) => q.eq(q.field("status"), "seeking"))
      .collect();
  },
});

// Get all offering drivers
export const getOfferingDrivers = query({
  handler: async (ctx) => {
    return await ctx.db.query("drivers_offering")
      .filter((q) => q.neq(q.field("status"), "completed"))
      .collect();
  },
});

// Start a negotiation between drivers
export const startNegotiation = mutation({
  args: {
    seeker_id: v.id("drivers_seeking"),
    offerer_id: v.id("drivers_offering"),
    initial_message: v.string(),
    sender: v.string(), // "seeker" or "offerer"
  },
  handler: async (ctx, args) => {
    const negotiationId = await ctx.db.insert("negotiations", {
      seeker_id: args.seeker_id,
      offerer_id: args.offerer_id,
      status: "pending",
      messages: [{
        sender: args.sender,
        message: args.initial_message,
        timestamp: Date.now(),
      }],
      created_at: Date.now(),
    });
    return negotiationId;
  },
});

// Add message to negotiation
export const addNegotiationMessage = mutation({
  args: {
    negotiation_id: v.id("negotiations"),
    sender: v.string(),
    message: v.string(),
    voice_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const negotiation = await ctx.db.get(args.negotiation_id);
    if (!negotiation) throw new Error("Negotiation not found");
    
    const newMessage = {
      sender: args.sender,
      message: args.message,
      voice_message: args.voice_message,
      timestamp: Date.now(),
    };
    
    await ctx.db.patch(args.negotiation_id, {
      messages: [...negotiation.messages, newMessage],
    });
  },
});

// Get negotiations for a specific driver
export const getNegotiationsForDriver = query({
  args: {
    driver_id: v.string(),
    driver_type: v.string(), // "seeker" or "offerer"
  },
  handler: async (ctx, args) => {
    if (args.driver_type === "seeker") {
      return await ctx.db.query("negotiations")
        .filter((q) => q.eq(q.field("seeker_id"), args.driver_id))
        .collect();
    } else {
      return await ctx.db.query("negotiations")
        .filter((q) => q.eq(q.field("offerer_id"), args.driver_id))
        .collect();
    }
  },
});

// Seed demo data for negotiation system
export const seedDemoData = mutation({
  handler: async (ctx) => {
    // Clear existing data
    const existingSeekers = await ctx.db.query("drivers_seeking").collect();
    for (const seeker of existingSeekers) {
      await ctx.db.delete(seeker._id);
    }
    
    const existingOfferers = await ctx.db.query("drivers_offering").collect();
    for (const offerer of existingOfferers) {
      await ctx.db.delete(offerer._id);
    }
    
    const existingNegotiations = await ctx.db.query("negotiations").collect();
    for (const negotiation of existingNegotiations) {
      await ctx.db.delete(negotiation._id);
    }

    // Create demo seeking drivers
    const seekers = [
      {
        driver_name: "Alex",
        destination: "Dolores Park",
        arrival_time_estimate: "10 minutes",
        parking_duration_needed: "2 hours",
        voice_message: "I am on my way to Dolores Park arriving in about 10 min and need free parking spot for less than 2h.",
        requirements: "Looking for free street parking",
        lat: 37.7749,
        lng: -122.4194,
        status: "seeking",
        created_at: Date.now(),
      },
    ];

    // Create demo offering drivers  
    const offerers = [
      {
        driver_name: "Maria",
        location_description: "Dolores Park, south-west corner",
        car_brand: "Toyota",
        car_color: "Silver",
        estimated_leave_time: "5 minutes",
        exact_location_known: false,
        voice_message: "I parked at Dolores park near the south-west corner with a Toyota Rav4 and I am about to leave. I'll let you know when I am closer but it may take me about 5 min to get there. I don't recall exactly my spot I parked but will provide an update once there.",
        lat: 37.7596,
        lng: -122.4269,
        status: "preparing",
        created_at: Date.now(),
      },
    ];

    const seekerIds = [];
    for (const seeker of seekers) {
      const id = await ctx.db.insert("drivers_seeking", seeker);
      seekerIds.push(id);
    }
    
    const offererIds = [];
    for (const offerer of offerers) {
      const id = await ctx.db.insert("drivers_offering", offerer);
      offererIds.push(id);
    }
    
    return { 
      seekers_created: seekerIds.length, 
      offerers_created: offererIds.length 
    };
  },
});
