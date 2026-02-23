#!/bin/bash
sudo mysql <<EOF
DROP DATABASE IF EXISTS ev_fleet;
CREATE DATABASE ev_fleet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON ev_fleet.* TO 'evfleet'@'%';
FLUSH PRIVILEGES;
EOF
echo "Database re-created with utf8mb4!"
