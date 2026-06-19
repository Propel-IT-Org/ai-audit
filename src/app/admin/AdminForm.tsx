"use client";

import { useRef } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveRestaurantAction, parseRestaurantMdxAction } from "@/lib/restaurants/admin-actions";
import type { Restaurant } from "@/lib/db/schema/restaurant";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_OPTIONS = ["restaurant", "cafe", "stay", "experience", "other"] as const;

const formSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameJp: z.string().optional(),
  slug: z.string().optional(),
  address: z.string().optional(),
  aiOverview: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  category: z.string().optional(),
  prefecture: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  websiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  hiddenGem: z.boolean(),
  mdxBody: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  nameEn: "",
  nameJp: "",
  slug: "",
  address: "",
  aiOverview: "",
  lat: "",
  lng: "",
  category: "",
  prefecture: "",
  imageUrl: "",
  websiteUrl: "",
  hiddenGem: false,
  mdxBody: "",
};

export function AdminForm({ initial, mode = "create" }: { initial?: Restaurant; mode?: "create" | "edit" }) {
  "use no memo";

  const initialValues: FormValues = initial
    ? {
        nameEn: initial.nameEn ?? "",
        nameJp: initial.nameJp ?? "",
        slug: initial.slug ?? "",
        address: initial.address ?? "",
        aiOverview: initial.aiOverview ?? "",
        lat: initial.lat != null ? String(initial.lat) : "",
        lng: initial.lng != null ? String(initial.lng) : "",
        category: initial.category ?? "",
        prefecture: initial.prefecture ?? "",
        imageUrl: initial.imageUrl ?? "",
        websiteUrl: initial.websiteUrl ?? "",
        hiddenGem: initial.hiddenGem ?? false,
        mdxBody: "",
      }
    : defaultValues;

  const fileRef = useRef<HTMLInputElement>(null);
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: initialValues });

  const mdxBody = useWatch({ control, name: "mdxBody" });

  const handleNameEnBlur = () => {
    const { slug, nameEn } = getValues();
    if (!slug && nameEn) setValue("slug", slugify(nameEn));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setValue("mdxBody", text);
    const { fields } = await parseRestaurantMdxAction(text);
    const current = getValues();
    let filled = 0;
    (Object.entries(fields) as [keyof FormValues, string][]).forEach(([k, v]) => {
      if (!current[k]) { setValue(k, v); filled++; }
    });
    if (filled > 0) toast.success(`${filled} field${filled > 1 ? "s" : ""} auto-filled from MDX`);
  };

  const onSubmit = async (values: FormValues) => {
    const result = await saveRestaurantAction({
      slug: values.slug || slugify(values.nameEn),
      nameEn: values.nameEn,
      nameJp: values.nameJp || undefined,
      address: values.address || undefined,
      aiOverview: values.aiOverview || undefined,
      lat: values.lat ? parseFloat(values.lat) : undefined,
      lng: values.lng ? parseFloat(values.lng) : undefined,
      category: values.category || undefined,
      prefecture: values.prefecture || undefined,
      imageUrl: values.imageUrl || undefined,
      websiteUrl: values.websiteUrl || undefined,
      hiddenGem: values.hiddenGem,
      mdxBody: values.mdxBody || undefined,
    });

    if (result.ok) {
      toast.success(mode === "edit" ? "Restaurant updated!" : "Restaurant saved!");
      if (mode === "create") { reset(defaultValues); if (fileRef.current) fileRef.current.value = ""; }
    } else {
      toast.error(result.error ?? "Failed to save. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="nameEn"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Name (English) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                onBlur={() => { field.onBlur(); handleNameEnBlur(); }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="nameJp"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Name (Japanese)</FieldLabel>
              <Input {...field} id={field.name} />
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
              <Input {...field} id={field.name} placeholder="auto-filled from name" aria-invalid={fieldState.invalid} />
              <FieldDescription>Leave blank to auto-generate from the English name.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Address</FieldLabel>
              <Input {...field} id={field.name} />
            </Field>
          )}
        />

        <Controller
          name="aiOverview"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>AI Overview</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={3}
                placeholder="Short AI-generated overview shown on the map pin popup…"
              />
              <FieldDescription>Shown in the pin preview popup.</FieldDescription>
            </Field>
          )}
        />

        <Field orientation="responsive">
          <Controller
            name="lat"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Latitude</FieldLabel>
                <Input {...field} id={field.name} type="number" step="any" placeholder="e.g. 35.6762" />
              </Field>
            )}
          />
          <Controller
            name="lng"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Longitude</FieldLabel>
                <Input {...field} id={field.name} type="number" step="any" placeholder="e.g. 139.6503" />
              </Field>
            )}
          />
        </Field>

        <Field orientation="responsive">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="prefecture"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Prefecture</FieldLabel>
                <Input {...field} id={field.name} placeholder="e.g. Tokyo" />
              </Field>
            )}
          />
        </Field>

        <Controller
          name="imageUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Image URL</FieldLabel>
              <Input {...field} id={field.name} type="url" placeholder="https://…" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="websiteUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Website URL</FieldLabel>
              <Input {...field} id={field.name} type="url" placeholder="https://…" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="hiddenGem"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor={field.name} className="font-normal">
                Hidden gem (verified)
              </FieldLabel>
            </Field>
          )}
        />

        <FieldSeparator />

        <Field>
          <FieldLabel htmlFor="mdxFile">MDX Content File</FieldLabel>
          <input
            ref={fileRef}
            id="mdxFile"
            type="file"
            accept=".mdx,.md"
            onChange={handleFileChange}
            className="text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
          />
          <FieldDescription>
            {mdxBody ? `✓ ${mdxBody.length.toLocaleString()} chars loaded` : ".mdx — uploaded as text"}
          </FieldDescription>
        </Field>

        {mdxBody && (
          <Controller
            name="mdxBody"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>MDX Preview / Edit</FieldLabel>
                <Textarea {...field} id={field.name} rows={8} className="font-mono text-xs" />
              </Field>
            )}
          />
        )}

        <FieldContent>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving…" : mode === "edit" ? "Update Restaurant" : "Save Restaurant"}
          </Button>
        </FieldContent>
      </FieldGroup>
    </form>
  );
}
