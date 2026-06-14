<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';
session_start();

$data    = json_decode(file_get_contents('php://input'), true);
$command = isset($data['command']) ? trim($data['command']) : '';

if (empty($command)) {
  echo json_encode(['output' => 'No command received.']);
  exit;
}

// Split command into parts
$parts = explode(' ', $command, 3);
$cmd   = strtolower($parts[0]);
$arg   = isset($parts[1]) ? trim($parts[1]) : '';
$arg2  = isset($parts[2]) ? trim($parts[2]) : '';

switch ($cmd) {

  // ===========================
  // HELP
  // ===========================
  case 'help':
    $output = "NexoraOS Terminal v1.0 — Available Commands:\n" .
              "─────────────────────────────────────────\n" .
              "  help                    - Show this command list\n" .
              "  ls                      - List all files in My Documents\n" .
              "  open <filename>         - Open a file in Notepad\n" .
              "  create <filename>       - Create a new empty file\n" .
              "  mkdir <foldername>      - Create a new folder\n" .
              "  rm <filename>           - Move a file to Recycle Bin\n" .
              "  rename <old> <new>      - Rename a file\n" .
              "  pwd                     - Show current directory\n" .
              "  echo <text>             - Print text to terminal\n" .
              "  date                    - Show current date and time\n" .
              "  whoami                  - Show logged-in username\n" .
              "  sysinfo                 - Show system statistics\n" .
              "  clear                   - Clear the terminal\n" .
              "─────────────────────────────────────────";
    break;

  // ===========================
  // LS
  // ===========================
  case 'ls':
    $result = $conn->query("SELECT name FROM files WHERE deleted = 0 ORDER BY created_at DESC");
    if ($result->num_rows === 0) {
      $output = "No files found in My Documents.";
    } else {
      $names = [];
      while ($row = $result->fetch_assoc()) {
        $names[] = '  📄 ' . $row['name'];
      }
      $output = "My Documents (" . count($names) . " files):\n" . implode("\n", $names);
    }
    break;

  // ===========================
  // OPEN
  // ===========================
  case 'open':
    if (empty($arg)) {
      $output = "Usage: open <filename>\nExample: open notes.txt";
    } else {
      $stmt = $conn->prepare("SELECT id, name, content FROM files WHERE name = ? AND deleted = 0");
      $stmt->bind_param('s', $arg);
      $stmt->execute();
      $result = $stmt->get_result();
      $file   = $result->fetch_assoc();
      if (!$file) {
        $output = "Error: File '$arg' not found.";
      } else {
        $output = "Opening '$arg' in Notepad...";
        echo json_encode(['output' => $output, 'openFile' => $file]);
        $stmt->close();
        $conn->close();
        exit;
      }
      $stmt->close();
    }
    break;

  // ===========================
  // CREATE
  // ===========================
  case 'create':
    if (empty($arg)) {
      $output = "Usage: create <filename>\nExample: create notes.txt";
    } else {
      $stmt = $conn->prepare("SELECT id FROM files WHERE name = ? AND deleted = 0");
      $stmt->bind_param('s', $arg);
      $stmt->execute();
      $stmt->store_result();
      if ($stmt->num_rows > 0) {
        $output = "Error: File '$arg' already exists.";
      } else {
        $stmt->close();
        $stmt2 = $conn->prepare("INSERT INTO files (name, content) VALUES (?, '')");
        $stmt2->bind_param('s', $arg);
        $stmt2->execute();
        $output = "✅ File '$arg' created successfully.\nUse 'open $arg' to edit it in Notepad.";
        $stmt2->close();
      }
      if (isset($stmt) && !isset($stmt2)) $stmt->close();
    }
    break;

  // ===========================
  // MKDIR
  // ===========================
  case 'mkdir':
    if (empty($arg)) {
      $output = "Usage: mkdir <foldername>\nExample: mkdir Projects";
    } else {
      $stmt = $conn->prepare("SELECT id FROM folders WHERE name = ? AND parent_id IS NULL AND deleted = 0");
      $stmt->bind_param('s', $arg);
      $stmt->execute();
      $stmt->store_result();
      if ($stmt->num_rows > 0) {
        $output = "Error: Folder '$arg' already exists in My Documents.";
      } else {
        $stmt->close();
        $stmt2 = $conn->prepare("INSERT INTO folders (name, parent_id) VALUES (?, NULL)");
        $stmt2->bind_param('s', $arg);
        $stmt2->execute();
        $output = "✅ Folder '$arg' created in My Documents.";
        $stmt2->close();
      }
      if (isset($stmt) && !isset($stmt2)) $stmt->close();
    }
    break;

  // ===========================
  // RM
  // ===========================
  case 'rm':
    if (empty($arg)) {
      $output = "Usage: rm <filename>\nExample: rm notes.txt";
    } else {
      $stmt = $conn->prepare("SELECT id FROM files WHERE name = ? AND deleted = 0");
      $stmt->bind_param('s', $arg);
      $stmt->execute();
      $result = $stmt->get_result();
      $file   = $result->fetch_assoc();
      if (!$file) {
        $output = "Error: File '$arg' not found.";
      } else {
        $stmt->close();
        $stmt2 = $conn->prepare("UPDATE files SET deleted = 1 WHERE id = ?");
        $stmt2->bind_param('i', $file['id']);
        $stmt2->execute();
        $output = "🗑️ '$arg' moved to Recycle Bin.";
        $stmt2->close();
      }
      if (isset($stmt) && !isset($stmt2)) $stmt->close();
    }
    break;

  // ===========================
  // RENAME
  // ===========================
  case 'rename':
    if (empty($arg) || empty($arg2)) {
      $output = "Usage: rename <old name> <new name>\nExample: rename notes.txt journal.txt";
    } else {
      $stmt = $conn->prepare("SELECT id FROM files WHERE name = ? AND deleted = 0");
      $stmt->bind_param('s', $arg);
      $stmt->execute();
      $result = $stmt->get_result();
      $file   = $result->fetch_assoc();
      if (!$file) {
        $output = "Error: File '$arg' not found.";
      } else {
        $stmt->close();
        $stmt2 = $conn->prepare("UPDATE files SET name = ? WHERE id = ?");
        $stmt2->bind_param('si', $arg2, $file['id']);
        $stmt2->execute();
        $output = "✅ Renamed '$arg' to '$arg2'.";
        $stmt2->close();
      }
      if (isset($stmt) && !isset($stmt2)) $stmt->close();
    }
    break;

  // ===========================
  // PWD
  // ===========================
  case 'pwd':
    $output = "/NexoraOS/MyDocuments";
    break;

  // ===========================
  // ECHO
  // ===========================
  case 'echo':
    if (empty($arg)) {
      $output = "";
    } else {
      $output = $arg;
    }
    break;

  // ===========================
  // DATE
  // ===========================
  case 'date':
    $output = "Current Date : " . date('l, F j, Y') . "\n" .
              "Current Time : " . date('h:i:s A') . "\n" .
              "Timezone     : " . date_default_timezone_get();
    break;

  // ===========================
  // WHOAMI
  // ===========================
  case 'whoami':
    $username = isset($_SESSION['username']) ? $_SESSION['username'] : 'unknown';
    $output   = "Logged in as: " . $username . "\n" .
                "Role        : Administrator\n" .
                "System      : NexoraOS v1.0";
    break;

  // ===========================
  // SYSINFO
  // ===========================
  case 'sysinfo':
    $files   = $conn->query("SELECT COUNT(*) as c FROM files WHERE deleted = 0")->fetch_assoc()['c'];
    $folders = $conn->query("SELECT COUNT(*) as c FROM folders WHERE deleted = 0")->fetch_assoc()['c'];
    $bin     = $conn->query("SELECT COUNT(*) as c FROM files WHERE deleted = 1")->fetch_assoc()['c'];
    $uploads = $conn->query("SELECT COUNT(*) as c FROM files WHERE content LIKE 'uploads/%'")->fetch_assoc()['c'];

    $output = "NexoraOS System Information\n" .
              "─────────────────────────────────────────\n" .
              "  OS          : NexoraOS v1.0\n" .
              "  Platform    : Web-Based (Browser)\n" .
              "  Stack       : HTML · CSS · JS · PHP · MySQL\n" .
              "  Server      : Apache (XAMPP)\n" .
              "─────────────────────────────────────────\n" .
              "  Files       : " . $files   . " file(s)\n" .
              "  Folders     : " . $folders . " folder(s)\n" .
              "  Uploads     : " . $uploads . " uploaded file(s)\n" .
              "  Recycle Bin : " . $bin     . " deleted file(s)\n" .
              "─────────────────────────────────────────\n" .
              "  User        : " . (isset($_SESSION['username']) ? $_SESSION['username'] : 'unknown') . "\n" .
              "  Role        : Administrator";
    break;

  // ===========================
  // CLEAR
  // ===========================
  case 'clear':
    $output = '__CLEAR__';
    break;

  // ===========================
  // UNKNOWN
  // ===========================
  default:
    $output = "Unknown command: '$cmd'\nType 'help' for available commands.";
    break;
}

echo json_encode(['output' => $output]);
$conn->close();
?>