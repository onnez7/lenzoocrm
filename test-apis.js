import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

// Função para fazer login e obter token
async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@matriz.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Login realizado com sucesso');
    return data.token;
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return null;
  }
}

// Função para testar criação de franquia
async function testCreateFranchise(token) {
  try {
    const response = await fetch(`${API_BASE}/franchises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Ótica Teste',
        cnpj: '12.345.678/0001-90',
        address: 'Rua Teste, 123',
        phone: '(11) 9999-9999',
        email: 'teste@otica.com'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao criar franquia: ${error.message}`);
    }

    const data = await response.json();
    console.log('✅ Franquia criada com sucesso:', data.name);
    return data.id;
  } catch (error) {
    console.error('❌ Erro ao criar franquia:', error.message);
    return null;
  }
}

// Função para testar listagem de franquias
async function testListFranchises(token) {
  try {
    const response = await fetch(`${API_BASE}/franchises`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar franquias: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Franquias listadas com sucesso:', data.length, 'franquias encontradas');
    return data;
  } catch (error) {
    console.error('❌ Erro ao listar franquias:', error.message);
    return [];
  }
}

// Função para testar criação de usuário
async function testCreateUser(token, franchiseId) {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'João Silva',
        email: 'joao@otica.com',
        password: '123456',
        userRole: 'FRANCHISE_ADMIN',
        targetFranchiseId: franchiseId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    const data = await response.json();
    console.log('✅ Usuário criado com sucesso:', data.name);
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    return null;
  }
}

// Função para testar listagem de usuários
async function testListUsers(token) {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar usuários: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Usuários listados com sucesso:', data.length, 'usuários encontrados');
    return data;
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error.message);
    return [];
  }
}

// Função principal para executar todos os testes
async function runTests() {
  console.log('🚀 Iniciando testes das APIs...\n');

  // 1. Login
  const token = await login();
  if (!token) {
    console.log('❌ Falha no login, abortando testes');
    return;
  }

  // 2. Testar franquias
  console.log('\n📋 Testando APIs de Franquias:');
  const franchises = await testListFranchises(token);
  const franchiseId = await testCreateFranchise(token);
  
  // 3. Testar usuários
  console.log('\n👥 Testando APIs de Usuários:');
  const users = await testListUsers(token);
  if (franchiseId) {
    await testCreateUser(token, franchiseId);
  }

  console.log('\n✅ Todos os testes concluídos!');
}

// Executar os testes
runTests().catch(console.error); 