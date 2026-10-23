<div align="center">

# 🕵️‍♂️ Detetive SQL // Operação CorpDB

**[🔴 CLIQUE AQUI PARA ACESSAR O SISTEMA AO VIVO NA NUVEM](https://SEU-LINK-DA-VERCEL.vercel.app)**

Um ambiente interativo de *Escape Room* desenvolvido para o ensino prático de Bancos de Dados, SQL e Cálculo Relacional, inspirado nos conceitos do Capítulo 8 da obra de C. J. Date.

</div>

<br>

## 📸 Telas da Aplicação

<div align="center">
  <img src="./tela-login.jpg" alt="Tela de credenciamento das equipes e briefing da Operação" width="100%">
  <br>
  <i>Tela de credenciamento das equipes e briefing da Operação.</i>
  <br><br>
  <img src="./tela-painel.jpg" alt="Terminal investigativo com conexão real ao banco, dicionário de dados interativo e Cofre Mestre" width="100%">
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
* **Vercel:** Hospedagem em nuvem configurada para execução sob demanda e alta disponibilidade.
* **JWT (JSON Web Token):** Autenticação de equipes, rastreamento de progresso e proteção do Painel de Administrador (Game Master) oculto.
* **Transações Read-Only:** O motor do jogo utiliza uma *Sandbox* SQL executando comandos de alunos dentro de uma transação `BEGIN TRANSACTION READ ONLY`, bloqueando tentativas de injeção destrutiva (`DROP`, `DELETE`).

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

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado.
* Instância ativa do PostgreSQL (local ou nuvem).

### Passo a Passo

**1. Clone o repositório:**
```bash
git clone [https://github.com/heliomachado-dev/detetive-sql-corpdb.git](https://github.com/heliomachado-dev/detetive-sql-corpdb.git)