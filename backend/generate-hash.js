import bcrypt from 'bcrypt';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nEjecuta este SQL:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@click.com';`);
