# ⚠️ Configuração Pendente e Problemas Identificados

Este documento lista todos os itens que precisam ser configurados e corrigidos no aplicativo.

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **App NÃO está conectado ao Banco de Dados Supabase**

**Problema:** O aplicativo está usando dados MOCK (hardcoded) em vez de fazer queries reais ao Supabase.

**Evidências:**
- `App.tsx` linhas 395-423: Dados mock (`useState` com arrays fixos)
- `AuthContext.tsx` linhas 115-117: Autenticação mock em vez de usar Supabase Auth
- Nenhuma query real ao banco de dados está sendo executada

**Impacto:** 
- Todas as alterações feitas no app são perdidas ao recarregar a página
- Dados não são persistidos
- Múltiplos usuários não podem compartilhar os mesmos dados

**Solução Necessária:**
- Implementar hooks/services para fazer queries ao Supabase
- Substituir todos os `useState` com dados mock por queries reais
- Configurar autenticação correta com Supabase Auth

---

### 2. **Variáveis de Ambiente Não Configuradas**

**Problema:** O arquivo `.env.local` existe mas não é possível verificar se está configurado corretamente.

**Variáveis Necessárias:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
GEMINI_API_KEY=sua-chave-gemini
```

**Verificação:**
- O arquivo `services/supabase.ts` está tentando ler essas variáveis
- Se não estiverem configuradas, o app mostrará erros no console

**Ação Necessária:**
1. Criar/verificar arquivo `.env.local` na raiz do projeto
2. Adicionar as credenciais do Supabase
3. Adicionar chave do Gemini API (para funcionalidade IA)

---

### 3. **Autenticação Não Funcional**

**Problema:** `AuthContext.tsx` está usando autenticação mock em vez de Supabase Auth.

**Código Atual (INCORRETO):**
```typescript
// Linhas 115-117: Validação hardcoded
const isValidPassword = password === '123456' && username === 'portaria' ||
                       password === 'admin123' && username === 'admin' ||
                       password === 'dev' && username === 'desenvolvedor';
```

**Problemas:**
- Senhas não são validadas contra o banco de dados
- Usuários não estão sendo autenticados via Supabase
- Sessões não são gerenciadas corretamente

**Solução Necessária:**
- Implementar autenticação real com Supabase Auth
- Ou implementar validação de senha contra a tabela `users` com hash correto
- Usar bcrypt ou similar para comparação de senhas

---

### 4. **Inconsistências entre Schema do Banco e Tipos TypeScript**

**Problemas Identificados:**

#### Tabela `packages`:
- **Banco:** `recipient_name` (snake_case)
- **TypeScript:** `recipient_name` ✅ (correto)
- **Mas também:** campos legados `recipient` que podem causar confusão

#### Tabela `visitors`:
- **Banco:** `entry_time`, `exit_time` (snake_case)
- **TypeScript:** `entry_time`, `exit_time` ✅ (correto)
- **Mas também:** campos legados `entryTime`, `exitTime`

#### Tabela `occurrences`:
- **Banco:** `reported_by` (string), `reported_by_user_id` (UUID opcional)
- **TypeScript:** `reported_by` ✅ (correto)
- **Banco:** `resolved_by` (UUID)
- **TypeScript:** `resolved_by` ✅ (correto)

#### Tabela `crm_units`:
- **Banco:** `tags TEXT[]` (array)
- **TypeScript:** `tags: string[]` ✅ (correto)
- **Banco:** `last_incident`, `nps_score` (snake_case)
- **TypeScript:** tem campos legados também

**Recomendação:** Limpar campos legados do TypeScript após confirmar que não são mais usados.

---

### 5. **Tabela `app_config` Não Está Sendo Usada**

**Problema:** O app usa `AppConfigContext` que salva tudo em `localStorage`, mas o banco tem uma tabela `app_config` que não é utilizada.

**Situação Atual:**
- Configurações são salvas apenas no `localStorage` do navegador
- Tabela `app_config` no banco existe mas está vazia/não sincronizada
- Configurações não são compartilhadas entre dispositivos/usuários

**Solução Necessária:**
- Sincronizar `AppConfigContext` com a tabela `app_config` do Supabase
- Fazer fetch inicial das configurações do banco
- Salvar alterações no banco E no localStorage (para cache)

---

### 6. **Row Level Security (RLS) Não Configurado**

**Problema:** O schema habilita RLS em todas as tabelas, mas as políticas são muito permissivas ou não existem.

**Código Atual:**
```sql
-- Linha 421-424: Políticas muito permissivas
CREATE POLICY "Users can view all data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert all data" ON residents FOR INSERT WITH CHECK (true);
```

**Risco:** Em produção, qualquer pessoa pode acessar/modificar dados se tiver a chave anon.

**Solução Necessária:**
- Implementar políticas RLS adequadas
- Configurar políticas baseadas em roles (PORTEIRO vs SINDICO)
- Limitar acesso baseado em autenticação

---

## 🟡 CONFIGURAÇÕES RECOMENDADAS

### 7. **Políticas RLS Adequadas**

**Exemplo de Política Recomendada:**
```sql
-- Permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can read residents"
    ON residents FOR SELECT
    USING (auth.role() = 'authenticated');

-- Porteiro pode inserir/atualizar packages
CREATE POLICY "Porteiro can manage packages"
    ON packages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'PORTEIRO'
        )
    );

-- Síndico tem acesso completo
CREATE POLICY "Sindico has full access"
    ON residents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'SINDICO'
        )
    );
```

---

### 8. **Sincronização de Dados com Supabase**

**Componentes que Precisam de Integração:**

1. **Residents (Moradores)**
   - CRUD completo no Supabase
   - Busca e filtros

2. **Packages (Encomendas)**
   - Inserção ao receber
   - Atualização de status
   - Busca e filtros

3. **Visitors (Visitantes)**
   - Registro de entrada
   - Registro de saída
   - Histórico

4. **Occurrences (Ocorrências)**
   - Criação
   - Atualização de status
   - Resolução

5. **Reservations (Reservas)**
   - Criação
   - Validação de conflitos
   - Check-in/Check-out

6. **Notices (Avisos)**
   - Criação
   - Leitura (marcar como lido)
   - Atualização

7. **Notes (Notas)**
   - CRUD completo

8. **Chat Messages**
   - Envio
   - Recebimento em tempo real (subscriptions)

---

### 9. **Funcionalidades Faltantes de Integração**

- **Real-time subscriptions** para:
  - Novos packages
  - Novos visitantes
  - Novas ocorrências
  - Novas mensagens no chat
  - Atualizações de reservas

- **Validações no lado do servidor** (via Supabase Functions ou triggers):
  - Sobreposição de reservas
  - Validação de unidade ao criar package
  - Verificação de morador existente

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

### Banco de Dados (Supabase)
- [ ] Executar `supabase_schema.sql` no SQL Editor
- [ ] Executar `supabase_functions.sql` no SQL Editor
- [ ] Executar `supabase_add_users.sql` para criar usuários de teste
- [ ] Verificar que todas as tabelas foram criadas
- [ ] Configurar políticas RLS adequadas
- [ ] Inserir dados de teste (áreas comuns, alguns moradores)

### Variáveis de Ambiente
- [ ] Criar `.env.local` na raiz
- [ ] Adicionar `VITE_SUPABASE_URL`
- [ ] Adicionar `VITE_SUPABASE_ANON_KEY`
- [ ] Adicionar `GEMINI_API_KEY`
- [ ] Verificar que o arquivo está no `.gitignore`

### Código (Desenvolvimento Futuro)
- [ ] Implementar hooks/services para queries ao Supabase
- [ ] Substituir dados mock por queries reais
- [ ] Implementar autenticação real com Supabase Auth
- [ ] Sincronizar `AppConfigContext` com tabela `app_config`
- [ ] Implementar real-time subscriptions
- [ ] Adicionar tratamento de erros para queries
- [ ] Implementar loading states durante queries
- [ ] Limpar campos legados do TypeScript

### Testes
- [ ] Testar criação de morador
- [ ] Testar registro de encomenda
- [ ] Testar registro de visitante
- [ ] Testar criação de ocorrência
- [ ] Testar criação de reserva
- [ ] Testar autenticação
- [ ] Testar sincronização entre dispositivos

---

## 🔧 PRÓXIMOS PASSOS RECOMENDADOS

1. **Imediato:**
   - Configurar variáveis de ambiente
   - Verificar se o schema foi executado no Supabase
   - Testar conexão básica com Supabase

2. **Curto Prazo:**
   - Implementar CRUD básico para uma entidade (ex: residents)
   - Testar inserção e leitura de dados
   - Implementar autenticação real

3. **Médio Prazo:**
   - Migrar todas as entidades para usar Supabase
   - Implementar real-time subscriptions
   - Configurar políticas RLS adequadas

4. **Longo Prazo:**
   - Otimizar queries e índices
   - Implementar cache local com sincronização
   - Adicionar validações no servidor
   - Implementar backup automático

---

## 📝 NOTAS IMPORTANTES

- O schema do banco está **correto e completo**
- Os tipos TypeScript estão **compatíveis** com o schema (apenas com campos legados que podem ser removidos)
- O problema principal é que o **código não está usando o banco de dados**
- Todas as funcionalidades do app funcionam localmente (com dados mock), mas precisam ser migradas para usar Supabase

---

**Última Atualização:** Janeiro 2025