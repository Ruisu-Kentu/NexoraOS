<?php
$host = 'localhost';
$db   = 'nexoraos';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
}
?>