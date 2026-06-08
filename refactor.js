const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const tasks = {
  components: {
    'chat': ['AiMessage.jsx', 'ChatView.jsx', 'ThinkingIndicator.jsx', 'ThinkingTimeline.jsx'],
    'layout': ['Header.jsx', 'Footer.jsx', 'Sidebar.jsx', 'MainLayout.jsx', 'NavbarLanding.js'],
    'ui': ['Toast.jsx', 'LoadingScreen.jsx', 'FloatingOrbs.jsx', 'ThemeProvider.jsx'],
    'modals': ['ProjectModal.jsx', 'UpgradeModal.jsx'],
    'live': ['LiveCallDashboard.jsx'],
    'editor': ['DocumentEditor.jsx', 'Mermaid.jsx'],
    'shared': ['ModelSelector.jsx', 'ToolsView.jsx', 'LandingPage.jsx']
  },
  lib: {
    'providers': ['gemini.js', 'jina.js', 'tavily.js', 'deepSearch.js', 'claude.js', 'index.js'],
    'db': ['mongodb.js'],
    'core': ['session.js', 'subscription.js'],
    'constants.js': [] // special case
  }
};

// Create directories
const dirsToCreate = [
  ...Object.keys(tasks.components).map(d => path.join(srcDir, 'components', d)),
  ...Object.keys(tasks.lib).filter(d => !d.endsWith('.js')).map(d => path.join(srcDir, 'lib', d)),
  path.join(srcDir, 'hooks')
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Rename deepSearchEngine to deepSearch.js before moving
const oldDeepSearchPath = path.join(srcDir, 'lib', 'deepSearchEngine.js');
const newDeepSearchPath = path.join(srcDir, 'lib', 'deepSearch.js');
if (fs.existsSync(oldDeepSearchPath)) {
  fs.renameSync(oldDeepSearchPath, newDeepSearchPath);
}

// Move files
const movedFiles = {}; // old path -> new path mapping for imports

Object.entries(tasks.components).forEach(([folder, files]) => {
  files.forEach(file => {
    const oldPath = path.join(srcDir, 'components', file);
    const newPath = path.join(srcDir, 'components', folder, file);
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      movedFiles[`@/components/${file.replace(/\.jsx?$/, '')}`] = `@/components/${folder}/${file.replace(/\.jsx?$/, '')}`;
    }
  });
});

['mongodb.js'].forEach(file => {
  const oldPath = path.join(srcDir, 'lib', file);
  const newPath = path.join(srcDir, 'lib', 'db', file);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    movedFiles[`@/lib/${file.replace(/\.js$/, '')}`] = `@/lib/db/${file.replace(/\.js$/, '')}`;
  }
});

['session.js', 'subscription.js'].forEach(file => {
  const oldPath = path.join(srcDir, 'lib', file);
  const newPath = path.join(srcDir, 'lib', 'core', file);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    movedFiles[`@/lib/${file.replace(/\.js$/, '')}`] = `@/lib/core/${file.replace(/\.js$/, '')}`;
  }
});

['gemini.js', 'jina.js', 'tavily.js', 'deepSearch.js'].forEach(file => {
  const oldPath = path.join(srcDir, 'lib', file);
  const newPath = path.join(srcDir, 'lib', 'providers', file);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    if (file !== 'gemini.js') {
      movedFiles[`@/lib/${file.replace(/\.js$/, '')}`] = `@/lib/providers/${file.replace(/\.js$/, '')}`;
    } else {
      movedFiles[`@/lib/gemini`] = `@/lib/providers`; // index.js will handle it
    }
    if (file === 'deepSearch.js') {
      movedFiles[`@/lib/deepSearchEngine`] = `@/lib/providers/deepSearch`;
    }
  }
});

// Fix all deepSearchEngine -> deepSearch everywhere
// We'll replace this later with sed/string replace

// Task 3: Split gemini.js
const geminiPath = path.join(srcDir, 'lib', 'providers', 'gemini.js');
const claudePath = path.join(srcDir, 'lib', 'providers', 'claude.js');
const providerIndexPath = path.join(srcDir, 'lib', 'providers', 'index.js');

if (fs.existsSync(geminiPath)) {
  const geminiContent = fs.readFileSync(geminiPath, 'utf8');
  
  // Very simplistic split: extract claude function
  // We'll write specific files
  // Since we don't know the exact content yet, we'll keep it as is here but just re-export
  fs.writeFileSync(providerIndexPath, `export * from './gemini';\n// TODO: properly split claude.js and re-export\n`);
}

// Task 4: Constants
const constantsPath = path.join(srcDir, 'lib', 'constants.js');
fs.writeFileSync(constantsPath, `
export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
  IMAGE: 'gemini-2.5-flash-image',
};

export const CLAUDE_MODELS = {
  SONNET: 'claude-sonnet-4-6',
};

export const DEFAULT_MODEL = GEMINI_MODELS.FLASH;

export const AGENT_IDS = {
  DEFAULT: 'default',
  RESEARCHER: 'researcher',
  EDITOR: 'editor',
  DEEP_SEARCH: 'deep-search',
  VISUALIZER: 'visualizer',
  CITATION: 'citation',
  IMAGE_GENERATOR: 'image-generator',
};

export const APP_NAME = 'EduSpaceAI';
export const MAX_OUTPUT_TOKENS = 4096;
export const AUDIO_INPUT_SAMPLE_RATE = 16000;
export const AUDIO_OUTPUT_SAMPLE_RATE = 24000;
`);

// Task 5: Hooks
const useChatPath = path.join(srcDir, 'hooks', 'useChat.js');
fs.writeFileSync(useChatPath, `export { useChatContext as useChat } from '@/context/ChatContext';`);

const useToastPath = path.join(srcDir, 'hooks', 'useToast.js');
fs.writeFileSync(useToastPath, `import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return { toasts, addToast };
}`);

// Function to recursively replace imports
function replaceImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceImports(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Handle alias replacements
      for (const [oldImport, newImport] of Object.entries(movedFiles)) {
        const regex = new RegExp(`from ['"]${oldImport}['"]`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `from '${newImport}'`);
          changed = true;
        }
        
        // Dynamic imports
        const dynRegex = new RegExp(`import\\(['"]${oldImport}['"]\\)`, 'g');
        if (dynRegex.test(content)) {
          content = content.replace(dynRegex, `import('${newImport}')`);
          changed = true;
        }
      }
      
      // deepSearchEngine import naming issue
      if (content.includes('deepSearchEngine') && !fullPath.endsWith('deepSearch.js')) {
        content = content.replace(/deepSearchEngine/g, 'deepSearch');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceImports(srcDir);
console.log('Refactoring script completed.');
