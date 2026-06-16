import { Card, CardContent } from "@/components/ui/card";
import { Plane, MessageSquare, TrendingUp } from "lucide-react";

const STATS = [
  { icon: Plane, value: "3.2M+", description: "inbound visitors to Japan used AI for trip planning in 2024" },
  { icon: MessageSquare, value: "62%", description: "of travelers ask ChatGPT or Gemini for restaurant recommendations" },
  { icon: TrendingUp, value: "¥2T+", description: "annual inbound tourism spending — growing every year" },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-2xl font-semibold text-foreground md:text-3xl">
          Japan's AI travel boom — is your business ready?
        </h2>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
            <Card key={stat.value} className="border-0 bg-card shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-light">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <p className="mb-2 text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
