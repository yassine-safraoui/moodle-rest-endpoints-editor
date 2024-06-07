"use client";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import EndpointsList from "@/components/EndpointsList";
import { useQuery } from "convex-helpers/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [endpointsFilter, setEndpointsFilter] = useState<string>("");
  const { data: endpointsList } = useQuery(api.endpoints.getEndpointsList, {});
  const { data: categoriesList } = useQuery(
    api.categories.getCategoriesList,
    {},
  );

  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      <div className="flex h-full w-[36vw] flex-col border-r bg-muted/40 text-sm font-medium">
        <div className="relative my-4 w-full px-6">
          <Search className="absolute left-[2.1rem] top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search endpoints..."
            className="w-full appearance-none bg-background pl-8 shadow-none"
            value={endpointsFilter}
            onChange={(e) => setEndpointsFilter(e.target.value)}
          />
        </div>
        <EndpointsList
          filter={endpointsFilter}
          endpointsList={endpointsList}
          categoriesList={categoriesList}
          activeCategory={
            pathname.split("/").at(-2) == "category"
              ? pathname.split("/").at(-1)
              : undefined
          }
          activeEndpoint={
            pathname.split("/").at(-2) == "endpoint"
              ? pathname.split("/").at(-1)
              : undefined
          }
        />
      </div>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
