# Plano: Notificações Automáticas a partir do Calendário de Eventos

## Visão Geral

**Objetivo:** Criar um sistema de notificações automáticas que lê os eventos da planilha Google Sheets (e opcionalmente do Firestore) e envia lembretes aos membros e coordenadores pelos canais WhatsApp e Email, sem necessidade de ação manual.

**Escopo:**
- Leitura automática da planilha de eventos (Google Sheets)
- Notificações de lembrete: 7 dias antes e 1 dia antes de cada evento
- Canais: WhatsApp (principal para jovens) + Email (resumo semanal para coordenadores)
- Respeito a consentimento de comunicação (`whatsappConsent`, `emailConsent`)
- Prevenção de duplicatas via log no Firestore
- SMS está fora do escopo (requer nova integração paga via Twilio/SNS)

**Fora do escopo (decidido conscientemente):**
- SMS: custo por mensagem (~R$0,10) e integração nova do zero; não justificado agora
- Notificações push via app: o projeto é web, sem service worker registrado
- Agendamento de mensagem pelo usuário: a automação é da camada de servidor, não da UI

---

## Contexto Técnico (descoberto na análise)

- **Planilha:** Google Sheets com aba `Eventos`, colunas: título, categoria, data, horário, local, descrição, url_arte
- **Membros:** Firestore coleção `people` (alias `members`) com campos `phone`, `email`, `whatsappConsent`, `emailConsent`
- **Infraestrutura de envio:** Cloud Functions já prontas — `sendWhatsAppBroadcast` e `sendEmailBroadcast` (Boa Nova)
- **Scheduled Functions:** Firebase Functions com Cloud Scheduler (Pub/Sub) já em uso (`cleanupOldBroadcasts`)
- **Sem automação atual:** Todo envio é manual pelo painel Terezinha OS

---

## Para Quem Notificar

| Público | Condição | Canal Recomendado |
|---------|----------|-------------------|
| **Jovens/Membros ativos** | `status: 'active'` + `whatsappConsent.accepted: true` | WhatsApp — lembrete individual por evento |
| **Novos (status 'new')** | `status: 'new'` + consent aceito | WhatsApp — mesmo lembrete (acolhimento) |
| **Coordenadores/Líderes** | `users` com role `coordinator` ou `admin` | Email — resumo semanal da agenda |
| **Membros afastados (away)** | Não notificar | — |
| **Ex-membros (alumni)** | Não notificar | — |

---

## Decisões de Design

1. **Não reutilizar `sendWhatsAppBroadcast` diretamente** — aquela função é `onCall` (acionada pela UI). A automação será uma nova função `onSchedule` que usa o mesmo serviço Baileys internamente.
2. **Sessão WhatsApp para automação** — a automação precisa de uma sessão WhatsApp já autenticada. A estratégia é verificar se existe sessão ativa; se não, registrar em log e não enviar (sem criar QR Code automaticamente).
3. **Filtro de consentimento obrigatório** — LGPD: só enviar para quem tem `whatsappConsent.accepted === true` ou `emailConsent.accepted === true`.
4. **Log de notificações no Firestore** — coleção `notification_logs` com chave composta `{eventId}_{memberId}_{type}_{days_before}` para evitar reenvio.
5. **Janela de envio** — WhatsApp: 08h00 (horário de Brasília). Email: segunda-feira às 08h (resumo semanal).
6. **Configuração flexível** — antecedências (7 dias, 1 dia) configuráveis via Firestore `system_settings`.

---

## Sub-Tarefa 1 — Estrutura de Dados para Log de Notificações

**Status:** [ ] pending

**Intent:** Criar a coleção `notification_logs` no Firestore para registrar cada notificação enviada e evitar duplicatas. Também definir o documento de configuração `system_settings/notifications`.

**Expected Outcomes:**
- Coleção `notification_logs` documentada nas Firestore rules
- Regras de acesso: escrita apenas por service account (Cloud Functions), leitura por admin
- Documento `system_settings/notifications` com configuração padrão criada

**Todo List:**
1. Adicionar ao `firestore.rules` a regra para `notification_logs` (escrita somente server-side via Admin SDK, leitura por admin)
2. Adicionar ao `firestore.rules` a regra para escrita do `system_settings` (admin only)
3. Documentar o schema de `notification_logs` no arquivo de tipos TypeScript
4. Criar o documento inicial `system_settings/notifications` via script de seed ou manualmente no console Firebase

**Relevant Context:**
- `firestore.rules` — adicionar nova coleção
- `src/types/index.ts` — adicionar interface `NotificationLog`
- Schema do documento `notification_logs/{logId}`:
  ```
  {
    eventId: string,         // ID ou hash do evento na planilha
    eventTitle: string,
    eventDate: Timestamp,
    memberId: string,        // ID em people/members
    channel: 'whatsapp' | 'email',
    daysBefore: number,      // 1 ou 7
    sentAt: Timestamp,
    status: 'sent' | 'failed',
    error?: string
  }
  ```
- Schema de `system_settings/notifications`:
  ```
  {
    enabled: boolean,           // Liga/desliga toda automação
    reminderDaysBefore: [7, 1], // Quantos dias antes enviar
    whatsappEnabled: boolean,
    emailEnabled: boolean,
    emailSummaryDayOfWeek: 1,  // 1=segunda-feira
    emailSummaryRecipients: 'coordinators_only' | 'all_leaders',
    whatsappSendHour: 8        // Hora do envio (08:00 Brasília)
  }
  ```

---

## Sub-Tarefa 2 — Cloud Function: Leitura da Planilha Google Sheets

**Status:** [ ] pending

**Intent:** Criar um módulo `functions/src/notifications/sheets.reader.ts` que lê os eventos da planilha Google Sheets e retorna os eventos dos próximos N dias.

**Expected Outcomes:**
- Função `getUpcomingSheetEvents(daysAhead: number): Promise<SheetEvent[]>` exportada e testável
- Lê a aba `Eventos` da planilha via Google Sheets API v4 (REST, sem SDK pesado)
- Filtra apenas eventos futuros dentro da janela `daysAhead`
- Faz parse de data nos formatos `YYYY-MM-DD` e `DD/MM/YYYY` (igual ao frontend)

**Todo List:**
1. Criar `functions/src/notifications/sheets.reader.ts`
2. Usar a variável `SHEETS_ID` e `SHEETS_API_KEY` (já configuradas no `.env` das functions ou firebase config)
3. Implementar `getUpcomingSheetEvents(daysAhead)` — fetch à API REST do Google Sheets
4. Fazer parse de data respeitando os dois formatos aceitos pela planilha
5. Retornar array de `SheetEvent` com: id (hash da data+título), título, categoria, data, horário, local
6. Escrever teste unitário básico para o parser de datas

**Relevant Context:**
- `AGENDA_GOOGLE_SHEETS.md` — estrutura de colunas (título=A, categoria=B, data=C, horário=D, local=E, descrição=F, url_arte=G)
- `src/services/agenda.service.ts` — lógica de leitura e parse já existente no frontend (replicar no backend)
- Linha 4 da planilha = cabeçalhos, linha 5+ = dados

---

## Sub-Tarefa 3 — Cloud Function: Lógica de Lembrete WhatsApp

**Status:** [ ] pending

**Intent:** Criar a Cloud Function agendada `sendEventRemindersWhatsApp` que, toda manhã às 08h (Brasília), identifica eventos com 7 ou 1 dias de antecedência, filtra membros com consentimento, verifica duplicatas no log e envia via WhatsApp.

**Expected Outcomes:**
- Função Pub/Sub agendada (`onSchedule`) registrada em `functions/src/index.ts`
- Para cada evento elegível, envia mensagem personalizada a cada membro ativo com consentimento
- Registra cada envio em `notification_logs`
- Se não houver sessão WhatsApp ativa, registra erro no log e encerra sem travar

**Todo List:**
1. Criar `functions/src/notifications/reminders.whatsapp.ts`
2. Importar `getUpcomingSheetEvents` da Sub-Tarefa 2
3. Buscar membros `active` + `whatsappConsent.accepted === true` do Firestore
4. Para cada evento em exatamente 7 ou 1 dias (configurável via `system_settings/notifications`):
   a. Verificar se já existe `notification_logs` para `{eventId}_{memberId}_whatsapp_{daysBefore}`
   b. Se não existe: enviar mensagem, registrar no log
   c. Se existe: pular (já enviado)
5. Template de mensagem: `"Oi {nome}! 👋 Lembretes: *{título}* é {dia da semana}, {data formatada} às {horário} em {local}. Até lá! 🙏"`
6. Registrar a função como `onSchedule('every day 08:00', { timeZone: 'America/Sao_Paulo' })` em `functions/src/index.ts`
7. Verificar `system_settings/notifications.enabled` e `whatsappEnabled` antes de executar

**Relevant Context:**
- `functions/src/boanova/whatsapp.service.ts` — reutilizar cliente Baileys e lógica de sessão
- `functions/src/index.ts` — adicionar export da nova scheduled function
- Antecedência exata: verificar se `eventDate - today === N dias` (sem horas, apenas data)

---

## Sub-Tarefa 4 — Cloud Function: Resumo Semanal por Email para Coordenadores

**Status:** [ ] pending

**Intent:** Criar a Cloud Function agendada `sendWeeklyAgendaSummaryEmail` que, toda segunda-feira às 08h, envia um email com os eventos da semana para coordenadores e admins.

**Expected Outcomes:**
- Função Pub/Sub agendada (`onSchedule`) disparada toda segunda-feira
- Lista eventos dos próximos 7 dias consolidada em um único email
- Destinatários: usuários com `role: 'coordinator'` ou `role: 'admin'` que tenham `emailConsent.accepted === true` OU que tenham `email` cadastrado em `users` (para usuários do painel)
- Template HTML limpo com tabela de eventos da semana

**Todo List:**
1. Criar `functions/src/notifications/reminders.email.ts`
2. Buscar eventos dos próximos 7 dias via `getUpcomingSheetEvents(7)` + eventos do Firestore `events` (reuniões internas)
3. Buscar destinatários: coleção `users` com role `coordinator` ou `admin`
4. Usar Nodemailer (já configurado) para enviar email com template HTML da semana
5. Template: header com logo/nome do grupo + tabela com colunas data / horário / evento / local / categoria
6. Registrar em `notification_logs` com `channel: 'email'` e `daysBefore: 7`
7. Registrar a função como `onSchedule('every monday 08:00', { timeZone: 'America/Sao_Paulo' })` em `functions/src/index.ts`
8. Verificar `system_settings/notifications.enabled` e `emailEnabled` antes de executar

**Relevant Context:**
- `functions/src/boanova/email.service.ts` — reutilizar Nodemailer e template HTML existente
- Reuniões internas: coleção `meetings` no Firestore, filtrar por `date >= hoje` e `date <= hoje + 7 dias`
- Coordenadores sem `emailConsent` ainda recebem (são operadores do sistema, não participantes)

---

## Sub-Tarefa 5 — Painel de Controle de Notificações (UI)

**Status:** [ ] pending

**Intent:** Adicionar uma seção "Notificações Automáticas" no módulo Boa Nova do painel para que coordenadores e admins possam ligar/desligar a automação, configurar antecedências e visualizar o histórico de notificações enviadas.

**Expected Outcomes:**
- Nova aba "Automação" ou seção dentro de `src/pages/BoaNova/`
- Toggle para habilitar/desabilitar notificações automáticas
- Configuração das antecedências (checkboxes: 7 dias / 3 dias / 1 dia)
- Tabela de histórico: data do envio, evento, canal, total enviado, falhas
- Lê/escreve em `system_settings/notifications` (Firestore, apenas admin/coordinator)

**Todo List:**
1. Criar componente `src/pages/BoaNova/AutomationSettings.tsx`
2. Implementar `getNotificationSettings()` e `updateNotificationSettings()` em `src/services/boanova.service.ts`
3. Implementar `getNotificationLogs(limit: 50)` para listar o histórico
4. Adicionar nova aba no `src/pages/BoaNova/BoaNova.tsx` com o componente
5. Acesso: restrito a `coordinator` e `admin` (seguindo o padrão RBAC existente)

**Relevant Context:**
- `src/pages/BoaNova/BoaNova.tsx` — estrutura de abas existente
- `src/services/boanova.service.ts` — funções de serviço existentes
- `system_settings/notifications` — documento Firestore criado na Sub-Tarefa 1

---

## Diagrama de Fluxo Final

```
[Planilha Google Sheets] ──────────────────────────────────────┐
                                                                ↓
[Firebase Scheduler 08h toda manhã] → [scheduleEventRemindersWhatsApp]
                                          ↓
                                  [Busca system_settings]
                                  [Verifica habilitado?]
                                          ↓ sim
                                  [Lê eventos dos próximos 7 dias]
                                          ↓
                                  [Para cada evento em 7 ou 1 dia]
                                          ↓
                                  [Busca membros active + consent]
                                          ↓
                                  [Verifica notification_logs]
                                          ↓ não enviado ainda
                                  [Envia WhatsApp via Baileys]
                                  [Registra em notification_logs]

[Firebase Scheduler 08h toda segunda] → [sendWeeklyAgendaSummaryEmail]
                                          ↓
                                  [Busca eventos semana + reuniões]
                                  [Busca coordinators + admins]
                                          ↓
                                  [Envia email via Gmail SMTP]
                                  [Registra em notification_logs]
```

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Sessão WhatsApp expirada durante envio automático | Falha silenciosa | Registrar em `notification_logs` com `status: 'failed'` e enviar alerta por email para admin |
| Planilha com formato de data inválido | Evento ignorado | Validação robusta no parser; eventos inválidos logados sem travar execução |
| Membro sem número de celular cadastrado | Membro não notificado | Pular e registrar em log; não é erro crítico |
| Envio duplicado por falha no Firestore | Membro recebe 2x | Transação atômica ao verificar+inserir em `notification_logs` |
| Limite de 500 emails/dia Gmail | Coordenadores sem receber | Resumo semanal em batch único (1 email por destinatário) permanece bem abaixo do limite |
| Ban do WhatsApp por volume | Serviço interrompido | Delays entre mensagens (já implementado no Baileys); considerar WhatsApp Business API no futuro |

---

## Sobre SMS

SMS foi avaliado e está **fora do escopo** por:
1. Custo por mensagem (~R$0,08–0,15 via Twilio, Zenvia, AWS SNS)
2. Requer integração nova (nenhuma base existente no projeto)
3. Baixa adição de valor: o WhatsApp já cobre o mesmo público com custo zero
4. O grupo de jovens tem alta taxa de adoção de WhatsApp (contexto brasileiro)

Se no futuro o SMS for necessário (ex: membros sem smartphone), a recomendação é **Twilio** (REST API simples, plano pay-as-you-go).
