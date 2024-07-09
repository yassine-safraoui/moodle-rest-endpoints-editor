"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import csv from "csvtojson";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import { useCallback } from "react";
import { api } from "../../convex/_generated/api";
import { useAction } from "convex/react";

const FormSchema = z.object({
  tables: z
    .instanceof(FileList)
    .refine((files) => files.length == 1)
    .optional(),
  columns: z
    .instanceof(FileList)
    .refine((files) => files.length == 1)
    .optional(),
});

export default function Settings() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const tablesInputRef = form.register("tables", { required: false });
  const columnsInputRef = form.register("columns", { required: false });
  const importTables = useAction(api.admin.importTables);
  const importColumns = useAction(api.admin.importColumns);

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      const columns = await data.columns?.[0].text();
      const tables = await data.tables?.[0].text();
      console.log(columns, tables);
      if (!tables) return;
      csv({ output: "json" })
        .fromString(tables)
        .then(async (tablesData: any) => {
          console.log(tablesData);
          await importTables({ tables: JSON.stringify(tablesData) });

          if (!columns) return;
          csv({ output: "json" })
            .fromString(columns)
            .then((columnsData: any) => {
              console.log(columnsData);
              importColumns({ columns: JSON.stringify(columnsData) });
            });
        });
    },
    [importColumns, importTables],
  );

  return (
    <AlertDialogContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full p-10">
          <AlertDialogHeader>
            <AlertDialogTitle>Settings</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Upload Moodle tables and columns
            </AlertDialogDescription>
          </AlertDialogHeader>
          <FormField
            control={form.control}
            name="columns"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Upload Moodle columns CSV</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder="columns"
                      {...columnsInputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="tables"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Upload Moodle tables CSV</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder="tables"
                      {...tablesInputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" asChild>
              <Button type="submit">Upload</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </Form>
    </AlertDialogContent>
  );
}
