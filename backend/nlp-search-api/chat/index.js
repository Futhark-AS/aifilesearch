const { ChatOpenAI } = require("langchain/chat_models/openai");
const { HumanChatMessage, SystemChatMessage, AIChatMessage } = require("langchain/schema");

// import { TokenTextSplitter } from "langchain/text_splitter";

module.exports = async function (context, req, document) {
  const chat = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: process.env["ENV_OPENAI_API_KEY"], // In Node.js defaults to process.env.OPENAI_API_KEY
    modelName: "gpt-3.5-turbo",
  });
  context.log("HTTP trigger function processed a request.");

  try {
    const uid = req.headers["x-ms-client-principal-id"];
    const price = (0.002 * 8000) / 1000;
    const price_credits = process.env["ENV_DOLLAR_TO_CREDIT"] * price;

    if (context.bindings.document.credits < price_credits) {
      context.res = {
        status: 402,
        body: "Not enough credits",
      };
      return;
    }

    const messages = req.body.messages;

    const langchain_messages = messages.map((message) => {
      if (message.role === "user") {
        return new HumanChatMessage(message.content);
      } else if (message.role === "system") {
        return new SystemChatMessage(message.content);
      } else if (message.role === "assistant") {
        return new AIChatMessage(message.content);
      }
    });

    const response = await chat.call(langchain_messages);

    // Update credits.
    context.bindings.document.credits -= price_credits;
    // context.bindings.document.last_updated = new Date().toISOString();
    context.bindings.outputDocument = context.bindings.document;

    context.res = {
      body: response,
    };
  } catch (error) {
    context.log(error);
    context.res = {
      status: 500,
      body: "Internal server error while calling OpenAI",
    };

    if (context.bindings.document.credits < price_credits) {
      context.res = {
        status: 402,
        body: "Not enough credits",
      };
      return;
    }
  }
};
