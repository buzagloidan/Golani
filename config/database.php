<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Use Railway environment variables in production, fallback for local development
        $this->host = $_ENV['DATABASE_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DATABASE_NAME'] ?? 'golani_game';
        $this->username = $_ENV['DATABASE_USER'] ?? 'root';
        $this->password = $_ENV['DATABASE_PASSWORD'] ?? '';
        
        // Railway MySQL URL format: mysql://user:password@host:port/database
        if (isset($_ENV['DATABASE_URL'])) {
            $db_url = parse_url($_ENV['DATABASE_URL']);
            $this->host = $db_url['host'];
            $this->db_name = ltrim($db_url['path'], '/');
            $this->username = $db_url['user'];
            $this->password = $db_url['pass'];
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            die("Database connection failed");
        }

        return $this->conn;
    }
}
?>