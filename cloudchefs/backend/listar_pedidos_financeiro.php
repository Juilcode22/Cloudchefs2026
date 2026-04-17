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

// Pega os filtros (ou define como nulos se não existirem)
$formaPagamento = $data['forma_pagamento'] ?? null;
$dataInicio = $data['data_inicio'] ?? null;
$dataFim = $data['data_fim'] ?? null;

// Base da Query
$query = "SELECT 
            id_pedido, 
            forma_pagamento, 
            data_pedido, 
            nome_cliente, 
            valor_total 
          FROM pedidos 
          WHERE 1=1"; // 'WHERE 1=1' é um truque para facilitar adicionar filtros

$params = [];

// Adiciona os filtros dinamicamente
if (!empty($formaPagamento)) {
    $query .= " AND forma_pagamento = :forma";
    $params[':forma'] = $formaPagamento;
}
if (!empty($dataInicio)) {
    // Adiciona T00:00:00 para pegar desde o início do dia
    $query .= " AND data_pedido >= :inicio";
    $params[':inicio'] = $dataInicio . ' 00:00:00';
}
if (!empty($dataFim)) {
    // Adiciona T23:59:59 para pegar até o fim do dia
    $query .= " AND data_pedido <= :fim";
    $params[':fim'] = $dataFim . ' 23:59:59';
}

// Ordena pelos mais recentes
$query .= " ORDER BY data_pedido DESC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($pedidos);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
