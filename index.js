require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(express.static('public')); // Permite entregar a tela HTML aos usuários

const SECRET = process.env.JWT_SECRET;

// 1. Auto-setup: Cria a tabela de pontuação das equipes se não existir
// 1. Auto-setup: Cria a tabela e garante que a coluna de vitória exista
db.query(`
    CREATE TABLE IF NOT EXISTS game_equipes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) UNIQUE NOT NULL,
        pontuacao INTEGER DEFAULT 0,
        fase_atual INTEGER DEFAULT 1
    );
    
    ALTER TABLE game_equipes ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMP;
`).catch(err => console.error("Erro ao configurar tabela do jogo:", err));

// ==========================================
// ROTA 1: LOGIN/CADASTRO DA EQUIPE
// ==========================================
app.post('/api/jogar', async (req, res) => {
    const { nome_equipe } = req.body;
    if (!nome_equipe) return res.status(400).json({ erro: 'O nome da equipe é obrigatório.' });

    try {
        // Busca a equipe ou cria uma nova se não existir
        let result = await db.query('SELECT * FROM game_equipes WHERE nome = $1', [nome_equipe]);
        
        if (result.rowCount === 0) {
            result = await db.query(
                'INSERT INTO game_equipes (nome) VALUES ($1) RETURNING *',
                [nome_equipe]
            );
        }
        
        const equipe = result.rows[0];
        
        // Gera o crachá digital (JWT) válido por 2 horas
        const token = jwt.sign({ id: equipe.id, nome: equipe.nome }, SECRET, { expiresIn: '2h' });
        
        res.status(201).json({ 
            mensagem: `Bem-vindos à CorpDB, equipe ${equipe.nome}! O relógio está correndo.`,
            token: token,
            fase_atual: equipe.fase_atual
        });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro no servidor central.' });
    }
});

// ==========================================
// MIDDLEWARE: PROTEÇÃO DO TERMINAL
// ==========================================
function verificarCracha(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ erro: "Acesso negado. Crachá digital não inserido no terminal." });
    }

    jwt.verify(token, SECRET, (err, equipeDecodificada) => {
        if (err) return res.status(401).json({ erro: "Crachá expirado ou falsificado." });
        
        // Salva os dados da equipe na requisição para usarmos na avaliação do SQL[cite: 1]
        req.equipe = equipeDecodificada; 
        next(); 
    });
}

// ==========================================
// ROTA 2: STATUS DA INVESTIGAÇÃO (Protegida)
// ==========================================
app.get('/api/terminal', verificarCracha, async (req, res) => {
    try {
        const result = await db.query('SELECT pontuacao, fase_atual FROM game_equipes WHERE id = $1', [req.equipe.id]);
        res.json({
            equipe: req.equipe.nome,
            status: 'Terminal Investigativo Liberado 🟢',
            progresso: result.rows[0]
        });
    } catch (erro) {
        res.status(500).json({ erro: 'Falha ao ler progresso.' });
    }
});

// ==========================================
// ROTA 3: TERMINAL SQL (Motor de Execução)
// ==========================================
app.post('/api/executar', verificarCracha, async (req, res) => {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ erro: "Nenhum comando SQL inserido." });

    // 1. Firewall Anti-Hacker: Bloqueia qualquer comando de modificação ou acesso ao sistema do jogo
    const palavrasProibidas = /DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|game_/i;
    if (palavrasProibidas.test(sql)) {
        // Punição automática para tentativa de trapaça
        await db.query('UPDATE game_equipes SET pontuacao = pontuacao - 100 WHERE id = $1', [req.equipe.id]);
        return res.status(403).json({ 
            erro: "🔥 ALARME DA CORPDB: Tentativa de sabotagem detectada! Comando bloqueado e equipe penalizada (-100 pontos)." 
        });
    }

    try {
        // 2. Executa a consulta do aluno em um ambiente blindado de Somente Leitura
        await db.query('BEGIN TRANSACTION READ ONLY');
        const result = await db.query(sql);
        await db.query('COMMIT');
        
        // Devolve as colunas e as linhas encontradas para o aluno analisar
        res.json({
            status: "Consulta Executada com Sucesso",
            linhas_retornadas: result.rowCount,
            dados: result.rows
        });
    } catch (err) {
        await db.query('ROLLBACK'); // Aborta a transação em caso de erro de sintaxe
        res.status(400).json({ erro: "Erro de Sintaxe SQL: " + err.message });
    }
});

// ==========================================
// ROTA 4: O COFRE MESTRE (Validador de Atos)
// ==========================================

// O Gabarito da Investigação baseado nos dados plantados no seed.js
const GABARITO = {
    1: { pergunta: "Qual o ID do funcionário suspeito que entrou exatamente às 02:15?", resposta_correta: "3", digito_liberado: "A" },
    2: { pergunta: "Usando a subconsulta (IN), descubra o ID do Cargo (setor) desse suspeito.", resposta_correta: "2", digito_liberado: "L" },
    3: { pergunta: "O suspeito teve um cúmplice. Qual o ID do funcionário que ganha > 8000 e entrou 2 min antes (02:13)?", resposta_correta: "2", digito_liberado: "P" },
    4: { pergunta: "O cúmplice (ID 2) tinha autorização válida para HOJE? (Responda SIM ou NAO)", resposta_correta: "NAO", digito_liberado: "H" },
    5: { pergunta: "O suspeito deletou a própria saída. Qual ID do log tem a saída NULA (NOT EXISTS)?", resposta_correta: "3", digito_liberado: "A" },
    6: { pergunta: "Usando COUNT e HAVING, qual o ID do projeto que sofreu mais de 5 exclusões?", resposta_correta: "3", digito_liberado: "Z" },
    7: { pergunta: "Insira a senha de 6 letras decodificada para emitir o mandado de prisão!", resposta_correta: "ALPHAZ", digito_liberado: "🔓 MANDADO EMITIDO!" }
};

app.post('/api/cofre', verificarCracha, async (req, res) => {
    const { resposta_submetida } = req.body;
    
    try {
        // Busca a fase atual da equipe
        const result = await db.query('SELECT fase_atual, pontuacao FROM game_equipes WHERE id = $1', [req.equipe.id]);
        let { fase_atual, pontuacao } = result.rows[0];

        if (fase_atual > 7) {
            return res.json({ status: "Jogo Concluído", mensagem: "Vocês já prenderam o culpado!" });
        }

        const faseJogo = GABARITO[fase_atual];

        // Avalia a resposta convertendo tudo para maiúsculas e tirando espaços
        if (resposta_submetida.toString().trim().toUpperCase() === faseJogo.resposta_correta) {
            
            fase_atual += 1;
            pontuacao += 100;
            
            // Salva o progresso no banco
            await db.query('UPDATE game_equipes SET fase_atual = $1, pontuacao = $2 WHERE id = $3', [fase_atual, pontuacao, req.equipe.id]);
            
            res.json({
                resultado: "✅ ACERTOU!",
                mensagem: `Você desvendou o Ato ${fase_atual - 1}.`,
                digito_descoberto: faseJogo.digito_liberado,
                nova_pontuacao: pontuacao,
                proximo_ato: GABARITO[fase_atual] ? GABARITO[fase_atual].pergunta : "Vá para o painel emitir a prisão!"
            });

        } else {
            // Firewall Anti-Chute: Retira 50 pontos
            pontuacao -= 50;
            await db.query('UPDATE game_equipes SET pontuacao = $1 WHERE id = $2', [pontuacao, req.equipe.id]);
            
            res.status(400).json({
                resultado: "❌ ERROU!",
                mensagem: "Evidência incorreta. A diretoria os penalizou em -50 pontos.",
                pontuacao_atual: pontuacao
            });
        }

    } catch (erro) {
        res.status(500).json({ erro: "Falha na validação do cofre." });
    }
});

// ==========================================
// ROTA 5: RANKING EM TEMPO REAL (Para o Telão)
// ==========================================
app.get('/api/ranking', async (req, res) => {
    try {
        // Ordena primeiro pelas equipes que concluíram (data_conclusao IS NOT NULL), depois por pontuação
        const result = await db.query(`
            SELECT id, nome, pontuacao, fase_atual, 
                   TO_CHAR(data_conclusao, 'HH24:MI:SS') as hora_vitoria 
            FROM game_equipes 
            ORDER BY 
                CASE WHEN data_conclusao IS NOT NULL THEN 0 ELSE 1 END,
                data_conclusao ASC,
                fase_atual DESC, 
                pontuacao DESC
        `);
        res.json(result.rows);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao carregar o ranking.' });
    }
});

// ==========================================
// PAINEL DO PROFESSOR (GAME MASTER)
// ==========================================
const SENHA_PROFESSOR = process.env.SENHA_PROFESSOR || "diretoria2026";

// 1. Rota de Login do Professor
app.post('/api/admin/login', (req, res) => {
    const { senha } = req.body;
    if (senha === SENHA_PROFESSOR) {
        // Gera um token especial com a role 'admin'
        const tokenAdmin = jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '4h' });
        return res.json({ token: tokenAdmin });
    }
    res.status(401).json({ erro: "Credencial da Diretoria Inválida." });
});

// 2. Fiscal da Diretoria (Middleware de Admin)
function verificarAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ erro: "Acesso negado." });

    jwt.verify(token, SECRET, (err, decodificado) => {
        if (err || decodificado.role !== 'admin') {
            return res.status(401).json({ erro: "Crachá de Diretoria inválido." });
        }
        next();
    });
}

// 3. Rota para Excluir Equipe (Somente Professor)
app.delete('/api/admin/equipes/:id', verificarAdmin, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM game_equipes WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ erro: "Equipe não encontrada." });
        res.json({ mensagem: "Equipe desclassificada com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao excluir equipe." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🕵️‍♂️ Servidor do Jogo escutando na porta ${PORT}`);
});