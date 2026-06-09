'use server';

import { extractFileContentLogic } from '@/lib/core/fileParser';

export async function extractFileContent(formData) {
  return extractFileContentLogic(formData);
}
