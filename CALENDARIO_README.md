# 📅 Sistema de Calendário - Grupo de Jovens Santa Terezinha

## Visão Geral

Sistema completo de calendário para gerenciar eventos e encontros do Grupo de Jovens da Paróquia Santa Terezinha. Implementado com React, TypeScript, Material-UI e react-big-calendar.

## ✨ Funcionalidades Implementadas

### 1. **Visualizações do Calendário**
- ✅ **Mês** - Visualização mensal completa (padrão)
- ✅ **Semana** - Visualização semanal detalhada
- ✅ **Dia** - Visualização diária
- ✅ **Agenda** - Lista de eventos

### 2. **Gestão de Eventos**
- ✅ Criar novos eventos
- ✅ Editar eventos existentes
- ✅ Excluir eventos (com confirmação)
- ✅ Visualizar detalhes completos do evento
- ✅ Identificação automática do tipo de sábado

### 3. **Tipos de Sábado**
O sistema reconhece 4 tipos de sábados mensais, cada um com cor específica:

| Tipo | Cor | Descrição |
|------|-----|-----------|
| 1º Sábado | 🟣 Roxo (#9c27b0) | Oração e Espiritualidade |
| 2º Sábado | 🟠 Laranja (#ff9800) | Grande Evento/Convivência |
| 3º Sábado | 🔵 Azul (#2196f3) | Formação I - Doutrinário |
| 4º Sábado | 🟢 Verde (#4caf50) | Formação II - Aprofundamento |

### 4. **Filtros e Controles**
- ✅ Filtrar eventos por tipo de sábado (checkboxes)
- ✅ Botão "Hoje" para voltar ao mês atual
- ✅ Navegação anterior/próximo mês
- ✅ Seletor de visualização
- ✅ Alternar todos os filtros de uma vez

### 5. **Modais Interativos**

#### Modal de Detalhes
- Título e descrição completa
- Data e horário formatados
- Local do evento
- Tipo de sábado (badge colorido)
- Participantes confirmados
- Botões: Editar, Excluir, Fechar

#### Modal de Formulário
- Título (obrigatório)
- Descrição
- Data (obrigatório, não permite passado)
- Horário início/fim (padrão: 18h-21h15)
- Local (padrão: "Paróquia Santa Terezinha")
- Tipo de sábado (sugestão automática)
- Marcar como evento especial
- Observações
- Validações completas

### 6. **Validações**
- ✅ Não permite criar eventos no passado
- ✅ Valida horários (início < fim)
- ✅ Valida campos obrigatórios
- ✅ Feedback visual de erros

### 7. **Notificações**
- ✅ Snackbar de sucesso ao criar evento
- ✅ Snackbar de sucesso ao editar evento
- ✅ Snackbar de sucesso ao excluir evento
- ✅ Confirmação antes de excluir

### 8. **Responsividade**
- ✅ Layout adaptável para mobile e desktop
- ✅ Modais full-screen em mobile
- ✅ Filtros colapsáveis em telas pequenas
- ✅ Touch-friendly para dispositivos móveis

### 9. **Localização**
- ✅ Calendário em português (pt-BR)
- ✅ Datas formatadas no padrão brasileiro
- ✅ Nomes dos dias e meses em português

## 📁 Estrutura de Arquivos

```
gj-santa-terezinha/
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── CalendarView.tsx          # Componente principal do calendário
│   │       ├── EventDetailsModal.tsx     # Modal de detalhes do evento
│   │       ├── EventFormModal.tsx        # Modal de formulário
│   │       └── index.ts                  # Exports
│   ├── hooks/
│   │   └── useCalendar.ts                # Hook customizado para lógica do calendário
│   ├── pages/
│   │   └── Calendar/
│   │       ├── Calendar.tsx              # Página principal do calendário
│   │       └── index.ts
│   ├── utils/
│   │   ├── calendarUtils.ts              # Funções utilitárias
│   │   └── mockData.ts                   # Dados mockados
│   └── types/
│       └── index.ts                      # Tipos TypeScript
```

## 🚀 Como Usar

### Acessar o Calendário
1. Navegue para a rota `/calendar` no sistema
2. O calendário será exibido com os eventos mockados

### Criar um Evento
1. Clique no botão "Novo Evento" no canto superior direito
2. Preencha o formulário com as informações do evento
3. O tipo de sábado será sugerido automaticamente baseado na data
4. Clique em "Criar Evento"

### Editar um Evento
1. Clique no evento no calendário
2. No modal de detalhes, clique em "Editar"
3. Modifique as informações desejadas
4. Clique em "Salvar Alterações"

### Excluir um Evento
1. Clique no evento no calendário
2. No modal de detalhes, clique em "Excluir"
3. Confirme a exclusão

### Filtrar Eventos
1. Use os checkboxes na sidebar esquerda
2. Marque/desmarque os tipos de sábado desejados
3. Use o botão "Todos/Limpar" para alternar rapidamente

### Navegar no Calendário
- Use os botões "Anterior" e "Próximo" na toolbar
- Clique em "Hoje" para voltar ao mês atual
- Selecione a visualização desejada (Mês/Semana/Dia/Agenda)

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Componentes de UI
- **react-big-calendar** - Biblioteca de calendário
- **date-fns** - Manipulação de datas
- **Vite** - Build tool

## 📦 Dependências Instaladas

```json
{
  "dependencies": {
    "react-big-calendar": "^1.x.x",
    "date-fns": "^3.x.x"
  },
  "devDependencies": {
    "@types/react-big-calendar": "^1.x.x"
  }
}
```

## 🎨 Customizações de Estilo

O calendário foi customizado com:
- Cores específicas para cada tipo de sábado
- Bordas arredondadas
- Sombras suaves
- Hover effects
- Responsividade completa
- Tema consistente com o Material-UI

## 🔧 Funções Utilitárias

### `getSaturdayTypeFromDate(date: Date)`
Identifica automaticamente o tipo de sábado (1º, 2º, 3º ou 4º) baseado na data.

### `getSaturdayTypeInfo(type: SaturdayType)`
Retorna informações sobre o tipo de sábado (cor, label, descrição).

### `getSaturdaysInMonth(year: number, month: number)`
Retorna todos os sábados de um mês específico.

### `isSaturday(date: Date)`
Verifica se uma data é sábado.

### `getNextSaturday(date?: Date)`
Retorna o próximo sábado a partir de uma data.

### `isEndTimeAfterStartTime(startTime: string, endTime: string)`
Valida se o horário de término é posterior ao horário de início.

## 📊 Estado do Calendário (useCalendar Hook)

O hook `useCalendar` gerencia todo o estado e lógica do calendário:

```typescript
const {
  events,              // Eventos filtrados
  allEvents,           // Todos os eventos
  selectedEvent,       // Evento selecionado
  isDetailsModalOpen,  // Estado do modal de detalhes
  isFormModalOpen,     // Estado do modal de formulário
  editingEvent,        // Evento sendo editado
  filters,             // Filtros ativos
  view,                // Visualização atual
  currentDate,         // Data atual do calendário
  // ... funções de manipulação
} = useCalendar();
```

## 🎯 Próximos Passos (Futuras Implementações)

- [ ] Integração com Google Calendar
- [ ] Backend/Firebase real
- [ ] Sincronização de dados
- [ ] Notificações push
- [ ] Exportar eventos para PDF
- [ ] Importar eventos de arquivo
- [ ] Recorrência de eventos
- [ ] Lembretes automáticos
- [ ] Integração com lista de presença

## 📝 Notas Importantes

1. **Dados Mockados**: Atualmente o sistema usa dados mockados em `mockData.ts`. As operações CRUD são simuladas no estado local.

2. **Persistência**: As mudanças não são persistidas após recarregar a página. Será necessário integrar com backend.

3. **Horário Padrão**: O horário padrão dos encontros é 18h-21h15, mas pode ser alterado no formulário.

4. **Validações**: O sistema não permite criar eventos no passado e valida todos os campos obrigatórios.

5. **Responsividade**: Em mobile, os filtros ficam colapsáveis e os modais ocupam a tela inteira.

## 🐛 Troubleshooting

### Calendário não aparece
- Verifique se as dependências foram instaladas: `npm install`
- Verifique se não há erros no console do navegador

### Eventos não aparecem
- Verifique se os filtros estão ativos
- Verifique se a data dos eventos está no período visível

### Erros de TypeScript
- Execute `npm run build` para verificar erros de compilação
- Verifique se todos os tipos estão corretamente importados

## 👨‍💻 Desenvolvido por

Bob - Assistente de IA especializado em desenvolvimento

---

**Versão**: 1.0.0  
**Data**: Maio 2026  
**Status**: ✅ Completo e Funcional