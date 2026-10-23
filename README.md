🕵️‍♂️ Detetive SQL // Operação CorpDB

🔴 CLIQUE AQUI PARA ACESSAR O SISTEMA AO VIVO NA NUVEM

Um ambiente interativo de Escape Room desenvolvido para o ensino prático de Bancos de Dados, SQL e Cálculo Relacional, inspirado nos conceitos do Capítulo 8 da obra de C. J. Date.

Neste jogo, as equipes assumem o papel de peritos forenses que devem utilizar consultas SQL reais para cruzar logs de catraca, autorizações e registros corporativos a fim de descobrir o culpado por uma sabotagem no servidor.

📸 Telas da Aplicação

![Tela de Sabotagem - Login](./tela-login.jpg)

![Painel Forense e Cofre Mestre](./tela-painel.jpg)

🛠️ Tecnologias Utilizadas e Arquitetura Cloud

Node.js & Express: Criação do servidor backend, roteamento da API e entrega da interface estática (Glassmorphism).

PostgreSQL (Neon Cloud): Banco de dados relacional Serverless, utilizando Views e funções de formatação (TO_CHAR) para blindagem de fusos horários.

Vercel: Hospedagem em nuvem configurada para execução sob demanda e alta disponibilidade.

JWT (JSON Web Token): Autenticação de equipes, rastreamento de progresso e proteção do Painel de Administrador (Game Master) oculto.

Transações Read-Only: O motor do jogo utiliza uma Sandbox SQL executando comandos de alunos dentro de uma transação BEGIN TRANSACTION READ ONLY, bloqueando tentativas de injeção destrutiva (DROP, DELETE).

⚙️ Dinâmica Forense (Os 7 Atos)

A aplicação avalia a capacidade analítica dos alunos através de respostas JSON instantâneas, exigindo o uso prático de:

[x] Restrições Simples e Projeções.

[x] Subconsultas com IN para equivalência de conjuntos.

[x] Múltiplas Variáveis e Junções (JOIN).

[x] Quantificadores Existenciais (EXISTS).

[x] Negação Universal e Tratamento de Nulos (NOT EXISTS / IS NULL).

[x] Funções de Agregação (COUNT, GROUP BY, HAVING).

[x] Query-By-Example (QBE) visual para a dedução final e emissão do mandado de prisão.

🚀 Como Executar o Projeto Localmente

Pré-requisitos

Node.js instalado em sua máquina.

Instância ativa do PostgreSQL (local ou nuvem via Neon).

Passo a Passo

Clone o repositório:

git clone https://github.com/heliomachado-dev/detetive-sql-corpdb.git


Acesse a pasta e instale as dependências:

cd detetive-sql-corpdb
npm install


Configure as Variáveis de Ambiente:
Crie um arquivo .env na raiz do projeto com as credenciais:

DATABASE_URL=postgresql://usuario:senha@seu-host.neon.tech/neondb?sslmode=require
JWT_SECRET=sua_chave_jwt_super_segura
SENHA_PROFESSOR=senha_do_game_master
PORT=3000


Prepare a Cena do Crime (Seed):

node seed.js


Inicie o Servidor:

node index.js


Acesse http://localhost:3000 no navegador para iniciar a investigação.# detetive-sql-corpdb
