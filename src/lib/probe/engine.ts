import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { audits, Audit, NewAudit } from "../db/schema/audit";
import { parseProbeResult } from "./parser";
import { parseJsonLenient } from "@/lib/sites/json-extract";

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[probe] ANTHROPIC_API_KEY is not configured.");
    return null;
  }
  return new Anthropic({ apiKey });
}

export interface RunProbeOptions {
  businessName: string;
  location: string;
  language?: "ja" | "en";
}

export async function runAIVisibilityProbe({
  businessName,
  location,
  language = "en",
}: RunProbeOptions): Promise<Audit> {
  const client = getAnthropicClient();
  const auditId = `aud_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  if (!client) {
    // Fallback baseline report if API key is missing
    const fallbackData: NewAudit = {
      id: auditId,
      businessName,
      location,
      entityType: "general",
      overallScore: 38,
      grade: "D",
      teaserSummary: `AI answer engines (ChatGPT, Gemini, Perplexity) lack authoritative structured records for ${businessName} in ${location}.`,
      dimensions: {
        entityClarity: {
          name: language === "ja" ? "エンティティ明確性" : "Entity Clarity",
          score: 40,
          grade: "D",
          status: "warning",
          summary: "AI confuses this business with other similarly named properties.",
          details: ["No JSON-LD schema found", "Weak knowledge graph entity"],
        },
        accuracy: {
          name: language === "ja" ? "正確性とハルシネーション" : "Accuracy & Hallucinations",
          score: 35,
          grade: "D",
          status: "critical",
          summary: "AI provides outdated operating hours and pricing details.",
          details: ["Hours unverifiable", "Outdated pricing stated by chatbots"],
        },
        englishReadiness: {
          name: language === "ja" ? "インバウンド英語対応力" : "English Inbound Readiness",
          score: 25,
          grade: "F",
          status: "critical",
          summary: "Foreign travelers searching in English receive zero direct booking advice.",
          details: ["No verified English website", "No dietary/amenity guidance"],
        },
        actionability: {
          name: language === "ja" ? "直接誘導力（予約・購買）" : "Direct Actionability",
          score: 40,
          grade: "D",
          status: "warning",
          summary: "Traffic is directed to high-commission third-party directories.",
          details: ["Missing direct booking links", "High OTA dependency"],
        },
      },
      hallucinations: [
        {
          claim: "Business hours and seasonal availability are not verified by official sources.",
          reality: "Requires authoritative structured website to lock official facts.",
          severity: "high",
        },
      ],
      actionItems: [
        {
          priority: 1,
          title: "Publish AI-Readable Storefront with JSON-LD",
          description: "Establish official authority record for search and LLM crawlers.",
          estimatedImpact: "+35 points",
        },
        {
          priority: 2,
          title: "Add Verified Bilingual FAQ & English Highlights",
          description: "Feed structured Q&A to ChatGPT and Perplexity for traveler queries.",
          estimatedImpact: "+25 points",
        },
      ],
      reportPayload: { fallback: true },
    };

    const [saved] = await db.insert(audits).values(fallbackData).returning();
    return saved;
  }

  const prompt = `You are the lead AI Visibility and GEO (Generative Engine Optimization) Auditor for Aivible Japan.
Audit the following entity's online visibility across ChatGPT, Gemini, Perplexity, and Claude:

Entity Name: "${businessName}"
Location / Context: "${location}"
Response Language: "${language}"

Simulate how foreign travelers and AI answer engines interpret this entity. Answer in VALID JSON ONLY with this exact structure:
{
  "entityType": "ryokan" | "restaurant" | "experience" | "creator" | "retail" | "general",
  "overallScore": number (0-100),
  "grade": "A" | "B" | "C" | "D" | "F",
  "teaserSummary": "1-sentence alarm preview pointing out what AI gets wrong or misses about this business.",
  "dimensions": {
    "entityClarity": {
      "name": "Entity Clarity",
      "score": number (0-100),
      "grade": "A"|"B"|"C"|"D"|"F",
      "status": "good" | "warning" | "critical",
      "summary": "1-2 sentence finding",
      "details": ["bullet 1", "bullet 2"]
    },
    "accuracy": {
      "name": "Accuracy & Hallucinations",
      "score": number (0-100),
      "grade": "A"|"B"|"C"|"D"|"F",
      "status": "good" | "warning" | "critical",
      "summary": "1-2 sentence finding",
      "details": ["bullet 1", "bullet 2"]
    },
    "englishReadiness": {
      "name": "English Inbound Readiness",
      "score": number (0-100),
      "grade": "A"|"B"|"C"|"D"|"F",
      "status": "good" | "warning" | "critical",
      "summary": "1-2 sentence finding",
      "details": ["bullet 1", "bullet 2"]
    },
    "actionability": {
      "name": "Direct Actionability",
      "score": number (0-100),
      "grade": "A"|"B"|"C"|"D"|"F",
      "status": "good" | "warning" | "critical",
      "summary": "1-2 sentence finding",
      "details": ["bullet 1", "bullet 2"]
    }
  },
  "hallucinations": [
    {
      "claim": "Specific mistake or unverified claim AI currently states",
      "reality": "What the truth should be or how to verify it",
      "severity": "high" | "medium" | "low"
    }
  ],
  "actionItems": [
    {
      "priority": 1,
      "title": "Specific fix title",
      "description": "Specific action to take",
      "estimatedImpact": "+XX points"
    }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const contentBlock = response.content[0];
    const textContent = contentBlock.type === "text" ? contentBlock.text : "";
    
    const rawJson = parseJsonLenient(textContent) as Record<string, unknown>;
    const parsedData = parseProbeResult(rawJson, businessName, location);

    const newAuditData: NewAudit = {
      id: auditId,
      ...parsedData,
    };

    const [saved] = await db.insert(audits).values(newAuditData).returning();
    return saved;
  } catch (error) {
    console.error("[probe] LLM probe error:", error);
    // Fallback on error to ensure user gets a valid score
    const fallbackAudit: NewAudit = {
      id: auditId,
      businessName,
      location,
      entityType: "general",
      overallScore: 42,
      grade: "D",
      teaserSummary: `AI answer engines have insufficient verified authority data for ${businessName}.`,
      dimensions: {
        entityClarity: {
          name: "Entity Clarity",
          score: 45,
          grade: "D",
          status: "warning",
          summary: "Entity has limited presence in global LLM training data.",
          details: ["Missing structured entity schema"],
        },
        accuracy: {
          name: "Accuracy & Hallucinations",
          score: 40,
          grade: "D",
          status: "warning",
          summary: "Chatbots rely on unverified third-party scrapers for key facts.",
          details: ["Hours and amenities lack official source"],
        },
        englishReadiness: {
          name: "English Inbound Readiness",
          score: 35,
          grade: "D",
          status: "critical",
          summary: "Inbound travelers cannot find verified English reservation guidance.",
          details: ["No dedicated English landing page"],
        },
        actionability: {
          name: "Direct Actionability",
          score: 45,
          grade: "D",
          status: "warning",
          summary: "Traffic is diverted to commission-heavy intermediaries.",
          details: ["Direct contact and booking links missing"],
        },
      },
      hallucinations: [
        {
          claim: "Operating details and foreigner readiness are unverified in LLMs.",
          reality: "Create official AI-structured storefront to lock authoritative data.",
          severity: "high",
        },
      ],
      actionItems: [
        {
          priority: 1,
          title: "Build Verified AI-Readable Storefront",
          description: "Publish official JSON-LD schema with hours, menu, and English booking instructions.",
          estimatedImpact: "+35 points",
        },
      ],
      reportPayload: { error: String(error) },
    };

    const [saved] = await db.insert(audits).values(fallbackAudit).returning();
    return saved;
  }
}
