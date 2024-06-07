import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
	categories: defineTable({
		name: v.string(),
		hidden: v.boolean(),
	}),
	endpoints: defineTable({
		categoryId: v.id('categories'),
		name: v.string(),
		description: v.string(),
		paramsSchema: v.string(),
		responseSchema: v.string(),
		requiredRoles: v.array(v.string()),
		hidden: v.boolean(),
	}),
	users: defineTable({
		name: v.string(),
		tokenIdentifier: v.string(),
	}).index("by_token", ["tokenIdentifier"]),
});

