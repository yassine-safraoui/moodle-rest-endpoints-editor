import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";
import { useEffect, useRef } from "react";

export default function EndpointsList({
  filter,
  categoriesList,
  endpointsList,
  activeEndpoint,
  activeCategory,
}: {
  filter?: string;
  categoriesList: Doc<"categories">[] | undefined;
  endpointsList: Doc<"endpoints">[] | undefined;
  activeEndpoint?: string;
  activeCategory?: string;
}) {
  const activeCategoryElement = useRef<HTMLAnchorElement>(null);
  const activeEndpointElement = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeCategoryElement.current) {
      activeCategoryElement.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } else if (activeEndpointElement.current) {
      activeEndpointElement.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, [
    activeCategoryElement,
    activeEndpointElement,
    categoriesList,
    endpointsList,
  ]);

  if (!categoriesList || !endpointsList) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <ul className="flex max-h-full flex-col gap-1 overflow-hidden overflow-y-scroll pl-4">
      {categoriesList.map((category) => (
        <div
          key={category._id}
          hidden={
            (!!filter &&
              endpointsList.filter(
                (endpoint) =>
                  filter &&
                  endpoint.categoryId === category._id &&
                  endpoint.name.toLowerCase().includes(filter.toLowerCase()),
              ).length === 0) ||
            category.hidden
          }
        >
          <Link href={`/category/${category.name}`} legacyBehavior>
            <a
              className={`text-wrap px-2 italic hover:text-accent-foreground hover:underline ${
                category.name === activeCategory
                  ? "rounded-md bg-slate-200 py-0.5 font-bold"
                  : ""
              }`}
              ref={
                activeCategory === category.name ? activeCategoryElement : null
              }
            >
              {category.name}
            </a>
          </Link>
          <ul className="flex flex-col gap-2 pl-6 pt-1">
            {endpointsList
              .filter((endpoint) => endpoint.categoryId === category._id)
              .map((endpoint) => (
                <Link
                  legacyBehavior
                  href={`/endpoint/${endpoint.name}`}
                  key={endpoint._id}
                  hidden={
                    (!!filter &&
                      !endpoint.name
                        .toLowerCase()
                        .includes(filter.toLowerCase())) ||
                    endpoint.hidden
                  }
                >
                  <a
                    className={`block w-fit max-w-full overflow-hidden text-wrap px-2 pr-4 hover:text-accent-foreground hover:underline ${
                      endpoint.name === activeEndpoint
                        ? "rounded-md bg-slate-200 py-0.5 font-bold"
                        : ""
                    }`}
                    ref={
                      activeEndpoint === endpoint.name
                        ? activeEndpointElement
                        : null
                    }
                  >
                    {endpoint.name
                      .split("_")
                      .map((x, i) => (i ? [<wbr key={i} />, "_", x] : x))}
                  </a>
                </Link>
              ))}
          </ul>
        </div>
      ))}
    </ul>
  );
}
