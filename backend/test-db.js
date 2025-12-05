require('dotenv').config({ path: '.env.development' });
const { Sequelize } = require('sequelize');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'pet_web';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

console.log('数据库配置:');
console.log('Host:', DB_HOST);
console.log('Port:', DB_PORT);
console.log('Database:', DB_NAME);
console.log('User:', DB_USER);
console.log('Password:', DB_PASSWORD ? '******' : '(empty)');

const encodedPassword = encodeURIComponent(DB_PASSWORD);
const DATABASE_URL = `postgres://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('\n连接 URL:', DATABASE_URL.replace(encodedPassword, '******'));

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log
});

sequelize.authenticate()
  .then(() => {
    console.log('\n✅ 数据库连接成功！');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ 数据库连接失败:', err.message);
    process.exit(1);
  });
