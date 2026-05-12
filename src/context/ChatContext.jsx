'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  // Store messages and status keyed by chatId (use 'new' for blank chats)
  const [chatData, setChatData] = useState({});
  const typewriterIntervals = useRef({});

  const setChatMessages = useCallback((chatId, messagesOrFn) => {
    const id = chatId || 'new';
    setChatData(prev => {
      const currentMessages = prev[id]?.messages || [];
      const newMessages = typeof messagesOrFn === 'function'
        ? messagesOrFn(currentMessages)
        : messagesOrFn;

      return {
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          messages: newMessages
        }
      };
    });
  }, []);

  const setChatStatus = useCallback((chatId, status) => {
    const id = chatId || 'new';
    setChatData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...status
      }
    }));
  }, []);

  const runTypewriter = useCallback((chatId, fullResponse) => {
    const id = chatId || 'new';
    const aiMessageId = (Date.now() + 1).toString();

    // Clear existing interval if any
    if (typewriterIntervals.current[id]) {
      clearInterval(typewriterIntervals.current[id]);
    }

    // Set status
    setChatStatus(id, { isThinking: false, isTyping: true });

    // Initialize AI message
    setChatMessages(id, prev => [...prev, {
      role: 'model',
      text: '',
      _id: aiMessageId
    }]);

    const words = fullResponse.split(' ');
    let currentText = '';
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setChatMessages(id, prev => prev.map(m =>
          m._id === aiMessageId ? { ...m, text: currentText } : m
        ));
        wordIndex++;
      } else {
        setChatStatus(id, { isTyping: false });
        clearInterval(interval);
        delete typewriterIntervals.current[id];
      }
    }, 30);

    typewriterIntervals.current[id] = interval;
  }, [setChatMessages, setChatStatus]);

  const migrateNewChatToId = useCallback((newChatId) => {
    setChatData(prev => {
      const newData = { ...prev };
      if (newData['new']) {
        newData[newChatId] = {
          ...newData['new'],
          ...(newData[newChatId] || {})
        };
        delete newData['new'];
      }
      return newData;
    });

    // Migrate interval as well
    if (typewriterIntervals.current['new']) {
      typewriterIntervals.current[newChatId] = typewriterIntervals.current['new'];
      delete typewriterIntervals.current['new'];
    }
  }, []);

  const clearChat = useCallback((chatId) => {
    const id = chatId || 'new';
    if (typewriterIntervals.current[id]) {
      clearInterval(typewriterIntervals.current[id]);
      delete typewriterIntervals.current[id];
    }
    setChatData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  }, []);

  return (
    <ChatContext.Provider value={{
      chatData,
      setChatMessages,
      setChatStatus,
      runTypewriter,
      migrateNewChatToId,
      clearChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
