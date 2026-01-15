import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

async function checkOrphanTasks() {
  try {
    // Buscar todas as tarefas
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    console.log(`\nTotal de tarefas: ${tasksSnapshot.docs.length}\n`);

    // Buscar todos os contatos agendados
    const scheduledContactsSnapshot = await getDocs(collection(db, "dealScheduledContacts"));
    console.log(`Total de contatos agendados: ${scheduledContactsSnapshot.docs.length}\n`);

    // Criar mapa de scheduledContactIds
    const scheduledContactIds = new Set();
    for (const doc of scheduledContactsSnapshot.docs) {
      scheduledContactIds.add(doc.id);
    }

    // Encontrar tarefas órfãs (com scheduledContactId que não existe)
    console.log("=== TAREFAS ÓRFÃS ===\n");
    let orphanCount = 0;
    for (const taskDoc of tasksSnapshot.docs) {
      const task = taskDoc.data();
      const scheduledContactId = task.relatedTo?.scheduledContactId;

      if (scheduledContactId && !scheduledContactIds.has(scheduledContactId)) {
        orphanCount++;
        console.log(`Tarefa órfã encontrada:`);
        console.log(`  ID: ${taskDoc.id}`);
        console.log(`  Título: ${task.title}`);
        console.log(`  ScheduledContactId: ${scheduledContactId}`);
        console.log(`  Status: ${task.status}`);
        console.log(`  DueDate: ${task.dueDate?.toDate?.() || task.dueDate}`);
        console.log();
      }
    }

    console.log(`Total de tarefas órfãs: ${orphanCount}\n`);

    // Encontrar tarefas de contato sem scheduledContactId
    console.log("=== TAREFAS DE CONTATO SEM SCHEDULEDCONTACTID ===\n");
    let noIdCount = 0;
    for (const taskDoc of tasksSnapshot.docs) {
      const task = taskDoc.data();
      if (task.title.startsWith("Contato:") && !task.relatedTo?.scheduledContactId) {
        noIdCount++;
        console.log(`Tarefa sem ID encontrada:`);
        console.log(`  ID: ${taskDoc.id}`);
        console.log(`  Título: ${task.title}`);
        console.log(`  RelatedTo: ${JSON.stringify(task.relatedTo)}`);
        console.log(`  Status: ${task.status}`);
        console.log();
      }
    }

    console.log(`Total de tarefas sem ID: ${noIdCount}\n`);
  } catch (error) {
    console.error("Erro ao verificar tarefas órfãs:", error);
  }
}

checkOrphanTasks();
