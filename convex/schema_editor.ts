import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

export const updateTrackedMoodleTable = mutation({
    args: { tableId: v.id("moodle_tables"), tracked: v.boolean() },
    async handler(ctx, { tableId, tracked }) {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        if (tracked)
            await ctx.db.patch(tableId, { is_tracked: tracked, is_hidden: false });
        else
            await ctx.db.patch(tableId, { is_tracked: tracked });
        return;
    },
});

export const updateMoodleTableVisibility = mutation({
    args: { tableId: v.id("moodle_tables"), hidden: v.boolean() },
    async handler(ctx, { tableId, hidden }) {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        await ctx.db.patch(tableId, { is_hidden: hidden });
    },
});

export const getMoodleTrackedTables = query({
    args: { hidden: v.optional(v.boolean()) },
    async handler(ctx, { hidden }) {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
        let tables: Doc<"moodle_tables">[] = [];

        let query = ctx.db.query("moodle_tables").withIndex("by_tracked", table => table.eq("is_tracked", true));
        if (hidden != undefined)
            tables = await query.filter(table => table.eq(table.field("is_hidden"), hidden)).collect();
        else
            tables = await query.collect();

        const columns = await Promise.all(tables.map(async table =>
            ctx.db.query("moodle_columns").withIndex("by_table", column =>
                column.eq("table", table._id)).collect()
        ));
        return {
            tables, columns: columns.flat()
        };
    },
});


export const getMoodleTables = query({
    args: { paginationOpts: paginationOptsValidator, is_tracked: v.optional(v.boolean()), search: v.optional(v.string()) },
    async handler(ctx, { paginationOpts, is_tracked, search }) {
        if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");

        const filtered_tables = ctx.db.query("moodle_tables").filter(
            // Filter out orphan tables
            table => {
                let filter = table.or(
                    table.gt(table.field("children_count"), 0),
                    table.gt(table.field("parents_count"), 0)
                );
                if (is_tracked != undefined)
                    filter = table.and(filter, table.eq(table.field("is_tracked"), is_tracked));
                return filter;
            }
        );
        if (search != undefined && search.length > 0) {
            const search_result = await filtered_tables.withSearchIndex("by_name", q => q.search("name", search)).paginate(paginationOpts);
            return search_result;
        }
        return filtered_tables.paginate(paginationOpts);
    },
});

