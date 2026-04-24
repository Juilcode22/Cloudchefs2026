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
try {
    // 1. Pega os 5 pedidos mais antigos que NÃO estão concluídos
    $queryPedidos = "
        SELECT * FROM pedido 
        WHERE status <> 'Concluído' 
        ORDER BY data_pedido ASC 
        LIMIT 5
    ";
    $stmtPedidos = $db->prepare($queryPedidos);
    $stmtPedidos->execute();
    $pedidos = $stmtPedidos->fetchAll(PDO::FETCH_ASSOC);

    // 2. Prepara a query para buscar os itens de cada pedido
    $queryItens = "SELECT nome_produto, quantidade 
                   FROM itens_pedido 
                   WHERE id_pedido_fk = :id_pedido";
    $stmtItens = $db->prepare($queryItens);

    // 3. Loop para "aninhar" os itens dentro de cada pedido
    foreach ($pedidos as $key => $pedido) {
        $stmtItens->execute([':id_pedido' => $pedido['id_pedido']]);
        $itens = $stmtItens->fetchAll(PDO::FETCH_ASSOC);
        
        // Adiciona a lista de itens ao array do pedido
        $pedidos[$key]['itens'] = $itens; 
    }

    // 4. Retorna o JSON completo (pedidos com seus itens)
    echo json_encode($pedidos);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
