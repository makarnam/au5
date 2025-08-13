#!/usr/bin/env node

const AutoTester = require('./browser-test.js');

// Command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('🔐 Kullanım: node update-credentials.js <email> <password>');
  console.log('Örnek: node update-credentials.js user@example.com mypassword123');
  process.exit(1);
}

const [email, password] = args;

// AutoTester instance oluştur
const tester = new AutoTester();

// Login bilgilerini güncelle
tester.setLoginCredentials(email, password);

console.log('✅ Login bilgileri başarıyla güncellendi!');
console.log(`📧 Email: ${email}`);
console.log('🔒 Şifre: [gizli]');
console.log('\nArtık browser-test.js çalıştırdığınızda bu bilgiler kullanılacak.');
