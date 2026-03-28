import { streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const params = await req.json();
    console.log("Generate API Params:", params);
    const { lessonTitle, subject, generateLesson, generateQuiz, generateAssignment, customPrompt } = params;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing." }, { status: 500 });
    }

    const requestedTypes = [
      generateLesson && "Lesson Content",
      generateQuiz && "Quiz",
      generateAssignment && "Assignment",
    ].filter(Boolean).join(", ");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Build a dynamic ordered list of ONLY what was requested for the prompt
    const orderedItems: string[] = [];
    if (generateLesson) orderedItems.push("lessonContent");
    if (generateQuiz) orderedItems.push("quiz");
    if (generateAssignment) orderedItems.push("assignment");
    const generationOrder = orderedItems.join(" → ");

    // DYNAMIC SCHEMA CONSTRUCTION
    // We build the schema object dynamically so the model literally CANNOT see 
    // fields that weren't requested. This forces it to follow the plan.
    const schemaShape: any = {};
    
    if (generateLesson) {
      schemaShape.lessonContent = z.object({
        text: z.array(z.object({
          content: z.string().describe("A descriptive paragraph explaining a concept"),
          reference_web: z.string().describe("A URL for further reading"),
          animation: z.enum(["fade-in", "slide-up", "zoom-in", "bounce", "flip-in-x", "flip-in-y", "rotate-in", "light-speed-in", "roll-in", "jack-in-the-box"])
        })),
        youtubeLinks: z.array(z.string()).optional(),
        referenceLinks: z.array(z.string()).optional(),
        animation: z.enum(["fade-in", "slide-up", "zoom-in", "bounce", "flip-in-x", "flip-in-y", "rotate-in", "light-speed-in", "roll-in", "jack-in-the-box"])
      });
    }

    if (generateQuiz) {
      schemaShape.quiz = z.object({
        title: z.string(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        timeLimit: z.number(),
        xpReward: z.number(),
        questions: z.array(z.object({
          text: z.string(),
          options: z.array(z.string()),
          correctIndex: z.number(),
          explanation: z.string()
        }))
      });
    }

    if (generateAssignment) {
      schemaShape.assignment = z.object({
        title: z.string(),
        description: z.string(),
        dueDate: z.string(),
        maxScore: z.number(),
        xpReward: z.number()
      });
    }

    const result = await streamObject({      
      model: google("gemini-2.5-flash"), // Better stability for complex schemas
      system: `You are an expert AI educational content generator. Generate high-quality educational content strictly matching the required schema. You MUST generate ONLY the fields explicitly defined in the schema and emit them in this exact order: ${generationOrder}. Do not attempt to generate any field that is NOT in the schema.`,
      prompt: `Generate educational content for a lesson titled "${lessonTitle}" under the subject "${subject || 'General'}".

${customPrompt ? `CRITICAL INSTRUCTOR REQUIREMENTS (PRIORITIZE THESE): ${customPrompt}\n` : ""}GENERATE ONLY these items, in this exact order: ${requestedTypes}

${generateLesson ? `STEP 1 — lessonContent: Write 4-5 rich informative paragraphs with reference URLs and animation styles.` : ""}
${generateQuiz ? `STEP ${generateLesson ? 2 : 1} — quiz: Generate 3-5 challenging multiple-choice questions with explanations.` : ""}
${generateAssignment ? `STEP ${[generateLesson, generateQuiz].filter(Boolean).length + 1} — assignment: Create a project task with title, description, dueDate, maxScore and xpReward.` : ""}

STRICT RULES:
- Emit fields in EXACTLY this order: ${generationOrder}
- Do NOT add any field that was not explicitly requested or defined in the schema.`,
      schema: z.object(schemaShape)
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Generate API Error:", error);

    const isQuotaError =
      error?.statusCode === 429 ||
      error?.lastError?.statusCode === 429 ||
      (typeof error?.message === "string" && (error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED")));

    if (isQuotaError) {
      return NextResponse.json(
        { error: "API quota exceeded. Please wait a moment and try again. Check your usage at https://ai.dev/rate-limit." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}
