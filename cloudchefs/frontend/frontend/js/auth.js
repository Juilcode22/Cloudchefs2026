const COLABORADORES_KEY = 'cloudchefs_colaboradores';
const LOGGED_USER_KEY = 'cloudchefs_logged_user';

// Estrutura de permissões: usada para controle de acesso
const PERMISSOES = {
    GERENTE: {
        nome: "Gerente",
        acessos: ["Início", "Relatórios", "Novo Pedido", "Colaboradores", "Financeiro", "Atualização de estoque"]
    },
    ATENDENTE: {
        nome: "Atendente",
        acessos: ["Início", "Novo Pedido", "Atualização de estoque"]
    }
};

/**
 * Exibe uma mensagem de notificação global (toast).
 * @param {string} texto O conteúdo da mensagem.
 * @param {string} tipo O tipo da mensagem ('sucesso', 'erro', 'alerta').
 */
function exibirMensagem(texto, tipo = 'alerta') {
    const container = document.getElementById('global-message-container');
    if (!container) return; // Não exibe se o container não existir

    const message = document.createElement('div');
    message.className = `toast-message ${tipo}`;
    
    let icone = '';
    switch (tipo) {
        case 'sucesso':
            icone = 'fa-check-circle';
            break;
        case 'erro':
            icone = 'fa-times-circle';
            break;
        case 'alerta':
        default:
            icone = 'fa-exclamation-triangle';
            break;
    }

    message.innerHTML = `<i class="fas ${icone}"></i><span>${texto}</span>`;
    container.appendChild(message);

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.marginTop = '-50px'; // Efeito de desvanecimento e subida
        setTimeout(() => message.remove(), 500); // Remove totalmente após a transição
    }, 4500);
}


/**
 * Carrega a lista de colaboradores ou cria o usuário inicial 'Admin:123'.
 */
function carregarColaboradores() {
    const colaboradoresSalvos = localStorage.getItem(COLABORADORES_KEY);
    
    if (colaboradoresSalvos) {
        return JSON.parse(colaboradoresSalvos);
    }
    
    // Usuário inicial Admin (Gerente)
    const colaboradoresIniciais = [{
        id: 1,
        nome: "Admin",
        senha: "123", 
        permissao: 'GERENTE'
    }];
    
    localStorage.setItem(COLABORADORES_KEY, JSON.stringify(colaboradoresIniciais));
    return colaboradoresIniciais;
}

/**
 * Salva a lista de colaboradores no localStorage.
 */
function salvarColaboradores(colaboradores) {
    localStorage.setItem(COLABORADORES_KEY, JSON.stringify(colaboradores));
}

/**
 * Tenta fazer o login com o nome e senha.
 */
function fazerLogin() {
    const nomeInput = document.getElementById('nome-usuario');
    const senhaInput = document.getElementById('senha-usuario');

    const nome = nomeInput.value.trim();
    const senha = senhaInput.value.trim();

    const colaboradores = carregarColaboradores();
    
    const usuario = colaboradores.find(c => c.nome.toUpperCase() === nome.toUpperCase() && c.senha === senha);

    if (usuario) {
        // Login bem-sucedido: Salva o usuário na sessão
        localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(usuario));
        window.location.href = 'monitoramento.html';
        return true;
    } else {
        // Login falhou
        exibirMensagem('Usuário ou senha inválidos.', 'erro');
        return false;
    }
}

/**
 * Retorna o usuário logado ou null.
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
 * Verifica se o usuário tem permissão para acessar um recurso.
 */
function verificarPermissao(recurso) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        return false;
    }

    const permissaoUsuario = PERMISSOES[usuario.permissao];
    if (!permissaoUsuario) {
        return false;
    }
    
    return permissaoUsuario.acessos.includes(recurso);
}

/**
 * Verifica o acesso a uma página e redireciona se não houver permissão.
 * @returns {boolean} True se o acesso for concedido, False caso contrário.
 */
function verificarAcessoPagina(nomePagina) {
    if (!getUsuarioLogado()) {
        window.location.href = 'login.html'; // Redireciona para login se não estiver logado
        return false;
    }
    
    if (!verificarPermissao(nomePagina)) {
        exibirMensagem("Você não tem permissão para acessar esta página.", "erro");
        // Dá um pequeno tempo para a mensagem aparecer antes de redirecionar
        setTimeout(() => {
            window.location.href = 'monitoramento.html'; // Redireciona para a página inicial
        }, 100); 
        return false;
    }
    
    return true; // Acesso concedido
}

// Garante que o usuário Admin exista
carregarColaboradores();