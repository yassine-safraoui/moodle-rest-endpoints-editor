import Link from "next/link";
import { Doc } from "../../convex/_generated/dataModel";
import { IEndpointParams, IEndpointResponse } from "./types";
import EndpointParams from "./EndpointParams";
import EndpointResponse from "./EndpointResponse";

export default function EndpointComponent({
  endpoint,
}: {
  endpoint: Omit<Doc<"endpoints">, "paramsSchema"> & {
    paramsSchema: IEndpointParams;
    responseSchema: IEndpointResponse;
  };
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-semibold md:text-2xl">{endpoint?.name}</h1>
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
      <code className="bg-syntax-code-background text-syntax-code rounded-md p-3">
        <EndpointResponse params={endpoint.responseSchema} />
      </code>
      {/* <code>{endpoint.responseSchema}</code> */}
    </div>
  );
}
