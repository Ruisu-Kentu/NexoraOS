<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$folder_id = isset($_POST['folder_id']) ? intval($_POST['folder_id']) : 0;

if ($folder_id <= 0) {
  echo json_encode(['error' => 'Invalid folder ID']);
  exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
  echo json_encode(['error' => 'No file uploaded or upload error']);
  exit;
}

$originalName = basename($_FILES['file']['name']);
$fileType     = mime_content_type($_FILES['file']['tmp_name']);
$uploadDir    = '../uploads/';

// Create uploads directory if it doesn't exist
if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

// Generate unique filename to avoid conflicts
$uniqueName = uniqid() . '_' . $originalName;
$targetPath = $uploadDir . $uniqueName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
  echo json_encode(['error' => 'Failed to move uploaded file']);
  exit;
}

// Store file record in database
$stmt = $conn->prepare("INSERT INTO files (name, content, folder_id, deleted) VALUES (?, ?, ?, 0)");
$stmt->bind_param('ssi', $originalName, $uniqueName, $folder_id);

if ($stmt->execute()) {
  echo json_encode(['success' => true, 'id' => $conn->insert_id, 'name' => $originalName]);
} else {
  echo json_encode(['error' => 'Failed to save file record']);
}

$stmt->close();
$conn->close();
?>