/* ==========================================
   EDUCORE - AUTENTICAÇÃO
   ========================================== */

// ==========================================
// CADASTRO
// ==========================================

const cadastroForm = document.getElementById('cadastroForm');

if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const tipo = document.getElementById('tipo').value;
        const campus = document.getElementById('campus').value;

        // Validar email IFPR
        if (!email.endsWith('@ifpr.edu.br')) {
            mostrarMensagem('Use um email do IFPR (@ifpr.edu.br)', 'error');
            return;
        }

        // Validar campos
        if (!nome || !email || !senha || !tipo || !campus) {
            mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        try {
            const response = await fetch('/api/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    tipo,
                    campus,
                })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarMensagem('Cadastro realizado com sucesso! Redirecionando...', 'success');
                
                // Salvar dados do usuário
                localStorage.setItem('usuario', JSON.stringify({
                    id: data.usuario_id,
                    nome,
                    email,
                    tipo,
                    campus
                }));

                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                mostrarMensagem(data.erro || 'Erro ao cadastrar', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao conectar com o servidor', 'error');
        }
    });
}

// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        localStorage.setItem('usuario', JSON.stringify({
            id: 0,
            nome: 'Visitante EduCore',
            email: 'visitante@ifpr.edu.br',
            tipo: 'aluno',
            campus: 'Curitiba'
        }));
        window.location.href = 'dashboard.html';
    });
}

// ==========================================
// MOSTRAR MENSAGEM
// ==========================================

function mostrarMensagem(texto, tipo) {
    const messageDiv = document.getElementById('message');
    
    if (messageDiv) {
        messageDiv.textContent = texto;
        messageDiv.className = `auth-message ${tipo}`;
        
        // Remover mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.className = 'auth-message';
        }, 5000);
    }
}

// ==========================================
// VERIFICAR AUTENTICAÇÃO NO LOGIN/CADASTRO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');
    
    // Se já está autenticado e tenta acessar login/cadastro
    if (usuario && (window.location.pathname === '/login' || window.location.pathname === '/cadastro' || window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/cadastro.html'))) {
        window.location.href = 'dashboard.html';
    }
});

// ==========================================
// CONSOLE LOG
// ==========================================

console.log('%c✅ Autenticação carregada', 'color: #10b981;');
