import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { Eye } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "./ui/scroll-area";

export default function HiddenCategoriesList({
  filter,
  categoriesList,
  categoriesLoading,
  activeCategory,
}: {
  filter?: string;
  categoriesList: Doc<"categories">[] | undefined;
  categoriesLoading: boolean;
  activeCategory?: string;
}) {
  const activeCategoryElement = useRef<HTMLAnchorElement>(null);
  const setCategoryVisibility = useMutation(
    api.categories.setCategoryVisibility,
  );

  useEffect(() => {
    if (activeCategoryElement.current) {
      activeCategoryElement.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, [categoriesLoading, activeCategoryElement.current]);

  if (!categoriesList) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <ScrollArea className="flex max-h-full flex-col gap-1 pl-4 pt-1">
      {categoriesList.map((category) => {
        return (
          <div
            className={`group w-full flex-row items-center gap-1 ${
              (!!filter &&
                category.name.toLowerCase().includes(filter.toLowerCase())) ||
              !category.hidden
                ? "hidden"
                : "flex"
            }`}
            key={category._id}
          >
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
                  hidden: false,
                })
              }
            />
          </div>
        );
      })}
    </ScrollArea>
  );
}
