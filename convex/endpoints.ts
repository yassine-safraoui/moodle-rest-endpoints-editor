import { v } from "convex/values";
import { query } from "./_generated/server";

export const getEndpointsList = query({
  args: {},
  handler: async (ctx) => {
    if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
    const hiddenCategories = await ctx.db
      .query("categories")
      .filter((category) => category.field("hidden"))
      .collect();
    const visibleEndpoints = await ctx.db
      .query("endpoints")
      .filter((endpoint) => endpoint.not(endpoint.field("hidden")))
      .collect();
    return visibleEndpoints.filter(
      (endpoint) =>
        endpoint.categoryId &&
        !hiddenCategories.some(
          (category) => category._id === endpoint.categoryId,
        ),
    );
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