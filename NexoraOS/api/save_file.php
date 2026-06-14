<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id      = isset($data['id']) ? intval($data['id']) : 0;
$name    = isset($data['name']) ? trim($data['name']) : '';
$content = isset($data['content']) ? $data['content'] : '';

if (empty($name)) {
  echo json_encode(['error' => 'Filename cannot be empty']);
  exit;
}

if ($id > 0) {
  // UPDATE existing file
  $stmt = $conn->prepare("UPDATE files SET name = ?, content = ? WHERE id = ?");
  $stmt->bind_param('ssi', $name, $content, $id);
} else {
  // CREATE new file
  $stmt = $conn->prepare("INSERT INTO files (name, content) VALUES (?, ?)");
  $stmt->bind_param('ss', $name, $content);
}

if ($stmt->execute()) {
  $newId = ($id > 0) ? $id : $conn->insert_id;
  echo json_encode(['success' => true, 'id' => $newId]);
} else {
  echo json_encode(['error' => 'Failed to save file']);
}

$stmt->close();
$conn->close();
?>
