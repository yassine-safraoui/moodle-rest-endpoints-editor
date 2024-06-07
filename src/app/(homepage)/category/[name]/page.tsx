"use client";
import { useQuery } from "convex-helpers/react";
import { api } from "@/../convex/_generated/api";
import CategoryComponent from "@/components/Category";

export default function Category({ params }: { params: { name: string } }) {
  const { data: category, isPending } = useQuery(api.categories.getCategory, {
    name: params.name,
  });
  if (isPending)
    return (
      <div className="flex w-full items-center justify-center">Loading...</div>
    );
  if (!category)
    return (
      <div className="flex w-full items-center justify-center">
        Category not found
      </div>
    );
  return (
    <div className="w-full overflow-hidden px-10 pt-10">
      <CategoryComponent category={category} />
    </div>
  );
}
