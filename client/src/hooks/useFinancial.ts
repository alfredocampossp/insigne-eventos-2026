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
import { FinancialRecord } from "@/types";
import { toast } from "sonner";

export function useFinancial() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "financial"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancialRecord[];
      setRecords(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching financial records:", error);
      toast.error("Erro ao carregar registros financeiros.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addRecord = async (record: Omit<FinancialRecord, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "financial"), {
        ...record,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Registro financeiro adicionado!");
      return true;
    } catch (error) {
      console.error("Error adding financial record:", error);
      toast.error("Erro ao adicionar registro.");
      return false;
    }
  };

  const updateRecord = async (id: string, data: Partial<FinancialRecord>) => {
    try {
      const docRef = doc(db, "financial", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      toast.success("Registro atualizado!");
      return true;
    } catch (error) {
      console.error("Error updating financial record:", error);
      toast.error("Erro ao atualizar registro.");
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    
    try {
      await deleteDoc(doc(db, "financial", id));
      toast.success("Registro excluído!");
      return true;
    } catch (error) {
      console.error("Error deleting financial record:", error);
      toast.error("Erro ao excluir registro.");
      return false;
    }
  };

  return { records, loading, addRecord, updateRecord, deleteRecord };
}
