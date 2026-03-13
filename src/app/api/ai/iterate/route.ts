import { NextRequest, NextResponse } from "next/server";
import { iterateCode } from "@/lib/ai/zhipu";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, instruction, language = "typescript" } = body;

    if (!code) {
      return NextResponse.json(
        { error: "请提供要修改的代码" },
        { status: 400 }
      );
    }

    if (!instruction) {
      return NextResponse.json(
        { error: "请提供修改指令" },
        { status: 400 }
      );
    }

    const result = await iterateCode({
      code,
      instruction,
      language,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI iteration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "修改失败" },
      { status: 500 }
    );
  }
}