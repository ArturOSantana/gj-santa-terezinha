# Problemas no Firebase Hosting - Soluções

## Problemas Identificados

### 1. API do Google Calendar (Erro de JSON)
**Erro:** `SyntaxError: JSON.parse: unexpected character at line 1 column 1`

**Causa:** A API está configurada para Vercel (`/api/google-calendar.ts`), mas você está no Firebase Hosting.

**Solução:** Migrar API para Firebase Functions

### 2. Boa Nova (Erro CORS 403)
**Erro:** `CORS header 'Access-Control-Allow-Origin' missing. Status code: 403`

**Causa:** Você está no Spark Plan (gratuito) que NÃO permite usar Firebase Functions.

**Solução:** Migrar para Blaze Plan

---

## Solução 1: API do Google Calendar

### Opção A: Migrar para Firebase Functions (Recomendado)

Criar uma Firebase Function para substituir a API do Vercel:

```typescript
// functions/src/index.ts
export const googleCalendar = functions.https.onRequest(async (req, res) => {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  // Lógica da API do Google Calendar
  // ...
});
```

**Vantagens:**
- Integração nativa com Firebase
- Sem problemas de CORS
- Mesma infraestrutura

**Desvantagens:**
- Requer Blaze Plan
- Precisa reescrever o código

### Opção B: Manter no Vercel (Mais Simples)

Manter a API no Vercel e apenas o frontend no Firebase:

**Configuração:**

1. **Deploy da API no Vercel:**
```bash
# A API já está em /api/google-calendar.ts
# Vercel detecta automaticamente
vercel --prod
```

2. **Atualizar URL no Frontend:**
```typescript
// src/services/googleCalendar.service.ts
const API_BASE_URL = 'https://gjsantaterezinha.vercel.app/api';
```

3. **Rebuild e Redeploy:**
```bash
npm run build
firebase deploy --only hosting
```

**Vantagens:**
- Não precisa reescrever código
- Funciona imediatamente
- Não precisa Blaze Plan para a API

**Desvantagens:**
- Duas plataformas (Firebase + Vercel)
- Possíveis problemas de CORS

### Opção C: Desabilitar Google Calendar (Temporário)

Se não estiver usando o Google Calendar, pode desabilitar:

```typescript
// src/services/googleCalendar.service.ts
export const googleCalendarService = {
  async getEvents() {
    // Retornar array vazio
    return [];
  },
  // ... outros métodos retornam vazio
};
```

---

## Solução 2: Boa Nova (Functions)

### Problema: Spark Plan não permite Functions

**Você PRECISA migrar para Blaze Plan para usar o Boa Nova.**

### Como Migrar para Blaze Plan:

#### Passo 1: Acessar Console
```
https://console.firebase.google.com/project/gj-santaterezinha/usage
```

#### Passo 2: Modificar Plano
1. Clicar em "Modificar plano"
2. Selecionar "Blaze (Pague conforme o uso)"
3. Clicar em "Continuar"

#### Passo 3: Adicionar Cartão
1. Adicionar cartão de crédito
2. Aceitar termos

#### Passo 4: Configurar Limite
1. Ir em "Orçamento e alertas"
2. Criar orçamento:
   - Nome: "GJ Santa Terezinha"
   - Valor: R$ 10,00/mês
3. Configurar alerta em R$ 5,00

#### Passo 5: Testar
```
1. Acessar https://gj-santaterezinha.web.app
2. Login como admin/coordenador
3. Ir para "Boa Nova"
4. Clicar em "Verificar Serviço"
5. Deve funcionar sem erro CORS
```

---

## Recomendação Final

### Solução Imediata (Hoje):

**1. Google Calendar:**
- **Opção B:** Manter API no Vercel
- Atualizar `API_BASE_URL` para `https://gjsantaterezinha.vercel.app/api`
- Rebuild e redeploy

**2. Boa Nova:**
- **Migrar para Blaze Plan** (necessário)
- Configurar limite de R$ 10,00
- Custo real: R$ 0,00/mês (dentro dos limites gratuitos)

### Solução Ideal (Futuro):

**1. Migrar tudo para Firebase:**
- Converter API do Google Calendar para Firebase Function
- Tudo em uma única plataforma
- Sem problemas de CORS

**2. Manter Blaze Plan:**
- Custo: R$ 0,00/mês
- Monitorar mensalmente

---

## Comandos Rápidos

### Atualizar API do Google Calendar (Opção B):

```bash
# 1. Editar arquivo
nano src/services/googleCalendar.service.ts

# 2. Mudar linha 3 para:
# const API_BASE_URL = 'https://gjsantaterezinha.vercel.app/api';

# 3. Build
npm run build

# 4. Deploy
firebase deploy --only hosting

# 5. Testar
open https://gj-santaterezinha.web.app
```

### Verificar se Vercel está rodando:

```bash
# Testar API diretamente
curl https://gjsantaterezinha.vercel.app/api/google-calendar
```

---

## Custos

### Com Blaze Plan:

| Serviço | Uso Mensal | Custo |
|---------|------------|-------|
| Hosting | 1 GB | R$ 0,00 |
| Firestore | 5.000 ops/dia | R$ 0,00 |
| Functions | 1.000 invocações | R$ 0,00 |
| **TOTAL** | - | **R$ 0,00** |

### Sem Blaze Plan (Spark):

| Serviço | Status |
|---------|--------|
| Hosting | ✅ Funciona |
| Firestore | ✅ Funciona |
| Functions | ❌ NÃO funciona |
| Boa Nova | ❌ NÃO funciona |

---

## Resumo

**Problema 1: Google Calendar**
- Causa: API configurada para Vercel
- Solução: Atualizar URL para `https://gjsantaterezinha.vercel.app/api`

**Problema 2: Boa Nova**
- Causa: Spark Plan não permite Functions
- Solução: Migrar para Blaze Plan (R$ 0,00/mês)

**Ação Imediata:**
1. Atualizar URL da API do Google Calendar
2. Migrar para Blaze Plan
3. Testar Boa Nova

**Tempo estimado:** 15 minutos
**Custo:** R$ 0,00/mês