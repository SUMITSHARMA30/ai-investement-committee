import { ChatMistralAI } from "@langchain/mistralai";
import { z } from "zod";

export function getMistralModel(modelName: string = "mistral-small-latest") {
  return new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: modelName,
    temperature: 0.3,
  });
}

export async function callStructuredAgent<T extends z.ZodTypeAny>(
  systemPrompt: string,
  userPrompt: string,
  schema: T,
  modelName?: string
): Promise<z.infer<T>> {
  const model = getMistralModel(modelName);
  const structuredModel = model.withStructuredOutput(schema);

  const result = await structuredModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  return result as z.infer<T>;
}