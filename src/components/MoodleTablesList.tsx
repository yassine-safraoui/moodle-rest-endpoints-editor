"use client";
import { Doc } from "@/../convex/_generated/dataModel";
import { useState } from "react";
import { EyeOff, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "./ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { useQuery } from "convex-helpers/react";

export default function MoodleTablesList({ filter }: { filter?: string }) {
  const {
    results: untrackedMoodleTables,
    loadMore: loadMoreUntrackedMoodleTables,
    isLoading: untrackedMoodleTablesLoading,
  } = usePaginatedQuery(
    api.schema_editor.getMoodleTables,
    { search: filter, is_tracked: false },
    {
      initialNumItems: 40,
    },
  );
  const {
    data: trackedMoodleTables,
    isPending: trackedMoodleTablesListLoading,
  } = useQuery(api.schema_editor.getMoodleTrackedTables, {});
  const trackedMoodleTablesList = trackedMoodleTables?.tables;

  const [trackedCollapsed, setTrackedCollapsed] = useState(false);
  const [untrackedCollapsed, setUntrackedCollapsed] = useState(false);
  const setTrackedMoodleTable = useMutation(
    api.schema_editor.updateTrackedMoodleTable,
  );
  const setMoodleTableVisibility = useMutation(
    api.schema_editor.updateMoodleTableVisibility,
  );
  if (untrackedMoodleTablesLoading || trackedMoodleTablesListLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }
  if (trackedMoodleTablesList == undefined)
    return (
      <div className="flex h-full w-full items-center justify-center">
        Couldn&apos;t load tracked tables...
      </div>
    );

  if (untrackedMoodleTables == undefined)
    return (
      <div className="flex h-full w-full items-center justify-center">
        Couldn&apos;t load tracked tables...
      </div>
    );

  return (
    <ScrollArea className="flex max-h-full flex-col pt-1" id="scroll-areas">
      <Collapsible
        open={!trackedCollapsed}
        onOpenChange={(newOpen) => setTrackedCollapsed(!newOpen)}
        className="h-fit w-full"
      >
        <div className="flex items-center justify-start gap-1 pl-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0">
              {trackedCollapsed ? (
                <ChevronRight size={20} className="h-5" />
              ) : (
                <ChevronDown size={20} className="h-5" />
              )}
              <span className="sr-only">
                {trackedCollapsed ? "Show" : "Collapse"} Tracked Tables
              </span>
            </Button>
          </CollapsibleTrigger>
          <h4 className="text-sm font-semibold">Tracked Moodle Tables</h4>
        </div>
        <CollapsibleContent asChild>
          <ul className="mt-0 flex flex-col">
            {trackedMoodleTablesList.map((trackedTable) => (
              <div
                className={`group h-7 w-full flex-row items-center justify-between gap-1 pl-10 pr-4 odd:bg-slate-100 ${
                  !!filter &&
                  !trackedTable.name
                    .toLowerCase()
                    .includes(filter.toLowerCase())
                    ? "hidden"
                    : "flex"
                }`}
                key={trackedTable._id}
              >
                <div className="flex flex-row gap-2">
                  <div
                    className="cursor-default hover:text-accent-foreground"
                    draggable
                  >
                    {trackedTable.name}
                  </div>
                  {trackedTable.is_hidden ? (
                    <EyeOff
                      className="hidden cursor-pointer group-hover:inline-block"
                      size={"1rem"}
                      onClick={() =>
                        setMoodleTableVisibility({
                          tableId: trackedTable._id,
                          hidden: false,
                        })
                      }
                    />
                  ) : (
                    <Eye
                      className="hidden cursor-pointer group-hover:inline-block"
                      size={"1rem"}
                      onClick={() =>
                        setMoodleTableVisibility({
                          tableId: trackedTable._id,
                          hidden: true,
                        })
                      }
                    />
                  )}
                </div>
                <Button
                  className="hidden h-6 select-none group-hover:block"
                  variant={"ghost"}
                  size={"sm"}
                  onClick={async () => {
                    await setTrackedMoodleTable({
                      tableId: trackedTable._id,
                      tracked: false,
                    });
                  }}
                >
                  untrack table
                </Button>
              </div>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        open={!untrackedCollapsed}
        onOpenChange={(newOpen) => setUntrackedCollapsed(!newOpen)}
        className="h-full w-full"
      >
        <div className="flex items-center justify-start gap-1 pl-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0">
              {untrackedCollapsed ? (
                <ChevronRight size={20} className="h-5" />
              ) : (
                <ChevronDown size={20} className="h-5" />
              )}
              <span className="sr-only">
                {untrackedCollapsed ? "Show" : "Collapse"} Untracked Tables
              </span>
            </Button>
          </CollapsibleTrigger>
          <h4 className="text-sm font-semibold">Untracked Moodle Tables</h4>
        </div>
        <CollapsibleContent asChild>
          <ul className="mt-0 flex h-full flex-col">
            {untrackedMoodleTables
              .filter((table) => !table.is_tracked)
              .map((untrackedTable) => (
                <div
                  className={`group h-7 w-full flex-row items-center justify-between gap-1 pl-10 pr-4 odd:bg-slate-100 ${
                    !!filter &&
                    !untrackedTable.name
                      .toLowerCase()
                      .includes(filter.toLowerCase())
                      ? "hidden"
                      : "flex"
                  }`}
                  key={untrackedTable._id}
                >
                  <div className="cursor-default hover:text-accent-foreground">
                    {untrackedTable.name}
                  </div>
                  <Button
                    className="hidden h-6 select-none group-hover:block"
                    variant={"ghost"}
                    size={"sm"}
                    onClick={async () => {
                      await setTrackedMoodleTable({
                        tableId: untrackedTable._id,
                        tracked: true,
                      });
                    }}
                  >
                    track table
                  </Button>
                </div>
              ))}
            <div className="flex flex-row place-content-center pb-4 pt-2">
              <Button
                onClick={() => loadMoreUntrackedMoodleTables(10)}
                variant={"outline"}
              >
                Load more
              </Button>
            </div>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </ScrollArea>
  );
}
