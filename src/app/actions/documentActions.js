'use server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';

export async function saveDocument(userId, fileName, fileType, content) {
  try {
    await dbConnect();
    const newDoc = new Document({ userId, fileName, fileType, content });
    await newDoc.save();
    return { success: true, id: newDoc._id.toString() };
  } catch (error) {
    console.error("Failed to save document:", error);
    return { success: false, error: error.message };
  }
}

export async function getDocumentById(docId) {
  try {
    await dbConnect();
    const doc = await Document.findById(docId).lean();
    if (doc) return { ...doc, _id: doc._id.toString(), createdAt: doc.createdAt?.toString() };
    return null;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return null;
  }
}
