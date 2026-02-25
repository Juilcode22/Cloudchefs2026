<?php
// ---- INÍCIO DO BLOCO DE CORREÇÃO CORS (Obrigatório) ----
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Cache-Control");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Permite POST, GET e OPTIONS
header("Content-Type: application/json; charset=utf-8");

// Responde ao "preflight"
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ---- FIM DO BLOCO DE CORREÇÃO CORS ----


// ---- O SEU CÓDIGO ANTIGO COMEÇA A PARTIR DAQUI ----
require 'connect.php';
// Opcional: Forçar exibição de erros
ini_set('display_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Nenhum dado recebido."]);
    exit();
}

// 🍔 MAPA DE DEDUÇÃO (RECEITAS)
// Baseado nos 9 ingredientes do seu banco de dados
$MAPA_DEDUCAO = [

    // --- LANCHES ---
    "Mega Stacker" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Carne Bovina", "qtd" => 0.2], // 200g
        ["nome" => "Queijo", "qtd" => 0.05],    // 50g
        ["nome" => "Bacon", "qtd" => 0.05],     // 50g
        ["nome" => "Alface", "qtd" => 0.03],    // 30g
        ["nome" => "Tomate", "qtd" => 0.02]     // 20g
    ],
    "Big Mac" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Carne Bovina", "qtd" => 0.2],
        ["nome" => "Queijo", "qtd" => 0.05],
        ["nome" => "Alface", "qtd" => 0.03]
    ],
    "Duplo Quarteirão" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Carne Bovina", "qtd" => 0.2],
        ["nome" => "Queijo", "qtd" => 0.1]
    ],
    "Duplo Burguer c/ Queijo" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Carne Bovina", "qtd" => 0.2],
        ["nome" => "Queijo", "qtd" => 0.05]
    ],
    "Duplo Burguer c/ Bacon" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Carne Bovina", "qtd" => 0.2],
        ["nome" => "Queijo", "qtd" => 0.05],
        ["nome" => "Bacon", "qtd" => 0.05]
    ],
    "Mc Chicken Duplo" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Frango", "qtd" => 0.15], // 150g
        ["nome" => "Alface", "qtd" => 0.02]
    ],
    "Cheeseburguer" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Carne Bovina", "qtd" => 0.1], // 100g
        ["nome" => "Queijo", "qtd" => 0.05],
        ["nome" => "Tomate", "qtd" => 0.02]
    ],
    "Mc Chicken Bacon" => [
        ["nome" => "Pão de Hambúrguer", "qtd" => 1],
        ["nome" => "Frango", "qtd" => 0.15],
        ["nome" => "Bacon", "qtd" => 0.05],
        ["nome" => "Alface", "qtd" => 0.02]
    ],

    // --- ACOMPANHAMENTOS ---
    "Batata Frita P" => [
        ["nome" => "Batata", "qtd" => 0.1] // 100g
    ],
    "Batata Frita M" => [
        ["nome" => "Batata", "qtd" => 0.15] // 150g
    ],
    "Batata Frita G" => [
        ["nome" => "Batata", "qtd" => 0.2] // 200g
    ],

    // --- BEBIDAS ---
    "Coca-Cola" => [
        ["nome" => "Refrigerante", "qtd" => 1] // Deduz 1 'un'
    ],
    "Guaraná" => [
        ["nome" => "Refrigerante", "qtd" => 1] // Deduz 1 'un'
    ],
    "Fanta Laranja" => [
        ["nome" => "Refrigerante", "qtd" => 1] // Deduz 1 'un'
    ]
];

$nome_cliente = $data['nome_cliente'] ?? '';
$produtos = $data['produtos'] ?? [];
$total = $data['total'] ?? 0;
$status = "Pendente";
$forma_pagamento = $data['forma_pagamento'] ?? '';

try {
    $db->beginTransaction();

    // 1. INSERIR PEDIDO PRINCIPAL (Tabela pedidos)
    $stmt = $db->prepare("
        INSERT INTO pedidos (nome_cliente, data_pedido, valor_total, status, forma_pagamento)
        VALUES (:nome_cliente, NOW(), :valor_total, :status, :forma_pagamento)
        RETURNING id_pedido
    ");
    $stmt->execute([
        ':nome_cliente' => $nome_cliente,
        ':valor_total' => $total,
        ':status' => $status,
        ':forma_pagamento' => $forma_pagamento
    ]);
    $id_pedido = $stmt->fetchColumn();

    // 2. INSERIR ITENS E DEDUZIR ESTOQUE
    $stmtItem = $db->prepare("
        INSERT INTO itens_pedido (id_pedido_fk, nome_produto, valor_unitario, quantidade)
        VALUES (:id_pedido, :nome_produto, :valor_unitario, :quantidade)
    ");

    // (Usa os nomes corretos da sua tabela: 'quantidade_atual' e 'nome_item')
    $stmtEstoque = $db->prepare("
        UPDATE estoque 
        SET quantidade_atual = quantidade_atual - :qtd_deduzir 
        WHERE nome_item = :nome_ingrediente 
        AND quantidade_atual >= :qtd_deduzir
    ");

    foreach ($produtos as $p) {
        $nome_produto = $p['nome'];
        $quantidade_pedido = $p['quantidade'];

        // A. Insere o item na tabela itens_pedido
        $stmtItem->execute([
            ':id_pedido' => $id_pedido,
            ':nome_produto' => $nome_produto,
            ':valor_unitario' => $p['preco'],
            ':quantidade' => $quantidade_pedido
        ]);

        // B. Verifica se o produto tem uma receita no Mapa de Dedução
        if (isset($MAPA_DEDUCAO[$nome_produto])) {
            $receita = $MAPA_DEDUCAO[$nome_produto];

            // C. Loop pelos ingredientes da receita
            foreach ($receita as $ingrediente) {
                $qtd_total_deduzir = $ingrediente['qtd'] * $quantidade_pedido;
                $nome_ingrediente = $ingrediente['nome'];

                // D. Executa a subtração no banco
                $stmtEstoque->execute([
                    ':qtd_deduzir' => $qtd_total_deduzir,
                    ':nome_ingrediente' => $nome_ingrediente
                ]);

                // E. Se a dedução falhar (rowCount=0), o estoque é insuficiente.
                if ($stmtEstoque->rowCount() === 0) {
                    throw new Exception("Estoque insuficiente para o ingrediente: $nome_ingrediente");
                }
            }
        }
    }

    // 3. SE TUDO DEU CERTO (Pedido e Deduções)
    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Pedido salvo e estoque deduzido com sucesso!",
        "id_pedido" => $id_pedido
    ]);
} catch (Exception $e) {
    $db->rollBack(); // Desfaz o pedido e todas as deduções

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>