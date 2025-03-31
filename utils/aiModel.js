// // aiService.js
// import OpenAI from "openai";
// import knowledgeBase from "../knowledgeBase.js";

import axios from "axios";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Cache with TTL (1 hour)
// const responseCache = new Map();
// const CACHE_TTL = 3600000;

// // Create search index from the knowledgeBase
// const createSearchIndex = () => {
//   const index = new Map();
//   knowledgeBase.forEach((item) => {
//     // Index each question string individually
//     item.questions.forEach((q) => {
//       const key = q.toLowerCase().trim();
//       index.set(key, item.answer);
//     });

//     // Add additional variations if any question includes "start"
//     if (item.questions.some((q) => q.toLowerCase().includes("start"))) {
//       index.set("begin process", item.answer);
//       index.set("how to begin", item.answer);
//     }
//   });
//   return index;
// };

// const searchIndex = createSearchIndex();

// // Main response handler
// export const getAIResponse = async (userQuery, context = {}) => {
//   try {
//     const normalizedQuery = userQuery.toLowerCase().trim();

//     // 1. Handle affirmatives in follow-up
//     if (
//       context.pendingFollowUp &&
//       /^(yes|yeah|yup|sure)/i.test(normalizedQuery)
//     ) {
//       return handleFollowUp(context);
//     }

//     // 2. Check cache
//     const cached = responseCache.get(normalizedQuery);
//     if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//       return cached.response;
//     }

//     // 3. Knowledge base lookup (if dynamic response is NOT forced)
//     if (!context.forceDynamic) {
//       const kbAnswer =
//         searchIndex.get(normalizedQuery) ||
//         Array.from(searchIndex.entries()).find(([key]) =>
//           normalizedQuery.includes(key)
//         )?.[1];

//       if (kbAnswer) {
//         const kbResponse = formatKBResponse(kbAnswer, normalizedQuery);
//         cacheResponse(normalizedQuery, kbResponse);
//         return kbResponse;
//       }
//     }

//     // 4. OpenAI dynamic fallback response
//     return await generateOpenAIResponse(userQuery, normalizedQuery);
//   } catch (error) {
//     console.error("AI Service Error:", error);
//     return fallbackResponse();
//   }
// };

// // Helper functions
// async function generateOpenAIResponse(query, normalizedQuery) {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo-0125",
//     messages: [
//       {
//         role: "system",
//         content: `You're a study abroad consultant. Respond using ONLY this knowledge:
// ${knowledgeBase
//   .map((qa) => `${qa.questions.join(", ")}: ${qa.answer}`)
//   .join("\n")}
// Keep responses under 3 sentences. If unsure, say "I'll check with our team".`,
//       },
//       { role: "user", content: query },
//     ],
//     temperature: 0.7,
//     max_tokens: 100,
//   });

//   const response = completion.choices[0].message.content;
//   cacheResponse(normalizedQuery, { text: response, followUp: [] });
//   return { text: response, followUp: [] };
// }

// function formatKBResponse(answer, query) {
//   const variations = {
//     documents: `📄 ${answer}\nNeed formatting help?`,
//     process: `🚀 ${answer}\nReady to start?`,
//     default: `${answer}\nMore details?`,
//   };

//   const type = query.includes("document")
//     ? "documents"
//     : query.includes("process")
//     ? "process"
//     : "default";

//   return {
//     text: variations[type],
//     followUp: generateFollowUp(type),
//   };
// }

// function generateFollowUp(type) {
//   const followUps = {
//     documents: ["Format guidelines", "Document samples"],
//     process: ["Timeline", "Cost estimate"],
//     default: ["Contact counselor", "View countries"],
//   };
//   return followUps[type] || [];
// }

// function cacheResponse(query, response) {
//   responseCache.set(query, {
//     response,
//     timestamp: Date.now(),
//   });
// }

// function fallbackResponse() {
//   const defaults = [
//     "Please email us at contact@example.com for detailed assistance",
//     "Our team will respond shortly. In the meantime, check our FAQ",
//   ];
//   return {
//     text: defaults[Math.floor(Math.random() * defaults.length)],
//     followUp: [],
//   };
// }

// // Dummy follow-up handler (ensure you implement as needed)
// function handleFollowUp(context) {
//   // This can use context.pendingFollowUp to determine the next step
//   return { text: "Proceeding with your follow-up request.", followUp: [] };
// }

// export default knowledgeBase;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// const getAIResponse = async (userInput) => {
//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "user", content: userInput }],
//       },
//       {
//         headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
//       }
//     );

//     return response.data.choices[0].message.content;
//   } catch (error) {
//     console.error("AI Error:", error);
//     return "Sorry, something went wrong.";
//   }
// };

import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getAIResponse = async (message) => {
  const response = await client.responses.create({
    model: "gpt-4o",
    input: "Write a one-sentence bedtime story about a unicorn.",
  });
  console.log("response.output_text", response.output_text);
  return response.output_text;
};

export default getAIResponse;

// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: "process.env.OPENAI_API_KEY",
// });

// const completion = openai.chat.completions.create({
//   model: "gpt-4o-mini",
//   store: true,
//   messages: [
//     {"role": "user", "content": "write a haiku about ai"},
//   ],
// });

// completion.then((result) => console.log(result.choices[0].message));
