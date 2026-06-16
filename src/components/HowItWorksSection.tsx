import { Scan, Globe, MapPin } from "lucide-react";

const STEPS = [
  {
    icon: Scan,
    step: "Step 1",
    title: "Free AI Audit",
    description: "Paste your URL and get an instant report on how AI tools see your business — robots.txt, schema markup, content structure and more.",
  },
  {
    icon: Globe,
    step: "Step 2",
    title: "AI Builds Your Page",
    description: "We extract your content, translate it to English, enrich it with AI, and publish a storefront optimised for ChatGPT, Gemini and Perplexity.",
  },
  {
    icon: MapPin,
    step: "Step 3",
    title: "Get Discovered",
    description: "Your business appears on our map and gets included in AI travel recommendations — connecting you directly with inbound tourists.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border bg-secondary/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-2xl font-semibold text-foreground md:text-3xl">
          How it works
        </h2>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <item.icon className="h-8 w-8" />
              </div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
