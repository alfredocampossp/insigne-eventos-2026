import fetch from 'node-fetch';

const projectId = 'insigneeventos2026';
const apiKey = 'AIzaSyCbxAPOpGcFApqEWalSbI4YDa1x9tSKkr4';

// Novas regras de segurança
const newRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

async function updateRules() {
  try {
    // Primeiro, fazer login com a API Key
    console.log('Atualizando regras de segurança do Firestore...');
    
    // Usar a API REST do Firestore para atualizar as regras
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/-default-/documents`;
    
    console.log('Nota: A atualização de regras via API REST requer autenticação especial.');
    console.log('Vou tentar usar uma abordagem alternativa...');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

updateRules();
