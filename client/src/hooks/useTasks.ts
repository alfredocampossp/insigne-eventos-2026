import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task } from "@/types";
import { toast } from "sonner";

export function useTasks(filter?: { status?: string; priority?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "tasks"), orderBy("dueDate", "asc"));
    
    if (filter?.status) {
      q = query(q, where("status", "==", filter.status));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      toast.error("Erro ao carregar tarefas.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter?.status]);

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "tasks"), {
        ...task,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Tarefa criada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Erro ao criar tarefa.");
      return false;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      const docRef = doc(db, "tasks", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      // toast.success("Tarefa atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Erro ao atualizar tarefa.");
      return false;
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    
    try {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("Tarefa excluída com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Erro ao excluir tarefa.");
      return false;
    }
  };

  return { tasks, loading, addTask, updateTask, deleteTask };
}
