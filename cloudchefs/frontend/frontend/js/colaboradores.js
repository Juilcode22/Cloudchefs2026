// ATENÇÃO: A variável COLABORADORES_KEY e outras globais (PERMISSOES, getUsuarioLogado, verificarAcessoPagina, etc.)
// JÁ ESTÃO DEFINIDAS em auth.js e SÃO USADAS AQUI.

/**
 * Renderiza a tabela de colaboradores na tela.
 */
function renderizarTabela(colaboradores) {
    const tabelaBody = document.getElementById('tabela-body');
    tabelaBody.innerHTML = '';
    
    // As funções e variáveis de auth.js (getUsuarioLogado, PERMISSOES, carregarColaboradores, etc.)
    // são acessíveis aqui porque auth.js foi carregado primeiro.
    const usuarioLogado = getUsuarioLogado(); 
    const podeVerSenha = usuarioLogado && usuarioLogado.permissao === 'GERENTE';

    colaboradores.forEach(colaborador => {
        const row = tabelaBody.insertRow();
        
        // Coluna 1: Nome
        row.insertCell().textContent = colaborador.nome;
        
        // Coluna 2: Senha (com toggle)
        const cellSenha = row.insertCell();
        cellSenha.className = 'senha-celula';
        
        const spanSenha = document.createElement('span');
        spanSenha.id = `senha-${colaborador.id}`;
        spanSenha.textContent = '******'; // Senha mascarada por padrão
        cellSenha.appendChild(spanSenha);

        if (podeVerSenha) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-senha-tabela';
            toggleBtn.innerHTML = `<i id="eye-icon-tabela-${colaborador.id}" class="fas fa-eye"></i>`;
            toggleBtn.onclick = () => toggleSenhaTabela(colaborador.id, colaborador.senha);
            cellSenha.appendChild(toggleBtn);
        }

        // Coluna 3: Permissão (Select)
        const cellPermissao = row.insertCell();
        const select = document.createElement('select');
        select.className = 'role-select';
        select.setAttribute('data-id', colaborador.id);
        
        // Opção Gerente
        let optionGerente = document.createElement('option');
        optionGerente.value = 'GERENTE';
        optionGerente.textContent = PERMISSOES.GERENTE.nome;
        select.appendChild(optionGerente);

        // Opção Atendente
        let optionAtendente = document.createElement('option');
        optionAtendente.value = 'ATENDENTE';
        optionAtendente.textContent = PERMISSOES.ATENDENTE.nome;
        select.appendChild(optionAtendente);
        
        select.value = colaborador.permissao;
        select.onchange = (e) => atualizarPermissao(colaborador.id, e.target.value);
        
        // Desabilitar select se o usuário logado não for Gerente
        if (!podeVerSenha) {
            select.disabled = true;
        }

        cellPermissao.appendChild(select);

        // Coluna 4: Acessos
        const cellAcessos = row.insertCell();
        const permissoesObj = PERMISSOES[colaborador.permissao] || PERMISSOES.ATENDENTE;
        cellAcessos.textContent = permissoesObj.acessos.join(', ');
    });
}

/**
 * Atualiza a permissão de um colaborador e renderiza a tabela novamente.
 * Restrito a Gerentes.
 */
function atualizarPermissao(id, novaPermissao) {
    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.permissao !== 'GERENTE') {
        exibirMensagem("Você não tem permissão para alterar permissões de colaboradores.", "erro");
        return;
    }

    let colaboradores = carregarColaboradores();
    const index = colaboradores.findIndex(c => c.id === id);
    
    if (index !== -1) {
        colaboradores[index].permissao = novaPermissao;
        salvarColaboradores(colaboradores);
        renderizarTabela(colaboradores);
        exibirMensagem(`Permissão de ${colaboradores[index].nome} alterada para ${PERMISSOES[novaPermissao].nome}.`, "sucesso");
    }
}

/**
 * Cadastra um novo colaborador com permissão inicial de ATENDENTE.
 * Restrito a Gerentes.
 */
function cadastrarColaborador() {
    const usuarioLogado = getUsuarioLogado();

    // 2. Verifica Permissão
    if (!usuarioLogado || usuarioLogado.permissao !== 'GERENTE') {
        exibirMensagem('Acesso negado. Apenas Gerentes podem cadastrar colaboradores.', 'erro');
        return;
    }

    const nomeInput = document.getElementById('nome');
    const senhaInput = document.getElementById('senha');
    
    const nome = nomeInput.value.trim();
    const senha = senhaInput.value.trim();

    // 3. Validação
    if (nome === "" || senha === "") {
        exibirMensagem('Nome e Senha são obrigatórios.', 'alerta');
        return;
    }
    
    if (senha.length < 4) {
        exibirMensagem('A senha deve ter no mínimo 4 caracteres.', 'alerta');
        return;
    }
    
    // 4. Cria e salva
    let colaboradores = carregarColaboradores();
    
    const novoColaborador = {
        id: Date.now(), 
        nome: nome,
        senha: senha,
        permissao: 'ATENDENTE'
    };
    
    colaboradores.push(novoColaborador);
    salvarColaboradores(colaboradores);

    // 5. Renderiza a tabela e exibe sucesso
    renderizarTabela(colaboradores); 
    
    nomeInput.value = '';
    senhaInput.value = '';
    
    exibirMensagem(`Colaborador ${nome} cadastrado como ATENDENTE!`, 'sucesso');
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
 * Alterna a visibilidade da senha na TABELA de colaboradores.
 * Restrito a Gerentes.
 */
function toggleSenhaTabela(id, senhaReal) {
    const usuarioLogado = getUsuarioLogado();
    if (!usuarioLogado || usuarioLogado.permissao !== 'GERENTE') {
        exibirMensagem("Você não tem permissão para visualizar senhas de colaboradores.", "erro");
        return;
    }

    const spanSenha = document.getElementById(`senha-${id}`);
    const eyeIcon = document.getElementById(`eye-icon-tabela-${id}`);
    
    if (spanSenha.textContent === '******') {
        spanSenha.textContent = senhaReal;
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        spanSenha.textContent = '******';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// CORREÇÃO: Esta função deve ser globalmente acessível
function carregarColaboradoresPagina() {
    // Renderiza a tabela APENAS se o acesso for concedido
    if (verificarAcessoPagina('Colaboradores')) { 
        renderizarTabela(carregarColaboradores());
    }
}