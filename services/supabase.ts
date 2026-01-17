
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
            transport: 'websocket',
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

// Silenciar erros de WebSocket do Supabase que são comuns em desenvolvimento
// e não afetam a funcionalidade principal da aplicação
if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        // Filtrar apenas erros de WebSocket do Supabase Realtime (não críticos)
        // Erros de API REST ainda serão logados normalmente
        if (message.includes('WebSocket connection') && 
            message.includes('supabase.co') && 
            message.includes('realtime')) {
            // Não logar - são erros esperados quando Realtime não está configurado
            return;
        }
        originalError.apply(console, args);
    };
}
