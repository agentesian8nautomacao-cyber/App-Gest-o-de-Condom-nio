// Aplicar filtros de console O MAIS CEDO POSSÍVEL para capturar todos os erros
if (typeof window !== 'undefined') {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const shouldFilterMessage = (messages: string): boolean => {
        const lowerMessages = messages.toLowerCase();
        
        // Filtrar erros de WebSocket do Supabase Realtime - TODOS os padrões
        const isWebSocketError = 
            // Mensagens básicas (qualquer variação)
            lowerMessages.includes('websocket connection') || 
            lowerMessages.includes('websocket connection to') ||
            // URLs completas do Supabase (padrão específico que aparece no erro)
            lowerMessages.includes('wss://zaemlxjwhzrfmowbckmk.supabase.co') ||
            lowerMessages.includes('zaemlxjwhzrfmowbckmk.supabase.co') ||
            lowerMessages.includes('/realtime/v1/websocket') ||
            (lowerMessages.includes('wss://') && lowerMessages.includes('supabase.co')) ||
            // Stack traces do código compilado (qualquer linha que contenha WebSocket + Supabase)
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:491')) ||
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:496')) ||
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:509')) ||
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:528')) ||
            // Capturar QUALQUER linha do código compilado que contenha o domínio do Supabase
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:') && lowerMessages.includes('zaemlxjwhzrfmowbckmk.supabase.co')) ||
            // Funções específicas
            lowerMessages.includes('createwebsocket') ||
            lowerMessages.includes('createwebsocket@') ||
            // Estados e erros
            (lowerMessages.includes('websocket') && (lowerMessages.includes('failed') || lowerMessages.includes('fail'))) ||
            (lowerMessages.includes('realtime') && lowerMessages.includes('websocket')) ||
            lowerMessages.includes('websocket is already in closing') ||
            lowerMessages.includes('already in closing or closed');
        
        // Filtrar erros 429 do Gemini API
        const isQuotaError = 
            lowerMessages.includes('429') ||
            lowerMessages.includes('quota exceeded') ||
            lowerMessages.includes('resource_exhausted') ||
            lowerMessages.includes('too many requests') ||
            lowerMessages.includes('generativelanguage.googleapis.com') ||
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:615')) ||
            (lowerMessages.includes('index-') && lowerMessages.includes('.js:527'));
        
        return isWebSocketError || isQuotaError;
    };
    
    console.error = (...args: any[]) => {
        // Capturar todas as formas possíveis da mensagem
        const allMessages = args.map(arg => {
            if (typeof arg === 'string') return arg;
            if (arg?.toString) return arg.toString();
            if (arg?.message) return arg.message;
            if (arg?.stack) return arg.stack;
            // Verificar propriedades adicionais que podem conter a mensagem
            if (arg && typeof arg === 'object') {
                const objStr = JSON.stringify(arg);
                if (objStr && objStr !== '{}') return objStr;
            }
            try {
                return JSON.stringify(arg);
            } catch {
                return String(arg);
            }
        }).join(' ');
        
        // Também verificar os argumentos originais individualmente para capturar melhor
        const hasWebSocketInArgs = args.some(arg => {
            const str = String(arg || '').toLowerCase();
            // Capturar qualquer mensagem que contenha WebSocket + URL do Supabase
            return (str.includes('websocket') && str.includes('zaemlxjwhzrfmowbckmk.supabase.co')) ||
                   (str.includes('wss://') && str.includes('supabase.co')) ||
                   (str.includes('websocket') && str.includes('failed'));
        });
        
        // Verificar também se algum dos argumentos contém o padrão do stack trace
        const hasWebSocketStack = args.some(arg => {
            const str = String(arg || '').toLowerCase();
            return (str.includes('index-') && str.includes('.js:491') && str.includes('createwebsocket')) ||
                   (str.includes('index-') && str.includes('.js:496') && str.includes('connect')) ||
                   (str.includes('index-') && str.includes('.js:509')) ||
                   (str.includes('index-') && str.includes('.js:528'));
        });
        
        if (!shouldFilterMessage(allMessages) && !hasWebSocketInArgs && !hasWebSocketStack) {
            originalError.apply(console, args);
        }
    };
    
    console.warn = (...args: any[]) => {
        const allMessages = args.map(arg => {
            if (typeof arg === 'string') return arg;
            if (arg?.toString) return arg.toString();
            if (arg?.message) return arg.message;
            if (arg?.stack) return arg.stack;
            try {
                return JSON.stringify(arg);
            } catch {
                return String(arg);
            }
        }).join(' ');
        
        if (!shouldFilterMessage(allMessages)) {
            originalWarn.apply(console, args);
        }
    };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
