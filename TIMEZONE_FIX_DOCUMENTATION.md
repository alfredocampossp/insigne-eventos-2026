# Documentação: Correção de Fuso Horário e Sincronização de Tarefas

## Problema Identificado

### 1. Data sendo salva incorretamente (05/01 em vez de 06/01)
- **Causa**: Problema de fuso horário ao converter a data do input HTML para Timestamp do Firebase
- **Sintoma**: Ao agendar um contato para 06/01/2026, era salvo como 05/01/2026

### 2. Tarefas não apareciam no calendário
- **Causa**: Hook de sincronização não estava ativo e tarefas criadas não eram carregadas
- **Sintoma**: Contatos agendados não geravam tarefas visíveis no calendário do Dashboard

## Soluções Implementadas

### 1. Correção de Fuso Horário (ScheduleContactForm.tsx)

**Problema Original:**
```javascript
const scheduledDate = new Date(formData.date); // Cria em UTC
scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0); // Interpreta como local
```

**Solução:**
```javascript
// Parsear a data no formato YYYY-MM-DD
const [year, month, day] = formData.date.split("-");
const [hours, minutes] = formData.time.split(":");

// Criar data em horário local (não UTC)
const scheduledDate = new Date(
  parseInt(year),
  parseInt(month) - 1, // Mês é 0-indexed
  parseInt(day),
  parseInt(hours),
  parseInt(minutes),
  0,
  0
);

// Converter para Timestamp do Firebase
const timestamp = Timestamp.fromDate(scheduledDate);
```

**Benefício**: Data agora é criada corretamente no horário local e convertida para Timestamp sem perda de precisão.

### 2. Ativação do Hook de Sincronização (App.tsx)

**Implementação:**
```javascript
// Criar AppContent que ativa o hook
function AppContent() {
  useScheduledContactsSync();
  return <Router />;
}

// Usar AppContent no App
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

**Benefício**: Hook agora está ativo globalmente e sincroniza contatos agendados com tarefas automaticamente.

### 3. Hook de Sincronização (useScheduledContactsSync.ts)

**Funcionalidade:**
- Monitora mudanças em `dealScheduledContacts`
- Quando um contato é agendado (added), cria uma tarefa automaticamente
- Quando um contato é deletado (removed), deleta a tarefa associada
- Usa `getDocs` para queries assíncronas corretas

**Exemplo de Tarefa Criada:**
```javascript
{
  title: "Contato: Cobrar retorno",
  description: "Contato com LUCIANO (SUPERVISOR) - Chamada\n\nNotas: Cobrar retorno",
  dueDate: Timestamp.fromDate(scheduledDate),
  priority: "high",
  status: "todo",
  relatedTo: {
    type: "deal",
    id: dealId,
    name: "Cobrar retorno"
  }
}
```

### 4. Correção do useTasks (useTasks.ts)

**Problema Original:**
```javascript
let q = query(collection(db, "tasks"), orderBy("dueDate", "asc"));
if (filter?.status) {
  q = query(q, where("status", "==", filter.status)); // Erro: não pode reatribuir query
}
```

**Solução:**
```javascript
const constraints: QueryConstraint[] = [orderBy("dueDate", "asc")];

if (filter?.status) {
  constraints.push(where("status", "==", filter.status));
}

if (filter?.priority) {
  constraints.push(where("priority", "==", filter.priority));
}

const q = query(collection(db, "tasks"), ...constraints);
```

**Benefício**: Query agora funciona corretamente com múltiplos constraints.

## Fluxo Completo Agora Funciona

### 1. Usuário Agenda um Contato
```
Modal de Negócios → Aba "Agenda" → "Agendar Próximo Contato"
↓
Preenche: Contato, Tipo, Assunto, Data (06/01/2026), Hora (11:00)
↓
Clica "Agendar Contato"
```

### 2. Dados são Salvos Corretamente
```
ScheduleContactForm converte data para horário local
↓
Timestamp.fromDate() converte para Firebase Timestamp
↓
Salva em dealScheduledContacts com data CORRETA (06/01/2026)
```

### 3. Tarefa é Criada Automaticamente
```
useScheduledContactsSync detecta novo dealScheduledContact
↓
Cria tarefa em "tasks" collection
↓
Tarefa tem dueDate = 06/01/2026
```

### 4. Tarefa Aparece no Calendário
```
Home.tsx carrega tarefas com useTasks()
↓
TaskCalendar agrupa tarefas por data
↓
Tarefa aparece no dia 06/01/2026 no calendário
```

## Testes Realizados

✅ **Teste 1: Agendar para data futura**
- Agendar contato para 06/01/2026
- Verificar que salva como 06/01/2026 (não 05/01)
- Verificar que tarefa aparece no calendário

✅ **Teste 2: Sincronização automática**
- Agendar contato
- Ir para Dashboard
- Verificar que tarefa aparece no calendário

✅ **Teste 3: Persistência após refresh**
- Agendar contato
- Atualizar página (F5)
- Verificar que contato ainda está agendado
- Verificar que tarefa ainda aparece no calendário

✅ **Teste 4: Múltiplos contatos**
- Agendar vários contatos para datas diferentes
- Verificar que todas as tarefas aparecem no calendário correto

## Arquivos Modificados

1. **ScheduleContactForm.tsx**
   - Corrigida conversão de data para horário local
   - Adicionado logging para debug
   - Adicionado toast de sucesso

2. **App.tsx**
   - Importado useScheduledContactsSync
   - Criado AppContent que ativa o hook
   - Hook agora está ativo globalmente

3. **useScheduledContactsSync.ts**
   - Criado novo hook para sincronização
   - Monitora dealScheduledContacts
   - Cria/deleta tarefas automaticamente

4. **useTasks.ts**
   - Corrigida construção de query com múltiplos constraints
   - Adicionado suporte a filter.priority
   - Melhorado tratamento de erros

## Regras de Segurança do Firestore

Certifique-se de que as seguintes regras estão configuradas:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Próximos Passos (Opcional)

1. **Melhorias de Performance**
   - Implementar índices no Firestore para queries de tarefas
   - Adicionar paginação ao calendário

2. **Funcionalidades Adicionais**
   - Notificações quando uma tarefa está próxima
   - Sincronização com calendários externos (Google Calendar, Outlook)
   - Recorrência de tarefas

3. **Testes Automatizados**
   - Adicionar testes unitários para ScheduleContactForm
   - Adicionar testes de integração para sincronização

## Conclusão

O sistema agora funciona corretamente:
- ✅ Datas são salvas no fuso horário correto
- ✅ Tarefas são criadas automaticamente
- ✅ Tarefas aparecem no calendário
- ✅ Dados persistem após refresh
- ✅ Sincronização é automática e confiável
