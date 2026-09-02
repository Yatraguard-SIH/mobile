CREATE TABLE user_table (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_table (
    trip_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    destination VARCHAR(255) NOT NULL,
    total_budget DECIMAL(10, 2),
    days INT,
    locked_route_polyline TEXT,
    FOREIGN KEY (user_id) REFERENCES user_table(user_id)
);

CREATE TABLE safe_haven_info_table (
    haven_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_number VARCHAR(15),
    category VARCHAR(50)
);