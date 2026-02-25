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
    if ($method === "GET") {
        // Seleciona todos, exceto a senha, para exibir na tela de colaboradores
        $stmt = $db->query("SELECT id_usuario, nome, login, tipo_usuario FROM usuario ORDER BY id_usuario ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    if ($method === "POST") {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $nome = $data['nome'];
        $login = $data['login'];
        $senha = password_hash($data['senha'], PASSWORD_BCRYPT);
        // Define o 'tipo_usuario' padrão para 'colaborador' ao criar
        $tipo_usuario = $data['tipo_usuario'] ?? 'colaborador'; 

        $stmt = $db->prepare("
            INSERT INTO usuario (nome, login, senha, tipo_usuario) 
            VALUES (:nome, :login, :senha, :tipo)
        ");
        $stmt->execute([
            ':nome' => $nome, 
            ':login' => $login, 
            ':senha' => $senha, 
            ':tipo' => $tipo_usuario
        ]);
        echo json_encode(["success" => true, "message" => "Usuário criado"]);
    }

    if ($method === "DELETE") {
        // Você não tem o botão de deletar, mas o backend está pronto
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id_usuario'];

        $stmt = $db->prepare("DELETE FROM usuario WHERE id_usuario = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(["success" => true]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>