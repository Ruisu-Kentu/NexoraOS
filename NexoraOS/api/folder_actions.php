<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$data   = json_decode(file_get_contents('php://input'), true);
$action = isset($data['action']) ? $data['action'] : '';

switch ($action) {

  case 'create':
    $name       = isset($data['name'])       ? trim($data['name'])        : '';
    $parent_id  = isset($data['parent_id'])  ? intval($data['parent_id']) : null;
    $is_desktop = isset($data['is_desktop']) ? intval($data['is_desktop']): 0;
    $position_x = isset($data['position_x']) ? intval($data['position_x']): 120;
    $position_y = isset($data['position_y']) ? intval($data['position_y']): 100;

    if (empty($name)) {
      echo json_encode(['error' => 'Folder name cannot be empty']);
      exit;
    }

    if ($parent_id !== null && $parent_id <= 0) $parent_id = null;

    $stmt = $conn->prepare("INSERT INTO folders (name, parent_id, deleted, is_desktop, position_x, position_y) VALUES (?, ?, 0, ?, ?, ?)");
    $stmt->bind_param('siiii', $name, $parent_id, $is_desktop, $position_x, $position_y);

    if ($stmt->execute()) {
      echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
      echo json_encode(['error' => 'Failed to create folder']);
    }
    $stmt->close();
    break;

  case 'get_all':
    // Root level non-desktop folders only
    $result  = $conn->query("SELECT id, name, created_at FROM folders WHERE parent_id IS NULL AND deleted = 0 AND is_desktop = 0 ORDER BY created_at ASC");
    $folders = [];
    while ($row = $result->fetch_assoc()) {
      $folders[] = $row;
    }
    echo json_encode($folders);
    break;

  case 'get_desktop':
    // Desktop folders only
    $result  = $conn->query("SELECT id, name, position_x, position_y FROM folders WHERE is_desktop = 1 AND deleted = 0 ORDER BY created_at ASC");
    $folders = [];
    while ($row = $result->fetch_assoc()) {
      $folders[] = $row;
    }
    echo json_encode($folders);
    break;

  case 'update_position':
    $id         = isset($data['id'])         ? intval($data['id'])         : 0;
    $position_x = isset($data['position_x']) ? intval($data['position_x']) : 120;
    $position_y = isset($data['position_y']) ? intval($data['position_y']) : 100;

    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }

    $stmt = $conn->prepare("UPDATE folders SET position_x = ?, position_y = ? WHERE id = ?");
    $stmt->bind_param('iii', $position_x, $position_y, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    $stmt->close();
    break;

  case 'get_children':
    $parent_id = isset($data['parent_id']) ? intval($data['parent_id']) : 0;
    if ($parent_id <= 0) { echo json_encode(['error' => 'Invalid parent ID']); exit; }
    $stmt = $conn->prepare("SELECT id, name, created_at FROM folders WHERE parent_id = ? AND deleted = 0 ORDER BY created_at ASC");
    $stmt->bind_param('i', $parent_id);
    $stmt->execute();
    $result  = $stmt->get_result();
    $folders = [];
    while ($row = $result->fetch_assoc()) {
      $folders[] = $row;
    }
    echo json_encode($folders);
    $stmt->close();
    break;

  case 'get_path':
    $id   = isset($data['id']) ? intval($data['id']) : 0;
    $path = [];
    while ($id > 0) {
      $stmt = $conn->prepare("SELECT id, name, parent_id FROM folders WHERE id = ?");
      $stmt->bind_param('i', $id);
      $stmt->execute();
      $result = $stmt->get_result();
      $row    = $result->fetch_assoc();
      $stmt->close();
      if (!$row) break;
      array_unshift($path, ['id' => $row['id'], 'name' => $row['name']]);
      $id = $row['parent_id'];
    }
    echo json_encode($path);
    break;

  case 'rename':
    $id   = isset($data['id'])   ? intval($data['id'])   : 0;
    $name = isset($data['name']) ? trim($data['name'])   : '';
    if ($id <= 0 || empty($name)) { echo json_encode(['error' => 'Invalid data']); exit; }
    $stmt = $conn->prepare("UPDATE folders SET name = ? WHERE id = ?");
    $stmt->bind_param('si', $name, $id);
    if ($stmt->execute()) {
      echo json_encode(['success' => true]);
    } else {
      echo json_encode(['error' => 'Failed to rename folder']);
    }
    $stmt->close();
    break;

  case 'soft_delete':
    $id = isset($data['id']) ? intval($data['id']) : 0;
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    softDeleteFolderRecursive($conn, $id);
    echo json_encode(['success' => true]);
    break;

  case 'restore':
    $id = isset($data['id']) ? intval($data['id']) : 0;
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    restoreFolderRecursive($conn, $id);
    echo json_encode(['success' => true]);
    break;

  case 'permanent_delete':
    $id = isset($data['id']) ? intval($data['id']) : 0;
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    permanentDeleteFolderRecursive($conn, $id);
    echo json_encode(['success' => true]);
    break;

  case 'get_bin':
    $result  = $conn->query("SELECT id, name, created_at FROM folders WHERE deleted = 1 ORDER BY created_at DESC");
    $folders = [];
    while ($row = $result->fetch_assoc()) {
      $folders[] = $row;
    }
    echo json_encode($folders);
    break;

  case 'delete':
    $id = isset($data['id']) ? intval($data['id']) : 0;
    if ($id <= 0) { echo json_encode(['error' => 'Invalid ID']); exit; }
    permanentDeleteFolderRecursive($conn, $id);
    echo json_encode(['success' => true]);
    break;

  default:
    echo json_encode(['error' => 'Unknown action']);
    break;
}

$conn->close();

// --- HELPERS ---

function softDeleteFolderRecursive($conn, $folder_id) {
  $stmt = $conn->prepare("UPDATE folders SET deleted = 1 WHERE id = ?");
  $stmt->bind_param('i', $folder_id);
  $stmt->execute();
  $stmt->close();

  $stmt2 = $conn->prepare("UPDATE files SET deleted = 1 WHERE folder_id = ?");
  $stmt2->bind_param('i', $folder_id);
  $stmt2->execute();
  $stmt2->close();

  $stmt3 = $conn->prepare("SELECT id FROM folders WHERE parent_id = ?");
  $stmt3->bind_param('i', $folder_id);
  $stmt3->execute();
  $result = $stmt3->get_result();
  $stmt3->close();
  while ($row = $result->fetch_assoc()) {
    softDeleteFolderRecursive($conn, $row['id']);
  }
}

function restoreFolderRecursive($conn, $folder_id) {
  $stmt = $conn->prepare("UPDATE folders SET deleted = 0 WHERE id = ?");
  $stmt->bind_param('i', $folder_id);
  $stmt->execute();
  $stmt->close();

  $stmt2 = $conn->prepare("UPDATE files SET deleted = 0 WHERE folder_id = ?");
  $stmt2->bind_param('i', $folder_id);
  $stmt2->execute();
  $stmt2->close();

  $stmt3 = $conn->prepare("SELECT id FROM folders WHERE parent_id = ?");
  $stmt3->bind_param('i', $folder_id);
  $stmt3->execute();
  $result = $stmt3->get_result();
  $stmt3->close();
  while ($row = $result->fetch_assoc()) {
    restoreFolderRecursive($conn, $row['id']);
  }
}

function permanentDeleteFolderRecursive($conn, $folder_id) {
  $stmt = $conn->prepare("DELETE FROM files WHERE folder_id = ?");
  $stmt->bind_param('i', $folder_id);
  $stmt->execute();
  $stmt->close();

  $stmt2 = $conn->prepare("SELECT id FROM folders WHERE parent_id = ?");
  $stmt2->bind_param('i', $folder_id);
  $stmt2->execute();
  $result = $stmt2->get_result();
  $stmt2->close();
  while ($row = $result->fetch_assoc()) {
    permanentDeleteFolderRecursive($conn, $row['id']);
  }

  $stmt3 = $conn->prepare("DELETE FROM folders WHERE id = ?");
  $stmt3->bind_param('i', $folder_id);
  $stmt3->execute();
  $stmt3->close();
}
?>