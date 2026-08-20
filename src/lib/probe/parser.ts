import { NewAudit, AuditDimension, HallucinationItem, ActionItem } from "../db/schema/audit";

export function calculateOverallGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function parseProbeResult(
  raw: Record<string, unknown>,
  defaultName: string,
  defaultLocation: string
): Omit<NewAudit, "id"> {
  const scoreNum = typeof raw.overallScore === "number" ? raw.overallScore : 30;
  const overallScore = Math.max(0, Math.min(100, scoreNum));
  const rawGrade = typeof raw.grade === "string" ? raw.grade : "";
  const grade = ["A", "B", "C", "D", "F"].includes(rawGrade) ? rawGrade : calculateOverallGrade(overallScore);

  const defaultDimension = (name: string): AuditDimension => ({
    name,
    score: 30,
    grade: "F",
    status: "critical",
    summary: "Information missing or unverifiable in AI engines.",
    details: ["No structured data detected"],
  });

  const rawDimensions = (raw.dimensions && typeof raw.dimensions === "object" ? raw.dimensions : {}) as Record<string, AuditDimension>;

  const dimensions: Record<string, AuditDimension> = {
    entityClarity: rawDimensions.entityClarity || defaultDimension("Entity Clarity"),
    accuracy: rawDimensions.accuracy || defaultDimension("Accuracy & Hallucinations"),
    englishReadiness: rawDimensions.englishReadiness || defaultDimension("English Inbound Readiness"),
    actionability: rawDimensions.actionability || defaultDimension("Direct Actionability"),
  };

  const rawHallucinations = Array.isArray(raw.hallucinations) ? raw.hallucinations : [];
  const hallucinations: HallucinationItem[] = rawHallucinations.map((h: unknown) => {
    const item = (h && typeof h === "object" ? h : {}) as Record<string, unknown>;
    const severity = item.severity === "high" || item.severity === "low" ? item.severity : "medium";
    return {
      claim: String(item.claim || ""),
      reality: item.reality ? String(item.reality) : undefined,
      severity,
    };
  });

  const rawActions = Array.isArray(raw.actionItems) ? raw.actionItems : [];
  const actionItems: ActionItem[] = rawActions.map((a: unknown, idx: number) => {
    const item = (a && typeof a === "object" ? a : {}) as Record<string, unknown>;
    return {
      priority: typeof item.priority === "number" ? item.priority : idx + 1,
      title: String(item.title || "Fix structured data"),
      description: String(item.description || "Deploy AI-readable schema markup"),
      estimatedImpact: String(item.estimatedImpact || "+20 points"),
    };
  });

  return {
    businessName: typeof raw.businessName === "string" ? raw.businessName : defaultName,
    location: typeof raw.location === "string" ? raw.location : defaultLocation,
    entityType: typeof raw.entityType === "string" ? raw.entityType : "general",
    overallScore,
    grade,
    teaserSummary: typeof raw.teaserSummary === "string" ? raw.teaserSummary : "AI models lack verified, authoritative data about this business.",
    dimensions,
    hallucinations,
    actionItems,
    reportPayload: raw,
  };
}
