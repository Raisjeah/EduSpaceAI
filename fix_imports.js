const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/components/chat/ChatView.jsx',
    fixes: [
      { old: "'./FloatingOrbs'", new: "'../ui/FloatingOrbs'" },
      { old: "'./ModelSelector'", new: "'../shared/ModelSelector'" },
      { old: "'./UpgradeModal'", new: "'../modals/UpgradeModal'" },
    ]
  },
  {
    file: 'src/components/shared/LandingPage.jsx',
    fixes: [
      { old: "'./FloatingOrbs'", new: "'../ui/FloatingOrbs'" },
    ]
  },
  {
    file: 'src/components/chat/AiMessage.jsx',
    fixes: [
      { old: "'./Mermaid'", new: "'../editor/Mermaid'" },
    ]
  },
  {
    file: 'src/components/layout/MainLayout.jsx',
    fixes: [
      { old: "'./ProjectModal'", new: "'../modals/ProjectModal'" },
    ]
  },
  {
    file: 'src/components/editor/DocumentEditor.jsx',
    fixes: [
      { old: "'./AiMessage'", new: "'../chat/AiMessage'" },
      { old: "'./ThinkingIndicator'", new: "'../chat/ThinkingIndicator'" },
    ]
  }
];

replacements.forEach(({ file, fixes }) => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    fixes.forEach(fix => {
      content = content.replace(fix.old, fix.new);
    });
    fs.writeFileSync(p, content);
  }
});
