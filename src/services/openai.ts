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

export async function getMostRelevantChunk({
  question,
  chunks,
  historyMessages,
}: {
  question: string;
  chunks: {
    content: string;
  }[];
  historyMessages: {
    role: string;
    content: string;
  }[];
}) {
  const numberedChunks = chunks
    .map((chunk, i) => `${i + 1}. ${chunk.content}`)
    .join("\n\n");
  const history = historyMessages
    .map((msg) => `- ${msg.role}: ${msg.content}`)
    .join("\n");

  const prompt = `
    Given the following user question:

    "${question}"

    And the following message history:

    ${history}

    And the following list of numbered information chunks coming from an embedding search:
    
    ${numberedChunks}

    Rate how useful each chunk is for answering the question. Only use the provided numbered information chunks. Use a number between 0.00 and 1.00, where:
    - 1.00 means "perfectly answers"
    - 0.00 means "not related"


    Return the most relevant answer in JSON format and in the same language as the user's question, with the following structure:
    {
      "result": {
        "content": // content of the most relevant text among the provided numbered information chunks,
        "relevance": 0.83 // A number between 0 and 1
      }
    }
    `;

  const response = await chatCompletions({
    messages: [
      {
        role: "system",
        content:
          "You are a model that evaluates the semantic relevance of text chunks based on a user's question.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    responseFormat: "json_schema",
    jsonSchema: {
      name: "ranked_chunks",
      description:
        "An object containing the most relevant chunk of text ranked based on the user's question.",
      schema: {
        type: "object",
        properties: {
          result: {
            type: "object",
            properties: {
              content: {
                type: "string",
              },
              relevance: {
                type: "number",
              },
            },
          },
        },
        required: ["result"],
      },
    },
  });

  const { result } = JSON.parse(response.content ?? "{}") as {
    result: { content: string; relevance: number };
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

  return result;
}