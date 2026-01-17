@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo FAZENDO COMMIT DAS ALTERAÇÕES
echo ========================================
echo.

git add -A

echo.
echo Verificando status...
git status

echo.
echo ========================================
echo Fazendo commit...
echo ========================================
echo.

git commit -m "Melhorar tratamento de erros da API Gemini e mensagens de quota

- Atualizado modelo para gemini-2.0-flash-exp (compatível com FreeTier)
- Melhorado tratamento de erros de quota com mensagens mais claras
- Adicionada verificação de chave API antes de usar
- Melhorado filtro de console para suprimir erros WebSocket e 429
- Adicionado suporte a quebra de linha no componente Toast
- Tratamento de mensagens JSON para evitar exibição de dados brutos"

echo.
echo ========================================
echo Commit concluído!
echo ========================================
echo.
echo Para enviar ao GitHub, execute:
echo git push origin main
echo.
pause
