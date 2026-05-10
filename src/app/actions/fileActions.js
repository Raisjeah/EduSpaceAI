'use server';

import fs from 'fs';
import path from 'path';
import os from 'os';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';
import dbConnect from '@/lib/mongodb';
import { getFileSizeLimit } from '@/lib/subscription';
import { getSessionUser } from '@/lib/session';

async function saveTempFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `upload_${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

export async function extractFileContent(formData) {
  let filePath = '';
  try {
    const file = formData.get('file');
    if (!file) return { error: 'No file provided' };

    await dbConnect();
    const user = await getSessionUser();
    const limit = getFileSizeLimit(user?.current_plan || 'FREE');

    if (file.size > limit) {
       return { error: `Ukuran file melebihi batas paket Anda (${limit / (1024 * 1024)}MB). Silakan upgrade paket Anda.` };
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    filePath = await saveTempFile(file);
    let text = '';

    // 1. PARSE PDF
    if (fileType === 'application/pdf') {
      const dataBuffer = await fs.promises.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    }
    // 2. PARSE WORD (DOCX)
    else if (
      fileType === 'application/msword' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const buffer = await fs.promises.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    // 3. PARSE EXCEL (XLSX / CSV)
    else if (
      fileName.endsWith('.xlsx') || 
      fileName.endsWith('.xls') || 
      fileName.endsWith('.csv') ||
      fileType === 'text/csv'
    ) {
      const workbook = new ExcelJS.Workbook();
      if (fileName.endsWith('.csv') || fileType === 'text/csv') {
        await workbook.csv.readFile(filePath);
      } else {
        await workbook.xlsx.readFile(filePath);
      }

      workbook.eachSheet((worksheet, sheetId) => {
        text += `\n--- Sheet: ${worksheet.name} ---\n`;
        worksheet.eachRow((row, rowNumber) => {
          const rowValues = Array.isArray(row.values) ? row.values.slice(1) : [];
          text += rowValues.join('\t') + '\n';
        });
      });
    }
    // 4. PARSE TEXT BIASA
    else if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      text = await fs.promises.readFile(filePath, 'utf8');
    }
    else {
      throw new Error('Tipe file tidak didukung. Gunakan PDF, Word, Excel, atau Teks.');
    }

    const cleanedText = text.replace(/[^\S\r\n]+/g, ' ').trim();

    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);

    return { 
      success: true, 
      content: cleanedText, 
      fileName: file.name 
    };

  } catch (error) {
    console.error("Extraction error:", error);
    if (filePath && fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    return { error: error.message || 'Gagal mengekstrak file.' };
  }
}
