// import { createEnv } from "@t3-oss/env-core";
// import { z } from "zod";

// export const env = createEnv({
//     server: {
//         // CONVEX_DEPLOYMENT: z.string().url(),
//         // AUTH0_CLIENT_ID: z.string().min(1),
//         // AUTH0_CLIENT_SECRET: z.string().min(1),
//         // AUTH0_SECRET: z.string().min(1),
//         // AUTH0_BASE_URL: z.string().url(),
//         // AUTH0_ISSUER_BASE_URL: z.string().url(),
//     },

//     /**
//      * The prefix that client-side variables must have. This is enforced both at
//      * a type-level and at runtime.
//      */
//     clientPrefix: "NEXT_PUBLIC_",

//     client: {
//         NEXT_PUBLIC_CONVEX_URL: z.string().url(),
//     },

//     /**
//      * What object holds the environment variables at runtime. This is usually
//      * `process.env` or `import.meta.env`.
//      */
//     runtimeEnv: process.env,
//     skipValidation: true,

//     /**
//      * By default, this library will feed the environment variables directly to
//      * the Zod validator.
//      *
//      * This means that if you have an empty string for a value that is supposed
//      * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
//      * it as a type mismatch violation. Additionally, if you have an empty string
//      * for a value that is supposed to be a string with a default value (e.g.
//      * `DOMAIN=` in an ".env" file), the default value will never be applied.
//      *
//      * In order to solve these issues, we recommend that all new projects
//      * explicitly specify this option as true.
//      */
//     emptyStringAsUndefined: true,
// });