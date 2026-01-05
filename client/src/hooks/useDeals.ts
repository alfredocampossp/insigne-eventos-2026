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
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Deal } from "@/types";
import { toast } from "sonner";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "deals"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
      setDeals(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deals:", error);
      toast.error("Erro ao carregar negócios.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addDeal = async (deal: Omit<Deal, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "deals"), {
        ...deal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Negócio criado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error adding deal:", error);
      toast.error("Erro ao criar negócio.");
      return false;
    }
  };

  const updateDeal = async (id: string, data: Partial<Deal>) => {
    try {
      const docRef = doc(db, "deals", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      // Don't show toast for drag and drop updates to avoid spam
      if (!data.pipelineStageId) {
        toast.success("Negócio atualizado com sucesso!");
      }
      return true;
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.error("Erro ao atualizar negócio.");
      return false;
    }
  };

  const deleteDeal = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este negócio?")) return;
    
    try {
      await deleteDoc(doc(db, "deals", id));
      toast.success("Negócio excluído com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("Erro ao excluir negócio.");
      return false;
    }
  };

  return { deals, loading, addDeal, updateDeal, deleteDeal };
}
