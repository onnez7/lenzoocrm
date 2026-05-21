const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testUsersAPI() {
  console.log('🧪 Testando API de usuários...\n');

  const baseUrl = 'localhost';
  const port = 3001;
  
  try {
    // 1. Testar healthcheck primeiro
    console.log('1. Testando healthcheck...');
    const healthOptions = {
      hostname: baseUrl,
      port: port,
      path: '/api/healthcheck',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const healthResult = await makeRequest(healthOptions);
    if (healthResult.status === 200) {
      console.log('   ✅ Healthcheck OK:', healthResult.data.message);
    } else {
      console.log('   ❌ Healthcheck falhou:', healthResult.status);
      return;
    }

    // 2. Fazer login para obter token
    console.log('\n2. Fazendo login...');
    const loginOptions = {
      hostname: baseUrl,
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: 'admin@matriz.com',
      password: 'admin123'
    };

    const loginResult = await makeRequest(loginOptions, loginData);
    if (loginResult.status !== 200) {
      console.log('   ❌ Login falhou:', loginResult.status);
      console.log('   Erro:', loginResult.data);
      return;
    }

    const token = loginResult.data.token;
    console.log('   ✅ Login OK - Token obtido');

    // 3. Testar rota de usuários
    console.log('\n3. Testando rota /users...');
    const usersOptions = {
      hostname: baseUrl,
      port: port,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const usersResult = await makeRequest(usersOptions);
    if (usersResult.status === 200) {
      console.log('   ✅ Rota /users OK');
      console.log(`   📊 ${usersResult.data.length} usuários encontrados`);
      
      // Mostrar alguns usuários
      usersResult.data.slice(0, 3).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
      
      if (usersResult.data.length > 3) {
        console.log(`   ... e mais ${usersResult.data.length - 3} usuários`);
      }
    } else {
      console.log('   ❌ Rota /users falhou:', usersResult.status);
      console.log('   Erro:', usersResult.data);
    }

    // 4. Testar rota de franquias
    console.log('\n4. Testando rota /franchises...');
    const franchisesOptions = {
      hostname: baseUrl,
      port: port,
      path: '/api/franchises',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const franchisesResult = await makeRequest(franchisesOptions);
    if (franchisesResult.status === 200) {
      console.log('   ✅ Rota /franchises OK');
      console.log(`   📊 ${franchisesResult.data.length} franquias encontradas`);
    } else {
      console.log('   ❌ Rota /franchises falhou:', franchisesResult.status);
      console.log('   Erro:', franchisesResult.data);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testUsersAPI(); 