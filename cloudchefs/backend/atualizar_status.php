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

// Pega os dados enviados pelo JavaScript
$data = json_decode(file_get_contents("php://input"), true);

$id_pedido = $data['id_pedido'] ?? null;
$novo_status = $data['novo_status'] ?? null;

if (!$id_pedido || !$novo_status) {
    echo json_encode(["success" => false, "error" => "Dados incompletos (id ou status faltando)"]);
    exit();
}

try {
    // Atualiza o status do pedido no banco
    $stmt = $db->prepare("UPDATE pedidos SET status = :status WHERE id_pedido = :id");
    $stmt->execute([':status' => $novo_status, ':id' => $id_pedido]);
    
    echo json_encode(["success" => true, "message" => "Status atualizado com sucesso"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>