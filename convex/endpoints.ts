import { v } from "convex/values";
import { internalAction, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

import outdatedEndpoints from "./outdatedEndpoints";

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

export const populateRelevantEndpoint = internalMutation({
  args: {},
  handler: async (ctx) => {
    ["core_course_get_categories",
      "core_course_get_contents",
      "core_course_get_course_module",
      "core_course_get_course_module_by_instance",
      "core_course_get_courses_by_field",
      "core_enrol_get_enrolled_users",
      "core_enrol_get_users_courses",
      "core_user_get_users",
      "mod_lesson_get_attempts_overview",
      "mod_lesson_get_content_pages_viewed",
      "mod_lesson_get_lesson",
      "mod_lesson_get_questions_attempts",
      "mod_lesson_get_user_attempt",
      "mod_lesson_get_user_attempt_grade",
      "mod_lesson_get_user_grade",
      "mod_quiz_get_attempt_data",
      "mod_quiz_get_attempt_review",
      "mod_quiz_get_attempt_summary",
      "mod_quiz_get_quizzes_by_courses",
      "mod_quiz_get_user_attempts",
      "mod_quiz_get_user_best_grade"].map(async (name) => {
        const endpoint = await ctx.db.query("endpoints").filter((endpoint) => endpoint.eq(endpoint.field("name"), name)).first();
        if (!endpoint) return console.warn(`Endpoint ${name} not found`);
        ctx.db.patch<"endpoints">(endpoint._id, { relevant: true })
      })
  }
})

export const setEndpointResponseVersion = internalMutation({
  args: {},
  handler: async (ctx) => {
    const endpoints4_4 = await ctx.db.query("endpoints").collect();
    endpoints4_4.map(async (endpoint) => {
      const responseSchema = JSON.parse(endpoint.responseSchema);
      if (responseSchema.type == null) {
        await ctx.db.patch<"endpoints">(endpoint._id, { responseVersion: 4.0 })
      }
    })
  }
})

export const setEndpointResponse = internalMutation({
  args: { name: v.string(), responseSchema: v.string() },
  handler: async (ctx, { name, responseSchema }) => {
    const endpoint = await ctx.db.query("endpoints").filter((endpoint) => endpoint.eq(endpoint.field("name"), name)).first();
    if (!endpoint) throw new Error("Endpoint not found");
    if (!endpoint) return console.warn(`Endpoint ${name} not found`);
    if (endpoint.responseVersion !== 4.0) return console.warn(`Endpoint ${name} is not 4.0`);
    await ctx.db.patch<"endpoints">(endpoint._id, { responseSchema })
  }
})

async function sleep(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export const setEndpointsResponse = internalAction({
  args: {},
  handler: async (ctx) => {
    const jsonRecords = JSON.parse(outdatedEndpoints);
    const endpoints = Object.keys(jsonRecords);
    for (let i = 0; i < endpoints.length; i++) {
      const name = endpoints[i];
      try {
        await ctx.runMutation(internal.endpoints.setEndpointResponse, { name, responseSchema: JSON.stringify(jsonRecords[name]) });
      } catch (error) {
        console.warn(`Error setting response for ${name}`, error);
      }
      if (i % 10 === 0)
        await sleep(300);
    }
  }
})

export const setEndpointImplemented = mutation({
  args: { endpointId: v.string(), implemented: v.boolean() },
  handler: async (ctx, { endpointId, implemented }) => {
    if (ctx.auth.getUserIdentity() === null) throw new Error("Unauthorized");
    if (!endpointId) throw new Error("endpointId is required");
    const endpoint = await ctx.db.query("endpoints").filter((endpoint) => endpoint.eq(endpoint.field("_id"), endpointId)).first();
    if (!endpoint) throw new Error("Endpoint not found");
    await ctx.db.patch<"endpoints">(endpoint._id, { implemented });
  },
})