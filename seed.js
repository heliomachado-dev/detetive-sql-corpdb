const db = require('./database');

async function plantarCenaDoCrime() {
    try {
        console.log("🕵️‍♂️ Iniciando a limpa total e recriação da CorpDB...");
        await db.query('BEGIN');

        console.log("1. Detonando a cena do crime antiga de forma inteligente...");
        
        // O bloco DO $$ permite que o PostgreSQL tente apagar como View, e se for uma Tabela, ele apaga como Tabela sem travar!
        await db.query(`
            DO $$ 
            BEGIN
                BEGIN DROP VIEW IF EXISTS corpdb_autorizacoes CASCADE; EXCEPTION WHEN OTHERS THEN DROP TABLE IF EXISTS corpdb_autorizacoes CASCADE; END;
                BEGIN DROP VIEW IF EXISTS corpdb_logs_catraca CASCADE; EXCEPTION WHEN OTHERS THEN DROP TABLE IF EXISTS corpdb_logs_catraca CASCADE; END;
            END $$;
        `);

        // Apaga as outras tabelas sem medo de conflito
        await db.query(`
            DROP TABLE IF EXISTS tb_logs_catraca CASCADE;
            DROP TABLE IF EXISTS tb_autorizacoes CASCADE;
            DROP TABLE IF EXISTS corpdb_projetos CASCADE;
            DROP TABLE IF EXISTS corpdb_funcionarios CASCADE;
            DROP TABLE IF EXISTS corpdb_cargos CASCADE;
        `);

        console.log("2. Reconstruindo com as blindagens de Data e Hora (Views e TO_CHAR)...");
        await db.query(`
            CREATE TABLE corpdb_cargos (
                id SERIAL PRIMARY KEY,
                nome_setor VARCHAR(50) NOT NULL
            );

            CREATE TABLE corpdb_funcionarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                cargo_id INTEGER REFERENCES corpdb_cargos(id),
                salario DECIMAL(10, 2) NOT NULL
            );

            CREATE TABLE tb_autorizacoes (
                id SERIAL PRIMARY KEY,
                funcionario_id INTEGER REFERENCES corpdb_funcionarios(id),
                data_liberacao DATE NOT NULL
            );

            CREATE TABLE tb_logs_catraca (
                id SERIAL PRIMARY KEY,
                funcionario_id INTEGER REFERENCES corpdb_funcionarios(id),
                hora_entrada TIME,
                hora_saida TIME
            );

            CREATE TABLE corpdb_projetos (
                id SERIAL PRIMARY KEY,
                nome_projeto VARCHAR(50) NOT NULL,
                exclusoes_tabelas INTEGER DEFAULT 0
            );

            CREATE VIEW corpdb_autorizacoes AS
            SELECT 
                id,
                funcionario_id,
                TO_CHAR(data_liberacao, 'YYYY-MM-DD') AS data_liberacao
            FROM tb_autorizacoes;

            CREATE VIEW corpdb_logs_catraca AS
            SELECT 
                id,
                funcionario_id,
                TO_CHAR(hora_entrada, 'HH24:MI:SS') AS hora_entrada,
                TO_CHAR(hora_saida, 'HH24:MI:SS') AS hora_saida
            FROM tb_logs_catraca;
        `);

        console.log("3. Injetando os suspeitos e os dados cravados...");
        
        await db.query(`
            INSERT INTO corpdb_cargos (nome_setor) VALUES 
            ('Recursos Humanos'), 
            ('Desenvolvimento'), 
            ('Diretoria'), 
            ('Manutenção');
        `);

        await db.query(`
            INSERT INTO corpdb_funcionarios (nome, cargo_id, salario) VALUES 
            ('Alice Ramos', 1, 4500.00),
            ('Roberto Hacker', 2, 9500.00),
            ('Carlos Sombra', 2, 7000.00),
            ('Diana Chefe', 3, 15000.00),
            ('Elias Zelador', 4, 3000.00);
        `);

        await db.query(`
            INSERT INTO tb_autorizacoes (funcionario_id, data_liberacao) VALUES 
            (3, CURRENT_DATE),
            (2, CURRENT_DATE - INTERVAL '1 day'),
            (4, CURRENT_DATE);
        `);

        await db.query(`
            INSERT INTO tb_logs_catraca (funcionario_id, hora_entrada, hora_saida) VALUES 
            (1, '08:00:00', '17:00:00'),
            (2, '02:13:00', '04:30:00'), 
            (3, '02:15:00', NULL),                           
            (5, '22:00:00', '06:00:00'); 
        `);

        await db.query(`
            INSERT INTO corpdb_projetos (nome_projeto, exclusoes_tabelas) VALUES 
            ('App Mobile', 2),
            ('API Financeira', 1),
            ('Banco de Produção Master', 8); 
        `);

        await db.query('COMMIT');
        console.log("✅ Seed concluído com sucesso! Datas e Horários blindados com Views.");

    } catch (erro) {
        await db.query('ROLLBACK');
        console.error("❌ Falha crítica no Seed:", erro);
    } finally {
        db.end();
    }
}

plantarCenaDoCrime();