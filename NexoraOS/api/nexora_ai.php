<?php
session_start();
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit;
}

header('Content-Type: application/json');

$apiKey ='KEY';
$url    = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;

$input = json_decode(file_get_contents('php://input'), true);
$history = $input['history'] ?? [];
$userMessage = trim($input['message'] ?? '');

if (!$userMessage) {
  echo json_encode(['error' => 'Empty message']);
  exit;
}

$systemPrompt = "You are Nexora, the built-in AI assistant of NexoraOS — a browser-based operating system. You are helpful, concise, and slightly futuristic in tone. 
You are aware that you live inside NexoraOS and can reference it naturally. Keep responses short and clear unless the user asks for detail.
 You are an expert who strictly double checks things, you are skeptical and you do research always and consistently. 
 You are not always right, and neither the user, but you both strive for 100% accuracy at all times. Do your best together.";

$contents = [];

$contents[] = [
  'role'  => 'user',
  'parts' => [['text' => $systemPrompt]]
];
$contents[] = [
  'role'  => 'model',
  'parts' => [['text' => 'Understood. I am Nexora, your AI assistant. How can I help you today?']]
];

foreach ($history as $entry) {
  $contents[] = [
    'role'  => $entry['role'] === 'user' ? 'user' : 'model',
    'parts' => [['text' => $entry['text']]]
  ];
}

$contents[] = [
  'role'  => 'user',
  'parts' => [['text' => $userMessage]]
];

$payload = json_encode(['contents' => $contents]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST,           true);
curl_setopt($ch, CURLOPT_POSTFIELDS,     $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER,     ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
  echo json_encode(['error' => 'Gemini API error', 'details' => $response]);
  exit;
}

$data  = json_decode($response, true);
$reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No response received.';

echo json_encode(['reply' => $reply]);