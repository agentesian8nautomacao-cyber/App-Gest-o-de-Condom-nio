@echo off
chcp 65001 >nul
echo ========================================
echo Iniciando servidor de desenvolvimento...
echo ========================================
echo.

REM Navega para o diretorio do script
cd /d "%~dp0"

echo Diretorio: %CD%
echo.

REM Verifica se package.json existe
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    pause
    exit /b 1
)

REM Verifica se a porta 3007 está ocupada
echo Verificando porta 3007...
netstat -aon | findstr :3007 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo AVISO: Porta 3007 ja esta em uso!
    echo Use REINICIAR_SERVIDOR.bat para liberar a porta.
    echo.
    choice /C SN /M "Deseja continuar mesmo assim? (S/N)"
    if errorlevel 2 exit /b 1
)

echo.
echo Servidor iniciara na porta 3007
echo URL: http://localhost:3007
echo.
echo Executando: npm run dev
echo.
npm run dev

pause