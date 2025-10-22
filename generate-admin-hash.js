// Generate bcrypt hash for admin password
import bcrypt from 'bcryptjs';

const password = 'admin7880';
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);

console.log('Password:', password);
console.log('Bcrypt Hash:', hash);
console.log('\nUse this hash in reset-database.sql');
