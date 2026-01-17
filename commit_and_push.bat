@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add -A
git commit -m "feat: implementar funcionalidades faltantes - exportacao PDF, gestao de funcionarios, CRM conectado, sistema Toast, tratamento erro 429"
git push origin master
pause
