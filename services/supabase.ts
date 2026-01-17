
// Aplicar filtros de console ANTES de importar qualquer coisa que possa gerar logs
if (typeof window !== 'undefined') {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const shouldFilterMessage = (messages: string): boolean => {
        const lowerMessages = messages.toLowerCase();
        
        // Filtrar erros de WebSocket do Supabase Realtime
        const isWebSocketError = 
            lowerMessages.includes('websocket connection') || 
            lowerMessages.includes('websocket connection to') ||
            (lowerMessages.includes('wss://') && (lowerMessages.includes('supabase.co') || lowerMessages.includes('supabase'))) ||
            lowerMessages.includes('createwebsocket') ||
            lowerMessages.includes('createwebsocket@') ||
            lowerMessages.includes('@ index-') || // Capturar stack traces do código compilado
            (lowerMessages.includes('websocket') && (lowerMessages.includes('failed') || lowerMessages.includes('fail'))) ||
            (lowerMessages.includes('realtime') && lowerMessages.includes('websocket')) ||
            lowerMessages.includes('websocket is already in closing or closed state') ||
            lowerMessages.includes('websocket is already in closing') ||
            lowerMessages.includes('already in closing') ||
            lowerMessages.includes('already in closed state') ||
            (lowerMessages.includes('websocket') && lowerMessages.includes('closing')) ||
            (lowerMessages.includes('websocket') && lowerMessages.includes('closed')) ||
            lowerMessages.includes('zaemlxjwhzrfmowbckmk.supabase.co') ||
            // Capturar especificamente o padrão que aparece no console
            (lowerMessages.includes('wss://zaemlxjwhzrfmowbckmk.supabase.co/realtime/v1/websocket'));
        
        // Filtrar erros 429 (quota exceeded) do Gemini API
        const isQuotaError = 
            lowerMessages.includes('error in handlesendmessage') ||
            lowerMessages.includes('error in handlegeneratereport') ||
            lowerMessages.includes('exceeded your current quota') ||
            lowerMessages.includes('quota exceeded') ||
            (lowerMessages.includes('429') && (lowerMessages.includes('too many requests') || lowerMessages.includes('resource'))) ||
            lowerMessages.includes('resource_exhausted') ||
            lowerMessages.includes('too many requests') ||
            lowerMessages.includes('generativelanguage.googleapis.com');
        
        return isWebSocketError || isQuotaError;
    };
    
    console.error = (...args: any[]) => {
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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase credentials not found in environment variables.');
    console.error('⚠️ VITE_SUPABASE_URL:', supabaseUrl || 'AUSENTE');
    console.error('⚠️ VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente (comprimento: ' + supabaseAnonKey.length + ')' : 'AUSENTE');
}

// Validar formato da chave (deve começar com eyJ e ter um tamanho mínimo)
if (supabaseAnonKey) {
    const trimmedKey = supabaseAnonKey.trim();
    console.log('🔍 Comprimento da chave API:', trimmedKey.length);
    console.log('🔍 Primeiros 10 caracteres:', trimmedKey.substring(0, 10));
    
    if (!trimmedKey.startsWith('eyJ') || trimmedKey.length < 100) {
        console.error('⚠️ Chave API parece estar incompleta ou incorreta!');
        console.error('⚠️ A chave deve começar com "eyJ" e ter aproximadamente 200+ caracteres');
        console.error('⚠️ Chave atual começa com:', trimmedKey.substring(0, 3));
        console.error('⚠️ Comprimento atual:', trimmedKey.length);
    } else {
        console.log('✅ Chave API parece estar correta');
    }
}

// Configuração do cliente Supabase com tratamento de erros melhorado
// Realtime está configurado, mas os erros de conexão serão silenciados
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        realtime: {
            params: {
                eventsPerSecond: 10
            },
            heartbeatIntervalMs: 30000,
            reconnectAfterMs: (tries: number) => {
                // Reduzir tentativas de reconexão após 5 tentativas
                if (tries > 5) return 60000; // 1 minuto após 5 tentativas
                return Math.min(tries * 1000, 30000);
            },
            timeout: 20000
        },
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        },
        global: {
            headers: {
                'x-client-info': 'qualivida-app'
            }
        }
    }
);

// Event listeners para capturar erros não tratados (já aplicados no topo do arquivo)
if (typeof window !== 'undefined') {
    // Também capturar erros não tratados de WebSocket e 429
    window.addEventListener('error', (event) => {
        const message = (event.message || event.filename || '').toLowerCase();
        const isWebSocketError = 
            (message.includes('websocket') && (message.includes('supabase') || message.includes('wss://'))) ||
            message.includes('websocket is already in closing') ||
            message.includes('already in closing or closed') ||
            message.includes('zaemlxjwhzrfmowbckmk.supabase.co');
        const isQuotaError = 
            message.includes('429') ||
            message.includes('quota exceeded') ||
            message.includes('generativelanguage.googleapis.com');
        
        if (isWebSocketError || isQuotaError) {
            event.preventDefault();
            return false;
        }
    }, true);

    // Capturar também erros de unhandled promise rejection relacionados a WebSocket e 429
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason || {};
        const message = (reason?.message || String(reason) || '').toLowerCase();
        const stack = (reason?.stack || '').toLowerCase();
        const allMessage = message + ' ' + stack;
        
        const isWebSocketError = 
            (allMessage.includes('websocket') && (allMessage.includes('supabase') || allMessage.includes('wss://'))) ||
            allMessage.includes('websocket is already in closing') ||
            allMessage.includes('already in closing or closed') ||
            allMessage.includes('zaemlxjwhzrfmowbckmk.supabase.co');
        const isQuotaError = 
            allMessage.includes('429') ||
            allMessage.includes('quota exceeded') ||
            allMessage.includes('resource_exhausted') ||
            allMessage.includes('generativelanguage.googleapis.com') ||
            (allMessage.includes('gemini') && allMessage.includes('429'));
        
        if (isWebSocketError || isQuotaError) {
            event.preventDefault();
            return false;
        }
    });
}
