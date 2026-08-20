import { describe, it, expect } from "vitest";
import { parseProbeResult, calculateOverallGrade } from "../parser";

describe("AI Probe Engine Parser & Scoring", () => {
  it("should calculate correct grade based on overall score", () => {
    expect(calculateOverallGrade(92)).toBe("A");
    expect(calculateOverallGrade(80)).toBe("B");
    expect(calculateOverallGrade(65)).toBe("C");
    expect(calculateOverallGrade(45)).toBe("D");
    expect(calculateOverallGrade(20)).toBe("F");
  });

  it("should parse raw LLM JSON into standardized audit schema", () => {
    const rawLlmOutput = {
      businessName: "Tanaka Ryokan",
      location: "Kanazawa",
      entityType: "ryokan",
      overallScore: 45,
      grade: "D",
      teaserSummary: "ChatGPT incorrectly states you are closed on weekends and provides no direct English booking path.",
      dimensions: {
        entityClarity: {
          name: "Entity Clarity",
          score: 40,
          grade: "D",
          status: "warning",
          summary: "AI recognizes the name but confuses it with a nearby hot spring property.",
          details: ["No structured schema markup found", "Entity ambiguous in Perplexity"],
        },
        accuracy: {
          name: "Accuracy & Hallucinations",
          score: 30,
          grade: "F",
          status: "critical",
          summary: "Stale hours and inaccurate pricing information stated by ChatGPT.",
          details: ["Claims ryokan is closed Sundays", "Outdated 2021 meal plan prices"],
        },
        englishReadiness: {
          name: "English Inbound Readiness",
          score: 25,
          grade: "F",
          status: "critical",
          summary: "No English dietary accommodation or reservation guidance available.",
          details: ["Foreign tourists redirected to broken link"],
        },
        actionability: {
          name: "Direct Actionability",
          score: 45,
          grade: "D",
          status: "warning",
          summary: "Direct booking links missing; traffic pushed to high-commission OTAs.",
          details: ["Only surfaces Expedia and Agoda listings"],
        },
      },
      hallucinations: [
        {
          claim: "Closed on Sundays and national holidays",
          reality: "Open 7 days a week",
          severity: "high",
        },
      ],
      actionItems: [
        {
          priority: 1,
          title: "Publish Verified JSON-LD Schema",
          description: "Establish official authority record for hours and pricing.",
          estimatedImpact: "+35 points",
        },
      ],
    };

    const parsed = parseProbeResult(rawLlmOutput, "Tanaka Ryokan", "Kanazawa");

    expect(parsed.businessName).toBe("Tanaka Ryokan");
    expect(parsed.location).toBe("Kanazawa");
    expect(parsed.overallScore).toBe(45);
    expect(parsed.grade).toBe("D");
    expect(parsed.dimensions.entityClarity.score).toBe(40);
    expect(parsed.hallucinations?.length).toBe(1);
    expect(parsed.actionItems?.length).toBe(1);
  });
});
