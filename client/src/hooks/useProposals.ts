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
import { Proposal } from "@/types";
import { toast } from "sonner";

export function useProposals(dealId?: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (dealId) {
      q = query(
        collection(db, "proposals"), 
        where("dealId", "==", dealId),
        orderBy("version", "desc")
      );
    } else {
      q = query(collection(db, "proposals"), orderBy("createdAt", "desc"));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Proposal[];
      setProposals(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching proposals:", error);
      toast.error("Erro ao carregar propostas.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dealId]);

  const addProposal = async (proposal: Omit<Proposal, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "proposals"), {
        ...proposal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Proposta criada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error adding proposal:", error);
      toast.error("Erro ao criar proposta.");
      return false;
    }
  };

  const updateProposal = async (id: string, data: Partial<Proposal>) => {
    try {
      const docRef = doc(db, "proposals", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      toast.success("Proposta atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast.error("Erro ao atualizar proposta.");
      return false;
    }
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta proposta?")) return;
    
    try {
      await deleteDoc(doc(db, "proposals", id));
      toast.success("Proposta excluída com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast.error("Erro ao excluir proposta.");
      return false;
    }
  };

  return { proposals, loading, addProposal, updateProposal, deleteProposal };
}
