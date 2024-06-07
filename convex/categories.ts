import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getCategoriesList = query({
    args: {},
    handler: async (ctx) => {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        return ctx.db
            .query("categories")
            .filter((category) => category.not(category.field("hidden")))
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