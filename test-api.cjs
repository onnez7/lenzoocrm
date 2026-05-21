const https = require('https');
const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6IkZSQU5DSElTRV9BRE1JTiIsImZyYW5jaGlzZUlkIjoxLCJpYXQiOjE3NTE2ODQ0NTIsImV4cCI6MTc1MTc3MDg1Mn0.EXsljv-XDUllg1nfL2fL0Sfp7APYhzUru3iv6ORj5Rw";

// Testar rota de cargos
const testRoles = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/employees/roles',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Resposta:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Erro: ${e.message}`);
  });

  req.end();
};

// Testar rota de funcionários da franquia
const testFranchiseEmployees = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/employees/franchise?page=1&limit=20',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Resposta:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Erro: ${e.message}`);
  });

  req.end();
};

console.log('Testando rota de cargos...');
testRoles();

setTimeout(() => {
  console.log('\nTestando rota de funcionários da franquia...');
  testFranchiseEmployees();
}, 1000); 