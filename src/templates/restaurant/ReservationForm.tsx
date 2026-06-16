"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const TIMES = [
  "11:30", "12:00", "12:30", "13:00", "13:30",
  "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const GUEST_COUNTS = [
  "1 Guest", "2 Guests", "3 Guests", "4 Guests", "5 Guests", "6 Guests", "7+ (Group)",
];

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Halal-friendly", "Gluten-free", "Shellfish allergy", "Nut allergy",
];

const reservationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z.string().min(1, "Number of guests is required"),
  phone: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  dietary: z.string().optional(),
  specialRequests: z.string().optional(),
});

type ReservationValues = z.infer<typeof reservationSchema>;

const defaultValues: ReservationValues = {
  date: "",
  time: "",
  guests: "",
  phone: "",
  fullName: "",
  email: "",
  dietary: "",
  specialRequests: "",
};

const fieldInputClass =
  "rounded-none border-input bg-background pl-9 py-3 h-auto font-sans text-sm focus-visible:border-gold focus-visible:ring-gold/30";
const plainInputClass =
  "rounded-none border-input bg-background px-4 py-3 h-auto font-sans text-sm focus-visible:border-gold focus-visible:ring-gold/30";
const fieldLabelClass = "font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground";
const triggerClass =
  "w-full rounded-none border-input bg-background pl-9 py-3 h-auto font-sans text-sm justify-between focus-visible:border-gold focus-visible:ring-gold/30";

interface Props {
  externalBookingUrl?: string;
}

export function ReservationForm({ externalBookingUrl }: Props) {
  "use no memo";

  const [submitted, setSubmitted] = useState(false);
  const { handleSubmit, control, reset } = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
  });

  const onSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-card border border-border p-10 text-center flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-full border border-gold flex items-center justify-center">
          <span className="text-2xl text-gold font-serif">✓</span>
        </div>
        <h3 className="font-serif text-2xl text-foreground">
          Reservation Requested
        </h3>
        <p className="font-sans text-sm text-muted-foreground max-w-sm leading-relaxed">
          Thank you. The restaurant will confirm by email within 24 hours.
          Please check your inbox — including spam.
        </p>
        {externalBookingUrl && (
          <a
            href={externalBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs tracking-[0.15em] uppercase text-gold border-b border-gold pb-0.5 hover:opacity-70 transition-opacity"
          >
            Book instantly on the restaurant&apos;s system
          </a>
        )}
        <button
          onClick={() => { setSubmitted(false); reset(defaultValues); }}
          className="font-sans text-xs tracking-[0.15em] uppercase px-6 py-3 border border-border text-foreground hover:bg-secondary transition-colors"
        >
          Make Another Reservation
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border p-8 md:p-10"
    >
      <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
        Step 1 of 1
      </p>
      <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">
        Reserve Your Table
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Controller
          name="date"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Date <span className="text-gold">*</span>
              </FieldLabel>
              <div className="relative">
                <Calendar
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className={fieldInputClass}
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="time"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Time <span className="text-gold">*</span>
              </FieldLabel>
              <div className="relative">
                <Clock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground pointer-events-none"
                />
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className={triggerClass} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="guests"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Number of Guests <span className="text-gold">*</span>
              </FieldLabel>
              <div className="relative">
                <Users
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground pointer-events-none"
                />
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} className={triggerClass} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select guests" />
                  </SelectTrigger>
                  <SelectContent>
                    {GUEST_COUNTS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Phone
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="tel"
                placeholder="+xx xxx xxx xxxx"
                className={plainInputClass}
              />
            </Field>
          )}
        />

        <Controller
          name="fullName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Full Name <span className="text-gold">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Jane Smith"
                className={plainInputClass}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Email <span className="text-gold">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="your@email.com"
                className={plainInputClass}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="dietary"
          control={control}
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Dietary Restrictions / Allergies
              </FieldLabel>
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} className="w-full rounded-none border-input bg-background px-4 py-3 h-auto font-sans text-sm justify-between focus-visible:border-gold focus-visible:ring-gold/30">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {DIETARY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="specialRequests"
          control={control}
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={field.name} className={fieldLabelClass}>
                Special Requests
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={3}
                placeholder="Celebrations, anniversaries, accessibility needs, high chair..."
                className="rounded-none border-input bg-background px-4 py-3 font-sans text-sm resize-none focus-visible:border-gold focus-visible:ring-gold/30"
              />
            </Field>
          )}
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          type="submit"
          className="w-full sm:w-auto font-sans text-xs tracking-[0.2em] uppercase px-10 py-4 bg-foreground text-background hover:bg-gold hover:text-ink transition-colors duration-200"
        >
          Request Reservation
        </button>
        <p className="font-sans text-xs text-muted-foreground leading-relaxed">
          Confirmation within 24 hours by email.
          {externalBookingUrl && (
            <>
              {" "}
              <a
                href={externalBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:opacity-70"
              >
                Book instantly →
              </a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}
