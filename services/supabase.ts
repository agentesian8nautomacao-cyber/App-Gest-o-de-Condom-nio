
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
export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        realtime: {
            params: {
                eventsPerSecond: 10
            },
            heartbeatIntervalMs: 30000,
            reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
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

// Silenciar erros de WebSocket do Supabase que são comuns e não afetam a funcionalidade
// Esses erros aparecem quando o Realtime não está configurado ou há problemas de conexão
if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
        // Verificar todos os argumentos para encontrar mensagens de WebSocket
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
        }).join(' ').toLowerCase();

        // Filtrar erros de WebSocket do Supabase Realtime (casos comuns)
        const isWebSocketError = 
            allMessages.includes('websocket connection') || 
            (allMessages.includes('wss://') && allMessages.includes('supabase.co')) ||
            allMessages.includes('createwebsocket') ||
            (allMessages.includes('websocket') && allMessages.includes('failed') && allMessages.includes('supabase')) ||
            (allMessages.includes('realtime') && allMessages.includes('websocket'));

        if (isWebSocketError) {
            // Não logar - são erros esperados e não críticos quando Realtime não está configurado
            return;
        }
        originalError.apply(console, args);
    };
}
