import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import xlsx from 'xlsx';

// Configuração do Firebase Admin (simulado para ambiente local ou usando credenciais se disponíveis)
// Nota: Em um ambiente real, precisaríamos das credenciais de serviço do Firebase Admin.
// Como estamos no sandbox e usando o SDK cliente no frontend, vamos adaptar para usar o SDK cliente
// ou instruir o usuário a rodar isso com credenciais adequadas.
// Pela limitação do ambiente, vamos criar um script que gera um JSON para ser importado via frontend
// ou usar uma abordagem híbrida.
//
// Melhor abordagem para este ambiente: Ler os XLS, processar e salvar em JSON.
// Depois, criar uma função temporária no frontend para ler esse JSON e enviar para o Firestore
// usando o SDK já autenticado do cliente.

const EMPRESAS_FILE = '/home/ubuntu/upload/Empresas.xls';
const CONTATOS_FILE = '/home/ubuntu/upload/Contatos.xls';
const OUTPUT_DIR = '/home/ubuntu/insigne-eventos-2026/client/src/data';

function processData() {
  console.log('Lendo arquivos Excel...');
  
  // Ler Empresas
  const empresasWorkbook = xlsx.readFile(EMPRESAS_FILE);
  const empresasSheet = empresasWorkbook.Sheets[empresasWorkbook.SheetNames[0]];
  const empresasData = xlsx.utils.sheet_to_json(empresasSheet);

  // Ler Contatos
  const contatosWorkbook = xlsx.readFile(CONTATOS_FILE);
  const contatosSheet = contatosWorkbook.Sheets[contatosWorkbook.SheetNames[0]];
  const contatosData = xlsx.utils.sheet_to_json(contatosSheet);

  console.log(`Encontradas ${empresasData.length} empresas e ${contatosData.length} contatos.`);

  // Processar Empresas
  const companiesMap = new Map();
  
  empresasData.forEach((emp: any, index) => {
    // Normalizar chaves
    const razaoSocial = emp['RAZAO_SOCIAL']?.trim();
    const nomeFantasia = emp['NOME_FANTASIA']?.trim() || razaoSocial;
    
    if (!razaoSocial) return;

    // Criar ID único baseado no índice ou hash simples
    const id = `company_${index + 1}`;
    
    companiesMap.set(razaoSocial, {
      id,
      name: nomeFantasia,
      legalName: razaoSocial,
      address: {
        street: emp['ENDERECO'],
        number: emp['NUMERO'],
        complement: emp['COMPLEMENTO'],
        zipCode: emp['CEP'],
        neighborhood: emp['BAIRRO'],
        city: emp['CIDADE'],
        state: 'SP' // Assumindo SP baseado na maioria, ou extrair se tiver
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    });
  });

  // Processar Contatos e vincular às Empresas
  const contactsList: any[] = [];
  let contactsLinked = 0;
  let contactsUnlinked = 0;

  contatosData.forEach((cont: any, index) => {
    const empresaNome = cont['RAZAO_SOCIAL']?.trim();
    const company = companiesMap.get(empresaNome);
    
    if (company) {
      contactsList.push({
        id: `contact_${index + 1}`,
        companyId: company.id,
        companyName: company.name,
        name: cont['NOME_CONTATO']?.trim(),
        surname: cont['SOBRENOME_CONTATO']?.trim(),
        role: cont['CARGO_CONTATO']?.trim(),
        email: cont['EMAIL_CONTATO']?.trim(),
        phone: cont['TELEFONE'],
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      contactsLinked++;
    } else {
      // Contato sem empresa correspondente no arquivo de empresas
      // Criar empresa "Unknown" ou apenas logar?
      // Vamos criar o contato mesmo assim, mas sem companyId vinculado ou criar a empresa on-the-fly?
      // Melhor: Criar empresa placeholder se não existir, para garantir integridade.
      // Mas por enquanto, vamos logar.
      contactsUnlinked++;
      // console.log(`Contato sem empresa vinculada: ${cont['NOME_CONTATO']} - ${empresaNome}`);
    }
  });

  console.log(`Processamento concluído.`);
  console.log(`Empresas processadas: ${companiesMap.size}`);
  console.log(`Contatos vinculados: ${contactsLinked}`);
  console.log(`Contatos sem empresa (ignorados por segurança ou precisam de revisão): ${contactsUnlinked}`);

  // Salvar JSONs para importação
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const companiesArray = Array.from(companiesMap.values());
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'companies_import.json'), JSON.stringify(companiesArray, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'contacts_import.json'), JSON.stringify(contactsList, null, 2));

  console.log(`Arquivos JSON gerados em ${OUTPUT_DIR}`);
}

processData();
