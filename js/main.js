/* ==========================================
   EDUCORE - JAVASCRIPT PRINCIPAL
   ========================================== */

// ==========================================
// TEMA (MODO ESCURO/CLARO)
// ==========================================

const themeToggle = document.getElementById('themeToggle');

// Verificar tema salvo no localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcon();
}

// Adicionar evento de clique ao botão de tema
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Salvar preferência
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
        
        updateThemeIcon();
    });
}

// Atualizar ícone do tema
function updateThemeIcon() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (themeToggle) {
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

// ==========================================
// SCROLL SUAVE
// ==========================================

function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================
// DASHBOARD
// ==========================================

function showSection(sectionId) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar seção selecionada
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Atualizar nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Marcar nav item como ativo
    const activeItem = document.querySelector(`.nav-item[onclick*="'${sectionId}'"]`);
    if (activeItem) activeItem.classList.add('active');

    // Prevenir comportamento padrão
    event.preventDefault();
}

// ==========================================
// LOGOUT
// ==========================================

function logout() {
    // Limpar localStorage
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    
    // Redirecionar para home
    window.location.href = '/';
}

// ==========================================
// VERIFICAR AUTENTICAÇÃO
// ==========================================

function verificarAutenticacao() {
    const usuario = localStorage.getItem('usuario');
    
    // Se está na página de dashboard e não está autenticado
    if ((window.location.pathname === '/dashboard' || window.location.pathname.endsWith('/dashboard.html')) && !usuario) {
        window.location.href = 'login.html';
    }
}

// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', verificarAutenticacao);

// ==========================================
// CARREGAR DADOS DO DASHBOARD
// ==========================================

function carregarDadosDashboard() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const exemplos = {
        disciplinas: [
            { id: 1, nome: 'Programação Web', campus: 'Curitiba', curso: 'Informática', descricao: 'HTML, CSS, JavaScript e desenvolvimento de aplicações.' },
            { id: 2, nome: 'Banco de Dados', campus: 'Curitiba', curso: 'Informática', descricao: 'Modelagem, SQL e organização de dados.' },
            { id: 3, nome: 'Matemática Aplicada', campus: 'Curitiba', curso: 'Informática', descricao: 'Fundamentos matemáticos para tecnologia.' }
        ],
        atividades: [
            { titulo: 'Projeto de página responsiva', descricao: 'Entrega até sexta-feira', disciplina: 'Programação Web' },
            { titulo: 'Lista de exercícios SQL', descricao: '10 questões para praticar consultas', disciplina: 'Banco de Dados' }
        ],
        materiais: [
            { titulo: 'Guia de JavaScript', tipo: 'Apostila', disciplina: 'Programação Web' },
            { titulo: 'Introdução ao SQL', tipo: 'Resumo', disciplina: 'Banco de Dados' },
            { titulo: 'Exercícios de revisão', tipo: 'Exercício', disciplina: 'Matemática Aplicada' }
        ],
        notificacoes: ['Novo material em Programação Web', 'Atividade com prazo nesta semana', 'Você recebeu um comentário no fórum']
    };

    const renderDisciplinas = disciplinas => {
        document.getElementById('disciplinas-count').textContent = `${disciplinas.length} disciplinas`;
        document.getElementById('disciplinas-list').innerHTML = disciplinas.map(d => `
            <div class="dashboard-card"><h3>${d.nome}</h3><p>${d.campus} - ${d.curso}</p><p>${d.descricao || 'Sem descrição'}</p></div>
        `).join('');
    };
    const renderAtividades = atividades => {
        document.getElementById('atividades-count').textContent = `${atividades.length} atividades`;
        document.getElementById('atividades-list').innerHTML = atividades.map(a => `
            <div class="dashboard-card"><h3>${a.titulo}</h3><p>${a.disciplina}</p><p>${a.descricao || 'Atividade acadêmica'}</p></div>
        `).join('');
    };

    renderDisciplinas(exemplos.disciplinas);
    renderAtividades(exemplos.atividades);
    document.getElementById('notificacoes-count').textContent = `${exemplos.notificacoes.length} notificações`;
    document.getElementById('materiais-list').innerHTML = exemplos.materiais.map(m => `
        <div class="dashboard-card"><h3>${m.titulo}</h3><p>${m.tipo} • ${m.disciplina}</p><button class="btn btn-secondary">Abrir material</button></div>
    `).join('');
    document.getElementById('forum-list').innerHTML = '<div class="dashboard-card"><h3>Como organizar os estudos?</h3><p>8 respostas • Última atividade hoje</p></div><div class="dashboard-card"><h3>Dicas para o projeto final</h3><p>5 respostas • Última atividade ontem</p></div>';
    document.getElementById('perfil-info').innerHTML = `<h3>${usuario.nome || 'Estudante EduCore'}</h3><p>${usuario.email || 'estudante@ifpr.edu.br'}</p><p>${usuario.campus || 'Campus Curitiba'} • ${usuario.tipo || 'Aluno'}</p><button class="btn btn-primary">Editar perfil</button>`;

    fetch('/api/disciplinas')
        .then(res => res.ok ? res.json() : Promise.reject(new Error('API indisponível')))
        .then(disciplinas => { if (disciplinas.length) renderDisciplinas(disciplinas); })
        .catch(() => {});
    fetch('/api/atividades/1')
        .then(res => res.ok ? res.json() : Promise.reject(new Error('API indisponível')))
        .then(atividades => { if (atividades.length) renderAtividades(atividades); })
        .catch(() => {});
    if (usuario.id) {
        fetch(`/api/notificacoes/${usuario.id}`)
            .then(res => res.ok ? res.json() : Promise.reject(new Error('API indisponível')))
            .then(notificacoes => { if (notificacoes.length) document.getElementById('notificacoes-count').textContent = `${notificacoes.length} notificações`; })
            .catch(() => {});
    }
}

// Carregar dados ao entrar no dashboard
if (document.getElementById('disciplinas-count')) {
    document.addEventListener('DOMContentLoaded', carregarDadosDashboard);
}

// ==========================================
// ANIMAÇÕES
// ==========================================

// Observador para animações de scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

// Animar cards ao entrar na viewport
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.feature-card, .benefit-card, .feature-box');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
});

// ==========================================
// VALIDAÇÃO DE FORMULÁRIOS
// ==========================================

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarEmailIFPR(email) {
    return email.endsWith('@ifpr.edu.br');
}

// ==========================================
// CONSOLE LOG
// ==========================================

console.log('%c🎓 EduCore iniciado com sucesso!', 'color: #10b981; font-size: 16px; font-weight: bold;');
console.log('%cVersão: 1.0.0', 'color: #10b981;');
console.log('%cTema: Verde e Branco com Modo Escuro', 'color: #10b981;');
