// // aiModel.js
// import { pipeline } from "@xenova/transformers";
// import knowledgeBase from "../knowledgeBase.js";

// // Cache the loaded model so we load it only once.
// let cachedModel = null;

// const loadModel = async () => {
//   if (cachedModel) {
//     return cachedModel;
//   }
//   console.log("Loading AI Model...");
//   // The warnings about unused initializers from ONNX Runtime are benign.
//   cachedModel = await pipeline("text2text-generation", "Xenova/t5-small", {
//     language: "en",
//   });
//   console.log("AI Model Loaded!");
//   return cachedModel;
// };

// const getAIResponse = async (userMessage) => {
//   console.log("User Message:", userMessage);

//   // Check if user question exists in our knowledge base
//   const found = knowledgeBase.find((item) =>
//     userMessage.toLowerCase().includes(item.question.toLowerCase())
//   );
//   if (found) {
//     console.log("Found answer in FAQ:", found.answer);
//     return found.answer;
//   }

//   const model = await loadModel();
//   //   const prompt = `You are an AI assistant that provides answers to user queries. The user asked: "${userMessage}". Please respond in English with a helpful answer.`;
//   const prompt = `Answer in clear English only: ${userMessage}`;
//   console.log("Generating AI response...");
//   //   const output = await model(prompt, { max_length: 100 });
//   const output = await model(prompt, { max_length: 150, temperature: 0.7 });

//   console.log("AI Response:", output);
//   return output?.[0]?.generated_text || "I'm not sure about that.";
// };

// export default getAIResponse;

// --------------------------------

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));


// --------------------------------







const { OpenAI } = require('openai');


// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const chatHistories = new Map();const history = chatHistories.get(socket.id);
      
  // Add user message to history
  history.push({ role: "user", content: message });  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: history,
    temperature: 0.7, // Controls randomness
    max_tokens: 150
  });

  const aiResponse = completion.choices[0].message.content;
  
  // Add AI response to history
  history.push({ role: "assistant", content: aiResponse });