@echo off
chcp 65001 >nul
echo ========================================
echo Enviando alteracoes para o GitHub...
echo ========================================
echo.

REM Navega para o diretorio do script
cd /d "%~dp0"

echo Diretorio: %CD%
echo.

REM Verifica se e um repositorio git
if not exist ".git" (
    echo ERRO: Nao e um repositorio Git!
    pause
    exit /b 1
)

echo Verificando status das alteracoes...
git status
echo.

echo Adicionando todos os arquivos (exceto .env)...
git add .
echo.

echo Arquivos adicionados. Verifique o que sera commitado:
git status --short
echo.

set /p commit_msg="Digite a mensagem do commit (ou pressione Enter para usar a padrao): "

if "%commit_msg%"=="" (
    set commit_msg=Correcao: Ajuste no vite.config.ts para evitar reinicializacoes constantes e atualizacao do .gitignore
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
echo Verificando repositorio remoto...
git remote -v
echo.

if %errorlevel% neq 0 (
    echo AVISO: Nenhum repositorio remoto configurado!
    echo Configure com: git remote add origin URL_DO_SEU_REPOSITORIO
    pause
    exit /b 1
)

echo.
set /p branch="Digite o nome da branch (pressione Enter para 'master'): "

if "%branch%"=="" (
    set branch=master
)

echo.
echo Enviando para o GitHub (branch: %branch%)...
git push origin %branch%
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
