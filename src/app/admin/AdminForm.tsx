"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { saveRestaurantAction } from "@/lib/restaurants/admin-actions";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminForm() {
  const [nameEn, setNameEn] = useState("");
  const [nameJp, setNameJp] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [aiOverview, setAiOverview] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [category, setCategory] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [hiddenGem, setHiddenGem] = useState(false);
  const [mdxBody, setMdxBody] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleNameEnBlur = () => {
    if (!slug && nameEn) setSlug(slugify(nameEn));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMdxBody(await file.text());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = await saveRestaurantAction({
      slug: slug || slugify(nameEn),
      nameEn,
      nameJp: nameJp || undefined,
      address: address || undefined,
      aiOverview: aiOverview || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      category: category || undefined,
      prefecture: prefecture || undefined,
      imageUrl: imageUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      hiddenGem,
      mdxBody: mdxBody || undefined,
    });

    setSaving(false);

    if (result.ok) {
      toast.success("Restaurant saved successfully!");
      setNameEn(""); setNameJp(""); setSlug(""); setAddress(""); setAiOverview("");
      setLat(""); setLng(""); setCategory(""); setPrefecture(""); setImageUrl("");
      setWebsiteUrl(""); setHiddenGem(false); setMdxBody("");
      if (fileRef.current) fileRef.current.value = "";
    } else {
      toast.error(result.error ?? "Failed to save. Please try again.");
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { required?: boolean; type?: string; onBlur?: () => void; placeholder?: string },
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {opts?.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={opts?.type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={opts?.onBlur}
        placeholder={opts?.placeholder}
        required={opts?.required}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field("Name (English)", nameEn, setNameEn, { required: true, onBlur: handleNameEnBlur })}
      {field("Name (Japanese)", nameJp, setNameJp)}
      {field("Slug (auto-filled from name)", slug, setSlug, { placeholder: "auto-filled", required: true })}
      {field("Address", address, setAddress)}

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          AI Overview <span className="text-xs text-muted-foreground">(shown in pin preview)</span>
        </label>
        <textarea
          value={aiOverview}
          onChange={(e) => setAiOverview(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Short AI-generated overview shown on the map pin popup…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field("Latitude", lat, setLat, { type: "number", placeholder: "e.g. 35.6762" })}
        {field("Longitude", lng, setLng, { type: "number", placeholder: "e.g. 139.6503" })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field("Category", category, setCategory, { placeholder: "restaurant / cafe / stay / experience" })}
        {field("Prefecture", prefecture, setPrefecture, { placeholder: "e.g. Tokyo" })}
      </div>

      {field("Image URL", imageUrl, setImageUrl, { type: "url", placeholder: "https://…" })}
      {field("Website URL", websiteUrl, setWebsiteUrl, { type: "url", placeholder: "https://…" })}

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={hiddenGem}
          onChange={(e) => setHiddenGem(e.target.checked)}
          className="rounded border-border"
        />
        Hidden gem (verified)
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          MDX Content File <span className="text-xs text-muted-foreground">(.mdx — uploaded as text)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".mdx,.md"
          onChange={handleFileChange}
          className="text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
        />
        {mdxBody && (
          <p className="mt-1 text-xs text-green-600">✓ {mdxBody.length.toLocaleString()} chars loaded</p>
        )}
      </div>

      {mdxBody && (
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">MDX Preview / Edit</label>
          <textarea
            value={mdxBody}
            onChange={(e) => setMdxBody(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Restaurant"}
      </button>
    </form>
  );
}
