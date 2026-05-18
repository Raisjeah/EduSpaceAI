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

// ✅ Safe limits untuk file processing
const MAX_CONTENT_LENGTH = 100000;           // 100k chars
const MAX_PDF_PAGES = 50;                    // Max pages to extract
const MAX_EXCEL_SHEETS = 5;                  // Max sheets
const MAX_EXCEL_ROWS_PER_SHEET = 500;        // Max rows per sheet

import { Readable } from 'stream';
import { finished } from 'stream/promises';

async function saveTempFile(file) {
  const tempDir = os.tmpdir();
  // Sanitasi file name untuk mencegah path traversal
  const safeName = path.basename(file.name).replace(/\s+/g, '_');
  const tempPath = path.join(tempDir, `upload_${Date.now()}_${safeName}`);

  const writableStream = fs.createWriteStream(tempPath);
  const readableStream = Readable.fromWeb(file.stream());

  await finished(readableStream.pipe(writableStream));

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
      // ✅ Limit PDF pages to prevent memory explosion
      const pdfData = await pdfParse(dataBuffer, { max: MAX_PDF_PAGES });
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

      // ✅ Limit sheets & rows to prevent lag
      let sheetCount = 0;
      workbook.eachSheet((worksheet, sheetId) => {
        if (sheetCount >= MAX_EXCEL_SHEETS) return;
        sheetCount++;
        
        text += `\n--- Sheet: ${worksheet.name} ---\n`;
        let rowCount = 0;
        worksheet.eachRow((row, rowNumber) => {
          if (rowCount >= MAX_EXCEL_ROWS_PER_SHEET) return;
          rowCount++;
          
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

    // ✅ Truncate content if exceeds limit
    let cleanedText = text.replace(/[^\S\r\n]+/g, ' ').trim();
    let truncated = false;
    if (cleanedText.length > MAX_CONTENT_LENGTH) {
      cleanedText = cleanedText.substring(0, MAX_CONTENT_LENGTH) + '\n\n[⚠️ Konten terpotong karena melampaui batas 100,000 karakter]';
      truncated = true;
    }

    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);

    return { 
      success: true, 
      content: cleanedText, 
      fileName: file.name,
      truncated: truncated ? '⚠️ Content was truncated' : undefined
    };

  } catch (error) {
    console.error("Extraction error:", error);
    if (filePath && fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    return { error: error.message || 'Gagal mengekstrak file.' };
  }
}
