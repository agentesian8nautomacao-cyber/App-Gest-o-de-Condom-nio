@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo Enviando alteracoes para o GitHub...
echo ========================================
echo.
echo Diretorio: %CD%
echo.
echo Verificando status...
git status
echo.
echo Adicionando todos os arquivos...
git add -A
echo.
echo Arquivos adicionados. Verificando o que sera commitado:
git status --short
echo.
if "%1"=="" (
    set commit_msg=feat: implementar funcionalidades faltantes - exportacao PDF, gestao de funcionarios completa, CRM conectado ao Supabase, sistema Toast, tratamento erro 429 API Gemini, botao limpar chat
) else (
    set commit_msg=%1
)
echo.
echo Fazendo commit com a mensagem: %commit_msg%
git commit -m "%commit_msg%"
echo.
if %errorlevel% neq 0 (
    echo AVISO: Nenhuma alteracao para commitar ou commit falhou!
    echo Verifique o status acima.
    pause
    exit /b 1
)
echo.
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
    echo ========================================
)
echo.
pause
