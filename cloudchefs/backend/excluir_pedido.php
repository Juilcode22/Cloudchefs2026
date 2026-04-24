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

$data = json_decode(file_get_contents("php://input"), true);

$id_pedido = $data['id_pedido'] ?? null;

if (!$id_pedido) {
    echo json_encode(["success" => false, "error" => "ID do pedido não fornecido"]);
    exit();
}

try {
    $db->beginTransaction();

    // 1. Deleta os ITENS do pedido primeiro (para evitar erro de chave estrangeira)
    $stmtItens = $db->prepare("DELETE FROM itens_pedido WHERE id_pedido_fk = :id");
    $stmtItens->execute([':id' => $id_pedido]);

    // 2. Deleta o PEDIDO principal
    $stmtPedido = $db->prepare("DELETE FROM pedido WHERE id_pedido = :id");
    $stmtPedido->execute([':id' => $id_pedido]);

    $db->commit();
    
    echo json_encode(["success" => true, "message" => "Pedido $id_pedido excluído com sucesso"]);

} catch (Exception $e) {
    $db->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
