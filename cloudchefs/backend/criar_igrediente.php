<?php
// ---- 1. FORÇAR EXIBIÇÃO DE ERROS E ENVIAR CABEÇALHOS ----
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control');
header('Content-Type: application/json; charset=utf-8');

// ---- 2. RESPONDER AO PREFLIGHT (OPTIONS) ----
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(); // Sai com sucesso
}

// ---- 3. SE FOR UM POST, ENVIAR UM SUCESSO FALSO ----
// (Nós removemos o 'require connect.php' e toda a lógica do banco)
echo json_encode([
    "success" => true, 
    "message" => "TESTE DE CORS BEM-SUCEDIDO"
]);
?>