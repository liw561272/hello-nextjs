import type {
  ChatMessage,
  GenerateCodeRequest,
  GenerateCodeResponse,
  IterateCodeRequest,
  ZhipuChatRequest,
  ZhipuChatResponse,
  GeneratedFile,
} from "@/types/ai";

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const ZHIPU_MODEL = "glm-4-plus";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 60000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function zhipuChat(
  messages: ChatMessage[],
  retries = MAX_RETRIES
): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    throw new Error("ZHIPU_API_KEY environment variable is not set");
  }

  const request: ZhipuChatRequest = {
    model: ZHIPU_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        ZHIPU_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(request),
        },
        REQUEST_TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zhipu API error: ${response.status} - ${errorText}`);
      }

      const data: ZhipuChatResponse = await response.json();

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error("No response from Zhipu AI");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Zhipu API attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < retries - 1) {
        await sleep(RETRY_DELAY * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Failed to call Zhipu AI after retries");
}

// System prompts
const CODE_GENERATION_SYSTEM_PROMPT = `你是一个专业的前端开发工程师和代码生成助手。你的任务是根据用户的需求描述生成高质量的代码。

要求：
1. 生成的代码应该简洁、高效、易于维护
2. 使用现代化的最佳实践
3. 对于 React/Next.js 项目，使用函数组件和 Hooks
4. 使用 Tailwind CSS 进行样式设计
5. 代码需要完整可运行

当生成多个文件时，请使用以下格式：
---filename:组件名称---
代码内容
---end---

例如：
---filename:App.tsx---
import React from 'react';
// ... 代码
---end---

---filename:styles.css---
/* 样式内容 */
---end---

请只输出代码，不要添加额外的解释文字。`;

const CODE_ITERATION_SYSTEM_PROMPT = `你是一个专业的前端开发工程师。你的任务是根据用户的修改指令优化现有代码。

要求：
1. 保持代码的原有风格和结构
2. 只修改用户要求的部分
3. 确保修改后的代码仍然完整可运行
4. 使用现代化的最佳实践

请只输出修改后的完整代码，不要添加额外的解释文字。`;

// Generate code from prompt
export async function generateCode(
  request: GenerateCodeRequest
): Promise<GenerateCodeResponse> {
  const { prompt, language = "typescript", framework = "react", context } = request;

  const userMessage = context
    ? `现有项目上下文：
\`\`\`
${context}
\`\`\`

请根据以下需求生成代码：
${prompt}

目标框架：${framework}
目标语言：${language}`
    : `请根据以下需求生成代码：
${prompt}

目标框架：${framework}
目标语言：${language}`;

  const messages: ChatMessage[] = [
    { role: "system", content: CODE_GENERATION_SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  const response = await zhipuChat(messages);

  // Parse the response to extract files
  const files = parseGeneratedCode(response, language);

  return {
    code: response,
    files,
  };
}

// Iterate on existing code
export async function iterateCode(
  request: IterateCodeRequest
): Promise<GenerateCodeResponse> {
  const { code, instruction, language = "typescript" } = request;

  const messages: ChatMessage[] = [
    { role: "system", content: CODE_ITERATION_SYSTEM_PROMPT },
    {
      role: "user",
      content: `现有代码：
\`\`\`${language}
${code}
\`\`\`

修改指令：${instruction}

请输出修改后的完整代码。`,
    },
  ];

  const response = await zhipuChat(messages);
  const files = parseGeneratedCode(response, language);

  return {
    code: response,
    files,
  };
}

// Parse generated code into files
function parseGeneratedCode(response: string, defaultLanguage: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Check for multi-file format
  const filePattern = /---filename:(.+?)---\n([\s\S]*?)---end---/g;
  let match;
  let hasMultiFile = false;

  while ((match = filePattern.exec(response)) !== null) {
    hasMultiFile = true;
    const filename = match[1].trim();
    const content = match[2].trim();
    const language = getLanguageFromFilename(filename);

    files.push({
      name: filename,
      path: `/${filename}`,
      content,
      language,
    });
  }

  // If no multi-file format, treat as single file
  if (!hasMultiFile) {
    // Extract code from markdown code blocks
    const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    const codeMatches = [...response.matchAll(codeBlockPattern)];

    if (codeMatches.length > 0) {
      codeMatches.forEach((match, index) => {
        const lang = match[1] || defaultLanguage;
        const content = match[2].trim();
        const extension = getFileExtension(lang);
        const filename = `component${index > 0 ? index + 1 : ""}.${extension}`;

        files.push({
          name: filename,
          path: `/${filename}`,
          content,
          language: lang,
        });
      });
    } else {
      // No code blocks, treat entire response as code
      files.push({
        name: `component.${getFileExtension(defaultLanguage)}`,
        path: "/component.tsx",
        content: response.trim(),
        language: defaultLanguage,
      });
    }
  }

  return files;
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "ts":
      return "typescript";
    case "jsx":
    case "js":
      return "javascript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    default:
      return "typescript";
  }
}

function getFileExtension(language: string): string {
  switch (language.toLowerCase()) {
    case "typescript":
    case "ts":
      return "tsx";
    case "javascript":
    case "js":
      return "jsx";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    default:
      return "tsx";
  }
}

// Generate explanation for code
export async function explainCode(code: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "你是一个代码解释助手。请用简洁清晰的语言解释代码的功能和结构。",
    },
    {
      role: "user",
      content: `请解释以下代码：\n\`\`\`\n${code}\n\`\`\``,
    },
  ];

  return zhipuChat(messages);
}