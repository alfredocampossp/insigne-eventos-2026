import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DealContactLog, DealScheduledContact } from "@/types";

export function useDealCommunications(dealId: string) {
  const [contactLogs, setContactLogs] = useState<DealContactLog[]>([]);
  const [scheduledContacts, setScheduledContacts] = useState<DealScheduledContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar histórico de contatos
  useEffect(() => {
    if (!dealId) return;

    const q = query(
      collection(db, "dealContactLogs"),
      where("dealId", "==", dealId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as DealContactLog));
        setContactLogs(logs);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar histórico de contatos:", err);
        setError("Erro ao carregar histórico");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [dealId]);

  // Carregar contatos agendados
  useEffect(() => {
    if (!dealId) return;

    const q = query(
      collection(db, "dealScheduledContacts"),
      where("dealId", "==", dealId),
      orderBy("scheduledFor", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const scheduled = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as DealScheduledContact));
        setScheduledContacts(scheduled);
      },
      (err) => {
        console.error("Erro ao carregar contatos agendados:", err);
      }
    );

    return () => unsubscribe();
  }, [dealId]);

  // Adicionar log de contato
  const addContactLog = async (log: Omit<DealContactLog, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "dealContactLogs"), {
        ...log,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error("Erro ao adicionar log de contato:", err);
      throw err;
    }
  };

  // Agendar contato
  const scheduleContact = async (
    scheduled: Omit<DealScheduledContact, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await addDoc(collection(db, "dealScheduledContacts"), {
        ...scheduled,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error("Erro ao agendar contato:", err);
      throw err;
    }
  };

  // Atualizar contato agendado
  const updateScheduledContact = async (
    id: string,
    updates: Partial<DealScheduledContact>
  ) => {
    try {
      const docRef = doc(db, "dealScheduledContacts", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error("Erro ao atualizar contato agendado:", err);
      throw err;
    }
  };

  // Deletar log de contato
  const deleteContactLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, "dealContactLogs", id));
    } catch (err) {
      console.error("Erro ao deletar log de contato:", err);
      throw err;
    }
  };

  // Deletar contato agendado
  const deleteScheduledContact = async (id: string) => {
    try {
      await deleteDoc(doc(db, "dealScheduledContacts", id));
    } catch (err) {
      console.error("Erro ao deletar contato agendado:", err);
      throw err;
    }
  };

  return {
    contactLogs,
    scheduledContacts,
    loading,
    error,
    addContactLog,
    scheduleContact,
    updateScheduledContact,
    deleteContactLog,
    deleteScheduledContact,
  };
}
