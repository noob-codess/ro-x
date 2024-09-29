import { processDataDump } from "./challenge";

async function run() {
  console.log("Challenge starting...");
  await processDataDump();
  console.log("✅ Done!");
}

run();
