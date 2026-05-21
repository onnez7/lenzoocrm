const http = require('http');

const loginData = JSON.stringify({
  email: 'joao@oticavisaoclara.com.br',
  password: 'franquia123'
});

console.log('Testando login...');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', chunk => {
    data += chunk;
    console.log('Recebendo dados...');
  });
  
  res.on('end', () => {
    console.log('Resposta completa:', data);
  });
});

req.on('error', (e) => {
  console.error('Erro:', e.message);
});

req.write(loginData);
req.end();

console.log('Requisição enviada'); 