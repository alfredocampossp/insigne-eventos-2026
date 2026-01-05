import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import companiesData from "@/data/companies_import.json";
import contactsData from "@/data/contacts_import.json";

export default function AdminDataImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const clearDatabase = async () => {
    setImporting(true);
    setStatus("Limpando banco de dados...");
    setProgress(0);

    try {
      // Limpar Empresas
      const companiesRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesRef);
      const totalCompanies = companiesSnapshot.size;
      let deletedCompanies = 0;

      const batchSize = 500;
      let batch = writeBatch(db);
      let operationCounter = 0;

      for (const docSnapshot of companiesSnapshot.docs) {
        batch.delete(docSnapshot.ref);
        operationCounter++;
        deletedCompanies++;

        if (operationCounter >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          operationCounter = 0;
          setProgress((deletedCompanies / totalCompanies) * 50); // 50% do progresso total
        }
      }
      if (operationCounter > 0) {
        await batch.commit();
      }

      // Limpar Contatos
      const contactsRef = collection(db, "contacts");
      const contactsSnapshot = await getDocs(contactsRef);
      const totalContacts = contactsSnapshot.size;
      let deletedContacts = 0;

      batch = writeBatch(db);
      operationCounter = 0;

      for (const docSnapshot of contactsSnapshot.docs) {
        batch.delete(docSnapshot.ref);
        operationCounter++;
        deletedContacts++;

        if (operationCounter >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          operationCounter = 0;
          setProgress(50 + (deletedContacts / totalContacts) * 50);
        }
      }
      if (operationCounter > 0) {
        await batch.commit();
      }

      toast.success("Banco de dados limpo com sucesso!");
    } catch (error) {
      console.error("Erro ao limpar banco:", error);
      toast.error("Erro ao limpar banco de dados.");
    } finally {
      setImporting(false);
      setStatus("");
      setProgress(0);
    }
  };

  const importData = async () => {
    setImporting(true);
    setStatus("Iniciando importação...");
    setProgress(0);

    try {
      const totalItems = companiesData.length + contactsData.length;
      let processedItems = 0;
      const batchSize = 500;
      
      // Importar Empresas
      setStatus(`Importando ${companiesData.length} empresas...`);
      let batch = writeBatch(db);
      let operationCounter = 0;

      for (const company of companiesData) {
        const docRef = doc(db, "companies", company.id);
        batch.set(docRef, company);
        operationCounter++;
        processedItems++;

        if (operationCounter >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          operationCounter = 0;
          setProgress((processedItems / totalItems) * 100);
        }
      }
      if (operationCounter > 0) {
        await batch.commit();
      }

      // Importar Contatos
      setStatus(`Importando ${contactsData.length} contatos...`);
      batch = writeBatch(db);
      operationCounter = 0;

      for (const contact of contactsData) {
        const docRef = doc(db, "contacts", contact.id);
        batch.set(docRef, contact);
        operationCounter++;
        processedItems++;

        if (operationCounter >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          operationCounter = 0;
          setProgress((processedItems / totalItems) * 100);
        }
      }
      if (operationCounter > 0) {
        await batch.commit();
      }

      toast.success("Importação concluída com sucesso!");
    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao importar dados.");
    } finally {
      setImporting(false);
      setStatus("");
      setProgress(100);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Administração de Dados</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Importação e Limpeza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              onClick={clearDatabase} 
              disabled={importing}
            >
              Limpar Banco de Dados
            </Button>
            <Button 
              onClick={importData} 
              disabled={importing}
            >
              Importar Dados (XLS)
            </Button>
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{status}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-4">
            <p>Dados disponíveis para importação:</p>
            <ul className="list-disc list-inside">
              <li>Empresas: {companiesData.length} registros</li>
              <li>Contatos: {contactsData.length} registros</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
