import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEndpointsList = query({
  args: {},
  handler: async (ctx) => {
    if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
    return await ctx.db
      .query("endpoints")
      .collect();
  },
});

export const getEndpoint = query({
  args: { name: v.optional(v.string()), id: v.optional(v.string()) },
  handler: async (ctx, { name, id }) => {
    if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
    if (!id && !name) throw new Error("id or name is required");
    if (name)
      return await ctx.db
        .query("endpoints")
        .filter((endpoint) => endpoint.eq(endpoint.field("name"), name))
        .first();
    return await ctx.db
      .query("endpoints")
      .filter((endpoint) => endpoint.eq(endpoint.field("_id"), id))
      .first();
  },
});


export const setEndpointVisibility = mutation({
  args: { endpointId: v.string(), hidden: v.boolean() },
  handler: async (ctx, { endpointId, hidden }) => {
    if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
    if (!endpointId) throw new Error("endpointId is required");
    const endpoint = await ctx.db.query("endpoints").filter((endpoint) => endpoint.eq(endpoint.field("_id"), endpointId)).first();
    if (!endpoint) throw new Error("Endpoint not found");
    if (hidden)
      await ctx.db.patch<"endpoints">(endpoint?._id, { hidden, relevant: false });
    else
      await ctx.db.patch<"endpoints">(endpoint?._id, { hidden });
  },
});

export const setEndpointRelevance = mutation({
  args: { endpointId: v.string(), relevant: v.boolean() },
  handler: async (ctx, { endpointId, relevant }) => {
    if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
    if (!endpointId) throw new Error("endpointId is required");
    const endpoint = await ctx.db.query("endpoints").filter((endpoint) => endpoint.eq(endpoint.field("_id"), endpointId)).first();
    if (!endpoint) throw new Error("Endpoint not found");
    if (endpoint.hidden) throw new Error("Endpoint is hidden");
    await ctx.db.patch<"endpoints">(endpoint._id, { relevant });
  },
});