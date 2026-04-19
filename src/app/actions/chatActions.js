'use server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { revalidatePath } from 'next/cache';
import { getGeminiResponse } from '@/lib/gemini';

export async function saveChat(role, text, userId) {
  try {
    await dbConnect();
    const newChat = new Chat({ role, text, userId });
    await newChat.save();
    return { success: true };
  } catch (error) {
    console.error("Failed to save chat:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(formData) {
  const userId = formData.get('userId');
  const prompt = formData.get('prompt');
  if (!prompt) return { error: "Prompt is required" };
  await saveChat('user', prompt, userId);
  const aiResponse = await getGeminiResponse(prompt);
  await saveChat('model', aiResponse, userId);
  revalidatePath('/');
  return { success: true, aiResponse };
}

export async function getChatHistory(userId) {
  try {
    await dbConnect();
    const chats = await Chat.find({ userId }).sort({ createdAt: 1 }).lean();
    return chats.map(chat => ({
      ...chat,
      _id: chat._id.toString(),
      createdAt: chat.createdAt?.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }
}
