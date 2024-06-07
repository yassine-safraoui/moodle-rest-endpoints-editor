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

export function ValidateResponse(response: Record<string, any>): IEndpointResponse {
    if (!response['type']) throw new Error('Response type is required');
    if (response['type'] === 'array') {
        if (!response['items']) throw new Error('Response items is required for array type');
        return {
            description: response['description'],
            nullable: response['nullable'],
            type: 'array',
            items: ValidateResponse(response['items']),
        };
    }
    if (response['type'] === 'object') {
        if (!response['properties']) throw new Error('Response properties is required for object type');
        for (const key in response['properties']) {
            response['properties'][key] = ValidateResponse(response['properties'][key]);
        }
        return response as IEndpointResponse;
    }
    return response as IEndpointResponse;
}

export type IEndpointParams = z.infer<typeof EndpointParamsSchema>;