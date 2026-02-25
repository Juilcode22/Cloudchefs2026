// Dados de estoque inicial (nome, quantidade)
const ESTOQUE_INICIAL = [
    { nome: "Bacon", quantidade: 30 },
    { nome: "Carne", quantidade: 80 },
    { nome: "Frango", quantidade: 80 },
    { nome: "Tomate", quantidade: 80 },
    { nome: "Alface", quantidade: 80 },
    { nome: "Pão", quantidade: 80 },
    { nome: "Batata", quantidade: 80 },
    { nome: "Coca-Cola", quantidade: 50 },
    { nome: "Guaraná", quantidade: 50 },
    { nome: "Fanta Laranja", quantidade: 50 }
];

const ESTOQUE_KEY = 'cloudchefs_estoque';

/**
 * Carrega o estoque do localStorage ou usa o estoque inicial.
 * @returns {Array} Lista de itens de estoque.
 */
function carregarEstoque() {
    const estoqueSalvo = localStorage.getItem(ESTOQUE_KEY);
    if (estoqueSalvo) {
        return JSON.parse(estoqueSalvo);
    }
    // Salva o estoque inicial se for a primeira vez
    salvarEstoque(ESTOQUE_INICIAL);
    return ESTOQUE_INICIAL;
}

/**
 * Salva o estoque no localStorage.
 * @param {Array} estoque Lista atualizada de itens de estoque.
 */
function salvarEstoque(estoque) {
    localStorage.setItem(ESTOQUE_KEY, JSON.stringify(estoque));
}

/**
 * Deduz a quantidade de um ou mais ingredientes do estoque, com checagem de disponibilidade.
 * @param {Object[]} ingredientesDeducao Array de objetos {nome: string, quantidade: number}.
 * @returns {boolean} True se a dedução foi bem-sucedida, False se houve falta de estoque.
 */
function deduzirEstoquePedido(ingredientesDeducao) {
    let estoque = carregarEstoque();
    let estoqueTemporario = JSON.parse(JSON.stringify(estoque)); // Clonar para verificar a disponibilidade

    // 1. Verificar disponibilidade
    for (const deducao of ingredientesDeducao) {
        const itemEstoque = estoqueTemporario.find(i => i.nome === deducao.nome);
        if (!itemEstoque) {
            console.error(`Ingrediente ${deducao.nome} não encontrado no estoque.`);
            return false;
        }
        if (itemEstoque.quantidade < deducao.quantidade) {
            // Se o estoque temporário for insuficiente, retorna false e impede a dedução
            return false;
        }
        // Deduz do temporário para que o estoque real seja testado em múltiplos itens do pedido
        itemEstoque.quantidade -= deducao.quantidade;
    }

    // 2. Aplicar a dedução no estoque real e salvar
    for (const deducao of ingredientesDeducao) {
        const itemEstoque = estoque.find(i => i.nome === deducao.nome);
        if (itemEstoque) {
            itemEstoque.quantidade -= deducao.quantidade;
        }
    }
    
    salvarEstoque(estoque);
    return true;
}

/**
 * Determina a classe de cor e o status com base na quantidade.
 * @param {number} quantidade
 * @returns {string} Classe CSS ('baixo', 'medio', 'alto')
 */
function getClassificacaoEstoque(quantidade) {
    if (quantidade < 20) {
        return 'baixo'; // Vermelho: abaixo de 20
    } else if (quantidade <= 50) {
        return 'medio'; // Amarelo: entre 20 e 50
    } else {
        return 'alto'; // Verde: acima de 50
    }
}