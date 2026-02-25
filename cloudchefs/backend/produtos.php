<?php
require 'connect.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    $stmt = $db->query("SELECT * FROM produto WHERE ativo = true ORDER BY id_produto ASC");
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($produtos);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>