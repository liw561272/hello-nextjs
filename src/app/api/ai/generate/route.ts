import { NextRequest, NextResponse } from "next/server";
import { generateCode } from "@/lib/ai/zhipu";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, framework = "react", language = "typescript", context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "请提供生成提示" },
        { status: 400 }
      );
    }

    const result = await generateCode({
      prompt,
      framework,
      language,
      context,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生成失败" },
      { status: 500 }
    );
  }
}