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
		responseVersion: v.number(),
		requiredRoles: v.array(v.string()),
		hidden: v.boolean(),
		relevant: v.boolean(),
		implemented: v.optional(v.boolean()),
	}).index("by_category", ["categoryId"])
		.index("by_relevance", ["relevant"])
		.index("by_hidden", ["hidden"]),
	users: defineTable({
		name: v.string(),
		tokenIdentifier: v.string(),
		isAdmin: v.optional(v.boolean()),
	}),
	moodle_tables: defineTable({
		name: v.string(),
		description: v.string(),
		columns_count: v.number(),
		parents_count: v.number(),
		children_count: v.number(),
	}).index("by_name", ["name"]),
	moodle_columns: defineTable({
		name: v.string(),
		description: v.string(),
		type: v.string(),
		nullable: v.boolean(),
		table: v.id('moodle_tables'),
	}).index("by_name", ["name"])

});