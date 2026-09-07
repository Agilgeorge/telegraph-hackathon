require("dotenv/config");

async function main() {
  const { ask } = require("./dist/telegraph/client.js");

  console.log("Testing Telegraph x402...");
  console.log("Intent: WEB_SEARCH");

  try {
    const result = await ask({
      intent: "WEB_SEARCH",
      query: "What is the current price of Bitcoin?",
      params: {},
    });

    console.log("\nSUCCESS! 🔥");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\nREQUEST FAILED:");
    console.error(error.message);
  }
}

main();
