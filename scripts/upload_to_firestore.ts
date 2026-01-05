
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import * as fs from 'fs';
import * as path from 'path';

// Configuração do Firebase (copiada do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyCbxAPOpGcFApqEWalSbI4YDa1x9tSKkr4",
  authDomain: "insigneeventos2026.firebaseapp.com",
  projectId: "insigneeventos2026",
  storageBucket: "insigneeventos2026.firebasestorage.app",
  messagingSenderId: "431680701150",
  appId: "1:431680701150:web:cd435be8bf6bbbb442b84f",
  measurementId: "G-WRMMXV2P1W"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const DATA_DIR = '/home/ubuntu/insigne-eventos-2026/client/src/data';

async function uploadData() {
  try {
    console.log("Autenticando...");
    // Tentar autenticação anônima ou criar um usuário temporário se necessário
    // Para simplificar e garantir permissão, o ideal seria usar Admin SDK, mas sem chave,
    // vamos tentar escrever assumindo que as regras de segurança permitem ou que temos um user.
    // Como não temos user interativo, vamos tentar signInAnonymously se habilitado, ou falhará.
    // SE AS REGRAS ESTIVEREM ABERTAS (modo teste), funcionará.
    // Caso contrário, precisaremos de um usuário válido.
    
    // NOTA: Se as regras exigirem auth, este script falhará sem um login válido.
    // Vamos assumir que o usuário já criou uma conta ou as regras estão em modo de desenvolvimento.
    
    console.log("Lendo arquivos JSON...");
    const companiesPath = path.join(DATA_DIR, 'companies_import.json');
    const contactsPath = path.join(DATA_DIR, 'contacts_import.json');

    if (!fs.existsSync(companiesPath) || !fs.existsSync(contactsPath)) {
      console.error("Arquivos JSON não encontrados. Execute 'npx tsx scripts/import_data.ts' primeiro.");
      return;
    }

    const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf-8'));
    const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf-8'));

    console.log(`Iniciando upload de ${companies.length} empresas...`);
    
    // Upload em lotes (batches) de 500 (limite do Firestore)
    const BATCH_SIZE = 450; // Margem de segurança
    
    // Upload Empresas
    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = companies.slice(i, i + BATCH_SIZE);
      
      chunk.forEach((company: any) => {
        const ref = doc(db, "companies", company.id);
        batch.set(ref, company);
      });

      await batch.commit();
      console.log(`Lote de empresas ${i + 1} a ${Math.min(i + BATCH_SIZE, companies.length)} enviado.`);
    }

    console.log(`Iniciando upload de ${contacts.length} contatos...`);

    // Upload Contatos
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = contacts.slice(i, i + BATCH_SIZE);
      
      chunk.forEach((contact: any) => {
        const ref = doc(db, "contacts", contact.id);
        batch.set(ref, contact);
      });

      await batch.commit();
      console.log(`Lote de contatos ${i + 1} a ${Math.min(i + BATCH_SIZE, contacts.length)} enviado.`);
    }

    console.log("Upload concluído com sucesso!");

  } catch (error) {
    console.error("Erro durante o upload:", error);
  }
}

uploadData();
