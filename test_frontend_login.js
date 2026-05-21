const http = require('http');

const data = JSON.stringify({
  email: 'admin@lenzoo.com.br',
  password: 'teste123'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200) {
      const response = JSON.parse(body);
      console.log('✅ Login via Frontend (proxy) funcionando!');
      console.log('Token:', response.token.substring(0, 50) + '...');
    } else {
      console.log('Response:', body);
    }
  });
});

req.on('error', (e) => console.error('Erro:', e.message));
req.write(data);
req.end();
