
// --- CONFIGURAÇÃO DE PRODUTOS E ESTOQUE ---
const DEDUCAO_ESTOQUE = {
    "Mega Stacker": [{ nome: "Pão", quantidade: 1 }, { nome: "Carne", quantidade: 2 }, { nome: "Bacon", quantidade: 1 }, { nome: "Alface", quantidade: 1 }, { nome: "Tomate", quantidade: 1 }],
    "Big Mac": [{ nome: "Pão", quantidade: 1 }, { nome: "Carne", quantidade: 2 }, { nome: "Alface", quantidade: 1 }, { nome: "Tomate", quantidade: 1 }],
    "Duplo Quarteirão": [{ nome: "Pão", quantidade: 1 }, { nome: "Carne", quantidade: 2 }, { nome: "Tomate", quantidade: 1 }],
    "Duplo Burguer c/ Queijo": [{ nome: "Pão", quantidade: 1 }, { nome: "Carne", quantidade: 2 }],
    "Duplo Burguer c/ Bacon": [{ nome: "Pão", quantidade: 1 }, { nome: "Carne", quantidade: 2 }, { nome: "Bacon", quantidade: 1 }],
    "Mc Chicken Duplo": [{ nome: "Pão", quantidade: 1 }, { nome: "Frango", quantidade: 2 }, { nome: "Alface", quantidade: 1 }],
    "Cheeseburguer": [{ nome: "Pão", quantidade: 1 }, { nome: "Carne", quantidade: 1 }],
    "Mc Chicken Bacon": [{ nome: "Pão", quantidade: 1 }, { nome: "Frango", quantidade: 1 }, { nome: "Alface", quantidade: 1 }, { nome: "Bacon", quantidade: 1 }],
    "Batata Frita P": [{ nome: "Batata", quantidade: 1 }],
    "Batata Frita M": [{ nome: "Batata", quantidade: 1 }],
    "Batata Frita G": [{ nome: "Batata", quantidade: 1 }],
    "Coca-Cola": [{ nome: "Coca-Cola", quantidade: 1 }],
    "Guaraná": [{ nome: "Guaraná", quantidade: 1 }],
    "Fanta Laranja": [{ nome: "Fanta Laranja", quantidade: 1 }]
};

const PRODUTOS = [
    "Mega Stacker", "Big Mac", "Duplo Quarteirão", "Duplo Burguer c/ Queijo",
    "Duplo Burguer c/ Bacon", "Mc Chicken Duplo", "Cheeseburguer", "Mc Chicken Bacon",
    "Batata Frita P", "Batata Frita M", "Batata Frita G",
    "Coca-Cola", "Guaraná", "Fanta Laranja"
];
const PRECOS = [28.90, 28.90, 32.50, 25.00, 30.50, 18.00, 22.00, 38.00, 9.00, 13.00, 17.00, 8.00, 8.00, 8.00];

const PEDIDOS_KEY = 'cloudchefs_pedidos';
const PEDIDO_COUNTER_KEY = 'cloudchefs_pedido_counter';

let quantidades = Array(PRODUTOS.length).fill(0);
let subtotal = 0;
let total = 0;
let formaPagamento = null;

// --- FUNÇÕES AUXILIARES ---

function getItemIcone(nomeItem) {
    if (nomeItem.match(/(Burguer|Mac|Queijo|Chicken|Quarteirão|Stacker)/)) return '🍔';
    if (nomeItem.includes('Batata')) return '🍟';
    if (nomeItem.match(/(Coca|Guaraná|Fanta)/)) return '🥤';
    return '🍽️';
}

function getProximoNumeroPedido() {
    let counter = parseInt(localStorage.getItem(PEDIDO_COUNTER_KEY) || 0);
    counter++;
    localStorage.setItem(PEDIDO_COUNTER_KEY, counter);
    return 'Nº' + counter.toString().padStart(5, '0');
}

function atualizarTotais() {
    subtotal = quantidades.reduce((sum, qtd, i) => sum + qtd * PRECOS[i], 0);
    total = subtotal;

    // ✅ Só atualiza se os elementos existirem na página
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");

    if (subtotalEl && totalEl) {
        subtotalEl.textContent = subtotal.toFixed(2).replace('.', ',');
        totalEl.textContent = total.toFixed(2).replace('.', ',');
    }
}

// --- FUNÇÕES DE INTERFACE ---

function aumentar(i) {
    quantidades[i]++;
    const qtdEl = document.getElementById(`qtd${i}`);
    if (qtdEl) qtdEl.textContent = quantidades[i];
    atualizarTotais();
}

function diminuir(i) {
    if (quantidades[i] > 0) {
        quantidades[i]--;
        const qtdEl = document.getElementById(`qtd${i}`);
        if (qtdEl) qtdEl.textContent = quantidades[i];
        atualizarTotais();
    }
}

function selecionarPagamento(forma) {
    formaPagamento = forma;
    document.querySelectorAll('.metodo-btn').forEach(btn => btn.classList.remove('selecionado'));
    const btnSel = document.querySelector(`.metodo-btn[data-forma='${forma}']`);
    if (btnSel) btnSel.classList.add('selecionado');
    const btnFinalizar = document.getElementById('btn-finalizar-pedido');
    if (btnFinalizar) btnFinalizar.disabled = false;
}

function finalizarPedido() {
    if (total === 0) return exibirMensagem("O pedido não pode estar vazio.", "alerta");
    if (!formaPagamento) return exibirMensagem("Selecione a forma de pagamento.", "alerta");

    const nome = document.getElementById('nome-cliente').value.trim();
    const itensPedido = PRODUTOS.map((p, i) => quantidades[i] > 0 ? { nome: p, quantidade: quantidades[i], icone: getItemIcone(p) } : null).filter(Boolean);

    const novoPedido = {
        nome_cliente: nome,
        total: total.toFixed(2),
        forma_pagamento: formaPagamento,
        produtos: itensPedido
    };

    console.log("📤 Enviando pedido:", novoPedido);

    // --- Envia para o backend ---
    fetch("http://localhost/cloudchefs/backend/salvar_pedido.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoPedido)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("✅ Pedido salvo no banco:", data);
                exibirMensagem("Pedido enviado com sucesso!", "sucesso");
                setTimeout(() => window.location.href = "monitoramento.html", 1500);
            } else {
                console.error("❌ Erro ao salvar pedido:", data.error);
                exibirMensagem("Erro ao salvar pedido.", "erro");
            }
        })
        .catch(err => {
            console.error("❌ Falha na conexão:", err);
            exibirMensagem("Falha ao comunicar com o servidor.", "erro");
        });
}

function proximaEtapa() {
    const nomeClienteInput = document.getElementById('nome-cliente');
    const nomeCliente = nomeClienteInput.value.trim();

    if (nomeCliente === "") {
        exibirMensagem("Por favor, insira o nome do cliente.", "alerta");
        return;
    }

    document.getElementById('nome-cliente-exibicao').textContent = nomeCliente;

    document.getElementById('etapa-cliente').classList.remove('ativa');
    document.getElementById('etapa-cardapio').classList.add('ativa');
}

function proximaEtapaPagamento() {
    if (total === 0) {
        exibirMensagem("Adicione itens ao pedido antes de avançar.", "alerta");
        return;
    }

    document.getElementById('etapa-cardapio').classList.remove('ativa');
    document.getElementById('etapa-pagamento').classList.add('ativa');

    const nomeCliente = document.getElementById('nome-cliente').value.trim();
    document.getElementById('nome-cliente-pagamento').textContent = nomeCliente;
    document.getElementById('total-pagamento').textContent = total.toFixed(2).replace('.', ',');

    formaPagamento = null;
    document.querySelectorAll('.metodo-btn').forEach(btn => btn.classList.remove('selecionado'));
    document.getElementById('btn-finalizar-pedido').disabled = true;
}

function mudarAba(categoria) {
    document.querySelectorAll('.produtos-container').forEach(container => {
        container.classList.remove('ativa');
    });

    const categoriaSelecionada = document.getElementById(`produtos-${categoria}`);
    if (categoriaSelecionada) categoriaSelecionada.classList.add('ativa');

    document.querySelectorAll('.aba-btn').forEach(btn => btn.classList.remove('ativa'));
    const btnAtivo = document.querySelector(`.aba-btn[data-categoria='${categoria}']`);
    if (btnAtivo) btnAtivo.classList.add('ativa');
}


// --- INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ pedidos.js carregado com sucesso");

    // Evita erro em páginas sem esses elementos
    if (document.getElementById("subtotal") && document.getElementById("total")) {
        atualizarTotais();
    }
});