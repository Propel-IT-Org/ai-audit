"use client";

import { useRef } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveRestaurantAction } from "@/lib/restaurants/admin-actions";
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
  slug: z.string().min(1, "Slug is required"),
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

export function AdminForm() {
  "use no memo";

  const fileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues });

  const mdxBody = useWatch({ control, name: "mdxBody" });

  const handleNameEnBlur = () => {
    const { slug, nameEn } = getValues();
    if (!slug && nameEn) setValue("slug", slugify(nameEn));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("mdxBody", await file.text());
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
      toast.success("Restaurant saved successfully!");
      reset(defaultValues);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      toast.error(result.error ?? "Failed to save. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nameEn">
            Name (English) <span className="text-destructive">*</span>
          </FieldLabel>
          <Input id="nameEn" {...register("nameEn", { onBlur: handleNameEnBlur })} />
          <FieldError errors={[errors.nameEn]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="nameJp">Name (Japanese)</FieldLabel>
          <Input id="nameJp" {...register("nameJp")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">
            Slug <span className="text-destructive">*</span>
          </FieldLabel>
          <Input id="slug" placeholder="auto-filled" {...register("slug")} />
          <FieldError errors={[errors.slug]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input id="address" {...register("address")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="aiOverview">AI Overview</FieldLabel>
          <Textarea
            id="aiOverview"
            rows={3}
            placeholder="Short AI-generated overview shown on the map pin popup…"
            {...register("aiOverview")}
          />
          <FieldDescription>Shown in the pin preview popup.</FieldDescription>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="lat">Latitude</FieldLabel>
            <Input id="lat" type="number" step="any" placeholder="e.g. 35.6762" {...register("lat")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lng">Longitude</FieldLabel>
            <Input id="lng" type="number" step="any" placeholder="e.g. 139.6503" {...register("lng")} />
          </Field>
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className="w-full">
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
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="prefecture">Prefecture</FieldLabel>
            <Input id="prefecture" placeholder="e.g. Tokyo" {...register("prefecture")} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="imageUrl">Image URL</FieldLabel>
          <Input id="imageUrl" type="url" placeholder="https://…" {...register("imageUrl")} />
          <FieldError errors={[errors.imageUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
          <Input id="websiteUrl" type="url" placeholder="https://…" {...register("websiteUrl")} />
          <FieldError errors={[errors.websiteUrl]} />
        </Field>

        <Field orientation="horizontal">
          <Controller
            name="hiddenGem"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="hiddenGem"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <FieldLabel htmlFor="hiddenGem" className="font-normal">
            Hidden gem (verified)
          </FieldLabel>
        </Field>

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
          <Field>
            <FieldLabel htmlFor="mdxBody">MDX Preview / Edit</FieldLabel>
            <Textarea id="mdxBody" rows={8} className="font-mono text-xs" {...register("mdxBody")} />
          </Field>
        )}

        <FieldContent>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving…" : "Save Restaurant"}
          </Button>
        </FieldContent>
      </FieldGroup>
    </form>
  );
}
