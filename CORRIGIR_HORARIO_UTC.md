# 🕐 Correção de Horário UTC → Brasília

## 📋 PROBLEMA

O Firestore salva timestamps em **UTC** (horário de Greenwich), mas o sistema precisa exibir no **horário de Brasília** (UTC-3).

**Exemplo:**
- Evento criado às **15:00 em Brasília**
- Firestore salva como **18:00 UTC**
- Sistema exibe **18:00** (errado!) ao invés de **15:00**

---

## ✅ SOLUÇÃO IMPLEMENTADA

Criei o arquivo `src/utils/dateUtils.ts` com funções para converter automaticamente:

### Funções Disponíveis:

```typescript
// 1. Formatar data e hora completa
formatFirestoreDate(timestamp)
// Resultado: "26/05/2026, 15:00"

// 2. Formatar apenas data
formatFirestoreDateOnly(timestamp)
// Resultado: "26/05/2026"

// 3. Formatar apenas hora
formatFirestoreTime(timestamp)
// Resultado: "15:00"

// 4. Formatar data relativa
formatRelativeDate(timestamp)
// Resultado: "Hoje às 15:00" ou "Amanhã às 10:00"

// 5. Formatar para cards (tempo decorrido)
formatCardDate(timestamp)
// Resultado: "5 min atrás" ou "2h atrás" ou "3 dias atrás"
```

---

## 🔧 COMO USAR

### Exemplo 1: Exibir data de criação

**Antes (errado):**
```tsx
<p>Criado em: {event.createdAt.toDate().toLocaleString()}</p>
```

**Depois (correto):**
```tsx
import { formatFirestoreDate } from '../utils/dateUtils';

<p>Criado em: {formatFirestoreDate(event.createdAt)}</p>
```

### Exemplo 2: Exibir data de evento

**Antes (errado):**
```tsx
<p>{event.date.toLocaleDateString()}</p>
```

**Depois (correto):**
```tsx
import { formatFirestoreDateOnly, formatFirestoreTime } from '../utils/dateUtils';

<p>
  {formatFirestoreDateOnly(event.date)} às {formatFirestoreTime(event.date)}
</p>
```

### Exemplo 3: Exibir "há X minutos"

```tsx
import { formatCardDate } from '../utils/dateUtils';

<p>Enviado {formatCardDate(broadcast.createdAt)}</p>
// Resultado: "Enviado 5 min atrás"
```

---

## 📝 ARQUIVOS QUE PRECISAM SER ATUALIZADOS

### 1. **src/pages/Calendar/Calendar.tsx**
Atualizar exibição de datas dos eventos:

```tsx
import { formatFirestoreDateOnly, formatFirestoreTime } from '../../utils/dateUtils';

// Onde exibe a data do evento:
<Typography>
  {formatFirestoreDateOnly(event.date)} às {formatFirestoreTime(event.date)}
</Typography>
```

### 2. **src/components/common/EventCard.tsx**
Atualizar card de eventos:

```tsx
import { formatFirestoreDate } from '../../utils/dateUtils';

<Typography variant="body2">
  {formatFirestoreDate(event.date)}
</Typography>
```

### 3. **src/pages/BoaNova/BoaNova.tsx**
Atualizar histórico de broadcasts:

```tsx
import { formatCardDate } from '../../utils/dateUtils';

<Typography variant="caption">
  {formatCardDate(broadcast.createdAt)}
</Typography>
```

### 4. **src/components/common/TransactionCard.tsx**
Atualizar transações financeiras:

```tsx
import { formatFirestoreDate } from '../../utils/dateUtils';

<Typography>
  {formatFirestoreDate(transaction.date)}
</Typography>
```

### 5. **src/components/common/MemberCard.tsx**
Atualizar data de cadastro:

```tsx
import { formatFirestoreDateOnly } from '../../utils/dateUtils';

<Typography variant="caption">
  Membro desde {formatFirestoreDateOnly(member.createdAt)}
</Typography>
```

---

## 🎯 DEPLOY

Após atualizar os componentes:

```bash
# 1. Build do frontend
npm run build

# 2. Deploy
firebase deploy --only hosting

# 3. Testar
# Acesse: https://gj-santaterezinha.web.app
# Verifique se as datas estão no horário de Brasília
```

---

## 💡 IMPORTANTE

### ✅ O que está CORRETO:

1. **Firestore salva em UTC** - Isso é correto e não deve ser mudado
2. **Backend usa UTC** - Firebase Functions trabalham em UTC
3. **Conversão no frontend** - Converte UTC → Brasília na exibição

### ❌ O que NÃO fazer:

1. **Não tente salvar em horário local** - Sempre salve em UTC
2. **Não converta no backend** - Deixe o backend em UTC
3. **Não use `new Date()` direto** - Use as funções do `dateUtils.ts`

---

## 🔍 EXEMPLO COMPLETO

### Antes (Problema):
```tsx
// EventCard.tsx
<Typography>
  Data: {event.date.toDate().toLocaleString()}
</Typography>
// Exibe: "26/05/2026, 18:00" (UTC - errado!)
```

### Depois (Solução):
```tsx
// EventCard.tsx
import { formatFirestoreDate } from '../../utils/dateUtils';

<Typography>
  Data: {formatFirestoreDate(event.date)}
</Typography>
// Exibe: "26/05/2026, 15:00" (Brasília - correto!)
```

---

## 📊 RESUMO

**Problema:** Datas em UTC ao invés de horário de Brasília
**Solução:** Utilitário `dateUtils.ts` com funções de conversão
**Ação:** Atualizar componentes para usar as novas funções
**Deploy:** Build + deploy do frontend

**Arquivo criado:** `src/utils/dateUtils.ts` (165 linhas)

---

**Última atualização:** 26/05/2026 15:29 BRT
**Status:** ✅ Utilitário criado, aguardando atualização dos componentes