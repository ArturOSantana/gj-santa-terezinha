# Changelog - Sistema GJ Santa Terezinha

## [2.0.0] - 2026-05-19

### ✨ Novas Funcionalidades

#### Página de Contribuições/PIX
- Nova página dedicada para doações via PIX
- Chave PIX estática configurável
- Valores sugeridos (R$ 10, R$ 20, R$ 50, R$ 100)
- Botão para copiar chave PIX
- Instruções claras para doação

#### Novo Sistema de Categorias de Eventos
Substituído o sistema fixo de "1º/2º/3º/4º Sábado" por categorias flexíveis:
- **Sábado**: Encontros regulares aos sábados
- **Solenidade**: Celebrações litúrgicas importantes
- **Dia de Santo**: Festividades de santos
- **Aniversário**: Aniversários de membros
- **Evento Paroquial**: Eventos da paróquia
- **Novena**: Novenas e orações especiais

### 🔧 Melhorias

#### Sistema de Permissões Atualizado
- **Admin**: Acesso total ao sistema
- **Coordenador**: Gerencia eventos, finanças e membros (exceto outros admins)
- **Membro**: Apenas visualização de dados

#### Interface do Usuário
- Título atualizado: "GJ Santa Terezinha - Sistema de Gestão"
- Meta tags em português brasileiro
- Cores das categorias de eventos mais vibrantes
- Melhor organização visual dos filtros no calendário

### 🗑️ Funcionalidades Removidas

#### Sistema de Presença
- Removido componente `AttendanceDialog`
- Removidos campos `attendees`, `attendance` e `isSpecialEvent` dos eventos
- Removidos tipos `AttendanceStatus` e `AttendanceStats`
- Simplificação do modelo de dados

### 🔄 Mudanças Técnicas

#### Tipos e Interfaces
- Removido: `SaturdayType` enum
- Removido: `AttendanceStatus` enum
- Removido: `AttendanceStats` interface
- Adicionado: `EventCategory` enum com 6 categorias
- Atualizado: Interface `Event` usa `category` ao invés de `saturdayType`

#### Componentes Atualizados
- `EventCard.tsx`: Usa novo sistema de categorias
- `EventDetailsModal.tsx`: Removida seção de participantes
- `EventFormModal.tsx`: Dropdown de categorias ao invés de tipos de sábado
- `CalendarView.tsx`: Cores baseadas em categorias
- `Calendar.tsx`: Filtros atualizados para 6 categorias

#### Hooks Atualizados
- `useCalendar.ts`: Filtros por categoria
- `useDashboard.ts`: Removida lógica de presença
- `useMembers.ts`: Funções de presença desabilitadas

#### Constantes
- Adicionado: `EVENT_CATEGORIES` com cores e labels
- Adicionado: `EVENT_CATEGORY_OPTIONS` para formulários

### 📝 Documentação

#### Novos Guias
- `GOOGLE_CALENDAR_SETUP.md`: Integração com Google Calendar
- `FIREBASE_API_KEY_FIX.md`: Solução para erro de API Key

### 🐛 Correções
- Corrigidos todos os erros TypeScript relacionados a tipos removidos
- Build em produção funcionando corretamente
- Hot Module Replacement (HMR) funcionando no desenvolvimento

### 📦 Build
- Build otimizado: 1.75 MB (521 KB gzipped)
- Tempo de build: ~1.3s
- Sem erros de compilação

### ⚠️ Breaking Changes
- Eventos existentes precisam ser migrados para o novo sistema de categorias
- Campo `saturdayType` substituído por `category`
- Campos `attendees`, `attendance` e `isSpecialEvent` removidos
- Sistema de presença completamente removido

### 🔜 Próximos Passos
- Aguardando lista de aniversários dos membros
- Otimização de carregamento e performance
- Possível integração com Google Calendar
- Code splitting para reduzir tamanho do bundle

---

## Como Atualizar

### Para Desenvolvedores
```bash
# Atualizar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Deploy no Vercel
vercel --prod
```

### Para Usuários
1. O sistema foi atualizado automaticamente
2. Eventos antigos podem precisar ter suas categorias ajustadas
3. A funcionalidade de presença não está mais disponível
4. Nova página de Contribuições disponível no menu

### Configuração Necessária
1. Verificar arquivo `.env` com credenciais Firebase corretas
2. Seguir guia `FIREBASE_API_KEY_FIX.md` se houver erro de API Key
3. Configurar chave PIX em `src/pages/Contributions/Contributions.tsx`

---

**Versão Anterior**: 1.0.0  
**Data de Lançamento**: 2026-05-19  
**Desenvolvedor**: Bob (AI Assistant)