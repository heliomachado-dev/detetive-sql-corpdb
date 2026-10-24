<div align="center">

# 🕵️‍♂️ Detetive SQL // Operação CorpDB

**[🔴 CLIQUE AQUI PARA ACESSAR O SISTEMA AO VIVO NA NUVEM](https://detetive-sql-corpdb.vercel.app)**

Um ambiente interativo de *Escape Room* desenvolvido para o ensino prático de Bancos de Dados, SQL e Cálculo Relacional, inspirado nos conceitos do Capítulo 8 da obra de C. J. Date.

</div>

<br>

## 📸 Telas da Aplicação

<div align="center">
  <img src="./tela-login.png" alt="Tela de credenciamento das equipes e briefing da Operação" width="100%">
  <br>
  <i>Tela de credenciamento das equipes e briefing da Operação.</i>
  <br><br>
  <img src="./tela-painel.png" alt="Terminal investigativo com conexão real ao banco, dicionário de dados interativo e Cofre Mestre" width="100%">
  <br>
  <i>Terminal investigativo com conexão real ao banco, dicionário de dados interativo e Cofre Mestre de 7 dígitos.</i>
</div>

<br>

## 🛠️ Tecnologias Utilizadas e Arquitetura Cloud

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
</div>

<br>

* **Node.js & Express:** Criação do servidor backend, roteamento da API e entrega da interface estática (Glassmorphism).
* **PostgreSQL (Neon Cloud):** Banco de dados relacional Serverless, utilizando *Views* e funções de formatação (`TO_CHAR`) para blindagem de fusos horários.
* **Vercel:** Hospedagem em nuvem com detecção automática de Express (zero-config): o `index.js` na raiz exporta o app e os arquivos de `public/` são servidos pelo CDN.
* **JWT (JSON Web Token):** Autenticação de equipes, rastreamento de progresso e proteção do Painel de Administrador (Game Master) oculto.
* **Transações Read-Only:** o motor do jogo executa o SQL dos alunos em `BEGIN TRANSACTION READ ONLY` dentro de um **client dedicado do pool** (a transação inteira na mesma conexão), somado a um firewall de palavras proibidas (`DROP`, `DELETE`, `UPDATE`...) e à regra de **um único comando de leitura por vez** (`SELECT`, `WITH`, `SHOW`, `EXPLAIN`).

---

## ⚙️ Dinâmica Forense (Os 7 Atos)

A aplicação avalia a capacidade analítica dos alunos através de respostas JSON instantâneas, exigindo o uso prático de:

1. **Restrições Simples e Projeções.**
2. **Subconsultas com `IN`** para equivalência de conjuntos.
3. **Múltiplas Variáveis e Junções (`JOIN`).**
4. **Quantificadores Existenciais (`EXISTS`).**
5. **Negação Universal e Tratamento de Nulos (`NOT EXISTS` / `IS NULL`).**
6. **Funções de Agregação (`COUNT`, `GROUP BY`, `HAVING`).**
7. **Query-By-Example (QBE)** visual para a dedução final e emissão do mandado de prisão.

---

## 🌐 Deploy na Vercel (produção)

O projeto usa o padrão clássico e mais confiável da Vercel: o app Express continua no `index.js` da raiz (usado localmente via `npm start`), o arquivo **`api/index.js`** o reexporta como Serverless Function e o `vercel.json` reescreve todos os caminhos para `/api`. Os arquivos de `public/` são servidos pelo CDN da Vercel.

> **Por que não zero-config?** A detecção automática de Express existe, mas em projetos já importados antes de existir essa função ela pode não disparar (o build fica "vazio" e só o estático sobe). O padrão `api/` funciona com qualquer preset de framework e é o caminho documentado pela Vercel.

**1. Envie o código ao GitHub** (o repositório conectado à Vercel é atualizado a cada `git push`).

**2. Na Vercel:** *Add New → Project* → importe o repositório `detetive-sql-corpdb`. Não configure Build Command nem Output Directory (o padrão já trata `api/` + `public/`).

**3. Cadastre as variáveis de ambiente** (*Settings → Environment Variables*) — o `.env` **não** é enviado pelo Git:

| Variável | Origem |
|---|---|
| `DATABASE_URL` | Neon → *Connection string* do endpoint **pooled** (`ep-xxx-pooler`) |
| `JWT_SECRET` | Gere um forte: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SENHA_PROFESSOR` | A senha mestra que você escolher para o painel do Game Master |

**4. Deploy.** Confira se `/api/ranking` responde JSON e `/` entrega a tela do jogo.

> **Se alguma rota `/api/*` retornar 404:** confirme que o `vercel.json` tem o `rewrites` apontando para `/api` e que existe um deployment novo no ar (`vercel ls`). A estrutura `api/index.js` + rewrite é o que garante que toda rota caia no Express.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado.
* Instância ativa do PostgreSQL (local ou nuvem Neon).

### Passo a Passo

**1. Clone o repositório:**
```bash
git clone https://github.com/heliomachado-dev/detetive-sql-corpdb.git
cd detetive-sql-corpdb
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Crie o arquivo `.env` na raiz:**
```env
DATABASE_URL=postgresql://usuario:senha@host/neondb?sslmode=require
JWT_SECRET=cole_uma_chave_forte_aqui
SENHA_PROFESSOR=diretoria2026
PORT=3000
```

**4. Plante a cena do crime (cria tabelas, views e dados do caso):**
```bash
npm run seed
```

**5. Suba o servidor:**
```bash
npm start
```

Acesse `http://localhost:3000`.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | Conexão com o PostgreSQL/Neon (SSL automático para URLs com `sslmode=require` ou `neon.tech`) |
| `JWT_SECRET` | ✅ | Segredo dos crachás digitais (JWT) das equipes |
| `SENHA_PROFESSOR` | opcional | Senha do painel do Game Master (padrão `diretoria2026` se ausente) |
| `PORT` | opcional | Porta local (padrão 3000) |

---

## 🕹️ Comandos do Projeto

| Comando | Função |
|---|---|
| `npm start` | Sobe o servidor local |
| `npm run dev` | Sobe com auto-reload (`node --watch`) |
| `npm run seed` | (Re)planta a cena do crime no banco |

---

## 🔐 Painel do Professor

Clique no cadeado no canto inferior direito da tela e informe a `SENHA_PROFESSOR` para listar e excluir equipes.
