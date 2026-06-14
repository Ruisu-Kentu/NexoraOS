<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
  echo json_encode(['error' => 'Invalid file ID']);
  exit;
}

$stmt = $conn->prepare("SELECT id, name, content FROM files WHERE id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$file = $result->fetch_assoc();

if (!$file) {
  echo json_encode(['error' => 'File not found']);
} else {
  echo json_encode($file);
}

$stmt->close();
$conn->close();
?>