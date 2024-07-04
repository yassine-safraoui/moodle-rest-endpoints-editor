import { internalQuery, query } from "./_generated/server";

export const getUser = query({
    args: {},
    handler: async (ctx) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if (!userIdentity) {
            console.error("No user identity found");
            return null;
        }
        const user = await ctx.db.query("users")
            .filter(_user => _user.eq(_user.field("name"), userIdentity.name))
            .first();
        return user;
    }
})
