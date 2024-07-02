"use client";
import { ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import EndpointsList from "@/components/EndpointsList";
import { useQuery } from "convex-helpers/react";
import { api } from "@/../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import HiddenEndpointsList from "@/components/HiddenEndpointsList";
import HiddenCategoriesList from "@/components/HiddenCategoriesList";
import RelevantEndpointsList from "@/components/RelevantEndpointsList";

export default function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [endpointsFilter, setEndpointsFilter] = useState<string>("");
  const { data: endpointsList, isPending: endpointsLoading } = useQuery(
    api.endpoints.getEndpointsList,
    {},
  );
  const { data: categoriesList, isPending: categoriesLoading } = useQuery(
    api.categories.getCategoriesList,
    {},
  );

  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === undefined) {
        params.delete(name);
        return params.toString();
      }
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );
  const [activeEndpoint, setActiveEndpoint] = useState<string | undefined>(
    undefined,
  );
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    setActiveEndpoint(
      pathname.split("/").at(-2) == "endpoint"
        ? pathname.split("/").at(-1)
        : undefined,
    );
    setActiveCategory(
      pathname.split("/").at(-2) == "category"
        ? pathname.split("/").at(-1)
        : undefined,
    );
  }, [pathname]);

  const router = useRouter();

  return (
    <Tabs
      orientation="vertical"
      defaultValue="relevant-endpoints"
      onValueChange={(value) => {
        router.push(pathname + "?" + createQueryString("tab", value));
      }}
      className="flex h-full w-full flex-row gap-0 p-0"
    >
      <TabsList className="m-0 justify-center rounded-none px-2">
        <TabsTrigger value="relevant-endpoints">Relevant Endpoints</TabsTrigger>
        <TabsTrigger value="visible-endpoints">Visible Endpoints</TabsTrigger>
        <TabsTrigger value="hidden-categories">Hidden Categories</TabsTrigger>
        <TabsTrigger value="hidden-endpoints">Hidden Endpoints</TabsTrigger>
      </TabsList>
      <div
        className={`${
          searchParams.get("collapse") === "true" ? "w-0" : "w-[25vw]"
        } h-full max-w-[25vw] flex-shrink-0 overflow-hidden`}
        style={{ transition: "width", transitionDuration: "0.3s" }}
      >
        <div className="flex h-full w-[25vw] flex-col border-r bg-muted/40 text-sm font-medium">
          <div className="flex w-full flex-row place-content-center gap-2">
            <div className="relative my-4 w-full pl-6">
              <Search className="absolute left-[2.1rem] top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search endpoints..."
                className="w-full appearance-none bg-background pl-8 shadow-none"
                value={endpointsFilter}
                onChange={(e) => setEndpointsFilter(e.target.value)}
              />
            </div>
            <ChevronsLeft
              className="h-full cursor-pointer"
              size={"35"}
              onClick={() =>
                router.push(
                  pathname + "?" + createQueryString("collapse", "true"),
                )
              }
            />
          </div>
          <TabsContent
            value="relevant-endpoints"
            className="m-0 h-full w-full overflow-hidden p-0"
          >
            <RelevantEndpointsList
              filter={endpointsFilter}
              endpointsList={endpointsList}
              categoriesList={categoriesList}
              categoriesLoading={categoriesLoading}
              endpointsLoading={endpointsLoading}
              activeCategory={activeCategory}
              activeEndpoint={activeEndpoint}
            />
          </TabsContent>
          <TabsContent
            value="visible-endpoints"
            className="m-0 h-full w-full overflow-hidden p-0"
          >
            <EndpointsList
              filter={endpointsFilter}
              endpointsList={endpointsList}
              categoriesList={categoriesList}
              categoriesLoading={categoriesLoading}
              endpointsLoading={endpointsLoading}
              activeCategory={activeCategory}
              activeEndpoint={activeEndpoint}
            />
          </TabsContent>
          <TabsContent
            value="hidden-endpoints"
            className="m-0 h-full w-full overflow-hidden p-0"
          >
            <HiddenEndpointsList
              filter={endpointsFilter}
              endpointsList={endpointsList}
              categoriesList={categoriesList}
              categoriesLoading={categoriesLoading}
              endpointsLoading={endpointsLoading}
              activeCategory={activeCategory}
              activeEndpoint={activeEndpoint}
            />
          </TabsContent>
          <TabsContent
            value="hidden-categories"
            className="m-0 h-full w-full overflow-hidden p-0"
          >
            <HiddenCategoriesList
              filter={endpointsFilter}
              categoriesList={categoriesList}
              categoriesLoading={categoriesLoading}
              activeCategory={activeCategory}
            />
          </TabsContent>
        </div>
      </div>
      <div
        className="relative mt-14 h-full w-0"
        style={{
          opacity: searchParams.get("collapse") === "true" ? 1 : 0,
          transition: "opacity",
          transitionDuration: "0.3s",
        }}
      >
        <ChevronsRight
          className="absolute left-0 top-4 cursor-pointer"
          size={"35"}
          onClick={() =>
            router.push(
              pathname + "?" + createQueryString("collapse", undefined),
            )
          }
        />
      </div>

      <div className="flex h-full w-full flex-col overflow-hidden">
        <Navbar />
        {children}
      </div>
    </Tabs>
  );
}
