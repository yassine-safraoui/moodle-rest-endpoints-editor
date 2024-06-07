import { IEndpointResponse } from "./types";
import ColoredSpan from "./ui/colored-span";

export default function EndpointResponse({
  params,
}: {
  params: IEndpointResponse;
}) {
  switch (params.type) {
    case "array":
      return (
        <span>
          <ColoredSpan color="pink">array</ColoredSpan>
          {" ["}
          {params.description ? (
            <ColoredSpan color="gray">
              {` // ${params.description}`}
            </ColoredSpan>
          ) : (
            ""
          )}
          <div className="ml-4 block">
            <EndpointResponse params={params.items} />
          </div>
          {"]"}
        </span>
      );
    case "object":
      return (
        <div>
          <ColoredSpan color="red">object</ColoredSpan>
          {" { "}
          {params.description ? (
            <ColoredSpan color="gray">
              {` // ${params.description}`}
            </ColoredSpan>
          ) : (
            ""
          )}
          <div className="border-syntax-code-key ml-4 block border-l-2 border-solid pl-3">
            {Object.entries(params.properties).map(([key, value]) => (
              <div key={key}>
                {key}
                <ColoredSpan color="gray">{" : "}</ColoredSpan>
                <EndpointResponse params={value} />
              </div>
            ))}
          </div>
          {"}"}
        </div>
      );
    default:
      return (
        <span>
          <ColoredSpan color="green">
            {params.type}
            {params.nullable ? "?" : ""}
          </ColoredSpan>
          {params.description ? (
            <ColoredSpan color="gray">
              {` // ${params.description}`}
            </ColoredSpan>
          ) : (
            ""
          )}
        </span>
      );
  }
}
