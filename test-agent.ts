import { createTextCompletion } from "./lib/ai/groq";
import { buildSyncPilotSystemPrompt, buildSyncPilotUserPrompt } from "./lib/ai/syncpilot-agent";
import { getGroqConfig } from "./lib/env";

async function main() {
  try {
    const system = buildSyncPilotSystemPrompt("operations_copilot");
    const prompt = buildSyncPilotUserPrompt({
      workflow: "operations_copilot",
      task: "Process invoice 1234 from AWS for $150 and notify the finance channel.",
      context: "AWS invoice arrived today. User needs to upload it."
    });

    console.log("Calling model:", getGroqConfig().model);
    console.log("System Prompt:", system);
    
    const result = await createTextCompletion({
      system,
      prompt,
      maxOutputTokens: 500,
    });
    console.log("\nRAW RESULT:\n", result.text);
    
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(error.message);
  }
}
main();
