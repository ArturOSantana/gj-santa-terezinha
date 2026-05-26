# Custos do Firebase - GJ Santa Terezinha

## Resposta Rápida

**Firebase Hosting vai me cobrar algo?**

**NÃO!** O Firebase tem um plano gratuito (Spark Plan) muito generoso que é mais do que suficiente para o GJ Santa Terezinha.

## Planos do Firebase

### 1. Spark Plan (GRATUITO)

**O que você está usando agora:**

#### Hosting (Frontend)
- 10 GB de armazenamento
- 360 MB/dia de transferência (~10 GB/mês)
- SSL grátis
- CDN global grátis

**Estimativa GJ:** ~50 MB de site, ~1 GB/mês de tráfego
**Custo:** R$ 0,00

#### Firestore (Banco de Dados)
- 1 GB de armazenamento
- 50.000 leituras/dia
- 20.000 escritas/dia
- 20.000 exclusões/dia

**Estimativa GJ:** ~100 MB de dados, ~5.000 operações/dia
**Custo:** R$ 0,00

#### Authentication
- Usuários ilimitados
- Grátis para sempre

**Custo:** R$ 0,00

#### Storage (Imagens)
- 5 GB de armazenamento
- 1 GB/dia de transferência

**Estimativa GJ:** ~500 MB de imagens, ~100 MB/dia
**Custo:** R$ 0,00

### 2. Blaze Plan (PAY-AS-YOU-GO)

**Você PRECISA deste plano para usar Functions (Boa Nova)**

#### O que muda:
- Tudo do Spark Plan continua GRÁTIS
- Você só paga pelo que usar ACIMA dos limites gratuitos
- Functions têm seus próprios limites gratuitos

#### Functions (Backend - Boa Nova)
**Limites GRATUITOS por mês:**
- 2 milhões de invocações
- 400.000 GB-segundos de computação
- 200.000 GHz-segundos de CPU
- 5 GB de tráfego de saída

**Estimativa GJ Santa Terezinha:**
- ~100 broadcasts/mês
- ~1.000 invocações/mês
- Bem abaixo dos limites

**Custo estimado:** R$ 0,00 - R$ 2,50/mês

## Estimativa de Custos Mensal

### Cenário Realista (GJ Santa Terezinha)

| Serviço | Uso Estimado | Limite Gratuito | Custo |
|---------|--------------|-----------------|-------|
| **Hosting** | 1 GB/mês | 10 GB/mês | R$ 0,00 |
| **Firestore** | 5.000 ops/dia | 50.000 leituras/dia | R$ 0,00 |
| **Storage** | 500 MB | 5 GB | R$ 0,00 |
| **Authentication** | 50 usuários | Ilimitado | R$ 0,00 |
| **Functions** | 1.000 invocações | 2 milhões | R$ 0,00 |
| **TOTAL** | - | - | **R$ 0,00** |

### Cenário Intenso (Uso Pesado)

| Serviço | Uso Estimado | Custo |
|---------|--------------|-------|
| **Hosting** | 5 GB/mês | R$ 0,00 (dentro do limite) |
| **Firestore** | 30.000 ops/dia | R$ 0,00 (dentro do limite) |
| **Storage** | 2 GB | R$ 0,00 (dentro do limite) |
| **Functions** | 5.000 invocações | R$ 0,00 (dentro do limite) |
| **TOTAL** | - | **R$ 0,00 - R$ 5,00** |

## Quando Você Pagaria?

Você só pagaria se:

1. **Hosting:** Mais de 10 GB/mês de tráfego
   - Equivale a ~300 visitas/dia com site pesado
   - GJ: ~50 visitas/dia = R$ 0,00

2. **Firestore:** Mais de 50.000 leituras/dia
   - Equivale a ~1.500 usuários ativos/dia
   - GJ: ~50 usuários/dia = R$ 0,00

3. **Functions:** Mais de 2 milhões de invocações/mês
   - Equivale a ~2.000 broadcasts/dia
   - GJ: ~3 broadcasts/dia = R$ 0,00

4. **Storage:** Mais de 5 GB de imagens
   - Equivale a ~5.000 fotos
   - GJ: ~100 fotos = R$ 0,00

## Como Configurar Limite de Gastos

Para ter certeza absoluta de não ser cobrado:

### 1. Configurar Alerta de Gastos

```bash
# Acessar console do Firebase
open https://console.firebase.google.com/project/gj-santaterezinha/usage

# Configurar alerta em:
# Configurações → Uso e faturamento → Definir alerta
# Valor: R$ 5,00
```

### 2. Configurar Limite Máximo (Budget)

1. Acessar: https://console.cloud.google.com/billing
2. Ir em "Budgets & alerts"
3. Criar orçamento:
   - Nome: "GJ Santa Terezinha"
   - Valor: R$ 10,00/mês
   - Ação: Enviar email + Desativar faturamento

### 3. Monitorar Uso

```bash
# Ver uso atual
firebase projects:list

# Ver métricas
open https://console.firebase.google.com/project/gj-santaterezinha/usage
```

## Comparação com Outras Plataformas

| Plataforma | Custo Mensal | Observações |
|------------|--------------|-------------|
| **Firebase** | R$ 0,00 | Plano gratuito generoso |
| **Vercel** | R$ 0,00 | Mas tem problema de CORS |
| **Heroku** | R$ 35,00 | Sem plano gratuito |
| **AWS** | R$ 15-50 | Complexo de configurar |
| **DigitalOcean** | R$ 25,00 | Requer manutenção |

## Vantagens do Firebase

1. **Plano Gratuito Generoso**
   - Suficiente para 99% dos projetos pequenos
   - GJ Santa Terezinha nunca vai ultrapassar

2. **Escalabilidade Automática**
   - Se crescer, escala automaticamente
   - Você só paga pelo que usar

3. **Sem Manutenção**
   - Google cuida de tudo
   - Sem servidor para gerenciar

4. **Integração Perfeita**
   - Hosting + Functions + Firestore
   - Sem problemas de CORS

5. **SSL Grátis**
   - HTTPS automático
   - Certificado renovado automaticamente

## Quando Migrar para Blaze Plan?

**Você PRECISA migrar para usar o Boa Nova (Functions)**

### Como Migrar:

1. Acessar: https://console.firebase.google.com/project/gj-santaterezinha/usage
2. Clicar em "Modificar plano"
3. Selecionar "Blaze (Pague conforme o uso)"
4. Adicionar cartão de crédito
5. Configurar limite de R$ 10,00

**Importante:**
- Você NÃO será cobrado se ficar dentro dos limites gratuitos
- O cartão é apenas para segurança
- Configure alertas para R$ 5,00

## Resumo Final

### Para o GJ Santa Terezinha:

**Custo Mensal Esperado:** R$ 0,00

**Motivos:**
- Poucos usuários (~50)
- Poucos broadcasts (~100/mês)
- Pouco tráfego (~1 GB/mês)
- Tudo dentro dos limites gratuitos

**Recomendação:**
1. Migrar para Blaze Plan (necessário para Functions)
2. Configurar limite de R$ 10,00
3. Configurar alerta de R$ 5,00
4. Monitorar mensalmente

**Risco de Cobrança:** Praticamente ZERO

**Pior Cenário:** R$ 5,00/mês (se ultrapassar todos os limites)

**Cenário Realista:** R$ 0,00/mês

---

**Conclusão:** Firebase Hosting é GRATUITO e vai continuar sendo para o GJ Santa Terezinha. Você só precisa do Blaze Plan para usar Functions (Boa Nova), mas mesmo assim o custo será R$ 0,00 na maioria dos meses.