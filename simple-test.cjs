const http = require('http');

// Dados de login
const loginData = JSON.stringify({
  email: 'joao@oticavisaoclara.com.br',
  password: 'franquia123'
});

console.log('Iniciando teste...');

// Fazer login
const loginReq = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  console.log('Status do login:', res.statusCode);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Token recebido:', response.token ? 'SIM' : 'NÃO');
      
      if (response.token) {
        // Testar endpoint de clientes
        const clientReq = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/api/clients',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${response.token}`
          }
        }, (clientRes) => {
          console.log('Status dos clientes:', clientRes.statusCode);
          
          let clientData = '';
          clientRes.on('data', chunk => clientData += chunk);
          clientRes.on('end', () => {
            console.log('Resposta dos clientes:', clientData);
          });
        });
        
        clientReq.on('error', (e) => {
          console.error('Erro na requisição de clientes:', e.message);
        });
        
        clientReq.end();
      }
    } catch (e) {
      console.error('Erro ao fazer parse:', e.message);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Erro no login:', e.message);
});

loginReq.write(loginData);
loginReq.end(); 