import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJpqrqN2p2Oo3QNqKXZXZXZXZXZXZXZXZ",
  authDomain: "insigneeventos2026.firebaseapp.com",
  projectId: "insigneeventos2026",
  storageBucket: "insigneeventos2026.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupTasks() {
  try {
    // Buscar todas as tarefas que começam com "Contato:"
    const tasksQuery = query(
      collection(db, "tasks"),
      where("title", ">=", "Contato:"),
      where("title", "<", "Contato;")
    );

    const snapshot = await getDocs(tasksQuery);
    console.log(`Encontradas ${snapshot.docs.length} tarefas de contato`);

    // Agrupar por dealId para encontrar duplicatas
    const tasksByDeal = {};
    for (const doc of snapshot.docs) {
      const task = doc.data();
      const dealId = task.relatedTo?.id;
      
      if (!tasksByDeal[dealId]) {
        tasksByDeal[dealId] = [];
      }
      
      tasksByDeal[dealId].push({ id: doc.id, task });
    }

    // Deletar duplicatas, mantendo apenas uma por deal
    let deletedCount = 0;
    for (const dealId in tasksByDeal) {
      const tasks = tasksByDeal[dealId];
      
      if (tasks.length > 1) {
        console.log(`Deal ${dealId} tem ${tasks.length} tarefas, deletando ${tasks.length - 1}`);
        
        // Manter a tarefa mais recente (com scheduledContactId)
        const tasksWithId = tasks.filter(t => t.task.relatedTo?.scheduledContactId);
        const tasksWithoutId = tasks.filter(t => !t.task.relatedTo?.scheduledContactId);
        
        // Deletar todas as tarefas sem scheduledContactId
        for (const { id } of tasksWithoutId) {
          await deleteDoc(doc(db, "tasks", id));
          deletedCount++;
          console.log(`Deletada tarefa: ${id}`);
        }
        
        // Se ainda houver duplicatas com ID, manter apenas uma
        if (tasksWithId.length > 1) {
          for (let i = 1; i < tasksWithId.length; i++) {
            await deleteDoc(doc(db, "tasks", tasksWithId[i].id));
            deletedCount++;
            console.log(`Deletada tarefa duplicada: ${tasksWithId[i].id}`);
          }
        }
      }
    }

    console.log(`Total de tarefas deletadas: ${deletedCount}`);
  } catch (error) {
    console.error("Erro ao limpar tarefas:", error);
  }
}

cleanupTasks();
