# 🚀 Como Adicionar os Arquivos Novos ao Git

## ⚠️ Problema Identificado

Os arquivos seguintes existem localmente, mas não estão sendo rastreados pelo Git:

- `hooks/useStaff.ts`
- `hooks/useCrmUnits.ts`
- `hooks/useCrmIssues.ts`
- `components/Toast.tsx`
- `components/settings/UserProfileSection.tsx`
- E outros arquivos novos

## ✅ Solução - Execute Manualmente

### Opção 1: Usar o Git Bash ou CMD (Recomendado)

1. Abra o **Git Bash** ou **CMD** (Prompt de Comando) como Administrador
2. Navegue até o diretório do projeto:
   ```bash
   cd "E:\App-Gestão-de-Condomínio"
   ```
   **OU** use o caminho curto do Windows:
   ```bash
   cd E:\APPGES~1\App-Ges~1
   ```

3. Execute os seguintes comandos:

```bash
# Adicionar arquivos novos explicitamente
git add -f hooks/useStaff.ts
git add -f hooks/useCrmUnits.ts
git add -f hooks/useCrmIssues.ts
git add -f components/Toast.tsx
git add -f components/settings/UserProfileSection.tsx
git add -f hooks/useNotes.ts
git add -f hooks/useNotices.ts
git add -f hooks/useOccurrences.ts
git add -f hooks/usePackages.ts
git add -f hooks/useReservations.ts
git add -f hooks/useResidents.ts
git add -f hooks/useUserProfile.ts
git add -f hooks/useVisitors.ts

# Adicionar todos os outros arquivos modificados
git add -A

# Verificar o que será commitado
git status --short

# Fazer commit
git commit -m "feat: adicionar funcionalidades completas - hooks useStaff, useCrmUnits, useCrmIssues, componente Toast, tratamento erro 429, botao limpar chat, exportacao PDF"

# Enviar para o GitHub
git push origin main
```

### Opção 2: Usar o Script Batch

1. Abra o **Explorador de Arquivos** e navegue até `E:\App-Gestão-de-Condomínio`
2. Clique duas vezes no arquivo `commit_and_push.bat`
3. O script tentará adicionar os arquivos automaticamente

### Opção 3: Usar o VS Code

1. Abra o projeto no **VS Code**
2. Abra o painel **Source Control** (Ctrl+Shift+G)
3. Você verá os arquivos não rastreados marcados com "U" (Untracked)
4. Clique no sinal de "+" ao lado de cada arquivo para adicioná-los
5. Ou clique em "Stage All Changes"
6. Digite uma mensagem de commit
7. Clique em "Commit"
8. Clique em "Sync Changes" ou "Push" para enviar ao GitHub

## 📋 Lista Completa de Arquivos que Precisam Ser Adicionados

Verifique se estes arquivos existem localmente:

### Hooks:
- [ ] `hooks/useStaff.ts`
- [ ] `hooks/useCrmUnits.ts`
- [ ] `hooks/useCrmIssues.ts`
- [ ] `hooks/useNotes.ts`
- [ ] `hooks/useNotices.ts`
- [ ] `hooks/useOccurrences.ts`
- [ ] `hooks/usePackages.ts`
- [ ] `hooks/useReservations.ts`
- [ ] `hooks/useResidents.ts`
- [ ] `hooks/useUserProfile.ts`
- [ ] `hooks/useVisitors.ts`

### Componentes:
- [ ] `components/Toast.tsx`
- [ ] `components/settings/UserProfileSection.tsx`

### Outros:
- [ ] `CONFIGURACAO_PENDENTE.md`
- [ ] `INTEGRACAO_SUPABASE_COMPLETA.md`
- [ ] `SUPABASE_SETUP_INSTRUCOES.md`
- [ ] `supabase_fix_duplicates.sql`

## 🔍 Verificação

Após executar os comandos, verifique se tudo foi enviado:

```bash
# Verificar status
git status

# Verificar últimos commits
git log --oneline -5

# Verificar se os arquivos estão no repositório remoto
git ls-files | grep -E "useStaff|useCrm|Toast"
```

Se você encontrar algum problema, execute:

```bash
# Forçar adição de todos os arquivos
git add -f .

# Verificar status
git status

# Commit e push
git commit -m "feat: adicionar todos os arquivos faltantes"
git push origin main
```

## ⚡ Solução Rápida (Uma Linha)

Se você estiver no Git Bash ou CMD no diretório correto:

```bash
git add -f . && git commit -m "feat: adicionar funcionalidades completas" && git push origin main
```

---

**Nota:** O problema ocorre porque o PowerShell tem dificuldades com caracteres especiais (ã, ó) no caminho do diretório. Usar Git Bash ou CMD resolve isso.
