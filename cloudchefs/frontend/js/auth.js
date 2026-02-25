// CHAVE PARA O LOCALSTORAGE (o usuário logado)
const LOGGED_USER_KEY = 'cloudchefs_logged_user';

// ESTRUTURA DE PERMISSÕES (Usada para checagem)
const PERMISSOES = {
    GERENTE: { // O 'admin' do banco
        nome: "Gerente",
        acessos: ["Início", "Relatórios", "Novo Pedido", "Colaboradores", "Financeiro", "Atualização de estoque"]
    },
    ATENDENTE: { // O 'colaborador' do banco
        nome: "Atendente",
        acessos: ["Início", "Novo Pedido", "Atualização de estoque"]
    }
};

/**
 * Exibe uma mensagem de notificação global (toast).
 */
function exibirMensagem(texto, tipo = 'alerta') {
    const container = document.getElementById('global-message-container');
    if (!container) return;

    const message = document.createElement('div');
    message.className = `toast-message ${tipo}`;

    let icone = '';
    switch (tipo) {
        case 'sucesso': icone = 'fa-check-circle'; break;
        case 'erro': icone = 'fa-times-circle'; break;
        case 'alerta': default: icone = 'fa-exclamation-triangle'; break;
    }

    message.innerHTML = `<i class="fas ${icone}"></i><span>${texto}</span>`;
    container.appendChild(message);

    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 500);
    }, 4500);
}

/**
 * Tenta fazer o login no BACKEND.
 */
async function fazerLogin() {
    const loginInput = document.getElementById('login-usuario');
    const senhaInput = document.getElementById('senha-usuario');

    const login = loginInput.value.trim();
    const senha = senhaInput.value.trim();

    if (login === "" || senha === "") {
        exibirMensagem("Login e Senha são obrigatórios.", "alerta");
        return;
    }

    try {
        // --- 🚀 CORREÇÃO APLICADA AQUI ---
        // 1. Caminho relativo (correto)
        // 2. Sintaxe do fetch() corrigida (aspas e parênteses)
        const resposta = await fetch("../backend/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: login, senha: senha })
        });
        // --- FIM DA CORREÇÃO ---

        const data = await resposta.json();

        if (data.success && data.usuario) {
            localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(data.usuario));
            window.location.href = 'monitoramento.html';
        } else {
            exibirMensagem(data.error || 'Usuário ou senha inválidos.', 'erro');
        }
    } catch (err) {
        console.error("Falha na conexão:", err);
        exibirMensagem("Falha ao comunicar com o servidor.", "erro");
    }
}

/**
 * Retorna o usuário logado do localStorage.
 */
function getUsuarioLogado() {
    const usuarioSalvo = localStorage.getItem(LOGGED_USER_KEY);
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
}

/**
 * Remove o usuário logado e redireciona para o login.
 */
function fazerLogout() {
    localStorage.removeItem(LOGGED_USER_KEY);
    window.location.href = 'login.html';
}

/**
 * Mapeia o 'tipo_usuario' (do banco) para o 'cargo' (do UI).
 */
function getCargoDoUsuario(tipo_usuario) {
    if (tipo_usuario === 'admin') {
        return 'GERENTE';
    }
    if (tipo_usuario === 'colaborador') {
        return 'ATENDENTE';
    }
    return null; // 'cliente' ou outros não têm cargo
}

/**
 * Verifica se o usuário logado tem permissão para acessar um recurso.
 */
function verificarPermissao(recurso) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        return false;
    }

    const cargo = getCargoDoUsuario(usuario.tipo_usuario);
    if (!cargo) {
        return false;
    }

    const permissaoUsuario = PERMISSOES[cargo];
    if (!permissaoUsuario) {
        return false;
    }

    return permissaoUsuario.acessos.includes(recurso);
}

/**
 * Verifica o acesso a uma página e redireciona se não houver permissão.
 * ESTA É A FUNÇÃO QUE FOI CORRIGIDA.
 */
function verificarAcessoPagina(nomePagina) {
    const usuario = getUsuarioLogado(); // Pega o usuário uma vez

    if (!usuario) {
        // 1. Se não está logado, vai para o login.
        window.location.href = 'login.html';
        return false;
    }

    if (!verificarPermissao(nomePagina)) {
        // 2. Se ESTÁ LOGADO, mas não tem permissão para esta página...
        exibirMensagem("Você não tem permissão para acessar esta página.", "erro");

        // 3. 🔥 LOGA O USUÁRIO (quebra o loop)
        localStorage.removeItem(LOGGED_USER_KEY);

        // 4. Manda para o login.
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
        return false;
    }

    return true; // 5. Se passou em tudo, permite o acesso.
}