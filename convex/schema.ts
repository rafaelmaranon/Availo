import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  spots_leaving: defineTable({
    location_text: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    leaving_time: v.string(), // ISO string
    notes: v.optional(v.string()),
    created_at: v.number(),
  }),
});
