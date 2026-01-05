import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  where,
  Timestamp
} from "firebase/firestore";
import { toast } from "sonner";

export interface EventLogistics {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  checklist: {
    id: string;
    task: string;
    completed: boolean;
    assignee?: string;
  }[];
  suppliers: {
    id: string;
    name: string;
    service: string;
    contact: string;
    status: 'pending' | 'confirmed' | 'paid';
    cost: number;
  }[];
  schedule: {
    id: string;
    time: string;
    activity: string;
    responsible: string;
  }[];
  notes?: string;
  createdAt: string;
}

export function useEvents() {
  const [events, setEvents] = useState<EventLogistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventLogistics[];
      
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      toast.error("Erro ao carregar eventos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addEvent = async (event: Omit<EventLogistics, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "events"), {
        ...event,
        createdAt: new Date().toISOString()
      });
      toast.success("Evento criado com sucesso!");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Erro ao criar evento.");
      throw error;
    }
  };

  const updateEvent = async (id: string, data: Partial<EventLogistics>) => {
    try {
      await updateDoc(doc(db, "events", id), data);
      toast.success("Evento atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Erro ao atualizar evento.");
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id));
      toast.success("Evento excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Erro ao excluir evento.");
      throw error;
    }
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent
  };
}
