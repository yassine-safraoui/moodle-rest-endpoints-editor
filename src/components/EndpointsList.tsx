import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";

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
          <Link
            className={`text-wrap italic hover:text-accent-foreground hover:underline ${category.name === activeCategory ? "font-bold" : ""}`}
            href={`/category/${category.name}`}
          >
            {category.name}
          </Link>
          <ul className="flex flex-col gap-2 pl-6 pt-1">
            {endpointsList
              .filter((endpoint) => endpoint.categoryId === category._id)
              .map((endpoint) => (
                <Link
                  href={`/endpoint/${endpoint.name}`}
                  key={endpoint._id}
                  className={`block overflow-hidden text-wrap hover:text-accent-foreground hover:underline ${endpoint.name === activeEndpoint ? "font-bold" : ""}`}
                  hidden={
                    (!!filter &&
                      !endpoint.name
                        .toLowerCase()
                        .includes(filter.toLowerCase())) ||
                    endpoint.hidden
                  }
                >
                  {endpoint.name
                    .split("_")
                    .map((x, i) => (i ? [<wbr key={i} />, "_", x] : x))}
                </Link>
              ))}
          </ul>
        </div>
      ))}
    </ul>
  );
}
