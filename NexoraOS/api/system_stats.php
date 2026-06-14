<?php
session_start();
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

header('Content-Type: application/json');

require_once 'db.php';

// Total text files
$result      = $conn->query("SELECT COUNT(*) FROM files WHERE deleted = 0");
$totalFiles  = (int) $result->fetch_row()[0];

// Total folders
$result       = $conn->query("SELECT COUNT(*) FROM folders WHERE deleted = 0");
$totalFolders = (int) $result->fetch_row()[0];


// Uploaded files — detected by file extension
$result       = $conn->query("SELECT COUNT(*) FROM files WHERE deleted = 0 AND (
  name LIKE '%.jpg' OR name LIKE '%.jpeg' OR name LIKE '%.png' OR
  name LIKE '%.gif' OR name LIKE '%.webp' OR name LIKE '%.bmp' OR
  name LIKE '%.svg' OR name LIKE '%.ico' OR name LIKE '%.jfif' OR
  name LIKE '%.mp3' OR name LIKE '%.wav' OR name LIKE '%.ogg' OR
  name LIKE '%.flac' OR name LIKE '%.aac' OR name LIKE '%.m4a' OR
  name LIKE '%.mp4' OR name LIKE '%.webm' OR name LIKE '%.mkv' OR
  name LIKE '%.avi' OR name LIKE '%.mov' OR name LIKE '%.wmv'
)");
$totalUploads = (int) $result->fetch_row()[0];

// Disk used — scan uploads directory
$uploadDir  = __DIR__ . '/../uploads/';
$totalBytes = 0;
if (is_dir($uploadDir)) {
  foreach (new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($uploadDir, FilesystemIterator::SKIP_DOTS)
  ) as $file) {
    $totalBytes += $file->getSize();
  }
}

function formatBytes($bytes) {
  if ($bytes >= 1073741824) return round($bytes / 1073741824, 2) . ' GB';
  if ($bytes >= 1048576)    return round($bytes / 1048576, 2)    . ' MB';
  if ($bytes >= 1024)       return round($bytes / 1024, 2)       . ' KB';
  return $bytes . ' B';
}

echo json_encode([
  'total_files'   => $totalFiles,
  'total_folders' => $totalFolders,
  'total_uploads' => $totalUploads,
  'disk_used'     => formatBytes($totalBytes),
  'disk_bytes'    => $totalBytes,
]);
?>