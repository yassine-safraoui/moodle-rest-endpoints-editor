import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { EyeOff, Star, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "./ui/scroll-area";

export default function EndpointsList({
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
  const setCategoryVisibility = useMutation(
    api.categories.setCategoryVisibility,
  );
  const setEndpointVisibility = useMutation(
    api.endpoints.setEndpointVisibility,
  );
  const setEndpointRelevance = useMutation(api.endpoints.setEndpointRelevance);
  const setCategoryRelevance = useMutation(api.categories.setCategoryRelevance);

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
              categoryEndpoints.filter((endpoint) => !endpoint.hidden)
                .length === 0 ||
              (!!filter &&
                categoryEndpoints.filter(
                  (endpoint) =>
                    filter &&
                    endpoint.name.toLowerCase().includes(filter.toLowerCase()),
                ).length === 0) ||
              category.hidden
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
              {categoryEndpoints.every((endpoint) => endpoint.relevant) ? (
                <Star
                  size={"1rem"}
                  strokeWidth={0}
                  fill="#ffe234"
                  className="hidden cursor-pointer group-hover:inline-block"
                  onClick={() =>
                    setCategoryRelevance({
                      categoryId: category._id,
                      relevant: false,
                    })
                  }
                />
              ) : (
                <Star
                  className="hidden cursor-pointer group-hover:inline-block"
                  size={"1rem"}
                  onClick={() =>
                    setCategoryRelevance({
                      categoryId: category._id,
                      relevant: true,
                    })
                  }
                />
              )}
              {categoryEndpoints.every((endpoint) => !endpoint.relevant) ? (
                <EyeOff
                  className="hidden cursor-pointer group-hover:inline-block"
                  size={"1rem"}
                  onClick={() =>
                    setCategoryVisibility({
                      categoryId: category._id,
                      hidden: true,
                    })
                  }
                />
              ) : (
                <EyeOff
                  className="hidden group-hover:inline-block"
                  color="#a1a5ae"
                  size={"1rem"}
                />
              )}
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
                      endpoint.hidden
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
                    {endpoint.implemented ? (
                      <Check size={"1rem"} color="#53a653" strokeWidth={3} />
                    ) : null}
                    {endpoint.relevant ? (
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
                    ) : (
                      <>
                        <Star
                          className="hidden cursor-pointer group-hover:inline-block"
                          size={"1rem"}
                          onClick={() =>
                            setEndpointRelevance({
                              endpointId: endpoint._id,
                              relevant: true,
                            })
                          }
                        />
                        <EyeOff
                          className="hidden cursor-pointer group-hover:inline-block"
                          size={"1rem"}
                          onClick={() =>
                            setEndpointVisibility({
                              endpointId: endpoint._id,
                              hidden: true,
                            })
                          }
                        />
                      </>
                    )}
                  </div>
                ))}
            </ul>
          </div>
        );
      })}
    </ScrollArea>
  );
}
