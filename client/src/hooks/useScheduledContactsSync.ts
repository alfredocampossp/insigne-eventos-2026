import { useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Hook que sincroniza contatos agendados (dealScheduledContacts) com tarefas (tasks)
 * Quando um contato é agendado, uma tarefa é criada automaticamente
 * Quando um contato é deletado, a tarefa associada também é deletada
 */
export function useScheduledContactsSync() {
  useEffect(() => {
    // Listener para contatos agendados
    const q = query(collection(db, "dealScheduledContacts"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          const scheduledContact = change.doc.data() as any;

          if (change.type === "added") {
            // Quando um contato é agendado, criar uma tarefa
            try {
              await addDoc(collection(db, "tasks"), {
                title: `Contato: ${scheduledContact.subject}`,
                description: `Contato com ${scheduledContact.contactName} - ${scheduledContact.type === "phone" ? "Chamada" : scheduledContact.type === "email" ? "E-mail" : "Reunião"}${scheduledContact.notes ? `\n\nNotas: ${scheduledContact.notes}` : ""}`,
                dueDate: scheduledContact.scheduledFor,
                priority: "high",
                status: "todo",
                relatedTo: {
                  type: "deal",
                  id: scheduledContact.dealId,
                  name: scheduledContact.subject,
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });

              console.log("Tarefa criada para contato agendado:", scheduledContact.subject);
            } catch (error) {
              console.error("Erro ao criar tarefa para contato agendado:", error);
            }
          }

          if (change.type === "removed") {
            // Quando um contato agendado é deletado, deletar a tarefa associada
            try {
              // Buscar a tarefa associada
              const tasksQuery = query(
                collection(db, "tasks"),
                where("relatedTo.id", "==", scheduledContact.dealId)
              );

              const tasksSnapshot = await getDocs(tasksQuery);

              // Deletar tarefas que correspondem ao contato agendado
              for (const taskDoc of tasksSnapshot.docs) {
                const task = taskDoc.data();
                if (
                  task.title.includes(scheduledContact.subject) &&
                  task.relatedTo?.id === scheduledContact.dealId
                ) {
                  await deleteDoc(doc(db, "tasks", taskDoc.id));
                  console.log("Tarefa deletada:", taskDoc.id);
                }
              }
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

    return () => unsubscribe();
  }, []);
}
