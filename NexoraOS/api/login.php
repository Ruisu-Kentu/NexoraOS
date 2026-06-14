<?php
session_start();
header('Content-Type: application/json');

require_once 'db.php';

$data     = json_decode(file_get_contents('php://input'), true);
$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (empty($username) || empty($password)) {
  echo json_encode(['error' => 'Username and password are required']);
  exit;
}

$stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();
$conn->close();

if (!$user || !password_verify($password, $user['password'])) {
  echo json_encode(['error' => 'Invalid username or password']);
  exit;
}

// Set session
$_SESSION['user_id']  = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['login_time'] = time() * 1000;

echo json_encode(['success' => true, 'username' => $user['username']]);
?>