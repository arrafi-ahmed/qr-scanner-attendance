CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    name       VARCHAR(255),
    role       SMALLINT            NOT NULL check ( role in (10, 20) ), -- admin = 10, manager = 20
    created_at TIMESTAMP
);
CREATE TABLE password_reset
(
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    user_id    INT REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE employee
(
    id          SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255),
    status      SMALLINT            NOT NULL check ( status in (0, 1) ), -- active = 1, inactive = 0,
    uuid        VARCHAR(255) UNIQUE NOT NULL,
    created_at  TIMESTAMP
);
CREATE TABLE bus
(
    id         SERIAL PRIMARY KEY,
    bus_id     VARCHAR(255) UNIQUE NOT NULL,
    name       VARCHAR(255),
    status     SMALLINT            NOT NULL check ( status in (0, 1) ), -- active = 1, inactive = 0,
    uuid       VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP
);
CREATE TABLE scan_bus
(
    id         SERIAL PRIMARY KEY,
    bus_id     INT REFERENCES bus (id) ON DELETE CASCADE,
    created_at TIMESTAMP
);
CREATE TABLE scan_employee
(
    id          SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee (id) ON DELETE CASCADE,
    scan_bus_id INT REFERENCES scan_bus (id) ON DELETE CASCADE,
    created_at  TIMESTAMP
);