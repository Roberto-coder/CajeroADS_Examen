-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bancoads
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cbanco`
--

DROP TABLE IF EXISTS `cbanco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cbanco` (
  `idcbanco` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`idcbanco`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cbanco`
--

LOCK TABLES `cbanco` WRITE;
/*!40000 ALTER TABLE `cbanco` DISABLE KEYS */;
/*!40000 ALTER TABLE `cbanco` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `paterno` varchar(45) NOT NULL,
  `materno` varchar(45) NOT NULL,
  `fechaNacimiento` varchar(30) NOT NULL,
  `cuenta` varchar(30) NOT NULL,
  `CLABE` varchar(18) NOT NULL,
  `idDebito` int DEFAULT NULL,
  `celular` varchar(10) NOT NULL,
  `SPEI` varchar(45) NOT NULL,
  `clave` int NOT NULL,
  `idCredito` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idDebito_idx` (`idDebito`),
  KEY `idCredito_idx` (`idCredito`),
  CONSTRAINT `idCredito` FOREIGN KEY (`idCredito`) REFERENCES `tarjetacredito` (`id`),
  CONSTRAINT `idDebito` FOREIGN KEY (`idDebito`) REFERENCES `tarjetadebito` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Josue','Nájera','Jiménez','13/05/2003','123','123',1,'5525142581','noseques',1234,1);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados`
--

DROP TABLE IF EXISTS `estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estado` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados`
--

LOCK TABLES `estados` WRITE;
/*!40000 ALTER TABLE `estados` DISABLE KEYS */;
INSERT INTO `estados` VALUES (1,'Rechazada'),(2,'Aprobada');
/*!40000 ALTER TABLE `estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagoservicio`
--

DROP TABLE IF EXISTS `pagoservicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagoservicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idCliente` int NOT NULL,
  `organizacion` varchar(50) NOT NULL,
  `monto` decimal(8,2) NOT NULL,
  `idEstado` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idCliente_idx` (`idCliente`),
  KEY `idEstado_idx` (`idEstado`),
  CONSTRAINT `idClient` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `idEstado` FOREIGN KEY (`idEstado`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagoservicio`
--

LOCK TABLES `pagoservicio` WRITE;
/*!40000 ALTER TABLE `pagoservicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagoservicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarjetacredito`
--

DROP TABLE IF EXISTS `tarjetacredito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarjetacredito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(45) NOT NULL,
  `fechaVencimiento` varchar(45) NOT NULL,
  `credito` decimal(8,2) NOT NULL,
  `PIN` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarjetacredito`
--

LOCK TABLES `tarjetacredito` WRITE;
/*!40000 ALTER TABLE `tarjetacredito` DISABLE KEYS */;
INSERT INTO `tarjetacredito` VALUES (1,'1245','03/27',3000.00,59);
/*!40000 ALTER TABLE `tarjetacredito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarjetadebito`
--

DROP TABLE IF EXISTS `tarjetadebito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarjetadebito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saldo` decimal(8,2) NOT NULL DEFAULT '0.00',
  `numero` varchar(30) NOT NULL,
  `Fecha` varchar(30) NOT NULL,
  `PIN` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarjetadebito`
--

LOCK TABLES `tarjetadebito` WRITE;
/*!40000 ALTER TABLE `tarjetadebito` DISABLE KEYS */;
INSERT INTO `tarjetadebito` VALUES (1,97.00,'1234','04/26',123);
/*!40000 ALTER TABLE `tarjetadebito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_error`
--

DROP TABLE IF EXISTS `tipo_error`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_error` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_error`
--

LOCK TABLES `tipo_error` WRITE;
/*!40000 ALTER TABLE `tipo_error` DISABLE KEYS */;
INSERT INTO `tipo_error` VALUES (1,'Error en la conexion'),(2,'Error de banco'),(3,'Error interno'),(4,'Error desconocido'),(5,'Error sin fondos');
/*!40000 ALTER TABLE `tipo_error` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaccion`
--

DROP TABLE IF EXISTS `transaccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idCliente` int NOT NULL,
  `idBanco` int NOT NULL,
  `monto` decimal(8,2) NOT NULL,
  `idEstado` int NOT NULL,
  `concepto` varchar(45) NOT NULL,
  `SPEI` varchar(50) DEFAULT NULL,
  `fecha` varchar(45) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `paterno` varchar(45) DEFAULT NULL,
  `materno` varchar(45) DEFAULT NULL,
  `cuenta` varchar(45) DEFAULT NULL,
  `tarjeta` varchar(45) DEFAULT NULL,
  `CLABE` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idBanco_idx` (`idBanco`),
  KEY `idCliente_idx` (`idCliente`),
  KEY `idest_idx` (`idEstado`),
  CONSTRAINT `idBanco` FOREIGN KEY (`idBanco`) REFERENCES `cbanco` (`idcbanco`),
  CONSTRAINT `idCliente` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `idest` FOREIGN KEY (`idEstado`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaccion`
--

LOCK TABLES `transaccion` WRITE;
/*!40000 ALTER TABLE `transaccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaccion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-05-21 21:56:36
