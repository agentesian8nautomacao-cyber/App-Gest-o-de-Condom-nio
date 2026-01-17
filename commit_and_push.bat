@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo Enviando alteracoes para o GitHub...
echo ========================================
echo.
echo Diretorio: %CD%
echo.

REM Primeiro, adicionar explicitamente os arquivos novos que podem nao estar rastreados
echo Adicionando arquivos novos explicitamente...
git add -f hooks\useStaff.ts 2>nul
git add -f hooks\useCrmUnits.ts 2>nul
git add -f hooks\useCrmIssues.ts 2>nul
git add -f components\Toast.tsx 2>nul
git add -f components\settings\UserProfileSection.tsx 2>nul
git add -f hooks\useNotes.ts 2>nul
git add -f hooks\useNotices.ts 2>nul
git add -f hooks\useOccurrences.ts 2>nul
git add -f hooks\usePackages.ts 2>nul
git add -f hooks\useReservations.ts 2>nul
git add -f hooks\useResidents.ts 2>nul
git add -f hooks\useUserProfile.ts 2>nul
git add -f hooks\useVisitors.ts 2>nul
git add -f supabase_fix_duplicates.sql 2>nul
git add -f CONFIGURACAO_PENDENTE.md 2>nul
git add -f INTEGRACAO_SUPABASE_COMPLETA.md 2>nul
git add -f SUPABASE_SETUP_INSTRUCOES.md 2>nul
echo.

echo Adicionando todos os arquivos modificados...
git add -A
echo.

echo Verificando status...
git status --short
echo.

if "%1"=="" (
    set commit_msg=feat: implementar funcionalidades faltantes - exportacao PDF, gestao de funcionarios completa, CRM conectado ao Supabase, sistema Toast, tratamento erro 429 API Gemini, botao limpar chat
) else (
    set commit_msg=%1
)

echo Fazendo commit com a mensagem:
echo %commit_msg%
echo.
git commit -m "%commit_msg%"
echo.

if %errorlevel% neq 0 (
    echo AVISO: Nenhuma alteracao para commitar ou commit falhou!
    echo Verifique o status acima.
    echo.
    echo Tentando adicionar arquivos novamente...
    git add -A
    git status --short
    pause
    exit /b 1
)

echo Enviando para GitHub (branch: main)...
git push origin main
echo.

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo SUCESSO! Alteracoes enviadas para o GitHub!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERRO ao enviar para o GitHub!
    echo Verifique se:
    echo - O repositorio remoto esta configurado corretamente
    echo - Voce tem permissao para fazer push
    echo - A branch existe no repositorio remoto
    echo.
    echo Tentando fazer pull primeiro...
    git pull origin main --rebase
    if %errorlevel% == 0 (
        echo.
        echo Tentando push novamente...
        git push origin main
    )
    echo ========================================
)
echo.
pause
