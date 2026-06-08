'use server';

import dbConnect from '@/lib/db/mongodb';
import Document from '@/models/Document';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/core/session';

export async function saveDocument(fileName, fileType, content, projectId = null) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Sesi berakhir. Silakan login kembali." };
    }
    const userId = user._id.toString();

    await dbConnect();
    
    // Validasi: Jangan simpan jika teks kosong atau simbol aneh
    if (!content || content.length < 10) {
      throw new Error("Konten dokumen terlalu pendek atau tidak terbaca.");
    }

    const newDoc = new Document({ 
      userId, 
      projectId,
      fileName, 
      fileType, 
      content // Ini harus teks bersih hasil extractFileContent tadi
    });

    await newDoc.save();
    
    // Refresh cache agar muncul di daftar file terbaru
    revalidatePath('/dashboard'); 
    revalidatePath('/workspace');
    
    return { success: true, id: newDoc._id.toString() };
  } catch (error) {
    console.error("Failed to save document:", error);
    return { success: false, error: error.message };
  }
}

export async function getDocumentById(docId) {
  try {
    const user = await getSessionUser();
    if (!user) return null;

    await dbConnect();
    const doc = await Document.findOne({ _id: docId, userId: user._id.toString() }).lean();
    
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
export async function getDocumentsByUser() {
  try {
    const user = await getSessionUser();
    if (!user) return [];

    await dbConnect();
    const docs = await Document.find({ userId: user._id.toString() })
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

export async function getProjectDocumentCounts() {
  try {
    const user = await getSessionUser();
    if (!user) return {};

    await dbConnect();
    const counts = await Document.aggregate([
      { $match: { userId: user._id.toString(), projectId: { $ne: null } } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      if (c._id) countMap[c._id] = c.count;
    });
    return countMap;
  } catch (error) {
    console.error("Failed to fetch doc counts:", error);
    return {};
  }
}

// FITUR TAMBAHAN: Untuk menghapus file
export async function deleteDocument(docId) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Sesi berakhir. Silakan login kembali." };
    }

    await dbConnect();
    const deleted = await Document.findOneAndDelete({ _id: docId, userId: user._id.toString() });

    if (!deleted) {
      return { success: false, error: "Dokumen tidak ditemukan atau Anda tidak memiliki akses." };
    }

    revalidatePath('/dashboard');
    revalidatePath('/workspace');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDocument(docId, fileName, fileType, content, projectId = undefined) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir." };

    await dbConnect();
    const updateData = {
      fileName,
      fileType,
      content,
      lastModified: new Date()
    };

    if (projectId !== undefined) {
      updateData.projectId = projectId;
    }

    const updated = await Document.findOneAndUpdate(
      { _id: docId, userId: user._id.toString() },
      updateData,
      { new: true }
    );

    if (!updated) return { success: false, error: "Gagal memperbarui dokumen." };

    revalidatePath('/dashboard');
    revalidatePath('/workspace');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getDocumentsByProject(projectId) {
  try {
    const user = await getSessionUser();
    if (!user) return [];

    await dbConnect();
    const docs = await Document.find({
      userId: user._id.toString(),
      projectId: projectId
    }).sort({ lastModified: -1 }).lean();

    return docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt?.toString(),
      lastModified: doc.lastModified?.toString()
    }));
  } catch (error) {
    console.error("Failed to fetch project documents:", error);
    return [];
  }
}
