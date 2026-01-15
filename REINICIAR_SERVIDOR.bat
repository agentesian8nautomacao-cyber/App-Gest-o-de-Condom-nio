@echo off
chcp 65001 >nul
echo ========================================
echo Reiniciando servidor de desenvolvimento...
echo ========================================
echo.

REM Navega para o diretorio do script
cd /d "%~dp0"

echo Diretorio: %CD%
echo.

REM Para processos do Node/Vite na porta 3007
echo Parando processos na porta 3007...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3007 ^| findstr LISTENING') do (
    echo Encerrando processo %%a
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

REM Verifica se a porta está livre
echo Verificando se a porta 3007 esta livre...
:check_port
netstat -aon | findstr :3007 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo Aguardando porta 3007 ficar livre...
    timeout /t 1 /nobreak >nul
    goto check_port
)
echo Porta 3007 esta livre!
echo.

REM Limpa o cache do Vite
echo Limpando cache do Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Cache do Vite removido.
)

REM Limpa o cache do npm (opcional)
echo Limpando cache do npm...
call npm cache clean --force >nul 2>&1

echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.

REM Verifica se package.json existe
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    pause
    exit /b 1
)

REM Inicia o servidor
echo Executando: npm run dev
echo.
npm run dev

pause
