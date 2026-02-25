<?php
// 1. Puxa as variáveis de configuração que já provamos que funcionam
require 'config.php';

// 2. Define as variáveis para a conexão PDO
$serverName = $DB_HOST;
$port = $DB_PORT;
$userName = $DB_USER;
$password = $DB_PASS;
$dbname = $DB_NAME;

try {
    // 3. Usa as variáveis do config.php para conectar
    $db = new PDO("pgsql:host=$serverName;port=$port;dbname=$dbname", $userName, $password);

    // Define o modo de erro para exceções
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} 
catch (Exception $e) {
    // Se a conexão falhar, o front-end verá este erro
    die(json_encode([
        "success" => false, 
        "error" => "Erro fatal de conexão com o banco: " . $e->getMessage()
    ]));
}
?>