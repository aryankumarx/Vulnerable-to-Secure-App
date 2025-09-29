CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);


INSERT INTO users (username, password, role) VALUES
('alice', 'password123', 'user'),
('bob', 'securepass', 'user'),
('admin', 'rootpassword', 'admin')
ON CONFLICT (username) DO NOTHING;
--
