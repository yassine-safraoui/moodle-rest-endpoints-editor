import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

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

    return;
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
            <Eye
              className="hidden cursor-pointer group-hover:inline-block"
              size={"1rem"}
              onClick={() =>
                setCategoryVisibility({
                  categoryId: category._id,
                  hidden: true,
                })
              }
            />
          </div>
          <ul className="flex flex-col gap-2 pl-6 pt-1">
            {endpointsList
              .filter((endpoint) => endpoint.categoryId === category._id)
              .map((endpoint) => (
                <div
                  className="group flex w-full flex-row items-center gap-0.5 pr-4"
                  key={endpoint._id}
                >
                  <Link
                    legacyBehavior
                    href={`/endpoint/${endpoint.name}`}
                    hidden={
                      (!!filter &&
                        !endpoint.name
                          .toLowerCase()
                          .includes(filter.toLowerCase())) ||
                      endpoint.hidden
                    }
                  >
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
                  <Eye
                    className="hidden cursor-pointer group-hover:inline-block"
                    size={"1rem"}
                    onClick={() =>
                      setEndpointVisibility({
                        endpointId: endpoint._id,
                        hidden: true,
                      })
                    }
                  />
                </div>
              ))}
          </ul>
        </div>
      ))}
    </ul>
  );
}
