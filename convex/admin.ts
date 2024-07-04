import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import z from "zod"
import { api, internal } from "./_generated/api";

const tableSchema = z.object({
    'Children': z.preprocess(x => Number.parseInt(String(x)), z.number()),
    'Columns': z.preprocess(x => Number.parseInt(String(x)), z.number()),
    'Parents': z.preprocess(x => Number.parseInt(String(x)), z.number()),
    'Comments': z.string(),
    'Table / View': z.string(),
})

const columnSchema = z.object(
    {
        "Table": z.string(),
        "Type": z.string(),
        "Column": z.string(),
        "Nullable": z.preprocess(x => x === "√", z.boolean()),
        "Comments": z.string()
    }
)

export const countMoodleTables = internalQuery({
    args: {},
    handler: async (ctx) => {
        const tables = await ctx.db.query("moodle_tables").collect();
        return tables.length;
    }

})

export const importTables = action({
    args: { tables: v.string() },
    handler: async (ctx, { tables }) => {
        const user = await ctx.runQuery(api.users.getUser);
        if (!user?.isAdmin) {
            console.error("User not admin");
            return null;
        }
        if (await ctx.runQuery(internal.admin.countMoodleTables) > 0) return;
        const tablesJson = z.array(tableSchema).parse(JSON.parse(tables));
        console.log(tablesJson);
        const chunkSize = 10;
        for (let i = 0; i < tablesJson.length; i += chunkSize) {
            const chunk = tablesJson.slice(i, i + chunkSize);
            await ctx.runMutation(internal.admin.insertTables, {
                tables: chunk.map(
                    table => ({
                        name: table["Table / View"],
                        description: table.Comments,
                        columns_count: table.Columns,
                        parents_count: table.Parents,
                        children_count: table.Children
                    })
                )
            });
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
});

export const insertTables = internalMutation({
    args: {
        tables: v.array(v.object({
            name: v.string(),
            description: v.string(),
            columns_count: v.number(),
            parents_count: v.number(),
            children_count: v.number()
        }))
    },
    handler: async (ctx, { tables }) => {
        await Promise.all(
            tables.map(table => {
                return ctx.db
                    .insert("moodle_tables", {
                        name: table.name,
                        description: table.description,
                        columns_count: table.columns_count,
                        parents_count: table.parents_count,
                        children_count: table.children_count
                    });
            })
        )
    }
});

export const findTable = internalQuery({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        return await ctx.db.query("moodle_tables").filter(table => table.eq(table.field("name"), name)).first();
    }
});

export const countMoodleColumns = internalQuery({
    args: {},
    handler: async (ctx) => {
        const columns = await ctx.db.query("moodle_columns").collect();
        return columns.length;
    }
})

export const importColumns = action({
    args: { columns: v.string() },
    handler: async (ctx, { columns }) => {
        const user = await ctx.runQuery(api.users.getUser);
        if (!user?.isAdmin) {
            console.error("User not admin");
            return null;
        }
        if (await ctx.runQuery(internal.admin.countMoodleColumns) > 0) return;
        const columnsJson = z.array(columnSchema).parse(JSON.parse(columns));
        console.log(columnsJson);
        const chunkSize = 20;
        for (let i = 0; i < columnsJson.length; i += chunkSize) {
            const chunk = columnsJson.slice(i, i + chunkSize);
            for (const column of chunk) {
                const parentTable = await ctx.runQuery(internal.admin.findTable, { name: column["Table"] });
                if (!parentTable) {
                    console.error(`Table ${column["Table"]} of column ${column.Column} not found`);
                    continue;
                }
                await ctx.runMutation(internal.admin.importColumn, {
                    column: {
                        name: column["Column"],
                        description: column.Comments,
                        type: column.Type,
                        nullable: column.Nullable,
                        table: parentTable?._id
                    }
                });
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
});

export const importColumn = internalMutation({
    args: {
        column: v.object({
            name: v.string(),
            description: v.string(),
            type: v.string(),
            nullable: v.boolean(),
            table: v.id('moodle_tables')
        })
    },
    handler: async (ctx, { column }) => {
        await ctx.db
            .insert("moodle_columns", {
                name: column.name,
                description: column.description,
                type: column.type,
                nullable: column.nullable,
                table: column.table
            });
    }
})