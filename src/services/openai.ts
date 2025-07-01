import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from "openai/resources/index.mjs";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function createEmbeddings(chunks: string[]) {
  const results = await Promise.all(
    chunks.map(async (content) => {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      return {
        content,
        embedding: response.data[0].embedding,
      };
    })
  );

  return results;
}

export async function chatCompletions({
  messages,
  responseFormat,
  jsonSchema,
}: {
  messages: ChatCompletionMessageParam[];
  responseFormat?: "json_schema" | "text";
  jsonSchema?: ResponseFormatJSONSchema.JSONSchema;
}) {
  let response_format: ResponseFormatJSONSchema | ResponseFormatText;
  if (responseFormat === "json_schema" && jsonSchema) {
    response_format = { type: "json_schema", json_schema: jsonSchema };
  } else {
    response_format = { type: "text" };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format,
    messages,
  });

  const result = {
    content: response.choices[0].message.content,
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  };

  return result;
}

export async function getCoherentChunksFromPdf({
  pdfText,
}: {
  pdfText: string;
}) {
  const prompt = `
    Divide the following text into coherent and thematic blocks. Each block should consist of 1 coherent piece of text. Feel free to rearrange the content as needed to improve coherence and generate the most efficient embeddings. Attach possible keywords that may be in the user's question to each block to improve semantic search, for example, this block of text: "There is no physical store; the company operates 100% online to maintain affordable prices and national coverage" should have keywords like "location", "online", "located", and all the relevant ones you can think of.

    Return a JSON array of strings, where each string is an independent block. Do not include incomplete fragments or irrelevant content.

    Text:
    """${pdfText}"""
  `;
  const response = await chatCompletions({
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that converts documents into useful blocks for semantic embeddings.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    responseFormat: "json_schema",
    jsonSchema: {
      name: "text_chunks",
      description:
        "An array of semantic, ready-to-embed, text chunks extracted from a PDF",
      schema: {
        type: "object",
        properties: {
          result: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["result"],
      },
    },
  });
  const { result } = JSON.parse(response.content ?? "{}") as {
    result: string[];
  };

  return {
    chunks: result,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
  };
}

export async function rewriteQuestionForEmbedding({
  historyMessages,
  userQuestion,
}: {
  historyMessages: { role: "user" | "assistant"; content: string }[];
  userQuestion: string;
}) {
  const history = historyMessages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const systemPrompt = `
    You are an assistant that rewrites ambiguous user questions ({{userQuestion}}) by incorporating relevant context from the previous conversation ({{historyMessages}}) to make them clearer for semantic embedding comparison.

    Rules:
    - Detect the language of the original question and rewrite it in the same language.
    - If the question is already clear, return it unchanged.
    - If no history is provided, return the original question unchanged.
    - If you're not sure how to rewrite it, return the original question unchanged.
    - Very important: Always return the question in the same language as the original.

    Examples:
    - User question: "What is the capital?"
    - History: "En dónde está Francia?"
    - Rewritten question: "What is the capital of France?"
  `;

  const userPrompt = `
    Conversation history ({{historyMessages}}):
    ${history}

    Original user question ({{userQuestion}}):
    "${userQuestion}"

    Rewritten question:
  `;

  const response = await chatCompletions({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return {
    rewritten: response.content ?? "",
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
  };
}
