<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$uploadDir = '../uploads/wallpapers/';

if (!is_dir($uploadDir)) {
  mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['wallpaper']) || $_FILES['wallpaper']['error'] !== UPLOAD_ERR_OK) {
  echo json_encode(['error' => 'No file uploaded']);
  exit;
}

$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$mime    = mime_content_type($_FILES['wallpaper']['tmp_name']);

if (!in_array($mime, $allowed)) {
  echo json_encode(['error' => 'Invalid file type. Use JPG, PNG, WEBP or GIF.']);
  exit;
}

$filename   = 'wallpaper_' . time() . '_' . basename($_FILES['wallpaper']['name']);
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($_FILES['wallpaper']['tmp_name'], $targetPath)) {
  echo json_encode(['success' => true, 'path' => '/NexoraOs/uploads/wallpapers/' . $filename]);
} else {
  echo json_encode(['error' => 'Failed to save wallpaper']);
}
?>