# Terezinha OS (V2) — Plano de Arquitetura e Implementação Incremental

## 1. Visão Geral e Princípios Fundamentais

O **Terezinha OS** é a central de organização e operação da liderança do Grupo de Jovens Santa Terezinha.

- **WhatsApp** = Canal de comunicação e distribuição.
- **Google Calendar** = Fonte oficial dos dados de agenda (datas, horários, locais, títulos e recorrências).
- **Google Forms/Sheets & Sistema Externo** = Origem das inscrições dos jovens.
- **Terezinha OS** = Orquestrador da liderança (tarefas, equipes, escalas, caixa/comprovantes, atas, presença, inscrições normalizadas e visão pastoral).

---

## 2. Decisões de Arquitetura, Modelagem e Segurança Refinadas

### 2.1 Autenticação e RBAC Estrito (Fail-Closed)
- **Sem Auto-Provisionamento:** Um login bem-sucedido no Firebase Auth **não** cria automaticamente um documento em `users/{uid}`. Se o documento não existir, o acesso ao painel é sumariamente bloqueado (`ACESSO NEGADO`).
- **Sem Contas Hardcoded:** Eliminação total de exceções para e-mails hardcoded (ex: `admin@gj.com`).
- **Níveis de Acesso (`Role`):**
  1. `admin` (Coordenação Geral, Pároco, SysAdmin)
  2. `coordinator` (Liderança de equipes e módulos)
  3. `leader` (Servidores com visão operacional restrita de escalas/tarefas)
- *Nota:* O participante/jovem é registrado na coleção `people`, sem credencial ou role de sistema.

### 2.2 Modelagem Canônica de Eventos e Datas
- **Timestamps Canônicos:** `startAt: Timestamp`, `endAt: Timestamp`, `timezone: "America/Sao_Paulo"` (evitando problemas de fuso, strings soltas de horário e ordenação).
- **Visibilidade Unificada:** `visibility: 'public' | 'leadership' | 'private'` (tanto em eventos quanto em documentos).
- **Desacoplamento de Documentos:** `checklist` e `teams` deixam de ser arrays embutidos dentro de `events`. As entidades canônicas `tasks` e `schedule_assignments` utilizam `eventId` para o relacionamento, evitando documentos inchados.
- **Campos de Sincronização:**
  - `googleCalendarId`: ID do calendário (ex: `c_xxx@group.calendar.google.com`)
  - `googleEventId`: ID do evento dentro do calendário
  - `googleSyncStatus`: `'synced' | 'pending' | 'conflict' | 'error' | 'disconnected'`
  - `googleLastSyncedAt`, `googleLastModifiedAt`

### 2.3 Desduplicação de Campos e Normalização
- Referências canônicas por IDs (`assignedToId`, `personId`, `eventId`).
- `people` armazena dados biográficos perenes (Nome, Telefone, Nascimento, Responsáveis, Contato de Emergência).
- `event_registrations` armazena dados específicos do evento (Status, Valor pago, Respostas específicas, Status da inscrição: `'pending' | 'confirmed' | 'cancelled' | 'waitlist' | 'completed'`).
- **Deduplicação em Camadas:** `externalId` -> `phone` -> `email` -> revisão manual.

### 2.4 Proteção de Dados de Menores e LGPD
- Consentimentos explícitos em `people`: `privacyConsent?: boolean` e `guardianConsent?: boolean`.
- Campos sensíveis (`guardianName`, `guardianPhone`, `emergencyContact`, `birthDate`) com acesso restrito a papéis autorizados no Firestore Rules e nunca expostos na área pública.

### 2.5 Tokens Públicos Seguros para Escalas
- Em `schedule_assignments`, o token de acesso rápido sem login via WhatsApp é gerado criptograficamente com hash (`publicTokenHash`) e prazo de expiração (`expiresAt`).

### 2.6 Financeiro com Precisão Monetária
- Uso de inteiros para centavos: `amountCents: number` (ex: R$ 120,50 vira `12050`), eliminando erros de arredondamento de ponto flutuante.
- Vínculo opcional `eventId` em `financial_transactions` para cálculo automático de saldo e prestação de contas por evento.

### 2.7 Auditoria e Integrações Externas
- `audit_logs`: Rastreamento de ações administrativas críticas (alterações de valores, exclusões de despesas, mudanças de permissões).
- `external_integrations`: Configuração desacoplada de fontes externas (Google Calendar, Google Sheets, APIs de terceiros).

---

## 3. Modelo de Entidades do Firestore (V2)

```text
users/{userId}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── role: 'admin' | 'coordinator' | 'leader'
  ├── personId?: string
  ├── active: boolean
  └── createdAt, updatedAt, lastLogin

people/{personId}
  ├── id: string
  ├── name: string
  ├── phone?: string
  ├── email?: string
  ├── birthDate?: Timestamp
  ├── gender?: 'male' | 'female'
  ├── status: 'active' | 'new' | 'away' | 'alumni'
  ├── rolesInGroup: string[]
  ├── parish?: string
  ├── guardianName?: string
  ├── guardianPhone?: string
  ├── emergencyContact?: { name: string, phone: string, relationship: string }
  ├── privacyConsent?: boolean
  ├── guardianConsent?: boolean
  ├── userId?: string
  └── createdAt, updatedAt

events/{eventId}
  ├── id: string
  ├── title: string
  ├── description?: string
  ├── themeVerse?: string
  ├── startAt: Timestamp
  ├── endAt: Timestamp
  ├── timezone: string (ex: 'America/Sao_Paulo')
  ├── location: string
  ├── category: 'formation' | 'mass' | 'meeting' | 'retreat' | 'outing' | 'schedule' | 'other'
  ├── responsibleId?: string
  ├── maxParticipants?: number
  ├── priceCents?: number
  ├── visibility: 'public' | 'leadership' | 'private'
  ├── publicSlug?: string
  ├── status: 'planning' | 'confirmed' | 'completed' | 'cancelled'
  ├── googleCalendarId?: string
  ├── googleEventId?: string
  ├── googleSyncStatus: 'synced' | 'pending' | 'conflict' | 'error' | 'disconnected'
  ├── googleLastSyncedAt?: Timestamp
  ├── googleLastModifiedAt?: Timestamp
  ├── integrationId?: string
  └── createdAt, updatedAt

event_registrations/{registrationId}
  ├── id: string
  ├── eventId: string
  ├── personId?: string
  ├── externalId?: string
  ├── source: 'google_forms' | 'external_system' | 'public_page' | 'manual'
  ├── status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist' | 'completed'
  ├── paymentStatus: 'paid' | 'pending' | 'partial' | 'waived'
  ├── amountPaidCents: number
  ├── totalAmountCents: number
  ├── eventSpecificAnswers?: Record<string, any>
  ├── registeredAt: Timestamp
  └── updatedAt: Timestamp

financial_transactions/{transactionId}
  ├── id: string
  ├── type: 'income' | 'expense'
  ├── category: 'monthly_fee' | 'donation' | 'fundraising' | 'formation' | 'retreat' | 'material' | 'food' | 'transport' | 'other'
  ├── amountCents: number
  ├── description: string
  ├── date: Timestamp
  ├── personId?: string
  ├── eventId?: string
  ├── paymentMethod?: string
  ├── receiptUrl?: string
  ├── hasReceipt: boolean
  └── createdAt, updatedAt

tasks/{taskId}
  ├── id: string
  ├── title: string
  ├── description?: string
  ├── assignedToId?: string
  ├── eventId?: string
  ├── dueDate: Timestamp
  ├── priority: 'low' | 'medium' | 'high' | 'urgent'
  ├── status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  └── createdAt, updatedAt

schedule_assignments/{scheduleId}
  ├── id: string
  ├── eventId: string
  ├── role: string
  ├── personId: string
  ├── status: 'confirmed' | 'pending' | 'declined'
  ├── publicTokenHash?: string
  ├── expiresAt?: Timestamp
  └── updatedAt: Timestamp

attendance_records/{attendanceId}
  ├── id: string
  ├── eventId: string
  ├── personId?: string
  ├── registrationId?: string
  ├── checkedInAt: Timestamp
  ├── method: 'qr_code' | 'manual' | 'self_checkin'
  └── personNameSnapshot?: string

meetings/{meetingId}
  ├── id: string
  ├── title: string
  ├── date: Timestamp
  ├── location?: string
  ├── attendeesIds: string[]
  ├── agenda: Array<{ id: string, title: string }>
  ├── decisions: Array<{ id: string, text: string }>
  └── createdAt: Timestamp

documents/{documentId}
  ├── id: string
  ├── title: string
  ├── category: 'Retiro' | 'Financeiro' | 'Coordenação' | 'Formação' | 'Outros'
  ├── fileType: 'pdf' | 'xlsx' | 'docx' | 'link' | 'image'
  ├── url: string
  ├── size?: string
  ├── eventId?: string
  ├── visibility: 'private' | 'leadership' | 'event_members' | 'public'
  ├── uploadedByUserId: string
  └── createdAt: Timestamp

external_integrations/{integrationId}
  ├── id: string
  ├── provider: 'google_calendar' | 'google_sheets' | 'external_system'
  ├── name: string
  ├── config: Record<string, any>
  ├── active: boolean
  ├── lastSyncedAt?: Timestamp
  └── createdAt, updatedAt

audit_logs/{logId}
  ├── id: string
  ├── actorUserId: string
  ├── actorName: string
  ├── action: 'create' | 'update' | 'delete' | 'sync' | 'permission_change'
  ├── resource: string
  ├── resourceId: string
  ├── before?: Record<string, any>
  ├── after?: Record<string, any>
  └── timestamp: Timestamp

sync_logs/{logId}
  ├── id: string
  ├── provider: 'google_calendar' | 'google_sheets' | 'external_system'
  ├── eventId?: string
  ├── status: 'success' | 'error' | 'warning'
  ├── recordsProcessed: number
  ├── message: string
  └── timestamp: Timestamp
```

---

## 4. Subtarefas e Roadmap de Execução Incremental

### Subtarefa 1: Fundação de Segurança, Firestore Rules e Autenticação RBAC Estrita (Foco Atual)
- **Intenção:** Estabelecer o fluxo de autenticação fail-closed onde somente usuários previamente criados em `users/{uid}` têm acesso ao painel, eliminar permissividade e fallbacks hardcoded (`admin@gj.com`), e configurar `firestore.rules` com RBAC e auditoria.
- **Resultados Esperados:**
  - `src/contexts/AuthContext.tsx` e `src/services/auth.service.ts` refatorados: login valida existência prévia em `users/{uid}`; sem auto-criação.
  - `src/utils/permissions.ts` alinhado à hierarquia oficial (`admin: 3`, `coordinator: 2`, `leader: 1`).
  - `firestore.rules` declarativo protegendo coleções administrativas com leitura/escrita condicional baseada em `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`.
  - Serviço de `audit_logs` inicial para registrar alterações administrativas.
- **Status:** `[ ] pending`

### Subtarefa 2: Persistência Real do Core de Pessoas (`people`) e Usuários (`users`)
- **Intenção:** Migrar a gestão de jovens e credenciais administrativas para coleções reais do Firestore, desacoplando `people` de `users` e garantindo a proteção LGPD para menores.
- **Resultados Esperados:**
  - `TerezinhaService` com CRUD real em `people` e `users`.
  - Telas `PeoplePage` e gestão de usuários atualizadas.
- **Status:** `[ ] pending`

### Subtarefa 3: Módulo de Eventos 360° e Sincronização Google Calendar
- **Intenção:** Implementar o schema canônico de eventos com timestamps (`startAt`/`endAt`), visibilidade e sincronização bidirecional robusta (`googleCalendarId`, `googleEventId`, `googleSyncStatus`).
- **Resultados Esperados:**
  - Persistência real de eventos no Firestore e Cloud Functions com Service Account seguras.
- **Status:** `[ ] pending`

### Subtarefa 4: Adapters de Inscrições com Cópia Local Normalizada (`event_registrations`)
- **Intenção:** Normalização e persistência local de inscrições externas (Google Sheets e API externa) com deduplicação em camadas e status de inscrição.
- **Resultados Esperados:**
  - Inscrições normalizadas com cálculo de vagas, confirmados e pendentes mesmo offline.
- **Status:** `[ ] pending`

### Subtarefa 5: Persistência dos Módulos Operacionais da Liderança
- **Intenção:** Persistir no Firestore: Tarefas, Escalas (com hash de tokens públicos seguros), Presenças (QR Code vinculado a evento), Atas de Reuniões e Documentos com controle de `visibility`.
- **Resultados Esperados:**
  - CRUD persistido para todos os módulos e dashboard com agregação dinâmica.
- **Status:** `[ ] pending`

### Subtarefa 6: Caixa, Tesouraria e Prestação de Contas por Evento
- **Intenção:** Persistir transações financeiras em centavos (`amountCents`) com vínculo a `eventId`, upload de comprovantes no Firebase Storage e fechamento mensal.
- **Resultados Esperados:**
  - Extrato do caixa preciso e prestação de contas consolidada.
- **Status:** `[ ] pending`
