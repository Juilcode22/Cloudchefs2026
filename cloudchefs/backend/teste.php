<?php
// 1. Forçar a exibição de TODOS os erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Depurando a Conexão...</h1>";

// 2. Tentar carregar a configuração
echo "<p>Carregando config.php... ";
if (file_exists('config.php')) {
    require 'config.php';
    echo "OK.</p>";
} else {
    die("<strong>ERRO FATAL:</strong> Arquivo 'config.php' não encontrado.</p>");
}

// 3. Verificar se as variáveis existem
echo "<p>Verificando variáveis... ";
if (!isset($DB_HOST) || !isset($DB_USER) || !isset($DB_PASS) || !isset($DB_NAME) || !isset($DB_PORT)) {
    die("<strong>ERRO FATAL:</strong> Uma ou mais variáveis ($DB_HOST, $DB_PORT, $DB_USER, $DB_PASS, $DB_NAME) não estão definidas no config.php.</p>");
}
echo "OK.</p>";

// 4. Tentar conectar ao banco
try {
    $dsn = "pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME";
    echo "<p>Tentando conectar com DSN: $dsn ... ";
    
    $db = new PDO($dsn, $DB_USER, $DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<hr><strong>✅ SUCESSO! Conexão com o banco de dados '$DB_NAME' está funcionando.</strong></p>";

} catch (PDOException $e) {
    // Erro específico do PDO (ex: senha errada, banco não existe)
    echo "<hr><strong style='color:red;'>❌ ERRO DE CONEXÃO (PDO):</strong> " . $e->getMessage() . "</p>";
} catch (Exception $e) {
    // Outros erros
    echo "<hr><strong style='color:red;'>❌ ERRO GERAL:</strong> " . $e->getMessage() . "</p>";
}

?>