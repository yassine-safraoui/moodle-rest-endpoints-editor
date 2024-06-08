import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getCategoriesList = query({
    args: {},
    handler: async (ctx) => {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        return ctx.db
            .query("categories")
            .collect();
    },
});

export const getCategory = query({
    args: { id: v.optional(v.string()), name: v.optional(v.string()) },
    handler: async (ctx, { id, name }) => {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        if (!id && !name) throw new Error("id or name is required");
        let foundCategory: Doc<"categories"> | undefined = undefined;
        if (id) {
            const result = await ctx.db.query("categories").filter((category) =>
                category.eq(category.field("_id"), id)
            ).first();
            if (result) foundCategory = result;
            else throw new Error("Category not found");
        }
        else if (name) {
            const result = await ctx.db.query("categories").filter((category) =>
                category.eq(category.field("name"), name)
            ).first();
            if (result) foundCategory = result;
            else throw new Error("Category not found");
        }

        if (foundCategory == undefined) throw new Error("Category not found");

        const endpoints = await ctx.db.query("endpoints").filter((endpoint) =>
            endpoint.eq(endpoint.field("categoryId"), foundCategory?._id)
        ).collect();
        return { endpoints, ...foundCategory };

    }
});

export const setCategoryVisibility = mutation({
    args: { categoryId: v.string(), hidden: v.boolean() },
    handler: async (ctx, { categoryId, hidden }) => {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        if (!categoryId) throw new Error("categoryId is required");
        const category = await ctx.db.query("categories").filter((category) => category.eq(category.field("_id"), categoryId)).first();
        if (!category) throw new Error("Category not found");
        const endpoints = await ctx.db.query("endpoints").filter((endpoint) =>
            endpoint.eq(endpoint.field("categoryId"), category._id)).collect();
        if (!hidden) {
            await Promise.all(endpoints.map(async (endpoint) => {
                await ctx.db.patch<"endpoints">(endpoint._id, { hidden: false });
            }));
        } else
            if (endpoints.some((endpoint) => endpoint.relevant)) throw new Error("Category has relevant endpoints");
            
        await ctx.db.patch<"categories">(category?._id, { hidden });
    },
});

export const setCategoryRelevance = mutation({
    args: { categoryId: v.string(), relevant: v.boolean() },
    handler: async (ctx, { categoryId, relevant }) => {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        if (!categoryId) throw new Error("categoryId is required");
        const category = await ctx.db.query("categories").filter((category) => category.eq(category.field("_id"), categoryId)).first();
        if (!category) throw new Error("Category not found");
        const endpoints = await ctx.db.query("endpoints")
            .filter((endpoint) => endpoint.eq(endpoint.field("categoryId"), category._id)).collect();
        await Promise.all(endpoints.map(
            async (endpoint) => await ctx.db.patch<"endpoints">(endpoint._id, { relevant })
        ));
    },
});