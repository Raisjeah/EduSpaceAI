'use server';

import fs from 'fs';
import path from 'path';
import os from 'os';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

async function saveTempFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const tempDir = os.tmpdir();

  // Sanitasi nama file untuk mencegah path traversal
  const safeName = path.basename(file.name).replace(/[^\w\s.-]/g, '_').replace(/\s+/g, '_');
  const tempPath = path.join(tempDir, `upload_${Date.now()}_${safeName}`);

  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

export async function extractFileContent(formData) {
  let filePath = '';
  try {
    const file = formData.get('file');
    if (!file) return { error: 'No file provided' };

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
    // 3. PARSE EXCEL / CSV (Menggunakan ExcelJS)
    else if (
      fileName.endsWith('.xlsx') || 
      fileName.endsWith('.xls') || 
      fileName.endsWith('.csv') ||
      fileType === 'text/csv'
    ) {
      const workbook = new ExcelJS.Workbook();
      if (fileName.endsWith('.csv')) {
        await workbook.csv.readFile(filePath);
      } else {
        await workbook.xlsx.readFile(filePath);
      }

      workbook.eachSheet((worksheet) => {
        text += `\n--- Sheet: ${worksheet.name} ---\n`;
        worksheet.eachRow((row) => {
          // Gabungkan nilai sel dalam baris dengan spasi
          const rowValues = Array.isArray(row.values)
            ? row.values.slice(1).map(val => (val && typeof val === 'object' ? JSON.stringify(val) : val)).join(' ')
            : '';
          text += rowValues + '\n';
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

    // PEMBERSIHAN AKHIR: Hapus spasi horizontal berlebih, tetap pertahankan newline
    const cleanedText = text.replace(/[^\S\r\n]+/g, ' ').trim();

    // HAPUS FILE SEMENTARA SETELAH SELESAI
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);

    return { 
      success: true, 
      content: cleanedText, 
      fileName: file.name 
    };

  } catch (error) {
    console.error("Extraction error:", error);
    // Pastikan file dihapus jika error
    if (filePath && fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    return { error: error.message || 'Gagal mengekstrak file.' };
  }
}
