const db = require('./database');

async function corrigirCatraca() {
    try {
        console.log("🛠️ Iniciando a correção forense da catraca...");
        await db.query('BEGIN');

        // 1. Destrói exclusivamente a tabela com defeito de fuso horário
        await db.query(`DROP TABLE IF EXISTS corpdb_logs_catraca CASCADE;`);

        // 2. Recria a tabela utilizando o tipo TIME estrito (sem data e sem fuso)
        await db.query(`
            CREATE TABLE corpdb_logs_catraca (
                id SERIAL PRIMARY KEY,
                funcionario_id INTEGER REFERENCES corpdb_funcionarios(id),
                hora_entrada TIME,
                hora_saida TIME
            );
        `);

        // 3. Injeta as evidências cravadas como texto imutável
        await db.query(`
            INSERT INTO corpdb_logs_catraca (funcionario_id, hora_entrada, hora_saida) VALUES 
            (1, '08:00:00', '17:00:00'),
            (2, '02:13:00', '04:30:00'), 
            (3, '02:15:00', NULL),                           
            (5, '22:00:00', '06:00:00'); 
        `);

        await db.query('COMMIT');
        console.log("✅ Tabela corrigida! O tipo agora é TIME e as provas estão seguras.");

    } catch (erro) {
        await db.query('ROLLBACK');
        console.error("❌ Falha na correção:", erro);
    } finally {
        db.end();
    }
}

corrigirCatraca();