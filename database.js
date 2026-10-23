const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => console.log('🕵️‍♂️ Detetive SQL: Conectado à CorpDB no Neon com sucesso!'))
    .catch(err => console.error('Erro crítico na conexão com o banco:', err.stack));

module.exports = pool;