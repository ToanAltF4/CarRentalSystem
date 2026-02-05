-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: ev_fleet
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_statuses`
--

DROP TABLE IF EXISTS `booking_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_statuses` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_statuses`
--

LOCK TABLES `booking_statuses` WRITE;
/*!40000 ALTER TABLE `booking_statuses` DISABLE KEYS */;
INSERT INTO `booking_statuses` VALUES (1,'PENDING','Pending'),(2,'CONFIRMED','Confirmed'),(3,'IN_PROGRESS','In Progress'),(4,'COMPLETED','Completed'),(5,'CANCELLED','Cancelled');
/*!40000 ALTER TABLE `booking_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(20) DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `rental_type_id` tinyint DEFAULT NULL,
  `pickup_method_id` tinyint DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `rental_fee` decimal(12,2) DEFAULT NULL,
  `driver_fee` decimal(12,2) DEFAULT NULL,
  `delivery_fee` decimal(12,2) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `status_id` tinyint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `notes` text,
  `status` varchar(30) DEFAULT NULL,
  `total_days` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `assigned_by` bigint DEFAULT NULL,
  `assigned_staff_id` bigint DEFAULT NULL,
  `delivery_address` varchar(255) DEFAULT NULL,
  `delivery_distance_km` decimal(8,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `user_id` (`user_id`),
  KEY `rental_type_id` (`rental_type_id`),
  KEY `pickup_method_id` (`pickup_method_id`),
  KEY `driver_id` (`driver_id`),
  KEY `idx_booking_vehicle` (`vehicle_id`),
  KEY `idx_booking_dates` (`start_date`,`end_date`),
  KEY `idx_booking_status` (`status_id`),
  KEY `idx_booking_code` (`booking_code`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`rental_type_id`) REFERENCES `rental_types` (`id`),
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`pickup_method_id`) REFERENCES `pickup_methods` (`id`),
  CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `bookings_ibfk_6` FOREIGN KEY (`status_id`) REFERENCES `booking_statuses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK-20260128-97F2',1,NULL,NULL,NULL,NULL,'Nguyen Duc Hoang','hoangnguyenduc674@gmail.com','2026-01-29','2026-01-31',1500000.00,3000000.00,NULL,NULL,3000000.00,NULL,'2026-01-28 06:28:40.633000','','Booking via website - Tesla Model 3','CANCELLED',2,'2026-01-28 06:50:48.460082',NULL,NULL,NULL,NULL,NULL),(2,'BK-20260128-4DDC',1,NULL,NULL,NULL,NULL,'Nguyen Duc Hoang','hoangnguyenduc674@gmail.com','2026-01-29','2026-02-03',1500000.00,7500000.00,NULL,NULL,7500000.00,NULL,'2026-01-28 06:50:58.142163','','Booking via website - Tesla Model 3','CONFIRMED',5,'2026-01-28 06:50:58.142163',NULL,NULL,NULL,NULL,NULL),(3,'BK-20260128-5F00',2,NULL,NULL,NULL,NULL,'Nguyen Duc Hoang','hoangnguyenduc674@gmail.com','2026-02-06','2026-02-21',1800000.00,27000000.00,NULL,NULL,27000000.00,NULL,'2026-01-28 07:30:11.633388','','Booking via website - Tesla Model Y','CONFIRMED',15,'2026-01-28 07:30:11.633388',NULL,NULL,NULL,NULL,NULL),(4,'BK-20260205-4886',21,NULL,NULL,NULL,NULL,'Nguyen Duc Hoang','hoangnguyenduc674@gmail.com','2026-02-06','2026-02-21',1600000.00,24000000.00,NULL,NULL,24000000.00,NULL,'2026-02-05 01:10:19.904226','','Booking via website - BMW i4','CONFIRMED',15,'2026-02-05 01:10:19.904226',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `condition_types`
--

DROP TABLE IF EXISTS `condition_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `condition_types` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `condition_types`
--

LOCK TABLES `condition_types` WRITE;
/*!40000 ALTER TABLE `condition_types` DISABLE KEYS */;
INSERT INTO `condition_types` VALUES (1,'GOOD','Good'),(2,'DAMAGED','Damaged');
/*!40000 ALTER TABLE `condition_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_pricing`
--

DROP TABLE IF EXISTS `delivery_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_pricing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `base_fee` decimal(10,2) DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_pricing`
--

LOCK TABLES `delivery_pricing` WRITE;
/*!40000 ALTER TABLE `delivery_pricing` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_licenses`
--

DROP TABLE IF EXISTS `driver_licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_licenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `license_type` varchar(50) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `front_image_url` varchar(500) DEFAULT NULL,
  `status_id` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_driver_licenses_user` (`user_id`),
  KEY `idx_driver_licenses_status` (`status_id`),
  CONSTRAINT `driver_licenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `driver_licenses_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `license_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_licenses`
--

LOCK TABLES `driver_licenses` WRITE;
/*!40000 ALTER TABLE `driver_licenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_licenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_pricing`
--

DROP TABLE IF EXISTS `driver_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_pricing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `daily_fee` decimal(10,2) DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_pricing`
--

LOCK TABLES `driver_pricing` WRITE;
/*!40000 ALTER TABLE `driver_pricing` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_statuses`
--

DROP TABLE IF EXISTS `driver_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_statuses` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_statuses`
--

LOCK TABLES `driver_statuses` WRITE;
/*!40000 ALTER TABLE `driver_statuses` DISABLE KEYS */;
INSERT INTO `driver_statuses` VALUES (1,'AVAILABLE','Available'),(2,'BUSY','Busy');
/*!40000 ALTER TABLE `driver_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status_id` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `driver_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init schema','SQL','V1__init_schema.sql',1640173578,'evfleet','2026-01-26 14:09:58',823,1),(2,'2','add driver license fields','SQL','V2__add_driver_license_fields.sql',-2113998977,'evfleet','2026-01-26 14:09:59',151,1),(3,'3','create driver licenses','SQL','V3__create_driver_licenses.sql',-1894296504,'evfleet','2026-01-26 14:09:59',50,1),(4,'4','drop license columns from users','SQL','V4__drop_license_columns_from_users.sql',66889246,'evfleet','2026-01-26 14:09:59',82,1),(5,'5','update stru db','SQL','V5__update_stru_db.sql',1131000110,'evfleet','2026-01-26 14:10:01',2031,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `handover_records`
--

DROP TABLE IF EXISTS `handover_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `handover_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint DEFAULT NULL,
  `battery_level` int DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `exterior_condition_id` tinyint DEFAULT NULL,
  `interior_condition_id` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `exterior_condition_id` (`exterior_condition_id`),
  KEY `interior_condition_id` (`interior_condition_id`),
  CONSTRAINT `handover_records_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `handover_records_ibfk_2` FOREIGN KEY (`exterior_condition_id`) REFERENCES `condition_types` (`id`),
  CONSTRAINT `handover_records_ibfk_3` FOREIGN KEY (`interior_condition_id`) REFERENCES `condition_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `handover_records`
--

LOCK TABLES `handover_records` WRITE;
/*!40000 ALTER TABLE `handover_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `handover_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inspections`
--

DROP TABLE IF EXISTS `inspections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inspections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint DEFAULT NULL,
  `battery_level` int DEFAULT NULL,
  `odometer` int DEFAULT NULL,
  `exterior_condition_id` tinyint DEFAULT NULL,
  `interior_condition_id` tinyint DEFAULT NULL,
  `has_damage` tinyint(1) DEFAULT NULL,
  `exterior_condition` varchar(30) DEFAULT NULL,
  `interior_condition` varchar(30) DEFAULT NULL,
  `charging_cable_present` bit(1) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `damage_description` text,
  `damage_photos` text,
  `inspected_at` datetime(6) DEFAULT NULL,
  `inspected_by` bigint DEFAULT NULL,
  `inspection_notes` text,
  `inspection_type` enum('PICKUP','RETURN') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `exterior_condition_id` (`exterior_condition_id`),
  KEY `interior_condition_id` (`interior_condition_id`),
  KEY `idx_inspection_booking` (`booking_id`),
  CONSTRAINT `inspections_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `inspections_ibfk_2` FOREIGN KEY (`exterior_condition_id`) REFERENCES `condition_types` (`id`),
  CONSTRAINT `inspections_ibfk_3` FOREIGN KEY (`interior_condition_id`) REFERENCES `condition_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inspections`
--

LOCK TABLES `inspections` WRITE;
/*!40000 ALTER TABLE `inspections` DISABLE KEYS */;
/*!40000 ALTER TABLE `inspections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_payment_statuses`
--

DROP TABLE IF EXISTS `invoice_payment_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_payment_statuses` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_payment_statuses`
--

LOCK TABLES `invoice_payment_statuses` WRITE;
/*!40000 ALTER TABLE `invoice_payment_statuses` DISABLE KEYS */;
INSERT INTO `invoice_payment_statuses` VALUES (1,'PENDING','Pending'),(2,'PAID','Paid');
/*!40000 ALTER TABLE `invoice_payment_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(30) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `rental_fee` decimal(12,2) DEFAULT NULL,
  `driver_fee` decimal(12,2) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT NULL,
  `damage_fee` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `payment_status_id` tinyint DEFAULT NULL,
  `payment_status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `idx_invoice_booking` (`booking_id`),
  KEY `idx_invoice_number` (`invoice_number`),
  KEY `idx_invoice_payment_status` (`payment_status_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`payment_status_id`) REFERENCES `invoice_payment_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `license_statuses`
--

DROP TABLE IF EXISTS `license_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `license_statuses` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `license_statuses`
--

LOCK TABLES `license_statuses` WRITE;
/*!40000 ALTER TABLE `license_statuses` DISABLE KEYS */;
INSERT INTO `license_statuses` VALUES (1,'PENDING','Pending'),(2,'APPROVED','Approved'),(3,'REJECTED','Rejected');
/*!40000 ALTER TABLE `license_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_codes`
--

DROP TABLE IF EXISTS `otp_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `verified` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_otp_email` (`email`),
  KEY `idx_otp_expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_codes`
--

LOCK TABLES `otp_codes` WRITE;
/*!40000 ALTER TABLE `otp_codes` DISABLE KEYS */;
INSERT INTO `otp_codes` VALUES (5,'2026-01-28 06:04:12.221043','hoangnguyenduc674@gmail.com','2026-01-28 06:14:12.219925','613948',0x01),(6,'2026-02-05 01:13:53.885555','HOANGNDSE181655@fpt.edu.vn','2026-02-05 01:23:53.883800','416684',0x01);
/*!40000 ALTER TABLE `otp_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK71lqwbwtklmljk3qlsugr1mig` (`token`),
  KEY `idx_reset_token` (`token`),
  KEY `idx_reset_email` (`email`),
  KEY `idx_reset_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'CASH','Cash',NULL),(2,'MOMO','MoMo',NULL),(3,'VNPAY','VNPay',NULL);
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_statuses`
--

DROP TABLE IF EXISTS `payment_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_statuses` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_statuses`
--

LOCK TABLES `payment_statuses` WRITE;
/*!40000 ALTER TABLE `payment_statuses` DISABLE KEYS */;
INSERT INTO `payment_statuses` VALUES (1,'SUCCESS','Success'),(2,'FAILED','Failed');
/*!40000 ALTER TABLE `payment_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `payment_method_id` tinyint DEFAULT NULL,
  `payment_status_id` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `payment_method_id` (`payment_method_id`),
  KEY `payment_status_id` (`payment_status_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`),
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pickup_methods`
--

DROP TABLE IF EXISTS `pickup_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pickup_methods` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pickup_methods`
--

LOCK TABLES `pickup_methods` WRITE;
/*!40000 ALTER TABLE `pickup_methods` DISABLE KEYS */;
INSERT INTO `pickup_methods` VALUES (1,'STORE','Store Pickup',NULL),(2,'DELIVERY','Delivery',NULL);
/*!40000 ALTER TABLE `pickup_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing`
--

DROP TABLE IF EXISTS `pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vehicle_category_id` bigint DEFAULT NULL,
  `daily_price` decimal(10,2) DEFAULT NULL,
  `weekly_price` decimal(10,2) DEFAULT NULL,
  `monthly_price` decimal(10,2) DEFAULT NULL,
  `overtime_fee_per_hour` decimal(8,2) DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pricing_category` (`vehicle_category_id`),
  KEY `idx_pricing_active` (`is_active`,`effective_from`,`effective_to`),
  CONSTRAINT `pricing_ibfk_1` FOREIGN KEY (`vehicle_category_id`) REFERENCES `vehicle_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing`
--

LOCK TABLES `pricing` WRITE;
/*!40000 ALTER TABLE `pricing` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `token` varchar(500) DEFAULT NULL,
  `expiry_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  KEY `idx_refresh_tokens_token` (`token`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,5,'e01b6cea-654d-4435-bfbb-ded0d63a1c83','2026-02-12 02:10:13'),(2,6,'68c7c19f-e42c-4ab3-94d6-206669ed840c','2026-02-12 02:03:30'),(3,7,'48d3d0ce-419a-42d3-a14d-e47f44a44f58','2026-02-12 02:10:29');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rental_types`
--

DROP TABLE IF EXISTS `rental_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rental_types` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental_types`
--

LOCK TABLES `rental_types` WRITE;
/*!40000 ALTER TABLE `rental_types` DISABLE KEYS */;
INSERT INTO `rental_types` VALUES (1,'SELF_DRIVE','Self Drive',NULL),(2,'WITH_DRIVER','With Driver',NULL);
/*!40000 ALTER TABLE `rental_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ROLE_CUSTOMER','Customer'),(2,'ROLE_STAFF','Staff'),(3,'ROLE_OPERATOR','Operator'),(4,'ROLE_ADMIN','Admin'),(5,'ROLE_DRIVER','Driver');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `license_front_image_url` varchar(500) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `license_status` varchar(30) DEFAULT NULL,
  `license_type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `driver_available` bit(1) DEFAULT NULL,
  `driver_status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `idx_users_email` (`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'Nguyen Duc Hoang','hoangnguyenduc674@gmail.com','$2a$10$N5bDMI1b8aXMSj5oNnCFE.Ne.Oor466N/jJhCvmabyTG.36JsX0qa',1,'2000-11-01','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/licenses/license_5_03d7e18f.webp','11111111111111111','APPROVED','PET license (fixed-term)','ACTIVE',NULL,NULL),(6,'Lê Anh Hòa','HOANGNDSE181655@fpt.edu.vn','$2a$10$I.upyWgzwWyZCeGDQ/aXS.dnPAdPIqNIcPOW35lr8kvJ2GXvkpBl2',5,'2000-11-01','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/licenses/license_6_f3d26f78.webp','11111111111111111','APPROVED','Legacy license (paper-based)','ACTIVE',NULL,NULL),(7,'Nguyễn Văn A','admin123@gmail.com','$2a$10$kWJ7vbRQYgfPd6p/.SXJxuiSseVbg4zC7HwovhuH3ZUD8J6ZDjCi2',4,NULL,NULL,NULL,NULL,NULL,'ACTIVE',0x00,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_categories`
--

DROP TABLE IF EXISTS `vehicle_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_categories`
--

LOCK TABLES `vehicle_categories` WRITE;
/*!40000 ALTER TABLE `vehicle_categories` DISABLE KEYS */;
INSERT INTO `vehicle_categories` VALUES (1,'Sedan','Premium electric sedan'),(2,'SUV','Electric SUV for all terrains'),(3,'Compact','Small economy electric car'),(4,'Luxury','High-end luxury electric vehicle'),(5,'Crossover','Versatile electric crossover');
/*!40000 ALTER TABLE `vehicle_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_last_location`
--

DROP TABLE IF EXISTS `vehicle_last_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_last_location` (
  `vehicle_id` bigint NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`vehicle_id`),
  CONSTRAINT `vehicle_last_location_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_last_location`
--

LOCK TABLES `vehicle_last_location` WRITE;
/*!40000 ALTER TABLE `vehicle_last_location` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicle_last_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_locations`
--

DROP TABLE IF EXISTS `vehicle_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `vehicle_id` bigint DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `vehicle_locations_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_locations`
--

LOCK TABLES `vehicle_locations` WRITE;
/*!40000 ALTER TABLE `vehicle_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicle_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_statuses`
--

DROP TABLE IF EXISTS `vehicle_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_statuses` (
  `id` tinyint NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_statuses`
--

LOCK TABLES `vehicle_statuses` WRITE;
/*!40000 ALTER TABLE `vehicle_statuses` DISABLE KEYS */;
INSERT INTO `vehicle_statuses` VALUES (1,'AVAILABLE','Available'),(2,'RENTED','Rented');
/*!40000 ALTER TABLE `vehicle_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `license_plate` varchar(20) DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `status_id` tinyint DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `battery_capacity_kwh` decimal(5,2) DEFAULT NULL,
  `charging_time_hours` decimal(4,2) DEFAULT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `range_km` int DEFAULT NULL,
  `seats` int DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `category_id` (`category_id`),
  KEY `idx_vehicles_status` (`status_id`),
  KEY `idx_vehicles_brand` (`brand`),
  KEY `idx_vehicles_name_model` (`name`,`model`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `vehicle_statuses` (`id`),
  CONSTRAINT `vehicles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `vehicle_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'Tesla Model 3','Model 3 Long Range','Tesla','51A-111.11',1500000.00,NULL,1,82.00,8.50,'Tesla Model 3 Long Range with Autopilot self-driving capability','https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',580,5,'AVAILABLE'),(2,'Tesla Model Y','Tesla Model Y','Tesla','51A-222.22',1800000.00,NULL,2,75.00,7.00,'High-performance Tesla Model Y SUV with spacious interior','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/d7ed75a9-5c86-4360-b9e0-a6cb1d4e0b6f.webp',480,5,'AVAILABLE'),(3,'Tesla Model S','Model S Plaid','Tesla','51A-333.33',2500000.00,NULL,4,100.00,10.00,'Tesla flagship sedan with 0-100km/h in 2.1 seconds','https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800',650,5,'AVAILABLE'),(4,'Tesla Model X','Tesla Model X','Tesla','51A-444.44',2800000.00,NULL,4,100.00,10.00,'Premium electric SUV with iconic falcon-wing doors','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/9b919651-b3de-4cdc-a69f-833e367cb9e3.webp',560,7,'RENTED'),(5,'VinFast VF e34','VinFast VF e34','VinFast','30A-555.55',600000.00,NULL,2,42.00,6.00,'Vietnamese electric car ideal for city commuting','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/cea4835d-a2f4-45b4-9646-cccceb49195d.webp',285,5,'AVAILABLE'),(6,'VinFast VF 8','VinFast VF 8','VinFast','30A-666.66',1200000.00,NULL,2,87.70,8.00,'VinFast VF 8 electric SUV with advanced ADAS technology','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/c2edc7a7-2dd0-45a5-baa4-299e562c00b3.webp',420,5,'AVAILABLE'),(7,'VinFast VF 9','VinFast VF 9','VinFast','30A-777.77',1800000.00,NULL,4,123.00,11.00,'VinFast flagship 7-seater luxury electric SUV','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/62d15728-b4c9-40bb-9aea-ab1a787a1709.webp',594,7,'MAINTENANCE'),(8,'VinFast VF 5','VinFast VF 5','VinFast','30A-888.88',450000.00,NULL,2,37.30,5.50,'Compact urban electric car, perfect for students','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/a4c4ab06-d4e0-4e4c-8586-250ffdd57b54.webp',300,5,'AVAILABLE'),(9,'BYD Seal','Seal Performance','BYD','51A-999.99',1300000.00,NULL,1,82.56,7.50,'Sporty electric sedan with aerodynamic design from BYD','https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800',570,5,'AVAILABLE'),(10,'BYD Atto 3','Atto 3 Extended','BYD','51A-101.01',900000.00,NULL,5,60.48,6.00,'BYD Atto 3 crossover with gym-inspired interior','https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800',420,5,'AVAILABLE'),(11,'BYD Dolphin','Dolphin Standard','BYD','51A-102.02',550000.00,NULL,3,44.90,5.00,'Compact electric car with youthful design','https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=800',340,5,'AVAILABLE'),(12,'Hyundai Ioniq 5','Hyundai Ioniq 5','Hyundai','29A-111.22',1100000.00,NULL,4,77.40,7.00,'Hyundai electric crossover with unique retro-futuristic design','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/6c188d01-f7de-4daf-a3bf-dafac5055cc1.webp',481,5,'AVAILABLE'),(13,'Hyundai Ioniq 6','Hyundai Ioniq 6','Hyundai','29A-222.33',1400000.00,NULL,2,77.40,7.50,'Aerodynamic electric sedan with lowest drag coefficient in class','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/d84f4cd7-5b81-4067-a41f-2e8ebac0ddc4.webp',614,5,'RENTED'),(14,'Hyundai Kona Electric','Hyundai Kona Electric','Hyundai','29A-333.44',750000.00,NULL,2,64.00,6.00,'Compact electric SUV perfect for families','https://pub-d0dfae1987fc47a4adf266c21181f5e1.r2.dev/vehicles/ee29a1fc-f8bd-437d-ae8f-ac69e3494dad.webp',400,5,'AVAILABLE'),(15,'Kia EV6','EV6 GT-Line','Kia','30A-444.55',1200000.00,NULL,5,77.40,7.00,'Bold Kia EV6 crossover with 800V ultra-fast charging','https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',510,5,'AVAILABLE'),(16,'Kia EV9','EV9 Land','Kia','30A-555.66',2000000.00,NULL,4,99.80,9.00,'Large 7-seater electric SUV with lounge-like interior','https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800',541,7,'AVAILABLE'),(17,'Mercedes EQS','EQS 450+','Mercedes-Benz','51A-666.77',3500000.00,NULL,4,107.80,11.00,'Mercedes flagship electric sedan with MBUX Hyperscreen','https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',780,5,'AVAILABLE'),(18,'Mercedes EQE','EQE 350+','Mercedes-Benz','51A-777.88',2800000.00,NULL,4,90.56,9.50,'Mid-size sporty electric sedan from Mercedes','https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',654,5,'MAINTENANCE'),(19,'Mercedes EQB','EQB 250+','Mercedes-Benz','51A-888.99',1800000.00,NULL,2,66.50,7.00,'Compact 7-seater electric SUV for families','https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',419,7,'AVAILABLE'),(20,'BMW iX','iX xDrive50','BMW','30A-999.00',3000000.00,NULL,4,111.50,10.00,'Premium BMW electric SUV with iDrive 8 technology','https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',630,5,'AVAILABLE'),(21,'BMW i4','i4 eDrive40','BMW','30A-000.11',1600000.00,NULL,1,83.90,8.00,'BMW i4 Gran Coupe with signature sporty driving dynamics','https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',590,5,'AVAILABLE');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-05  3:56:55
