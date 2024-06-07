import z from "zod";

export const EndpointParamsSchema = z.record(
    z.string(),
    z.object({
        description: z.string().optional(),
        type: z.string().optional().nullable(),
        default: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
            .optional().nullable(),
        required: z.boolean().optional(),
        nullable: z.boolean().optional(),
    }),
);

type IEndpointPrimitives = 'path' | 'area' | 'email' | 'tag' | 'int' | 'float' | 'safedir' | 'lang' | 'notags' | 'component' | 'raw' | 'localurl' | 'url' | 'alphanum' | 'bool' | 'alpha' | 'stringid' | 'file' | 'text' | 'theme' | 'raw_trimmed' | 'alphanumext' | 'plugin' | null;

export type IEndpointResponse = {
    description?: string;
    nullable: boolean;
} & (
        {
            type: "array";
            items: IEndpointResponse;
        } | {
            type: "object";
            properties: Record<string, IEndpointResponse>;
        } | {
            type: IEndpointPrimitives;
        }
    );

export type IEndpointParams = z.infer<typeof EndpointParamsSchema>;