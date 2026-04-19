'use server';

import fs from 'fs';
import path from 'path';
import os from 'os';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Simpan file sementara ke disk, lalu parse, lalu hapus
async function saveTempFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `upload_${Date.now()}_${file.name}`);
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

export async function extractFileContent(formData) {
  try {
    const file = formData.get('file');
    if (!file) return { error: 'No file provided' };

    const fileType = file.type;
    const filePath = await saveTempFile(file);
    let text = '';

    if (fileType === 'application/pdf') {
      const dataBuffer = await fs.promises.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } 
    else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const buffer = await fs.promises.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    else {
      // text, csv, json, dll.
      text = await fs.promises.readFile(filePath, 'utf8');
    }

    // Hapus file temp
    await fs.promises.unlink(filePath).catch(() => {});

    return { success: true, text, fileName: file.name, fileType };
  } catch (error) {
    console.error('Extract error:', error);
    return { error: error.message };
  }
}
