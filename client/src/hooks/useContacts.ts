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
import { Contact } from "@/types";
import { toast } from "sonner";

export function useContacts(companyId?: string) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (companyId) {
      q = query(
        collection(db, "contacts"), 
        where("companyId", "==", companyId),
        orderBy("name")
      );
    } else {
      q = query(collection(db, "contacts"), orderBy("name"));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      setContacts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching contacts:", error);
      toast.error("Erro ao carregar contatos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId]);

  const addContact = async (contact: Omit<Contact, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "contacts"), {
        ...contact,
        createdAt: serverTimestamp()
      });
      toast.success("Contato adicionado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Erro ao adicionar contato.");
      return false;
    }
  };

  const updateContact = async (id: string, data: Partial<Contact>) => {
    try {
      const docRef = doc(db, "contacts", id);
      await updateDoc(docRef, data);
      toast.success("Contato atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Erro ao atualizar contato.");
      return false;
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
    
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast.success("Contato excluído com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Erro ao excluir contato.");
      return false;
    }
  };

  return { contacts, loading, addContact, updateContact, deleteContact };
}
