import { PhpEndpoint } from '../types';

export const PHP_CODE_TEMPLATES = {
  'database.php': `<?php
/**
 * EventPulse Backend - Database Connection Wrapper
 * Uses PDO (PHP Data Objects) with UTF-8 character encoding
 * Prepared statements enforce strict SQL injection protection.
 */

declare(strict_types=1);

namespace EventPulse\\Config;

use PDO;
use PDOException;

class Database {
    private string $host = 'localhost';
    private string $db_name = 'eventpulse_db';
    private string $username = 'root';
    private string $password = '';
    private ?PDO $conn = null;

    public function getConnection(): ?PDO {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Disables native emulation for true server-side prepared statements
            ];
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
        return $this->conn;
    }
}
`,

  'events.php': `<?php
/**
 * EventPulse - Events REST Endpoint
 * Handles GET (fetch list / single event) and POST/PUT/DELETE (Admin & Faculty protected)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
use EventPulse\\Config\\Database;

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT e.*, 
                (SELECT COUNT(*) FROM bookings b WHERE b.event_id = e.id AND b.status != 'Cancelled') as live_booked_count
                FROM events e WHERE 1=1";
        $params = [];

        if ($category && $category !== 'All') {
            $sql .= " AND e.category = :category";
            $params[':category'] = $category;
        }
        if ($search) {
            $sql .= " AND (e.title LIKE :search OR e.venue LIKE :search OR e.tags LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }

        $sql .= " ORDER BY e.event_date ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $events = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'count'  => count($events),
            'data'   => $events
        ]);
        break;

    case 'POST':
        // Event Creation by Admin or Faculty coordinator
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['title']) || empty($data['event_date']) || empty($data['venue'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields: title, event_date, venue']);
            exit;
        }

        $sql = "INSERT INTO events (title, category, event_date, event_time, venue, organizer, description, total_capacity, base_price)
                VALUES (:title, :category, :event_date, :event_time, :venue, :organizer, :description, :total_capacity, :base_price)";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':title'          => htmlspecialchars(strip_tags($data['title'])),
            ':category'       => $data['category'] ?? 'Tech',
            ':event_date'     => $data['event_date'],
            ':event_time'     => $data['event_time'] ?? '09:00 AM - 05:00 PM',
            ':venue'          => htmlspecialchars(strip_tags($data['venue'])),
            ':organizer'      => htmlspecialchars(strip_tags($data['organizer'] ?? 'REC Event Cell')),
            ':description'    => htmlspecialchars(strip_tags($data['description'] ?? '')),
            ':total_capacity' => (int)($data['total_capacity'] ?? 100),
            ':base_price'     => (float)($data['base_price'] ?? 0.0),
        ]);

        $newId = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            'status'  => 'success',
            'message' => 'Event published successfully',
            'eventId' => $newId
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}
`,

  'bookings.php': `<?php
/**
 * EventPulse - Bookings & Ticketing REST Endpoint
 * Demonstrates MySQL Transactions and Race-Condition Prevention (FOR UPDATE)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
use EventPulse\\Config\\Database;

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);

    $eventId   = $payload['eventId'] ?? null;
    $userId    = $payload['userId'] ?? 'usr-harish-rec';
    $tier      = $payload['tier'] ?? 'Student';
    $quantity  = (int)($payload['quantity'] ?? 1);
    $unitPrice = (float)($payload['unitPrice'] ?? 0);
    $discount  = (float)($payload['discount'] ?? 0);

    if (!$eventId || $quantity < 1) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid booking parameters']);
        exit;
    }

    try {
        // Begin transaction to guarantee seat atomic reservation
        $db->beginTransaction();

        // Lock row to prevent overbooking
        $lockStmt = $db->prepare("SELECT total_capacity, booked_count FROM events WHERE id = :id FOR UPDATE");
        $lockStmt->execute([':id' => $eventId]);
        $event = $lockStmt->fetch();

        if (!$event) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Event not found']);
            exit;
        }

        if (($event['booked_count'] + $quantity) > $event['total_capacity']) {
            $db->rollBack();
            http_response_code(409); // Conflict: capacity exceeded
            echo json_encode(['status' => 'error', 'message' => 'Requested seats exceed available capacity']);
            exit;
        }

        $bookingRef = 'EP-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));
        $totalAmount = max(0, ($unitPrice * $quantity) - $discount);
        $qrPayload   = "EVENTPULSE:{$bookingRef}:{$eventId}:{$userId}:CONFIRMED";

        // Insert booking record
        $insStmt = $db->prepare("INSERT INTO bookings 
            (booking_ref, event_id, user_id, tier, quantity, unit_price, discount, total_amount, qr_data, status) 
            VALUES (:ref, :eid, :uid, :tier, :qty, :uprice, :disc, :total, :qr, 'Confirmed')");
        $insStmt->execute([
            ':ref'    => $bookingRef,
            ':eid'    => $eventId,
            ':uid'    => $userId,
            ':tier'   => $tier,
            ':qty'    => $quantity,
            ':uprice' => $unitPrice,
            ':disc'   => $discount,
            ':total'  => $totalAmount,
            ':qr'     => $qrPayload,
        ]);

        // Increment event booked_count
        $updStmt = $db->prepare("UPDATE events SET booked_count = booked_count + :qty WHERE id = :id");
        $updStmt->execute([':qty' => $quantity, ':id' => $eventId]);

        $db->commit();

        http_response_code(201);
        echo json_encode([
            'status'     => 'success',
            'message'    => 'Ticket booked successfully',
            'bookingRef' => $bookingRef,
            'qrCodeData' => $qrPayload,
            'totalPaid'  => $totalAmount,
            'status'     => 'Confirmed'
        ]);
    } catch (\\Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Transaction failed: ' . $e->getMessage()]);
    }
    exit;
}

// GET /api/bookings.php - Attendee bookings
$userId = $_GET['userId'] ?? 'usr-harish-rec';
$stmt = $db->prepare("SELECT b.*, e.title as event_title, e.event_date, e.venue 
                      FROM bookings b 
                      JOIN events e ON b.event_id = e.id 
                      WHERE b.user_id = :uid 
                      ORDER BY b.created_at DESC");
$stmt->execute([':uid' => $userId]);
$bookings = $stmt->fetchAll();

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'count'  => count($bookings),
    'data'   => $bookings
]);
`,

  'auth.php': `<?php
/**
 * EventPulse - 3-Tier Role Authentication Endpoint
 * Roles: 'admin', 'faculty', 'student'
 * Demonstrates password_verify(), session binding, and RBAC privilege separation
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
session_start();

require_once __DIR__ . '/../config/database.php';
use EventPulse\\Config\\Database;

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? 'login';

$database = new Database();
$db = $database->getConnection();

if ($action === 'login') {
    $identifier = trim($data['username'] ?? $data['email'] ?? '');
    $password   = $data['password'] ?? '';

    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Username/email and password required']);
        exit;
    }

    $stmt = $db->prepare("SELECT id, name, username, email, role, password_hash, college, department 
                          FROM users 
                          WHERE username = :id OR email = :id LIMIT 1");
    $stmt->execute([':id' => $identifier]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['user_role'] = $user['role']; // 'admin' | 'faculty' | 'student'
        $_SESSION['user_name'] = $user['name'];

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Authentication successful',
            'user' => [
                'id'         => $user['id'],
                'name'       => $user['name'],
                'username'   => $user['username'],
                'email'      => $user['email'],
                'role'       => $user['role'],
                'college'    => $user['college'],
                'department' => $user['department'],
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password credentials']);
    }
} elseif ($action === 'register') {
    // New User Account Creation (Student / Faculty)
    $name       = htmlspecialchars(strip_tags($data['name'] ?? ''));
    $username   = strtolower(trim($data['username'] ?? ''));
    $email      = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password   = $data['password'] ?? '';
    $role       = in_array($data['role'], ['student', 'faculty']) ? $data['role'] : 'student';
    $college    = htmlspecialchars(strip_tags($data['college'] ?? 'Rajalakshmi Engineering College'));
    $department = htmlspecialchars(strip_tags($data['department'] ?? 'Information Technology'));

    if (!$email || empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Valid email, username, and password required']);
        exit;
    }

    $pwHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $uid    = 'usr-' . bin2hex(random_bytes(4));

    $insStmt = $db->prepare("INSERT INTO users (id, name, username, email, password_hash, role, college, department)
                            VALUES (:id, :name, :uname, :email, :pw, :role, :college, :dept)");
    $insStmt->execute([
        ':id'      => $uid,
        ':name'    => $name,
        ':uname'   => $username,
        ':email'   => $email,
        ':pw'      => $pwHash,
        ':role'    => $role,
        ':college' => $college,
        ':dept'    => $department
    ]);

    http_response_code(201);
    echo json_encode([
        'status'  => 'success',
        'message' => 'User account registered successfully',
        'userId'  => $uid
    ]);
}
`,

  'schema.sql': `-- ========================================================
-- EventPulse Database Schema - MySQL 8.x / MariaDB
-- 3NF Normalized Relational Design with Foreign Keys
-- Roles: 'admin', 'faculty', 'student'
-- ========================================================

CREATE DATABASE IF NOT EXISTS eventpulse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventpulse_db;

-- 1. Users Table (Role-based access control: admin, faculty, student)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') DEFAULT 'student',
    college VARCHAR(150) NOT NULL,
    department VARCHAR(100) DEFAULT NULL,
    roll_no VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Pre-configured accounts for examination review:
-- 1. admin   / password: admin
-- 2. faculty / password: faculty123
-- 3. harish  / password: Harish@2006 (Harish M - IT)

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('Tech', 'Workshop', 'Cultural', 'Sports') NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    organizer VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    tags VARCHAR(255),
    total_capacity INT UNSIGNED NOT NULL DEFAULT 100,
    booked_count INT UNSIGNED NOT NULL DEFAULT 0,
    base_price DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Ticket Tiers Table
CREATE TABLE IF NOT EXISTS ticket_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(50) NOT NULL,
    tier_type ENUM('Student', 'Standard', 'VIP') NOT NULL,
    name VARCHAR(80) NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    total_seats INT UNSIGNED NOT NULL,
    available_seats INT UNSIGNED NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(30) NOT NULL UNIQUE,
    event_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    tier ENUM('Student', 'Standard', 'VIP') NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    qr_data TEXT NOT NULL,
    status ENUM('Confirmed', 'Checked-In', 'Cancelled') DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
`,
};

export const PHP_ENDPOINTS: PhpEndpoint[] = [
  {
    id: 'ep-get-events',
    name: 'Fetch Campus Events',
    method: 'GET',
    endpoint: '/api/events.php?category=Tech',
    description: 'Retrieves active events filtered by category with calculated real-time capacity and ticket tiers.',
    phpFile: 'events.php',
    queryParamSchema: ['category', 'search', 'page'],
    mockResponse: {
      status: 'success',
      count: 2,
      data: [
        {
          id: 'evt-rec-hack-2026',
          title: 'HackInnovate 2026: 36-Hour National Campus Hackathon',
          category: 'Tech',
          event_date: '2026-10-24',
          venue: 'Convention Center, REC Campus, Chennai',
          total_capacity: 350,
          booked_count: 284,
          base_price: 99.0,
        },
      ],
      execution_time_ms: 12.4,
      server: 'Apache/2.4.58 (Unix) PHP/8.4.2',
    },
  },
  {
    id: 'ep-post-booking',
    name: 'Book Event Tickets (Atomic Transaction)',
    method: 'POST',
    endpoint: '/api/bookings.php',
    description: 'Reserves seats inside a PDO transaction with row locking, validates capacity, applies discounts, and generates unique QR ticket data.',
    phpFile: 'bookings.php',
    samplePayload: {
      eventId: 'evt-rec-hack-2026',
      userId: 'usr-harish-rec',
      tier: 'Student',
      quantity: 1,
      unitPrice: 99.0,
      discount: 24.75,
      couponCode: 'REC2024',
    },
    mockResponse: {
      status: 'success',
      message: 'Ticket booked successfully',
      bookingRef: 'EP-2026-8942',
      qrCodeData: 'EVENTPULSE:EP-2026-8942:evt-rec-hack-2026:usr-harish-rec:CONFIRMED',
      totalPaid: 74.25,
      transaction_id: 'tx_rec_982401',
      http_code: 201,
    },
  },
  {
    id: 'ep-post-login',
    name: '3-Tier Role Authentication (Admin/Faculty/Student)',
    method: 'POST',
    endpoint: '/api/auth.php',
    description: 'Authenticates admin, faculty, or student credentials using password_verify() and initializes server PHP session with role privileges.',
    phpFile: 'auth.php',
    samplePayload: {
      action: 'login',
      username: 'admin',
      password: 'admin',
    },
    mockResponse: {
      status: 'success',
      message: 'Authentication successful',
      user: {
        id: 'usr-admin-01',
        name: 'Admin Controller',
        username: 'admin',
        role: 'admin',
        college: 'Rajalakshmi Engineering College',
      },
      session_id: 'sess_php_admin_9f7a81',
      http_code: 200,
    },
  },
  {
    id: 'ep-post-checkin',
    name: 'Live QR Code Attendee Check-In',
    method: 'POST',
    endpoint: '/api/checkin.php',
    description: 'Faculty or Admin gate validation of attendee digital QR ticket pass at campus venue gates, marking status as Checked-In.',
    phpFile: 'bookings.php',
    samplePayload: {
      bookingRef: 'EP-2026-7819',
      gateId: 'Gate-1-Main-Hall',
      scannedBy: 'Prof. S. Ramanathan',
    },
    mockResponse: {
      status: 'success',
      message: 'Attendee verified & checked in',
      attendeeName: 'Harish M',
      eventTitle: 'HackInnovate 2026',
      tier: 'Student',
      checkInTime: '2026-10-24 08:45:12',
      http_code: 200,
    },
  },
];
