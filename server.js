// ==========================================
// SERVIDOR EDUCORE - SIMPLES
// ==========================================
// Este arquivo configura o servidor Express
// e o banco de dados SQLite

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Inicializar Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ==========================================
// BANCO DE DADOS
// ==========================================

// Conectar ao banco de dados SQLite
const dbPath = path.join(__dirname, 'database', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite');
    inicializarBancoDados();
  }
});

// Função para inicializar o banco de dados
function inicializarBancoDados() {
  // Criar tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('aluno', 'professor')),
      campus TEXT,
      cursos TEXT,
      foto_perfil TEXT,
      bio TEXT,
      tema_cores TEXT DEFAULT 'verde',
      privacidade TEXT DEFAULT 'publica',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela usuarios:', err);
    else console.log('✅ Tabela usuarios criada/verificada');
  });

  // Criar tabela de disciplinas
  db.run(`
    CREATE TABLE IF NOT EXISTS disciplinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      professor_id INTEGER NOT NULL,
      campus TEXT NOT NULL,
      curso TEXT NOT NULL,
      descricao TEXT,
      semestre TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(professor_id) REFERENCES usuarios(id)
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela disciplinas:', err);
    else console.log('✅ Tabela disciplinas criada/verificada');
  });

  // Criar tabela de materiais
  db.run(`
    CREATE TABLE IF NOT EXISTS materiais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disciplina_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('slide', 'apostila', 'exercicio', 'resumo')),
      arquivo_url TEXT,
      professor_id INTEGER NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(disciplina_id) REFERENCES disciplinas(id),
      FOREIGN KEY(professor_id) REFERENCES usuarios(id)
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela materiais:', err);
    else console.log('✅ Tabela materiais criada/verificada');
  });

  // Criar tabela de atividades
  db.run(`
    CREATE TABLE IF NOT EXISTS atividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disciplina_id INTEGER NOT NULL,
      professor_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data_entrega DATETIME,
      arquivo_url TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(disciplina_id) REFERENCES disciplinas(id),
      FOREIGN KEY(professor_id) REFERENCES usuarios(id)
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela atividades:', err);
    else console.log('✅ Tabela atividades criada/verificada');
  });

  // Criar tabela de notificações
  db.run(`
    CREATE TABLE IF NOT EXISTS notificacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      conteudo TEXT,
      lido INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela notificacoes:', err);
    else console.log('✅ Tabela notificacoes criada/verificada');
  });
}

// ==========================================
// ROTAS
// ==========================================

// Rota raiz - Servir landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Rota de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

// Rota de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'cadastro.html'));
});

app.get('/cadastro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'cadastro.html'));
});

// Rota de dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'dashboard.html'));
});

// ==========================================
// API - AUTENTICAÇÃO
// ==========================================

// POST /api/cadastro - Criar novo usuário
app.post('/api/cadastro', (req, res) => {
  const { nome, email, senha, tipo, campus, cursos } = req.body;

  // Validar dados
  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  // Validar email IFPR
  if (!email.endsWith('@ifpr.edu.br')) {
    return res.status(400).json({ erro: 'Use um email do IFPR (@ifpr.edu.br)' });
  }

  // Inserir no banco de dados
  db.run(
    `INSERT INTO usuarios (nome, email, senha, tipo, campus, cursos) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, email, senha, tipo, campus, cursos],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        return res.status(500).json({ erro: 'Erro ao cadastrar' });
      }
      res.json({ 
        sucesso: true, 
        mensagem: 'Cadastro realizado com sucesso!',
        usuario_id: this.lastID 
      });
    }
  );
});

// POST /api/login - Fazer login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha obrigatórios' });
  }

  db.get(
    `SELECT * FROM usuarios WHERE email = ? AND senha = ?`,
    [email, senha],
    (err, usuario) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao fazer login' });
      }

      if (!usuario) {
        return res.status(401).json({ erro: 'Email ou senha incorretos' });
      }

      // Sucesso - Retornar dados do usuário
      res.json({
        sucesso: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          campus: usuario.campus
        }
      });
    }
  );
});

// ==========================================
// API - DISCIPLINAS
// ==========================================

// GET /api/disciplinas - Listar todas as disciplinas
app.get('/api/disciplinas', (req, res) => {
  db.all(
    `SELECT * FROM disciplinas ORDER BY nome`,
    (err, disciplinas) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar disciplinas' });
      }
      res.json(disciplinas || []);
    }
  );
});

// GET /api/disciplinas/:id - Obter uma disciplina específica
app.get('/api/disciplinas/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM disciplinas WHERE id = ?`,
    [id],
    (err, disciplina) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar disciplina' });
      }

      if (!disciplina) {
        return res.status(404).json({ erro: 'Disciplina não encontrada' });
      }

      res.json(disciplina);
    }
  );
});

// POST /api/disciplinas - Criar nova disciplina (professor)
app.post('/api/disciplinas', (req, res) => {
  const { nome, professor_id, campus, curso, descricao, semestre } = req.body;

  if (!nome || !professor_id || !campus || !curso) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  db.run(
    `INSERT INTO disciplinas (nome, professor_id, campus, curso, descricao, semestre)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, professor_id, campus, curso, descricao, semestre],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao criar disciplina' });
      }
      res.json({
        sucesso: true,
        disciplina_id: this.lastID
      });
    }
  );
});

// ==========================================
// API - MATERIAIS
// ==========================================

// GET /api/materiais/:disciplina_id - Listar materiais de uma disciplina
app.get('/api/materiais/:disciplina_id', (req, res) => {
  const { disciplina_id } = req.params;

  db.all(
    `SELECT * FROM materiais WHERE disciplina_id = ? ORDER BY criado_em DESC`,
    [disciplina_id],
    (err, materiais) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar materiais' });
      }
      res.json(materiais || []);
    }
  );
});

// POST /api/materiais - Fazer upload de material
app.post('/api/materiais', (req, res) => {
  const { disciplina_id, titulo, tipo, arquivo_url, professor_id } = req.body;

  if (!disciplina_id || !titulo || !tipo || !professor_id) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  db.run(
    `INSERT INTO materiais (disciplina_id, titulo, tipo, arquivo_url, professor_id)
     VALUES (?, ?, ?, ?, ?)`,
    [disciplina_id, titulo, tipo, arquivo_url, professor_id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao fazer upload' });
      }
      res.json({
        sucesso: true,
        material_id: this.lastID
      });
    }
  );
});

// ==========================================
// API - ATIVIDADES
// ==========================================

// GET /api/atividades/:disciplina_id - Listar atividades de uma disciplina
app.get('/api/atividades/:disciplina_id', (req, res) => {
  const { disciplina_id } = req.params;

  db.all(
    `SELECT * FROM atividades WHERE disciplina_id = ? ORDER BY data_entrega`,
    [disciplina_id],
    (err, atividades) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar atividades' });
      }
      res.json(atividades || []);
    }
  );
});

// POST /api/atividades - Criar nova atividade
app.post('/api/atividades', (req, res) => {
  const { disciplina_id, professor_id, titulo, descricao, data_entrega } = req.body;

  if (!disciplina_id || !professor_id || !titulo) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  db.run(
    `INSERT INTO atividades (disciplina_id, professor_id, titulo, descricao, data_entrega)
     VALUES (?, ?, ?, ?, ?)`,
    [disciplina_id, professor_id, titulo, descricao, data_entrega],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao criar atividade' });
      }
      res.json({
        sucesso: true,
        atividade_id: this.lastID
      });
    }
  );
});

// ==========================================
// API - NOTIFICAÇÕES
// ==========================================

// GET /api/notificacoes/:usuario_id - Listar notificações
app.get('/api/notificacoes/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  db.all(
    `SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 10`,
    [usuario_id],
    (err, notificacoes) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar notificações' });
      }
      res.json(notificacoes || []);
    }
  );
});

// POST /api/notificacoes - Criar notificação
app.post('/api/notificacoes', (req, res) => {
  const { usuario_id, tipo, conteudo } = req.body;

  if (!usuario_id || !tipo) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  db.run(
    `INSERT INTO notificacoes (usuario_id, tipo, conteudo)
     VALUES (?, ?, ?)`,
    [usuario_id, tipo, conteudo],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao criar notificação' });
      }
      res.json({
        sucesso: true,
        notificacao_id: this.lastID
      });
    }
  );
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎓 EDUCORE - SERVIDOR INICIADO      ║
╚════════════════════════════════════════╝

📍 Acesse: http://localhost:${PORT}
📊 Banco de Dados: ${dbPath}

✅ Servidor rodando com sucesso!
  `);
});

// Fechar banco de dados ao encerrar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err);
    console.log('Banco de dados fechado');
    process.exit(0);
  });
});
