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
import { Company } from "@/types";
import { toast } from "sonner";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "companies"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching companies:", error);
      toast.error("Erro ao carregar empresas.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCompany = async (company: Omit<Company, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "companies"), {
        ...company,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Empresa adicionada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Erro ao adicionar empresa.");
      return false;
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    try {
      const docRef = doc(db, "companies", id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      toast.success("Empresa atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Erro ao atualizar empresa.");
      return false;
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;
    
    try {
      await deleteDoc(doc(db, "companies", id));
      toast.success("Empresa excluída com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Erro ao excluir empresa.");
      return false;
    }
  };

  return { companies, loading, addCompany, updateCompany, deleteCompany };
}
