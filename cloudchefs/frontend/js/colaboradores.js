/*
============================================================
== ARQUIVO FINAL E SEGURO - PASSO 2 ==
== USE ESTE CÓDIGO APÓS CRIAR SEU ADMIN ==
============================================================
*/

/**
 * Renderiza a tabela de colaboradores vinda do BANCO.
 */
function renderizarTabela(colaboradores) {
    const tabelaBody = document.getElementById('tabela-body');
    tabelaBody.innerHTML = '';
    
    const usuarioLogado = getUsuarioLogado(); 
    const podeAlterar = usuarioLogado && usuarioLogado.tipo_usuario === 'admin';

    colaboradores.forEach(colaborador => {
        if (colaborador.tipo_usuario === 'cliente') {
            return;
        }

        const row = tabelaBody.insertRow();
        row.insertCell().textContent = colaborador.nome;
        
        const cellSenha = row.insertCell();
        cellSenha.className = 'senha-celula';
        cellSenha.innerHTML = `<span>******</span>`;

        const cellPermissao = row.insertCell();
        const select = document.createElement('select');
        select.className = 'role-select';
        
        const cargo = getCargoDoUsuario(colaborador.tipo_usuario); // auth.js
        
        let optionGerente = document.createElement('option');
        optionGerente.value = 'admin'; // O valor é o do BANCO
        optionGerente.textContent = PERMISSOES.GERENTE.nome;
        select.appendChild(optionGerente);

        let optionAtendente = document.createElement('option');
        optionAtendente.value = 'colaborador'; // O valor é o do BANCO
        optionAtendente.textContent = PERMISSOES.ATENDENTE.nome;
        select.appendChild(optionAtendente);
        
        select.value = colaborador.tipo_usuario;
        // Este 'onchange' é seguro, pois é criado dinamicamente
        select.onchange = (e) => atualizarPermissao(colaborador.id_usuario, e.target.value);
        select.disabled = !podeAlterar;
        cellPermissao.appendChild(select);

        const cellAcessos = row.insertCell();
        const permissoesObj = PERMISSOES[cargo];
        cellAcessos.textContent = permissoesObj ? permissoesObj.acessos.join(', ') : 'N/A';
    });
}

/**
 * Atualiza a permissão de um colaborador no BANCO.
 */
async function atualizarPermissao(id_usuario, novo_tipo_usuario) {
    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== 'admin') {
        exibirMensagem("Você não tem permissão para alterar permissões.", "erro");
        return;
    }

    try {
        const resposta = await fetch("../backend/atualizar_permissao.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id_usuario: id_usuario, 
                tipo_usuario: novo_tipo_usuario 
            })
        });
        const data = await resposta.json();

        if (data.success) {
            exibirMensagem("Permissão atualizada com sucesso!", "sucesso");
            carregarColaboradoresPagina(); 
        } else {
            exibirMensagem(`Erro: ${data.error}`, "erro");
        }
    } catch (err) {
        exibirMensagem("Falha na conexão ao atualizar permissão.", "erro");
    }
}

/**
 * Cadastra um novo colaborador no BANCO.
 */
async function cadastrarColaborador() {
    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.tipo_usuario !== 'admin') {
        exibirMensagem('Acesso negado. Apenas Gerentes podem cadastrar.', 'erro');
        return;
    }

    const nomeInput = document.getElementById('nome');
    const loginInput = document.getElementById('login'); // Novo campo
    const senhaInput = document.getElementById('senha');
    
    const nome = nomeInput.value.trim();
    const login = loginInput.value.trim();
    const senha = senhaInput.value.trim();

    if (nome === "" || login === "" || senha === "") {
        exibirMensagem('Nome, Login e Senha são obrigatórios.', 'alerta');
        return;
    }
    
    if (senha.length < 4) {
        exibirMensagem('A senha deve ter no mínimo 4 caracteres.', 'alerta');
        return;
    }
    
    try {
        const resposta = await fetch("http://localhost/cloudchefs/backend/usuarios.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                nome: nome, 
                login: login, 
                senha: senha,
                tipo_usuario: 'colaborador' // Padrão é criar como Atendente
            })
        });
        const data = await resposta.json();

        if (data.success) {
            exibirMensagem(`Colaborador ${nome} cadastrado como ATENDENTE!`, 'sucesso');
            nomeInput.value = '';
            loginInput.value = '';
            senhaInput.value = '';
            carregarColaboradoresPagina(); // Recarrega a tabela
        } else {
            exibirMensagem(`Erro ao cadastrar: ${data.error}`, 'erro');
        }
    } catch (err) {
        exibirMensagem("Falha na conexão ao cadastrar.", "erro");
    }
}

/**
 * Alterna a visibilidade da senha no campo de CADASTRO.
 */
function toggleSenhaInput() {
    const senhaInput = document.getElementById('senha');
    const eyeIcon = document.getElementById('eye-icon-cadastro');
    
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        senhaInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

/**
 * Função principal: carrega os dados do banco e renderiza a tabela.
 */
async function carregarColaboradoresPagina() {
    // A verificação de acesso já acontece aqui (vinda do auth.js)
    if (!verificarAcessoPagina('Colaboradores')) { 
        return; // Sai se não tiver permissão
    }
    
    try {
        const resposta = await fetch("../backend/usuarios.php");
        const colaboradores = await resposta.json();
        
        if (Array.isArray(colaboradores)) {
            renderizarTabela(colaboradores);
        } else {
            exibirMensagem("Erro ao carregar lista de colaboradores.", "erro");
        }
    } catch (err) {
        exibirMensagem("Falha ao buscar usuários no servidor.", "erro");
    }
}


// --- 🚀 Ponto de Entrada Principal ---
document.addEventListener("DOMContentLoaded", () => {
    
    const btnCadastrar = document.getElementById('btn-cadastrar');
    if (btnCadastrar) {
        btnCadastrar.onclick = cadastrarColaborador;
    }

    const btnToggleSenha = document.getElementById('btn-toggle-senha');
    if (btnToggleSenha) {
        btnToggleSenha.onclick = toggleSenhaInput;
    }

    // Chama a função principal para carregar a tabela
    carregarColaboradoresPagina();
});