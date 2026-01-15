# Solução para Erro "Server is being restarted or closed"

## Problema
O erro `Internal Server Error: The server is being restarted or closed. Request is outdated` ocorre quando o servidor Vite está sendo reiniciado ou foi fechado enquanto o navegador ainda tenta se conectar.

## Soluções

### Solução Rápida (Recomendada)
1. **Execute o script de reinicialização:**
   - Clique duas vezes no arquivo `REINICIAR_SERVIDOR.bat`
   - Este script irá:
     - Parar processos na porta 3007
     - Limpar o cache do Vite
     - Reiniciar o servidor

### Solução Manual

1. **Pare o servidor atual:**
   - Pressione `Ctrl + C` no terminal onde o servidor está rodando
   - Ou feche o terminal completamente

2. **Limpe o cache do Vite:**
   ```bash
   rmdir /s /q node_modules\.vite
   ```

3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

4. **Recarregue o navegador:**
   - Pressione `Ctrl + Shift + R` para recarregar sem cache
   - Ou feche e abra novamente a aba do navegador

### Se o problema persistir

1. **Verifique se há processos na porta 3007:**
   ```bash
   netstat -ano | findstr :3007
   ```

2. **Encerre processos manualmente:**
   ```bash
   taskkill /F /PID [número_do_processo]
   ```

3. **Limpe completamente o cache:**
   ```bash
   npm cache clean --force
   rmdir /s /q node_modules\.vite
   ```

4. **Reinstale as dependências (último recurso):**
   ```bash
   rmdir /s /q node_modules
   npm install
   npm run dev
   ```

## Prevenção

- Sempre pare o servidor corretamente usando `Ctrl + C` antes de fechar o terminal
- Evite fazer muitas mudanças simultâneas no código enquanto o servidor está rodando
- Use o script `REINICIAR_SERVIDOR.bat` quando precisar reiniciar o servidor
