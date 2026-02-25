/**
 * Carrega o estoque do BANCO DE DADOS.
 * @returns {Promise<Array>} Lista de itens de estoque.
 */
async function carregarEstoque() {
    try {
        // --- 🚀 CORREÇÃO APLICADA AQUI ---
        // Troca 'http://localhost/...' por '../backend/...'
        const resposta = await fetch("../backend/listar_estoque.php", {
            cache: "no-cache" // Garante que pegamos dados atualizados
        });
        if (!resposta.ok) {
            throw new Error("Falha ao buscar estoque do servidor.");
        }
        const estoque = await resposta.json();
        
        if (estoque.error) {
            throw new Error(estoque.error);
        }
        
        return Array.isArray(estoque) ? estoque : [];

    } catch (err) {
        console.error("Erro ao carregar estoque:", err);
        exibirMensagem(err.message, "erro");
        return []; // Retorna array vazio em caso de falha
    }
}

/**
 * Determina a classe de cor e o status com base na quantidade.
 */
function getClassificacaoEstoque(quantidade) {
    if (quantidade < 20) {
        return 'baixo'; // Vermelho
    } else if (quantidade <= 50) {
        return 'medio'; // Amarelo
    } else {
        return 'alto'; // Verde
    }
}