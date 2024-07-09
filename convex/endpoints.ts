import { v } from "convex/values";

import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { zodToConvex } from "convex-helpers/server/zod"

import outdatedEndpoints from "./outdatedEndpoints";
import { Doc } from "./_generated/dataModel";

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
});

let primaryFieldsCount = 0;
let arrayFieldsCount = 0;
let objectFieldsCount = 0;

export const verifyEndpointsResponseSchemaValidity = internalAction({
  args: {},
  handler: async (ctx) => {
    primaryFieldsCount = 0;
    arrayFieldsCount = 0;
    objectFieldsCount = 0;
    const endpoints = await ctx.runQuery(api.endpoints.getEndpointsList);
    let schema: any;
    for (const endpoint of endpoints) {
      try {
        schema = JSON.parse(endpoint.responseSchema);
        if (!schema) continue;
        if (Object.keys(schema).length === 0) continue;
        if (schema["type"] === "array") {
          if (schema["items"]["type"] === "object") {
            validateResponseObject(schema["items"]);
          } else if (schema["items"]["type"] === "array") {
            validateResponseObject(schema["items"]["items"])
          } else
            validateResponsePrimaryField(schema["items"]);
        } else if (schema["type"] === "object") {
          validateResponseObject(schema);
        } else
          validateResponsePrimaryField(schema);
        // console.log(`Response schema for ${endpoint.name} is valid`);
      } catch (error) {
        console.error(`Error parsing response schema for ${endpoint.name}`, error);
        console.error(`Response schema for ${endpoint.name}`, schema);
      }
    }
    console.log("Primary fields count", primaryFieldsCount);
    console.log("Array fields count", arrayFieldsCount);
    console.log("Object fields count", objectFieldsCount);
  }
});

export function validateResponseArray(data: Record<string, any>) {
  arrayFieldsCount++;
  if (data["type"] !== "array") throw new Error(`Response type must be array, found ${data["type"]}`);
  if (!data["items"]) throw new Error("Response items is required for array type");
  if (data["items"]["type"] === "object") {
    if (!data["items"]["properties"]) throw new Error("Response properties is required for object type");
    validateResponseObject(data["items"]);
  }
  else if (data["items"]["type"] === "array") {
    validateResponseArray(data["items"])
  } else
    validateResponsePrimaryField(data["items"])
}

export function validateResponseObject(data: Record<string, any>) {
  objectFieldsCount++;
  // console.log("Validating response object", data);
  if (data["type"] != "object") throw new Error(`Response type must be object, found ${data["type"]}`);
  if (!data["properties"]) throw new Error("Response properties is required for object type");
  for (const key in data["properties"]) {
    const property = data["properties"][key];
    if (!property["type"]) throw new Error("Response type is required");
    if (property["type"] === "array") {
      validateResponseArray(property);
    } else if (property["type"] === "object") {
      validateResponseObject(property);
    } else {
      validateResponsePrimaryField(property)
    }
  }
}
export function validateResponsePrimaryField(data: Record<string, any>) {
  primaryFieldsCount++;
  if (!data["type"]) throw new Error("Response type is required");
  if (data["type"] === "array" || data["type"] === "object") {
    throw new Error("Response type must be primitive");
  }
}
export const convertRelevantEndpointsResponseSchema = internalAction({
  args: {},
  async handler(ctx) {
    const endpoints = await ctx.runQuery(api.endpoints.getEndpointsList);
    const chunkSize = 5;
    for (let i = 0; i < endpoints.length; i += chunkSize) {
      const chunk = endpoints.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (endpoint) => {
        // if (endpoint.relevant)
        return ctx.runAction(internal.endpoints.convertEndpointResponseSchema, { endpointId: endpoint._id });
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
});
export const convertEndpointResponseSchema = internalAction({
  args: { endpointId: v.id("endpoints") },
  async handler(ctx, { endpointId }) {
    // await ctx.runMutation(internal.endpoints.removeAllEndpointResponseFields);
    const endpoint = await ctx.runQuery(api.endpoints.getEndpoint, { id: endpointId });
    if (!endpoint) throw new Error("Endpoint not found");
    let schema = JSON.parse(endpoint.responseSchema);
    schema = JSON.parse(endpoint.responseSchema);
    if (!schema || Object.keys(schema).length === 0) {
      await ctx.runMutation(internal.endpoints.setEndpointResponseField, { endpointId, responseField: null });
      return;
    }
    let responseField: Doc<"endpoints">["responseSchemaField"];
    if (schema["type"] === "array") {
      responseField = await ctx.runAction(internal.endpoints.convertEndpointResponseSchemaArray, { endpointId, parentEntity: null, responseSchema: JSON.stringify(schema) });
    } else if (schema["type"] === "object") {
      responseField = await ctx.runAction(internal.endpoints.convertEndpointResponseSchemaObject, { endpointId, parentEntity: null, responseSchema: JSON.stringify(schema) });
    } else
      responseField = await ctx.runMutation(internal.endpoints.addResponseSchemaPrimaryField, {
        name: schema["name"] || "",
        description: schema["description"] || "",
        type: schema["type"],
        nullable: typeof schema["nullable"] == "string" ? schema["nullable"] === "true" : false,
        parentEndpoint: endpointId,
        parentEntity: null
      });
    return true;
  },
});

export const convertEndpointResponseSchemaArray = internalAction({
  args: {
    endpointId: v.id("endpoints"),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
    responseSchema: v.string()
  },
  returns: v.id("endpointResponseArrayFields"),
  async handler(ctx, { endpointId, parentEntity, responseSchema }): Promise<Doc<"endpointResponseArrayFields">["_id"]> {
    // console.log("Parsing array response schema", responseSchema)
    let schema = JSON.parse(responseSchema);
    let description = schema["description"] || "";
    let type = schema["type"];
    let name = schema["name"] || "";
    if (!type) throw new Error("Response type is required");
    if (type !== "array") throw new Error("Invalid schema type");
    let items = schema["items"];
    if (!items) throw new Error("Response items is required");
    let itemsSchema: Doc<"endpointResponseArrayFields">["items"];
    if (items["type"] === "object") {
      itemsSchema = await ctx.runAction(internal.endpoints.convertEndpointResponseSchemaObject, { endpointId, parentEntity, responseSchema: JSON.stringify(items) });
    } else if (items["type"] === "array") {
      itemsSchema = await ctx.runAction(internal.endpoints.convertEndpointResponseSchemaArray, { endpointId, parentEntity, responseSchema: JSON.stringify(items) });
    } else
      itemsSchema = await ctx.runMutation(internal.endpoints.addResponseSchemaPrimaryField, {
        name: items["name"] || "",
        description: items["description"] || "",
        type: items["type"],
        nullable: typeof items["nullable"] == "string" ? items["nullable"] === "true" : false,
        parentEndpoint: endpointId,
        parentEntity: null
      });
    const addedField = await ctx.runMutation(internal.endpoints.addResponseSchemaArrayField, { name, description, items: itemsSchema, parentEndpoint: endpointId, parentEntity });
    if (items["type"] === "object") {
      await ctx.runMutation(internal.endpoints.setResponseSchemaObjectFieldParentEntity,
        { fieldId: itemsSchema as Doc<"endpointResponseObjectFields">["_id"], parentEntity: addedField }
      )
    } else if (items["type"] === "array") {
      await ctx.runMutation(internal.endpoints.setResponseSchemaArrayFieldParentEntity,
        { fieldId: itemsSchema as Doc<"endpointResponseArrayFields">["_id"], parentEntity: addedField }
      )
    } else {
      await ctx.runMutation(internal.endpoints.setResponseSchemaPrimaryFieldParentEntity,
        { fieldId: itemsSchema as Doc<"endpointResponsePrimaryFields">["_id"], parentEntity: addedField }
      )
    }
    return addedField;
  },
});

export const convertEndpointResponseSchemaObject = internalAction({
  args: {
    endpointId: v.id("endpoints"),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
    responseSchema: v.string()
  },
  returns: v.id("endpointResponseObjectFields"),
  async handler(ctx, { endpointId, parentEntity, responseSchema }): Promise<Doc<"endpointResponseObjectFields">["_id"]> {
    // console.log("Parsing object response schema", responseSchema)
    let schema = JSON.parse(responseSchema);
    let description = schema["description"] || "";
    let type = schema["type"];
    let name = schema["name"] || "";
    let properties = schema["properties"];
    if (!type) throw new Error("Response type is required");
    if (type !== "object") throw new Error("Response type must be object");
    if (!properties) throw new Error("Response properties is required");
    const propertyFieldsIds = await Promise.all(Object.keys(properties).map((key) => {
      let property = properties[key];
      if (property["type"] === "object") {
        return ctx.runAction(internal.endpoints.convertEndpointResponseSchemaObject, { endpointId, parentEntity, responseSchema: JSON.stringify(property) });
      } else if (property["type"] === "array") {
        return ctx.runAction(internal.endpoints.convertEndpointResponseSchemaArray, { endpointId, parentEntity, responseSchema: JSON.stringify(property) });
      } else {
        if (!property["type"]) throw new Error("Response type for primitive fields is required");
        return ctx.runMutation(internal.endpoints.addResponseSchemaPrimaryField, {
          name: key,
          description: property["description"] || "",
          type: property["type"],
          nullable: typeof property["nullable"] == "string" ? property["nullable"] === "true" : false,
          parentEndpoint: endpointId,
          parentEntity
        });
      }
    }));
    return await ctx.runMutation(internal.endpoints.addResponseSchemaObjectField, { name, description, properties: propertyFieldsIds, parentEndpoint: endpointId, parentEntity });
  },
});

export const addResponseSchemaPrimaryField = internalMutation({
  args: {
    description: v.string(),
    name: v.string(),
    nullable: v.boolean(),
    parentEndpoint: v.id("endpoints"),
    type: v.string(),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null())
  },
  returns: v.id("endpointResponsePrimaryFields"),
  async handler(ctx, { description, name, nullable, parentEndpoint, type, parentEntity }) {
    return await ctx.db.insert("endpointResponsePrimaryFields", {
      description,
      name,
      nullable,
      parentEndpoint,
      parentEntity,
      type
    })
  },
});

export const addResponseSchemaObjectField = internalMutation({
  args: {
    name: v.string(),
    description: v.string(),
    properties: v.array(v.union(v.id('endpointResponseObjectFields'), v.id('endpointResponsePrimaryFields'), v.id("endpointResponseArrayFields"))),
    parentEndpoint: v.id('endpoints'),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
  },
  async handler(ctx, { name, description, properties, parentEndpoint, parentEntity }) {
    return await ctx.db.insert("endpointResponseObjectFields", {
      name,
      description,
      properties,
      parentEndpoint,
      parentEntity
    });
  }
});

export const addResponseSchemaArrayField = internalMutation({
  args: {
    name: v.string(),
    description: v.string(),
    items: v.union(v.id('endpointResponseObjectFields'), v.id('endpointResponsePrimaryFields'), v.id("endpointResponseArrayFields")),
    parentEndpoint: v.id('endpoints'),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()),
  },
  handler(ctx, { name, description, items, parentEndpoint, parentEntity }) {
    return ctx.db.insert("endpointResponseArrayFields", {
      name,
      description,
      items,
      parentEndpoint,
      parentEntity
    });

  },
});

export const setEndpointResponseField = internalMutation({
  args: { endpointId: v.id("endpoints"), responseField: v.union(v.id('endpointResponsePrimaryFields'), v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'), v.null()) },
  async handler(ctx, { responseField, endpointId }) {
    return await ctx.db.patch<"endpoints">(endpointId, { responseSchemaField: responseField });
  },
});

export const removeAllEndpointResponseFields = internalMutation({
  args: {},
  async handler(ctx) {
    await Promise.all((await ctx.db.query("endpointResponsePrimaryFields").collect()).map((field) => ctx.db.delete(field._id)))
    await Promise.all((await ctx.db.query("endpointResponseObjectFields").collect()).map((field) => ctx.db.delete(field._id)))
    await Promise.all((await ctx.db.query("endpointResponseArrayFields").collect()).map((field) => ctx.db.delete(field._id)))
  }
})

export const setResponseSchemaObjectFieldParentEntity = internalMutation({
  args: {
    fieldId: v.id("endpointResponseObjectFields"),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'))
  },
  async handler(ctx, { parentEntity, fieldId }) {
    return await ctx.db.patch<"endpointResponseObjectFields">(fieldId, { parentEntity });
  }
});
export const setResponseSchemaArrayFieldParentEntity = internalMutation({
  args: {
    fieldId: v.id("endpointResponseArrayFields"),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'))
  },
  async handler(ctx, { parentEntity, fieldId }) {
    return await ctx.db.patch<"endpointResponseArrayFields">(fieldId, { parentEntity });
  }
});
export const setResponseSchemaPrimaryFieldParentEntity = internalMutation({
  args: {
    fieldId: v.id("endpointResponsePrimaryFields"),
    parentEntity: v.union(v.id('endpointResponseArrayFields'), v.id('endpointResponseObjectFields'))
  },
  async handler(ctx, { parentEntity, fieldId }) {
    return await ctx.db.patch<"endpointResponsePrimaryFields">(fieldId, { parentEntity });
  }
});