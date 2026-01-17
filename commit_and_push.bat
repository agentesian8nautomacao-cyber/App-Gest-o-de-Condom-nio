@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Adicionando arquivos ao staging...
git add -A
echo.
echo Verificando status...
git status --short
echo.
echo Fazendo commit...
git commit -m "feat: implementar funcionalidades faltantes - exportacao PDF, gestao de funcionarios, CRM conectado ao Supabase, sistema Toast, tratamento erro 429 API Gemini, botao limpar chat"
echo.
echo Enviando para GitHub...
git push origin master
echo.
echo Concluido!
pause
