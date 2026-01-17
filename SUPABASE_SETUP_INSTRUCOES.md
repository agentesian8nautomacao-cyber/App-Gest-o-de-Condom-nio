# 📋 Instruções de Setup do Supabase - Versão Corrigida

## ⚠️ Problema Encontrado

Você está recebendo erros ao executar os scripts porque alguns objetos (índices, triggers, etc.) já existem no banco de dados.

## ✅ Solução

Atualizei todos os scripts SQL para usar `IF NOT EXISTS` e `DROP IF EXISTS` onde necessário. Agora você tem duas opções:

---

## 🎯 OPÇÃO 1: Executar Script de Correção (Recomendado)

### Passo 1: Execute o script de correção
1. No SQL Editor do Supabase, clique em **"New Query"**
2. Abra o arquivo `supabase_fix_duplicates.sql`
3. **Copie todo o conteúdo** e cole no SQL Editor
4. Clique em **"Run"** ou pressione `Ctrl+Enter`
5. Aguarde a execução terminar

Este script irá:
- Remover índices duplicados
- Remover triggers duplicados  
- Remover políticas duplicadas

### Passo 2: Execute os scripts principais (na ordem)

Depois do script de correção, execute:

1. **`supabase_schema.sql`** (atualizado com IF NOT EXISTS)
2. **`supabase_functions.sql`** (já tinha DROP IF EXISTS)
3. **`supabase_add_users.sql`** (usa ON CONFLICT, seguro)

---

## 🎯 OPÇÃO 2: Executar Scripts Atualizados Diretamente

Se preferir, pode executar os scripts atualizados diretamente. Eles agora usam:
- `CREATE INDEX IF NOT EXISTS` - para índices
- `DROP TRIGGER IF EXISTS ... CREATE TRIGGER` - para triggers
- `DROP POLICY IF EXISTS ... CREATE POLICY` - para políticas

**Ordem de execução:**
1. `supabase_schema.sql`
2. `supabase_functions.sql`
3. `supabase_add_users.sql`

---

## 📊 Verificação

Após executar os scripts, verifique se tudo está correto:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar usuários criados
SELECT username, name, role, is_active 
FROM users 
ORDER BY created_at;

-- Verificar se há configuração padrão
SELECT * FROM app_config;
```

Você deve ver:
- ✅ 16 tabelas criadas
- ✅ 3 usuários criados (portaria, admin, desenvolvedor)
- ✅ 1 registro em `app_config` com nome padrão

---

## 🔐 Credenciais de Teste

Após executar `supabase_add_users.sql`, você pode fazer login com:

**Usuário Porteiro:**
- Usuário: `portaria`
- Senha: `123456`

**Usuário Síndico:**
- Usuário: `admin`
- Senha: `admin123`

**Usuário Desenvolvedor:**
- Usuário: `desenvolvedor`
- Senha: `dev`

---

## ⚠️ Importante

1. **Sempre execute na ordem:** schema → functions → add_users
2. **Aguarde cada execução terminar** antes de prosseguir
3. **Se houver erros**, execute primeiro o `supabase_fix_duplicates.sql`
4. **Não execute os scripts múltiplas vezes** sem o script de correção

---

## 🔧 Se Ainda Houver Problemas

Se ainda encontrar erros após executar o script de correção:

1. Verifique qual objeto está causando erro
2. Execute manualmente: `DROP [TYPE] IF EXISTS [nome];`
3. Execute novamente o script correspondente

---

**Última Atualização:** Janeiro 2025