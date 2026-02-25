<?php
// ---- INÍCIO DO BLOCO DE CORREÇÃO CORS (Obrigatório) ----
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Cache-Control");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Permite GET
header("Content-Type: application/json; charset=utf-8");

// Responde ao "preflight"
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ---- FIM DO BLOCO DE CORREÇÃO CORS ----

require 'connect.php';

try {
    // Busca todos os itens do estoque ordenados por nome
    $stmt = $db->query("SELECT * FROM estoque ORDER BY nome_item ASC");
    $estoque = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($estoque);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>