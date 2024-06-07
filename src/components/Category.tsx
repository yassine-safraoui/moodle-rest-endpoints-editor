"use client";

import Link from "next/link";
import { Doc } from "@/../convex/_generated/dataModel";

export default function CategoryComponent({
  category,
}: {
  category: Doc<"categories"> & { endpoints: Doc<"endpoints">[] };
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg md:text-2xl">{category?.name}</h1>
      <ul className="flex flex-col gap-2">
        {category?.endpoints.map((endpoint) => (
          <Link
            href={`/endpoint/${endpoint.name}`}
            className="flex flex-col gap-0.5 hover:text-accent-foreground"
            key={endpoint._id}
          >
            <span className="font-bold">{endpoint.name}</span>
            <p className="italic">{endpoint.description}</p>
          </Link>
        ))}
      </ul>
    </div>
  );
}
