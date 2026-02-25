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
$acao = $data['acao'] ?? null;

try {
    if ($acao === "remover") {
        $nome = $data['nome'];
        $quantidade = $data['quantidade'];
        $stmt = $db->prepare("UPDATE estoque SET quantidade_atual = quantidade_atual - :qtd WHERE nome_item = :nome AND quantidade_atual >= :qtd");
        $stmt->execute([':qtd' => $quantidade, ':nome' => $nome]);

    } else if ($acao === "adicionar") {
        $nome = $data['nome'];
        $quantidade = $data['quantidade'];
        $stmt = $db->prepare("UPDATE estoque SET quantidade_atual = quantidade_atual + :qtd WHERE nome_item = :nome");
        $stmt->execute([':qtd' => $quantidade, ':nome' => $nome]);

    } else if ($acao === "criar") {
        // --- 🚀 CORREÇÃO APLICADA ---
        // Blocos duplicados removidos.
        // 'quantidade_minima' removida.

        $nome_item = $data['nome_item'];
        $unidade_medida = $data['unidade_medida'];
        $quantidade_atual = $data['quantidade_atual'] ?? 0; // Pega a qtd inicial do JS

        $stmt = $db->prepare("
            INSERT INTO estoque (nome_item, unidade_medida, quantidade_atual) 
            VALUES (:nome, :unidade, :qtd_atual)
        ");
        $stmt->execute([
            ':nome' => $nome_item,
            ':unidade' => $unidade_medida,
            ':qtd_atual' => $quantidade_atual // Salva a quantidade inicial
        ]);

        echo json_encode(["success" => true, "message" => "Ingrediente $nome_item adicionado."]);
        exit(); // Sai aqui para não dar o 'success' duplicado
        // --- FIM DA CORREÇÃO ---

    } else {
        throw new Exception("Ação desconhecida.");
    }

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    if (strpos($e->getMessage(), 'duplicate key') !== false) {
        echo json_encode(["success" => false, "error" => "Ingrediente já existe."]);
    } else {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>