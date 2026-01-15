import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";

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

async function cleanupOrphanTasks() {
  try {
    console.log("Iniciando limpeza de tarefas órfãs...\n");

    // Buscar todos os contatos agendados
    const scheduledContactsSnapshot = await getDocs(collection(db, "dealScheduledContacts"));
    const scheduledContactIds = new Set(
      scheduledContactsSnapshot.docs.map(doc => doc.id)
    );

    console.log(`Contatos agendados encontrados: ${scheduledContactIds.size}`);

    // Buscar todas as tarefas
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    console.log(`Total de tarefas: ${tasksSnapshot.docs.length}\n`);

    // Encontrar tarefas órfãs
    const orphanTasks = [];
    for (const taskDoc of tasksSnapshot.docs) {
      const task = taskDoc.data();
      const scheduledContactId = task.relatedTo?.scheduledContactId;

      // Se a tarefa tem um scheduledContactId que não existe mais, é órfã
      if (scheduledContactId && !scheduledContactIds.has(scheduledContactId)) {
        orphanTasks.push({ id: taskDoc.id, task });
      }
    }

    if (orphanTasks.length === 0) {
      console.log("Nenhuma tarefa órfã encontrada!");
      return;
    }

    console.log(`Tarefas órfãs encontradas: ${orphanTasks.length}\n`);

    // Exibir tarefas órfãs
    console.log("=== TAREFAS ÓRFÃS A SEREM DELETADAS ===\n");
    for (const { id, task } of orphanTasks) {
      console.log(`ID: ${id}`);
      console.log(`Título: ${task.title}`);
      console.log(`ScheduledContactId: ${task.relatedTo?.scheduledContactId}`);
      console.log(`Status: ${task.status}`);
      console.log();
    }

    // Deletar tarefas órfãs
    console.log("Deletando tarefas órfãs...\n");
    const batch = writeBatch(db);
    for (const { id } of orphanTasks) {
      batch.delete(doc(db, "tasks", id));
    }
    await batch.commit();

    console.log(`✓ ${orphanTasks.length} tarefas órfãs deletadas com sucesso!`);
  } catch (error) {
    console.error("Erro ao limpar tarefas órfãs:", error);
  }
}

cleanupOrphanTasks();
