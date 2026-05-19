# Guia de Integração com Google Calendar

Este guia explica como configurar a integração do sistema com o Google Calendar para sincronizar eventos automaticamente.

## ID do Calendário
```
4371fc05e56aeb0b6c9160645226ee1d6376ed43036e768d61322a1e02588df0@group.calendar.google.com
```

## Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" no topo da página
3. Clique em "NOVO PROJETO"
4. Dê um nome ao projeto (ex: "GJ Santa Terezinha")
5. Clique em "CRIAR"

## Passo 2: Habilitar a API do Google Calendar

1. No menu lateral, vá em **APIs e Serviços** > **Biblioteca**
2. Busque por "Google Calendar API"
3. Clique na API e depois em **ATIVAR**

## Passo 3: Configurar Tela de Consentimento OAuth

1. No menu lateral, vá em **APIs e Serviços** > **Tela de consentimento OAuth**
2. Selecione **Externo** e clique em **CRIAR**
   - ⚠️ **Importante**: Como você não é usuário do Google Workspace, o app será disponibilizado para usuários externos (público em geral)
3. Preencha as informações obrigatórias:
   - **Nome do app**: GJ Santa Terezinha
   - **E-mail de suporte do usuário**: seu e-mail
   - **E-mail do desenvolvedor**: seu e-mail
   - **Logotipo do app** (opcional): Pode adicionar o brasão do GJ
4. Clique em **SALVAR E CONTINUAR**
5. Em "Escopos", clique em **ADICIONAR OU REMOVER ESCOPOS**
6. Adicione os seguintes escopos:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events.readonly`
7. Clique em **ATUALIZAR** e depois **SALVAR E CONTINUAR**
8. Em "Usuários de teste":
   - **Durante desenvolvimento**: Adicione os e-mails dos coordenadores que vão testar
   - **Para produção**: Você precisará publicar o app (veja seção abaixo)
9. Clique em **SALVAR E CONTINUAR**
10. Revise as informações e clique em **VOLTAR PARA O PAINEL**

## Passo 4: Criar Credenciais OAuth 2.0

1. No menu lateral, vá em **APIs e Serviços** > **Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** > **ID do cliente OAuth**
3. Selecione **Aplicativo da Web**
4. Dê um nome (ex: "GJ Web Client")
5. Em **URIs de redirecionamento autorizados**, adicione:
   - Para desenvolvimento: `http://localhost:5173`
   - Para produção: `https://seu-dominio.vercel.app`
6. Clique em **CRIAR**
7. **IMPORTANTE**: Copie o **Client ID** e o **Client Secret** que aparecerem

## Passo 5: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Google Calendar Integration
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
VITE_GOOGLE_CALENDAR_ID=4371fc05e56aeb0b6c9160645226ee1d6376ed43036e768d61322a1e02588df0@group.calendar.google.com
```

## Passo 6: Configurar no Vercel (Produção)

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione as mesmas variáveis:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_SECRET`
   - `VITE_GOOGLE_CALENDAR_ID`
5. Clique em **Save**
6. Faça um novo deploy para aplicar as mudanças

## Passo 7: Testar a Integração

1. Acesse o sistema
2. Vá para a página de Calendário
3. Clique no botão "Sincronizar com Google Calendar"
4. Faça login com sua conta Google
5. Autorize o acesso ao calendário
6. Os eventos serão importados automaticamente

## Funcionalidades Disponíveis

### Sincronização Manual
- Botão para importar eventos do Google Calendar
- Atualiza eventos existentes
- Adiciona novos eventos

### Sincronização Automática (Opcional)
- Verifica novos eventos a cada 1 hora
- Sincroniza automaticamente em segundo plano
- Notifica sobre novos eventos

## Tipos de Eventos Mapeados

O sistema mapeia automaticamente os eventos do Google Calendar para as categorias:

- **Sábados**: Eventos regulares do GJ
- **Solenidades**: Eventos marcados como "Solenidade"
- **Dia de Santo**: Eventos de santos
- **Aniversário**: Aniversários dos jovens
- **Eventos Paroquiais**: Eventos da paróquia
- **Novenas**: Novenas e orações

## Permissões do Calendário

Certifique-se de que o calendário está configurado como:
- **Público** ou
- **Compartilhado** com o e-mail usado no OAuth

Para verificar:
1. Abra o Google Calendar
2. Clique nos 3 pontos ao lado do calendário
3. Vá em "Configurações e compartilhamento"
4. Em "Permissões de acesso", marque "Disponibilizar publicamente"

## Solução de Problemas

### Erro: "Access denied"
- Verifique se o e-mail está na lista de usuários de teste
- Confirme que as permissões do calendário estão corretas

### Erro: "Invalid client"
- Verifique se o Client ID está correto no `.env`
- Confirme que o URI de redirecionamento está configurado

### Eventos não aparecem
- Verifique se o Calendar ID está correto
- Confirme que o calendário tem eventos
- Tente fazer logout e login novamente

## Segurança

- **Nunca** commite o arquivo `.env` no Git
- As credenciais OAuth são sensíveis
- Use variáveis de ambiente para produção
- Revogue o acesso se necessário no [Google Account](https://myaccount.google.com/permissions)

## Próximos Passos

Após configurar:
1. Teste a importação de eventos
2. Verifique se as categorias estão corretas
3. Configure a sincronização automática (opcional)
4. Treine os coordenadores para usar a funcionalidade

## Suporte

Se tiver problemas:
1. Verifique os logs do console do navegador
2. Confirme que todas as variáveis estão configuradas
3. Teste com um calendário de teste primeiro
4. Consulte a [documentação oficial do Google Calendar API](https://developers.google.com/calendar)