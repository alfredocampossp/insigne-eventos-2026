import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Hook que sincroniza contatos agendados (dealScheduledContacts) com tarefas (tasks)
 * Quando um contato é agendado, uma tarefa é criada automaticamente (se não existir)
 * Quando um contato é deletado, a tarefa associada também é deletada
 * Quando uma tarefa é deletada, o contato agendado também é deletado
 */
export function useScheduledContactsSync() {
  const processedContactsRef = useRef<Set<string>>(new Set());
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listener para contatos agendados
    const q = query(collection(db, "dealScheduledContacts"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Processar apenas mudanças, não o snapshot completo
        const changes = snapshot.docChanges();
        
        for (const change of changes) {
          const scheduledContact = change.doc.data() as any;
          const scheduledContactId = change.doc.id;

          // Evitar processar o mesmo contato múltiplas vezes
          if (processedContactsRef.current.has(scheduledContactId) && change.type === "added") {
            console.log("Contato agendado já foi processado:", scheduledContactId);
            continue;
          }

          if (change.type === "added") {
            try {
              // Verificar se já existe uma tarefa para este dealScheduledContact
              const existingTasksQuery = query(
                collection(db, "tasks"),
                where("relatedTo.scheduledContactId", "==", scheduledContactId)
              );

              const existingTasks = await getDocs(existingTasksQuery);

              if (existingTasks.empty) {
                // Tarefa não existe, criar nova
                const taskRef = await addDoc(collection(db, "tasks"), {
                  title: `Contato: ${scheduledContact.subject}`,
                  description: `Contato com ${scheduledContact.contactName} - ${scheduledContact.type === "phone" ? "Chamada" : scheduledContact.type === "email" ? "E-mail" : "Reunião"}${scheduledContact.notes ? `\n\nNotas: ${scheduledContact.notes}` : ""}`,
                  dueDate: scheduledContact.scheduledFor,
                  priority: "high",
                  status: "todo",
                  relatedTo: {
                    type: "deal",
                    id: scheduledContact.dealId,
                    name: scheduledContact.subject,
                    scheduledContactId: scheduledContactId, // ID único para evitar duplicatas
                  },
                  createdAt: Timestamp.now(),
                  updatedAt: Timestamp.now(),
                });

                // Marcar como processado
                processedContactsRef.current.add(scheduledContactId);
                console.log("Tarefa criada para contato agendado:", scheduledContactId, taskRef.id);
              } else {
                // Tarefa já existe, marcar como processado
                processedContactsRef.current.add(scheduledContactId);
                console.log("Tarefa já existe para contato agendado:", scheduledContactId);
              }
            } catch (error) {
              console.error("Erro ao criar tarefa para contato agendado:", error);
            }
          }

          if (change.type === "modified") {
            // Quando um contato agendado é modificado, atualizar a tarefa associada
            try {
              const tasksQuery = query(
                collection(db, "tasks"),
                where("relatedTo.scheduledContactId", "==", scheduledContactId)
              );

              const tasksSnapshot = await getDocs(tasksQuery);

              for (const taskDoc of tasksSnapshot.docs) {
                await updateDoc(doc(db, "tasks", taskDoc.id), {
                  title: `Contato: ${scheduledContact.subject}`,
                  description: `Contato com ${scheduledContact.contactName} - ${scheduledContact.type === "phone" ? "Chamada" : scheduledContact.type === "email" ? "E-mail" : "Reunião"}${scheduledContact.notes ? `\n\nNotas: ${scheduledContact.notes}` : ""}`,
                  dueDate: scheduledContact.scheduledFor,
                  updatedAt: Timestamp.now(),
                });

                console.log("Tarefa atualizada:", taskDoc.id);
              }
            } catch (error) {
              console.error("Erro ao atualizar tarefa:", error);
            }
          }

          if (change.type === "removed") {
            // Quando um contato agendado é deletado, deletar a tarefa associada
            try {
              // Buscar a tarefa associada
              const tasksQuery = query(
                collection(db, "tasks"),
                where("relatedTo.scheduledContactId", "==", scheduledContactId)
              );

              const tasksSnapshot = await getDocs(tasksQuery);

              // Deletar tarefas que correspondem ao contato agendado
              const batch = writeBatch(db);
              for (const taskDoc of tasksSnapshot.docs) {
                batch.delete(doc(db, "tasks", taskDoc.id));
              }
              await batch.commit();

              // Remover do conjunto de processados
              processedContactsRef.current.delete(scheduledContactId);
              console.log("Tarefa(s) deletada(s) para contato agendado:", scheduledContactId);
            } catch (error) {
              console.error("Erro ao deletar tarefa associada:", error);
            }
          }
        }
      },
      (error) => {
        console.error("Erro ao sincronizar contatos agendados:", error);
      }
    );

    // Limpeza periódica de tarefas órfãs (a cada 5 minutos)
    cleanupIntervalRef.current = setInterval(async () => {
      try {
        // Buscar todos os contatos agendados
        const scheduledContactsSnapshot = await getDocs(collection(db, "dealScheduledContacts"));
        const scheduledContactIds = new Set(
          scheduledContactsSnapshot.docs.map(doc => doc.id)
        );

        // Buscar todas as tarefas de contato
        const tasksSnapshot = await getDocs(collection(db, "tasks"));
        
        // Encontrar e deletar tarefas órfãs
        const batch = writeBatch(db);
        let orphanCount = 0;

        for (const taskDoc of tasksSnapshot.docs) {
          const task = taskDoc.data();
          const scheduledContactId = task.relatedTo?.scheduledContactId;

          // Se a tarefa tem um scheduledContactId que não existe mais, é órfã
          if (scheduledContactId && !scheduledContactIds.has(scheduledContactId)) {
            console.log("Deletando tarefa órfã:", taskDoc.id, "ScheduledContactId:", scheduledContactId);
            batch.delete(doc(db, "tasks", taskDoc.id));
            orphanCount++;
          }
        }

        if (orphanCount > 0) {
          await batch.commit();
          console.log(`Limpeza de tarefas órfãs: ${orphanCount} tarefas deletadas`);
        }
      } catch (error) {
        console.error("Erro ao limpar tarefas órfãs:", error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      unsubscribe();
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);
}
