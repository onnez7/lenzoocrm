const http = require('http');

// Primeiro fazer login para obter o token
const loginData = JSON.stringify({
  email: 'joao@oticavisaoclara.com.br',
  password: 'franquia123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('Fazendo login...');

const loginReq = http.request(loginOptions, (loginRes) => {
  let data = '';
  
  loginRes.on('data', (chunk) => {
    data += chunk;
  });
  
  loginRes.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Login response status:', loginRes.statusCode);
      console.log('Login response:', response);
      
      if (response.token) {
        console.log('Token obtido, testando endpoint de clientes...');
        
        // Agora testar o endpoint de clientes
        const clientsOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/clients',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${response.token}`
          }
        };
        
        const clientsReq = http.request(clientsOptions, (clientsRes) => {
          let clientsData = '';
          
          clientsRes.on('data', (chunk) => {
            clientsData += chunk;
          });
          
          clientsRes.on('end', () => {
            console.log('Clients response status:', clientsRes.statusCode);
            console.log('Clients response headers:', clientsRes.headers);
            
            try {
              const clientsResponse = JSON.parse(clientsData);
              console.log('Clients response:', clientsResponse);
            } catch (e) {
              console.log('Raw response:', clientsData);
            }
          });
        });
        
        clientsReq.on('error', (e) => {
          console.error('Erro na requisição de clientes:', e.message);
        });
        
        clientsReq.end();
      } else {
        console.log('Token não encontrado na resposta');
      }
    } catch (e) {
      console.log('Erro ao fazer parse da resposta de login:', e.message);
      console.log('Raw response:', data);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Erro na requisição de login:', e.message);
});

loginReq.write(loginData);
loginReq.end(); 