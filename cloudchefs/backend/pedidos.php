<?php
require 'connect.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$data = json_decode(file_get_contents("php://input"), true);

$nome_cliente = $data['nome_cliente'] ?? null;
$total = $data['total'] ?? 0;
$status = "Pendente";
$produtos = $data['produtos'] ?? [];
$forma_pagamento = $data['forma_pagamento'] ?? "Não informado";

try {
    $db->beginTransaction();

    // Inserir o pedido
    $stmt = $db->prepare("
        INSERT INTO pedido (nome_cliente, data_pedido, valor_total, status, forma_pagamento)
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

    // Inserir itens
    $stmtItem = $db->prepare("
        INSERT INTO itens_pedido (id_pedido_fk, nome_produto, preco_unitario, quantidade)
        VALUES (:id_pedido, :nome_produto, :preco_unitario, :quantidade)
    ");

    foreach ($produtos as $p) {
        $stmtItem->execute([
            ':id_pedido' => $id_pedido,
            ':nome_produto' => $p['nome'],
            ':preco_unitario' => $p['preco'],
            ':quantidade' => $p['quantidade']
        ]);
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Pedido salvo com sucesso!",
        "id_pedido" => $id_pedido
    ]);
} catch (Exception $e) {
    $db->rollBack();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>