<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$result = $conn->query("SELECT id, name, created_at FROM files WHERE deleted = 0 AND folder_id IS NULL ORDER BY created_at DESC");

$files = [];
while ($row = $result->fetch_assoc()) {
  $files[] = $row;
}

echo json_encode($files);
$conn->close();
?>