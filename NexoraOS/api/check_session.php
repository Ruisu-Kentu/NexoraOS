<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
  echo json_encode(['authenticated' => false]);
} else {
  echo json_encode([
    'authenticated' => true,
    'username'      => $_SESSION['username'],
    'login_time'    => $_SESSION['login_time'] ?? time() * 1000
  ]);
}
?>