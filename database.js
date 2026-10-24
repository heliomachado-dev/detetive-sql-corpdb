const { Pool } = require('pg');
require('dotenv').config();

// SSL só quando o banco exige (Neon) — assim continua compatível com Postgres local sem SSL
const databaseUrl = process.env.DATABASE_URL || '';
const precisaSsl = /sslmode=require|neon\.tech/i.test(databaseUrl);

const pool = new Pool({
    connectionString: databaseUrl,
    // Serverless (Vercel): 1 conexão por instância para não estourar o limite de conexões do Neon
    max: 1,
    ...(precisaSsl ? { ssl: { rejectUnauthorized: false } } : {})
});

// Teste de conexão usando pool.query (o client é devolvido ao pool automaticamente —
// o antigo pool.connect() sem release() vazava 1 conexão por cold start)
pool.query('SELECT 1')
    .then(() => console.log('🕵️‍♂️ Detetive SQL: Conectado à CorpDB no Neon com sucesso!'))
    .catch(err => console.error('Erro crítico na conexão com o banco:', err.stack));

module.exports = pool;
