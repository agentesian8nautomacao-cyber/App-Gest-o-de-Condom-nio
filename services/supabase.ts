
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

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
