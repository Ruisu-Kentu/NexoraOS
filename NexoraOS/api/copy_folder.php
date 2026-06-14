<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$data      = json_decode(file_get_contents('php://input'), true);
$folder_id = isset($data['folder_id']) ? intval($data['folder_id']) : 0;
$parent_id = isset($data['parent_id']) ? intval($data['parent_id']) : null;

if ($folder_id <= 0) {
  echo json_encode(['error' => 'Invalid folder ID']);
  exit;
}

if ($parent_id !== null && $parent_id <= 0) $parent_id = null;

$new_id = copyFolderRecursive($conn, $folder_id, $parent_id, true);

if ($new_id) {
  echo json_encode(['success' => true, 'new_id' => $new_id]);
} else {
  echo json_encode(['error' => 'Failed to copy folder']);
}

$conn->close();

// --- RECURSIVE COPY ---
function copyFolderRecursive($conn, $folder_id, $new_parent_id, $isRoot = false) {
  // Get original folder
  $stmt = $conn->prepare("SELECT name FROM folders WHERE id = ?");
  $stmt->bind_param('i', $folder_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $folder = $result->fetch_assoc();
  $stmt->close();

  if (!$folder) return false;

  // Name the copy
  $newName = $isRoot ? ($folder['name'] . ' - Copy') : $folder['name'];

  // Create new folder
  $stmt2 = $conn->prepare("INSERT INTO folders (name, parent_id) VALUES (?, ?)");
  $stmt2->bind_param('si', $newName, $new_parent_id);
  $stmt2->execute();
  $new_folder_id = $conn->insert_id;
  $stmt2->close();

  // Copy files inside this folder
  $stmt3 = $conn->prepare("SELECT name, content FROM files WHERE folder_id = ? AND deleted = 0");
  $stmt3->bind_param('i', $folder_id);
  $stmt3->execute();
  $fileResult = $stmt3->get_result();
  $stmt3->close();

  while ($file = $fileResult->fetch_assoc()) {
    $stmt4 = $conn->prepare("INSERT INTO files (name, content, folder_id, deleted) VALUES (?, ?, ?, 0)");
    $stmt4->bind_param('ssi', $file['name'], $file['content'], $new_folder_id);
    $stmt4->execute();
    $stmt4->close();
  }

  // Recursively copy subfolders
  $stmt5 = $conn->prepare("SELECT id FROM folders WHERE parent_id = ?");
  $stmt5->bind_param('i', $folder_id);
  $stmt5->execute();
  $subResult = $stmt5->get_result();
  $stmt5->close();

  while ($sub = $subResult->fetch_assoc()) {
    copyFolderRecursive($conn, $sub['id'], $new_folder_id, false);
  }

  return $new_folder_id;
}
?>