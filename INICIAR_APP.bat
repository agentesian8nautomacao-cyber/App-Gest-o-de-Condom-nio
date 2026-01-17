@echo off
chcp 65001 >nul
echo ========================================
echo Iniciando App Gestao de Condominio
echo Porta: 3007
echo ========================================
echo.

cd /d "%~dp0"

REM Para processos na porta 3007
echo Verificando porta 3007...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3007 ^| findstr LISTENING') do (
    echo Encerrando processo antigo: %%a
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

REM Limpa cache do Vite
if exist "node_modules\.vite" (
    echo Limpando cache do Vite...
    rmdir /s /q "node_modules\.vite"
)

echo.
echo ========================================
echo Iniciando servidor na porta 3007...
echo URL: http://localhost:3007
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev

pause
