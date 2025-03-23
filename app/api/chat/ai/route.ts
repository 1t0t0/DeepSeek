// Please install OpenAI SDK first: `npm install openai`

export const maxDuration = 60;

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    //Extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    //Find the chat document in the database based on userId and chatId
    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    //Create a user message object
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.message.push(userPrompt);

    //Call the DeepSeek API to get a chat completion
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek",
      store: true,
    });

    // ตรงส่วนที่ทำงานกับ message
    const message = completion.choices[0].message;
    const messageWithTimestamp = {
      role: message.role,
      content: message.content,
      timestamp: Date.now(),
    };

    data.messages.push(messageWithTimestamp);
    await data.save();

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage });
  }
}
