const bcrypt = require('bcrypt');

// Gerar hash da senha "teste123"
const password = 'teste123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log(`INSERT INTO users (name, email, password_hash, role, franchise_id) VALUES ('Admin', 'admin@lenzoo.com.br', '${hash}', 'SUPER_ADMIN', NULL) ON CONFLICT (email) DO UPDATE SET password_hash = '${hash}';`);
});
