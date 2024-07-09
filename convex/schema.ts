import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { z } from "zod";


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
		responseSchemaField: v.optional(v.union(v.id('endpointResponsePrimaryFields'), v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null())),
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
		is_tracked: v.optional(v.boolean()),
		is_hidden: v.optional(v.boolean()),
	})
		.index("by_tracked", ["is_tracked"])
		.searchIndex("by_name", {
			searchField: "name",
			filterFields: ["is_tracked", "is_hidden"]
		}),
	moodle_columns: defineTable({
		name: v.string(),
		description: v.string(),
		type: v.string(),
		nullable: v.boolean(),
		table: v.id('moodle_tables'),
	}).index("by_table", ["table"]),

	endpointResponsePrimaryFields: defineTable({
		name: v.string(),
		description: v.string(),
		nullable: v.boolean(),
		type: v.string(),
		parentEndpoint: v.id('endpoints'),
		parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
	}),
	endpointResponseArrayFields: defineTable({
		name: v.string(),
		description: v.string(),
		items: v.union(v.id('endpointResponseObjectFields'), v.id('endpointResponsePrimaryFields'), v.id("endpointResponseArrayFields")),
		parentEndpoint: v.id('endpoints'),
		parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
	}),
	endpointResponseObjectFields: defineTable({
		name: v.string(),
		description: v.string(),
		properties: v.array(v.union(v.id('endpointResponseObjectFields'), v.id('endpointResponsePrimaryFields'), v.id("endpointResponseArrayFields"))),
		parentEndpoint: v.id('endpoints'),
		parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
	}),
});
