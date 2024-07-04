"use client";

import EndpointComponent from "@/components/Endpoint";
import { useQuery } from "convex-helpers/react";
import { api } from "../../../../../convex/_generated/api";
import {
  EndpointParamsSchema,
  // EndpointResponseSchema,
  ValidateResponse,
} from "@/components/types";

export default function Endpoint({ params }: { params: { name: string } }) {
  const { data: endpoint, isPending } = useQuery(api.endpoints.getEndpoint, {
    name: params.name,
  });
  if (isPending)
    return (
      <div className="flex h-full w-full place-content-center">Loading...</div>
    );
  if (!endpoint) return <div>Endpoint not found</div>;
  try {
    const paramsSchema = EndpointParamsSchema.parse(
      JSON.parse(endpoint.paramsSchema),
    );
    // const responseSchema = ValidateResponse(
    //   JSON.parse(endpoint.responseSchema),
    // );
    return (
      <div className="w-full overflow-hidden overflow-y-auto px-10 pt-10">
        <EndpointComponent
          endpoint={{
            ...endpoint,
            paramsSchema,
            responseSchema: JSON.parse(endpoint.responseSchema),
          }}
        />
      </div>
    );
  } catch (e) {
    console.error(
      "Invalid endpoint params",
      JSON.parse(endpoint.paramsSchema),
      // JSON.parse(endpoint.responseSchema),
    );
    console.error(e);
    return <div>Invalid endpoint params schema</div>;
  }
}
