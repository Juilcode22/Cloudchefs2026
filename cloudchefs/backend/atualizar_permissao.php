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

$id_usuario = $data['id_usuario'] ?? null;
$tipo_usuario = $data['tipo_usuario'] ?? null; // 'admin' ou 'colaborador'

if (!$id_usuario || !$tipo_usuario) {
    echo json_encode(["success" => false, "error" => "ID e Tipo são obrigatórios"]);
    exit();
}

try {
    $stmt = $db->prepare("UPDATE usuario SET tipo_usuario = :tipo WHERE id_usuario = :id");
    $stmt->execute([':tipo' => $tipo_usuario, ':id' => $id_usuario]);
    
    echo json_encode(["success" => true, "message" => "Permissão atualizada"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>