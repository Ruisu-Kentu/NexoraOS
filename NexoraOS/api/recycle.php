<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$data   = json_decode(file_get_contents('php://input'), true);
$action = isset($data['action']) ? $data['action'] : '';
$id     = isset($data['id']) ? intval($data['id']) : 0;

switch ($action) {

  // Soft delete — move to recycle bin
  case 'soft_delete':
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    $stmt = $conn->prepare("UPDATE files SET deleted = 1 WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    $stmt->close();
    break;

  // Restore — move back to My Documents
  case 'restore':
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    $stmt = $conn->prepare("UPDATE files SET deleted = 0 WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    $stmt->close();
    break;

  // Permanent delete — remove one file from DB forever
  case 'permanent_delete':
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    $stmt = $conn->prepare("DELETE FROM files WHERE id = ? AND deleted = 1");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    $stmt->close();
    break;

  // Empty recycle bin — remove all deleted files from DB
  case 'empty_bin':
    $conn->query("DELETE FROM files WHERE deleted = 1");
    $conn->query("DELETE FROM folders WHERE deleted = 1");
    echo json_encode(['success' => true]);
    break;

  // Get all files in recycle bin
  case 'get_bin':
    $result = $conn->query("SELECT id, name, created_at, folder_id FROM files WHERE deleted = 1 ORDER BY created_at DESC");
    $files = [];
    while ($row = $result->fetch_assoc()) {
      $files[] = $row;
    }
    echo json_encode($files);
    break;
}

$conn->close();
?>