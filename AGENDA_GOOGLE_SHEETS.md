# Configuração da Agenda dos Jovens

A agenda usa duas fontes de dados do Google, ambas lidas com a mesma chave de API:

| Dado | Fonte |
|---|---|
| **Eventos / atividades** | Google Sheets (aba `Eventos`) |
| **Aniversariantes** | Google Calendar |
| **Avisos** | Firestore (gerenciado pelo admin do app) |

---

## 1. Planilha de Eventos (Google Sheets)

### Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha.
2. Renomeie a aba padrão para **`Eventos`**.

### Estrutura da aba `Eventos`:

| Linha | Conteúdo |
|---|---|
| 1 | Título visual do calendário (mesclada) |
| 2 | Subtítulo / instrução |
| 3 | Linha em branco |
| 4 | Cabeçalhos das colunas |
| **5 em diante** | **Dados dos eventos** |

### Cabeçalhos (linha 4):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| título | categoria | data | horário | local | descrição | url_arte |

**Regras:**
- `título` e `data` são obrigatórios. As demais colunas são opcionais.
- `categoria`: use exatamente uma das opções: `paroquia`, `jovens`, `crisma`, `tlc`, `outros`
- `data`: aceita `YYYY-MM-DD` (ex: `2025-08-15`) ou `DD/MM/YYYY` (ex: `15/08/2025`)
- `horário`: formato `HH:MM` (ex: `19:30`)
- `url_arte`: URL direta de uma imagem (ex: link público do Drive, Imgur, etc.)

**Exemplo de linha:**
```
Encontro de Jovens | jovens | 15/08/2025 | 19:30 | Igreja Matriz | Venha participar! | https://...
```

### Publicar a planilha (necessário para leitura pública)

1. No menu superior: **Arquivo → Compartilhar → Publicar na web**
2. Publique como **Planilha inteira** no formato **Página da web**
3. Clique em **Publicar** e confirme

> A planilha continua editável normalmente — apenas a *leitura* fica pública.

### Obter o ID da planilha

A URL da planilha tem o formato:
```
https://docs.google.com/spreadsheets/d/ESTE_E_O_ID/edit
```

Copie o trecho entre `/d/` e `/edit` — esse é o `VITE_SHEETS_ID`.

---

## 2. Calendário de Aniversariantes (Google Calendar)

O app lê **o calendário que você já usa** para os aniversários dos jovens.
Nenhuma planilha adicional é necessária.

### Requisito: calendário acessível via chave de API

O calendário precisa estar configurado como **público** (ou compartilhado para leitura sem autenticação).

Para tornar um calendário público:
1. Abra [calendar.google.com](https://calendar.google.com)
2. Nas configurações do calendário → **Permissões de acesso**
3. Marque **"Disponibilizar ao público"** → confirme

### Obter o ID do calendário

1. Nas configurações do calendário → role até **"Integrar calendário"**
2. Copie o **"Endereço do calendário"** — formato: `abc123@group.calendar.google.com` ou `seu@gmail.com`
3. Esse é o `VITE_GOOGLE_CALENDAR_ID`

### Formato dos eventos de aniversário

O app aceita dois formatos:
- **Evento recorrente anual** *(recomendado)*: crie um evento no dia do aniversário e configure para repetir todo ano. O app desduplicará automaticamente — cada pessoa aparece uma vez.
- **Evento único** com a data do aniversário.

O **título do evento é o nome da pessoa** que aparece no app.

---

## 3. Chave de API do Google Cloud (única para ambas as fontes)

Uma única chave de API serve para Sheets e Calendar.

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto (ou use um existente)
3. Ative as duas APIs:
   - **Biblioteca → "Google Sheets API" → Ativar**
   - **Biblioteca → "Google Calendar API" → Ativar**
4. Crie a chave: **APIs e Serviços → Credenciais → Criar credenciais → Chave de API**
5. **Restrinja a chave** (importante para segurança):
   - Em "Restrições de aplicativo": selecione **Sites HTTP** e adicione o domínio do app (ex: `https://seusite.com/*`)
   - Em "Restrições de API": selecione **Google Sheets API** e **Google Calendar API**
6. Copie a chave gerada — esse é o `VITE_SHEETS_API_KEY`

---

## 4. Configurar no projeto

Copie o arquivo `.env.example` para `.env.local` e preencha:

```env
VITE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
VITE_SHEETS_API_KEY=AIzaSyD-EXEMPLO-SUA-CHAVE-AQUI
VITE_GOOGLE_CALENDAR_ID=abc123xyz@group.calendar.google.com
```

> **Nunca commite o arquivo `.env.local`** — ele já está no `.gitignore`.

---

## 5. Como a coordenação atualiza

| O que atualizar | Onde |
|---|---|
| Adicionar/editar eventos e atividades | Edita a planilha do Google Sheets |
| Adicionar/remover aniversariante | Adiciona/apaga evento no Google Calendar |
| Publicar um aviso urgente | Painel admin do app (login necessário) |

O app faz um cache de **5 minutos**. Para forçar atualização imediata, basta recarregar a página.

---

## Resumo da arquitetura

```
Google Sheets (aba Eventos)
        ↓ (Sheets API — leitura pública com chave)
    App React → exibe atividades e eventos

Google Calendar (calendário de aniversariantes)
        ↓ (Calendar API — leitura pública com chave)
    App React → exibe aniversariantes do mês

Firestore (Firebase)
        ↓ (tempo real — somente leitura para todos)
    App React → exibe avisos

Admin do grupo (login Firebase)
        ↓ (escrita restrita — somente admin/coordinator)
   Firestore → adiciona/apaga avisos com vencimento automático
```
