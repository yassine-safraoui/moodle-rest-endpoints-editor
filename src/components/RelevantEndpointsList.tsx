import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "./ui/scroll-area";

export default function RelevantEndpointsList({
  filter,
  categoriesList,
  endpointsList,
  categoriesLoading,
  endpointsLoading,
  activeEndpoint,
  activeCategory,
}: {
  filter?: string;
  categoriesList: Doc<"categories">[] | undefined;
  endpointsList: Doc<"endpoints">[] | undefined;
  categoriesLoading: boolean;
  endpointsLoading: boolean;
  activeEndpoint?: string;
  activeCategory?: string;
}) {
  const activeCategoryElement = useRef<HTMLAnchorElement>(null);
  const activeEndpointElement = useRef<HTMLAnchorElement>(null);
  const setEndpointRelevance = useMutation(api.endpoints.setEndpointRelevance);

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
    categoriesLoading,
    endpointsLoading,
    activeCategoryElement.current,
    activeEndpointElement.current,
  ]);

  if (!categoriesList || !endpointsList) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <ScrollArea className="flex max-h-full flex-col pl-4 pt-1">
      {categoriesList.map((category) => {
        const categoryEndpoints = endpointsList.filter(
          (endpoint) => endpoint.categoryId === category._id,
        );
        return (
          <div
            key={category._id}
            hidden={
              (!!filter &&
                categoryEndpoints.filter(
                  (endpoint) =>
                    filter &&
                    endpoint.name.toLowerCase().includes(filter.toLowerCase()),
                ).length === 0) ||
              categoryEndpoints.every((endpoint) => !endpoint.relevant)
            }
            className="mb-2"
          >
            <div className="group flex w-full flex-row items-center gap-1">
              <Link href={`/category/${category.name}`} legacyBehavior>
                <a
                  className={`text-wrap px-2 italic hover:text-accent-foreground hover:underline ${
                    category.name === activeCategory
                      ? "rounded-md bg-slate-200 py-0.5 font-bold"
                      : ""
                  }`}
                  ref={
                    activeCategory === category.name
                      ? activeCategoryElement
                      : null
                  }
                >
                  {category.name}
                </a>
              </Link>
            </div>
            <ul className="flex flex-col gap-2 pl-6 pt-1">
              {endpointsList
                .filter((endpoint) => endpoint.categoryId === category._id)
                .map((endpoint) => (
                  <div
                    className={`group w-full flex-row items-center gap-0.5 pr-4 ${
                      (!!filter &&
                        !endpoint.name
                          .toLowerCase()
                          .includes(filter.toLowerCase())) ||
                      !endpoint.relevant
                        ? "hidden"
                        : "flex"
                    }`}
                    key={endpoint._id}
                  >
                    <Link legacyBehavior href={`/endpoint/${endpoint.name}`}>
                      <a
                        className={`block w-fit max-w-full overflow-hidden text-wrap px-2 hover:text-accent-foreground hover:underline ${
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
                    <Star
                      size={"1rem"}
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
                  </div>
                ))}
            </ul>
          </div>
        );
      })}
    </ScrollArea>
  );
}
