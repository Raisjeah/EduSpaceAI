'use server';

import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import { revalidatePath } from 'next/cache';

export async function saveDocument(userId, fileName, fileType, content) {
  try {
    await dbConnect();
    
    // Validasi: Jangan simpan jika teks kosong atau simbol aneh
    if (!content || content.length < 10) {
      throw new Error("Konten dokumen terlalu pendek atau tidak terbaca.");
    }

    const newDoc = new Document({ 
      userId, 
      fileName, 
      fileType, 
      content // Ini harus teks bersih hasil extractFileContent tadi
    });

    await newDoc.save();
    
    // Refresh cache agar muncul di daftar file terbaru
    revalidatePath('/dashboard'); 
    
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
    
    if (doc) {
      return { 
        ...doc, 
        _id: doc._id.toString(), 
        createdAt: doc.createdAt?.toString() || new Date().toString()
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return null;
  }
}

// FITUR TAMBAHAN: Untuk menampilkan daftar file di halaman "Workspace & Tools"
export async function getDocumentsByUser(userId) {
  try {
    await dbConnect();
    const docs = await Document.find({ userId })
      .select('fileName fileType createdAt') // Jangan ambil 'content' agar ringan saat loading daftar
      .sort({ createdAt: -1 })
      .lean();

    return docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt?.toString()
    }));
  } catch (error) {
    console.error("Failed to fetch user documents:", error);
    return [];
  }
}

// FITUR TAMBAHAN: Untuk menghapus file
export async function deleteDocument(docId) {
  try {
    await dbConnect();
    await Document.findByIdAndDelete(docId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
