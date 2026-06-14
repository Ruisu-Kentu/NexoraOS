<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$folder_id = isset($_GET['folder_id']) ? intval($_GET['folder_id']) : 0;

if ($folder_id <= 0) {
  echo json_encode(['error' => 'Invalid folder ID']);
  exit;
}

// Get subfolders inside this folder
$stmt = $conn->prepare("SELECT id, name, created_at FROM folders WHERE parent_id = ? ORDER BY created_at ASC");
$stmt->bind_param('i', $folder_id);
$stmt->execute();
$folderResult = $stmt->get_result();
$folders = [];
while ($row = $folderResult->fetch_assoc()) {
  $folders[] = $row;
}
$stmt->close();

// Get files inside this folder
$stmt2 = $conn->prepare("SELECT id, name, content, created_at FROM files WHERE folder_id = ? AND deleted = 0");
$stmt2->bind_param('i', $folder_id);
$stmt2->execute();
$fileResult = $stmt2->get_result();
$files = [];
while ($row = $fileResult->fetch_assoc()) {
  $files[] = $row;
}
$stmt2->close();

echo json_encode(['folders' => $folders, 'files' => $files]);
$conn->close();
?>