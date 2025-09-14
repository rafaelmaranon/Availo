import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Drivers looking for parking spots
  drivers_seeking: defineTable({
    driver_name: v.string(),
    destination: v.string(),
    arrival_time_estimate: v.string(),
    parking_duration_needed: v.string(), // e.g., "2 hours", "30 minutes"
    voice_message: v.optional(v.string()), // Original voice message
    requirements: v.optional(v.string()), // Any special requirements
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    status: v.string(), // "seeking", "matched", "completed"
    created_at: v.number(),
  }),
  
  // Drivers offering parking spots
  drivers_offering: defineTable({
    driver_name: v.string(),
    location_description: v.string(), // e.g., "Dolores Park, south-west corner"
    car_brand: v.string(),
    car_color: v.string(),
    estimated_leave_time: v.string(),
    exact_location_known: v.boolean(), // false if they need to find their spot first
    voice_message: v.optional(v.string()), // Original voice message
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    status: v.string(), // "preparing", "ready", "matched", "completed"
    created_at: v.number(),
  }),
  
  // Negotiation conversations between drivers
  negotiations: defineTable({
    seeker_id: v.id("drivers_seeking"),
    offerer_id: v.id("drivers_offering"),
    status: v.string(), // "pending", "accepted", "declined", "completed"
    messages: v.array(v.object({
      sender: v.string(), // "seeker" or "offerer"
      message: v.string(),
      voice_message: v.optional(v.string()),
      timestamp: v.number(),
    })),
    created_at: v.number(),
  }),
});
