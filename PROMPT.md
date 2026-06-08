# 🛠️ REFACTOR TASK: EduSpaceAI Project Structure

## Konteks
Ini adalah proyek Next.js 16 App Router dengan JavaScript (bukan TypeScript).
Lokasi root proyek: `Raisjeah/EduSpaceAI/`
Jangan ubah logika bisnis, hanya pindahkan dan reorganisasi file.

---

## TASK 1 — Reorganisasi `src/components/`

Buat subfolder berikut dan pindahkan file sesuai mapping di bawah:

```
src/components/
  chat/
    AiMessage.jsx
    ChatView.jsx
    ThinkingIndicator.jsx
  layout/
    Header.jsx
    Footer.jsx
    Sidebar.jsx
    MainLayout.jsx
  ui/
    Toast.jsx
    LoadingScreen.jsx
    FloatingOrbs.jsx
    ThemeProvider.jsx
  modals/
    ProjectModal.jsx
    UpgradeModal.jsx
  live/
    LiveCallDashboard.jsx
  editor/
    DocumentEditor.jsx
    Mermaid.jsx
  shared/
    ModelSelector.jsx
    ToolsView.jsx
    LandingPage.jsx
```

Setelah memindahkan file, **update semua import path** di seluruh proyek yang merujuk ke komponen-komponen tersebut.

---

## TASK 2 — Reorganisasi `src/lib/`

Buat struktur baru:

```
src/lib/
  providers/
    gemini.js       ← pindah dari lib/gemini.js
    jina.js         ← pindah dari lib/jina.js
    tavily.js       ← pindah dari lib/tavily.js
    deepSearch.js   ← pindah dari lib/deepSearchEngine.js (rename)
  db/
    mongodb.js      ← pindah dari lib/mongodb.js
  core/
    session.js      ← pindah dari lib/session.js
    subscription.js ← pindah dari lib/subscription.js
  constants.js      ← FILE BARU (lihat Task 4)
```

Setelah memindahkan file, **update semua import path** di seluruh proyek.

---

## TASK 3 — Pecah `src/lib/providers/gemini.js`

File `gemini.js` saat ini terlalu besar (god file). Pecah menjadi:

```
src/lib/providers/
  gemini.js     ← hanya Gemini logic
  claude.js     ← pindahkan fungsi getClaudeResponse() ke sini
  index.js      ← re-export semua: export { getGeminiResponse } from './gemini'; export { getClaudeResponse } from './claude';
```

Pastikan semua file yang mengimport dari `lib/gemini.js` sekarang mengimport dari `lib/providers/index.js` atau path spesifik yang sesuai.

---

## TASK 4 — Buat `src/lib/constants.js`

Buat file baru `src/lib/constants.js` berisi semua nilai konstan yang berulang di proyek:

```js
// Model names
export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
  IMAGE: 'gemini-2.5-flash-image',
};

export const CLAUDE_MODELS = {
  SONNET: 'claude-sonnet-4-6',
};

export const DEFAULT_MODEL = GEMINI_MODELS.FLASH;

// Agent IDs
export const AGENT_IDS = {
  DEFAULT: 'default',
  RESEARCHER: 'researcher',
  EDITOR: 'editor',
  DEEP_SEARCH: 'deep-search',
  VISUALIZER: 'visualizer',
  CITATION: 'citation',
  IMAGE_GENERATOR: 'image-generator',
};

// App config
export const APP_NAME = 'EduSpaceAI';
export const MAX_OUTPUT_TOKENS = 4096;
export const AUDIO_INPUT_SAMPLE_RATE = 16000;
export const AUDIO_OUTPUT_SAMPLE_RATE = 24000;
```

Lalu **replace hardcoded values** di file-file terkait dengan import dari constants.js.

---

## TASK 5 — Tambah Custom Hooks

Buat file-file berikut di `src/hooks/`:

### `src/hooks/useChat.js`
Ekstrak chat-related state logic dari `ChatContext.jsx` jika ada, atau buat hook wrapper:
```js
// Re-export dari context agar konsisten
export { useChatContext as useChat } from '@/context/ChatContext';
```

### `src/hooks/useToast.js`
Buat hook sederhana untuk trigger toast notification:
```js
import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return { toasts, addToast };
}
```

---

## TASK 6 — Buat `src/lib/providers/deepSearch.js` yang bersih

Rename `deepSearchEngine.js` → `deepSearch.js` dan pastikan export-nya konsisten:
```js
// Pastikan ada named export
export async function deepSearchEngine(prompt, history, fileParts, model) {
  // ... existing logic
}
```

---

## ATURAN PENTING untuk Agent

1. **JANGAN ubah logika bisnis apapun** — hanya pindah file dan update import.
2. **Jalankan pencarian global** untuk setiap file yang dipindah, pastikan tidak ada import yang tertinggal menggunakan path lama.
3. **Setelah selesai**, jalankan `npm run build` untuk memastikan tidak ada broken import.
4. Jika ada file yang tidak ditemukan dalam mapping di atas, **tanyakan** sebelum memindahkan.
5. Gunakan **path alias** `@/` yang sudah dikonfigurasi di `jsconfig.json` untuk semua import baru.

---

## Hasil yang Diharapkan

```
src/
  app/          ← tidak berubah
  components/
    chat/
    layout/
    ui/
    modals/
    live/
    editor/
    shared/
  context/      ← tidak berubah
  hooks/
    useAuth.js
    useChat.js  ← baru
    useToast.js ← baru
  lib/
    providers/
      gemini.js
      claude.js
      deepSearch.js
      index.js
      jina.js
      tavily.js
    db/
      mongodb.js
    core/
      session.js
      subscription.js
    constants.js
  models/       ← tidak berubah
  styles/       ← tidak berubah
```

Mulai dari Task 1, lanjut berurutan sampai Task 6.
