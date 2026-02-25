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

$tipoRelatorio = $data['relatorio'] ?? null;
$dataInicio = $data['data_inicio'] ?? null;
$dataFim = $data['data_fim'] ?? null;

if (empty($tipoRelatorio) || empty($dataInicio) || empty($dataFim)) {
    echo json_encode(["error" => "Todos os campos (tipo, data início, data fim) são obrigatórios."]);
    exit();
}

// Ajusta a data final para incluir o dia inteiro
$dataFim = $dataFim . ' 23:59:59';
$dataInicio = $dataInicio . ' 00:00:00';

$params = [':inicio' => $dataInicio, ':fim' => $dataFim];
$query = "";

try {
    if ($tipoRelatorio === "Vendas") {
        // Query para agrupar vendas por dia
        $query = "
            SELECT 
                DATE(data_pedido) as data_venda, 
                COUNT(id_pedido) as total_pedidos, 
                SUM(valor_total) as valor_total
            FROM pedidos
            WHERE data_pedido BETWEEN :inicio AND :fim
            GROUP BY DATE(data_pedido)
            ORDER BY data_venda ASC;
        ";
    } 
    else if ($tipoRelatorio === "Produtos") {
        // Query para agrupar produtos vendidos no período
        $query = "
            SELECT 
                ip.nome_produto, 
                SUM(ip.quantidade) as total_vendido,
                SUM(ip.valor_unitario * ip.quantidade) as receita_total
            FROM itens_pedido ip
            JOIN pedidos p ON ip.id_pedido_fk = p.id_pedido
            WHERE p.data_pedido BETWEEN :inicio AND :fim
            GROUP BY ip.nome_produto
            ORDER BY total_vendido DESC;
        ";
    } 
    else {
        throw new Exception("Tipo de relatório desconhecido.");
    }

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($resultado);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>