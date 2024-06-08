import Link from "next/link";
import { Doc } from "../../convex/_generated/dataModel";
import { IEndpointParams, IEndpointResponse } from "./types";
import EndpointParams from "./EndpointParams";
import EndpointResponse from "./EndpointResponse";
import { Eye, EyeOff, Star } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

export default function EndpointComponent({
  endpoint,
}: {
  endpoint: Omit<Doc<"endpoints">, "paramsSchema"> & {
    paramsSchema: IEndpointParams;
    responseSchema: IEndpointResponse;
  };
}) {
  const setEndpointVisibility = useMutation(
    api.endpoints.setEndpointVisibility,
  );
  const setEndpointRelevance = useMutation(api.endpoints.setEndpointRelevance);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <h1 className="text-lg font-semibold md:text-2xl">{endpoint?.name}</h1>
        {endpoint.relevant ? (
          <Star
            size={"2rem"}
            strokeWidth={0}
            fill="#ffe234"
            className="cursor-pointer"
            onClick={() =>
              setEndpointRelevance({
                endpointId: endpoint._id,
                relevant: false,
              })
            }
          />
        ) : (
          <Star
            className="cursor-pointer"
            size={"2rem"}
            onClick={() =>
              setEndpointRelevance({
                endpointId: endpoint._id,
                relevant: true,
              })
            }
          />
        )}
        {!endpoint.hidden && !endpoint.relevant ? (
          <EyeOff
            size={"2rem"}
            className="cursor-pointer"
            onClick={() =>
              setEndpointVisibility({
                endpointId: endpoint._id,
                hidden: true,
              })
            }
          />
        ) : (
          <Eye
            size={"2rem"}
            className="cursor-pointer"
            onClick={() =>
              setEndpointVisibility({
                endpointId: endpoint._id,
                hidden: false,
              })
            }
          />
        )}
      </div>
      <p>{endpoint.description}</p>
      {endpoint.requiredRoles.length > 0 && (
        <span>
          <b>Requires:</b>{" "}
          {endpoint.requiredRoles.map((role, index) => (
            <Link
              key={index}
              href={`https://docs.moodle.org/404/en/Capabilities/${role}`}
              className="hover:text-accent-foreground hover:underline"
            >
              {role + (index < endpoint.requiredRoles.length - 1 ? ", " : "")}
            </Link>
          ))}
        </span>
      )}
      <br />
      <b>Request</b>
      <EndpointParams params={endpoint.paramsSchema} />
      <br />
      <b>Response</b>
      <code className="rounded-md bg-syntax-code-background p-3 text-syntax-code">
        <EndpointResponse params={endpoint.responseSchema} />
      </code>
      {/* <code>{endpoint.responseSchema}</code> */}
    </div>
  );
}
