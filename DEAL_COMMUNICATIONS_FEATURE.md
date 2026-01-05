# Funcionalidade de Comunicações e Histórico de Negócios

## Visão Geral

A expansão do modal de Novos Negócios agora oferece uma **visão 360° completa** de cada negociação, permitindo que você acompanhe todos os aspectos da comunicação com o cliente em um único lugar.

## Recursos Implementados

### 1. **Histórico de Contatos (Aba: Histórico)**

Registre e visualize todos os contatos realizados com clientes:

- **Tipos de Contato**: Chamada Telefônica, E-mail, Reunião, Mensagem
- **Informações Registradas**:
  - Contato responsável
  - Tipo de comunicação
  - Assunto/Tema
  - Notas detalhadas
  - Duração (para chamadas telefônicas)
  - Data e hora do contato

**Recursos**:
- Histórico ordenado cronologicamente (mais recente primeiro)
- Visualização rápida com ícones por tipo de contato
- Exclusão de registros quando necessário
- Cores diferentes para cada tipo de comunicação

### 2. **Agendamento de Próximos Contatos (Aba: Agenda)**

Planeje e acompanhe os próximos passos da negociação:

- **Informações de Agendamento**:
  - Contato a ser contatado
  - Tipo de contato (Chamada, E-mail, Reunião)
  - Assunto da comunicação
  - Data e hora agendadas
  - Notas preparatórias

**Recursos**:
- Separação entre contatos pendentes e histórico
- Marcar contatos como concluídos
- Visualização clara de próximas ações
- Cancelamento de agendamentos

### 3. **Gerenciamento de Contatos da Empresa (Aba: Contatos)**

Acesso rápido para gerenciar todos os contatos da empresa:

- **Operações Disponíveis**:
  - ➕ Adicionar novo contato
  - ✏️ Editar contatos existentes
  - 🗑️ Excluir contatos
  - ⭐ Marcar como contato principal

**Informações de Contato**:
- Nome completo
- E-mail
- Telefone
- Cargo/Função
- Status de contato principal

### 4. **Visualização de Propostas (Aba: Propostas)**

Acompanhe todas as propostas associadas ao negócio:

- **Informações Exibidas**:
  - Versão da proposta
  - Status (Rascunho, Enviada, Aceita, Rejeitada)
  - Valores (Subtotal, Impostos, Total)
  - Data de validade
  - Notas adicionais
  - Quantidade de itens

**Recursos**:
- Indicação de propostas expiradas
- Visualização de detalhes
- Download de PDF
- Histórico de versões

## Estrutura de Dados

### Coleções Firestore Criadas

#### `dealContactLogs`
```typescript
{
  id: string;
  dealId: string;
  contactId: string;
  contactName: string;
  type: "phone" | "email" | "meeting" | "message";
  subject?: string;
  notes: string;
  duration?: number; // em minutos
  timestamp: Timestamp;
  createdAt: Timestamp;
}
```

#### `dealScheduledContacts`
```typescript
{
  id: string;
  dealId: string;
  contactId: string;
  contactName: string;
  scheduledFor: Timestamp;
  type: "phone" | "email" | "meeting";
  subject: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Componentes Criados

### Hooks

- **`useDealCommunications(dealId)`**: Gerencia todo o ciclo de vida das comunicações
  - Carrega histórico de contatos
  - Carrega contatos agendados
  - Fornece métodos para adicionar, atualizar e deletar registros

### Componentes React

1. **`ContactLogForm`**: Formulário para registrar novo contato
2. **`ContactHistoryTimeline`**: Exibição do histórico em timeline
3. **`ScheduleContactForm`**: Formulário para agendar contatos
4. **`ScheduledContactsList`**: Lista de contatos agendados
5. **`CompanyContactsManager`**: Gerenciador de contatos da empresa
6. **`DealProposalsSection`**: Seção de propostas do negócio

## Como Usar

### Registrar um Contato

1. Abra um negócio existente ou crie um novo
2. Vá para a aba **"Histórico"**
3. Clique em **"Registrar Novo Contato"**
4. Preencha:
   - Contato (obrigatório)
   - Tipo de contato
   - Assunto
   - Notas (obrigatório)
   - Duração (se for chamada)
5. Clique em **"Registrar Contato"**

### Agendar Próximo Contato

1. Abra um negócio existente
2. Vá para a aba **"Agenda"**
3. Clique em **"Agendar Próximo Contato"**
4. Preencha:
   - Contato (obrigatório)
   - Tipo de contato
   - Assunto (obrigatório)
   - Data (obrigatório)
   - Hora (obrigatório)
   - Notas (opcional)
5. Clique em **"Agendar Contato"**

### Gerenciar Contatos da Empresa

1. Abra um negócio
2. Vá para a aba **"Contatos"**
3. Clique em **"Novo Contato"** para adicionar
4. Preencha os dados do contato
5. Marque como "Contato Principal" se necessário
6. Clique em **"Adicionar"**

### Visualizar Propostas

1. Abra um negócio existente
2. Vá para a aba **"Propostas"**
3. Visualize todas as propostas associadas
4. Clique em **"Ver"** para detalhes
5. Clique em **"PDF"** para download

## Fluxo de Trabalho Recomendado

1. **Criar Negócio**: Preencha informações básicas na aba "Info"
2. **Preparar Contatos**: Vá para "Contatos" e adicione/edite contatos da empresa
3. **Registrar Comunicações**: Use "Histórico" para documentar todas as interações
4. **Planejar Próximos Passos**: Use "Agenda" para agendar follow-ups
5. **Acompanhar Propostas**: Consulte "Propostas" para status de ofertas

## Regras de Negócio

- ✅ Contatos devem ser selecionados **obrigatoriamente** antes de registrar comunicações
- ✅ Apenas contatos da empresa selecionada aparecem nas listas
- ✅ Histórico é ordenado do **mais recente para o mais antigo**
- ✅ Agendamentos futuros aparecem na seção "Próximos Contatos"
- ✅ Agendamentos passados ou concluídos aparecem no "Histórico de Agendamentos"
- ✅ Propostas expiradas são indicadas visualmente

## Regras de Segurança Firestore

As seguintes regras foram configuradas para proteger os dados:

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

**Nota**: Apenas usuários autenticados podem ler e escrever dados.

## Próximas Melhorias Sugeridas

1. **Notificações**: Alertas para contatos agendados próximos
2. **Integração de E-mail**: Enviar e-mails diretamente do sistema
3. **Integração de Telefone**: Registrar chamadas automaticamente
4. **Análise de Comunicações**: Relatórios sobre frequência de contatos
5. **Modelos de Mensagens**: Templates para comunicações padrão
6. **Histórico de Versões**: Acompanhar mudanças em propostas
7. **Tarefas Relacionadas**: Vincular tarefas a comunicações

## Troubleshooting

### Problema: Contatos não aparecem na lista
**Solução**: Certifique-se de que:
- A empresa foi selecionada
- Os contatos estão associados à empresa correta
- Você tem permissão para visualizar os contatos

### Problema: Não consigo registrar um contato
**Solução**: Verifique se:
- O negócio foi salvo (não é um novo negócio não salvo)
- Um contato foi selecionado
- As notas foram preenchidas

### Problema: Agendamentos não aparecem
**Solução**: Verifique se:
- O negócio foi salvo
- A data/hora foi preenchida corretamente
- O contato foi selecionado

## Suporte

Para reportar problemas ou sugerir melhorias, abra uma issue no repositório GitHub do projeto.
