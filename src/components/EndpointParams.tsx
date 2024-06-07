/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/no-unescaped-entities */
import { IEndpointParams } from "./types";
import ColoredSpan from "./ui/colored-span";

export default function EndpointParams({
  params,
}: {
  params: IEndpointParams;
}) {
  return (
    <code className="bg-syntax-code-background text-syntax-code rounded-md p-3">
      {Object.keys(params).map((param) => {
        const key = param as keyof typeof params;
        params[key].description;
        return (
          <div key={param}>
            {param}
            {params[key].default && (
              <ColoredSpan color="gray">
                {" (defaults to "}
                {
                  <ColoredSpan color="orange">
                    "{params[key].default}"
                  </ColoredSpan>
                }
                )
              </ColoredSpan>
            )}
            <ColoredSpan color="gray">{" : "}</ColoredSpan>
            <ColoredSpan color="orange">
              {params[key].type && params[key].type}
              {!params[key].required && "?"}
            </ColoredSpan>
            {params[key].description && (
              <ColoredSpan color="gray">
                {" "}
                // {params[key].description}
              </ColoredSpan>
            )}
          </div>
        );
      })}
    </code>
  );
}
