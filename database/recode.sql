CREATE DATABASE  IF NOT EXISTS `vit` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `vit`;
-- MySQL dump 10.16  Distrib 10.1.24-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: vit
-- ------------------------------------------------------
-- Server version	10.1.34-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `branch`
--

DROP TABLE IF EXISTS `branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `branch` (
  `idbranch` varchar(45) NOT NULL,
  `revision` int(11) DEFAULT NULL,
  `nome` varchar(45) DEFAULT NULL,
  `utente` varchar(45) NOT NULL,
  `repository` int(11) NOT NULL,
  PRIMARY KEY (`idbranch`),
  KEY `utenti2_idx` (`utente`),
  KEY `fileAdd_idx` (`revision`),
  CONSTRAINT `fileAdd` FOREIGN KEY (`revision`) REFERENCES `file` (`idFile`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `utenti2` FOREIGN KEY (`utente`) REFERENCES `utenti` (`nickname`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch`
--

LOCK TABLES `branch` WRITE;
/*!40000 ALTER TABLE `branch` DISABLE KEYS */;
/*!40000 ALTER TABLE `branch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commit`
--

DROP TABLE IF EXISTS `commit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commit` (
  `idModifiche` varchar(45) NOT NULL,
  `padre1` varchar(45) DEFAULT NULL,
  `padre2` varchar(45) DEFAULT NULL,
  `file` int(11) NOT NULL,
  `utente` varchar(45) NOT NULL,
  `descrizione` varchar(200) NOT NULL,
  `dataModifica` datetime DEFAULT NULL,
  `branch` varchar(45) NOT NULL,
  PRIMARY KEY (`idModifiche`),
  KEY `utente2_idx` (`utente`),
  KEY `file1_idx` (`file`),
  KEY `branch1_idx` (`branch`),
  CONSTRAINT `branch1` FOREIGN KEY (`branch`) REFERENCES `branch` (`idbranch`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `file1` FOREIGN KEY (`file`) REFERENCES `file` (`idFile`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `utente3` FOREIGN KEY (`utente`) REFERENCES `utenti` (`nickname`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commit`
--

LOCK TABLES `commit` WRITE;
/*!40000 ALTER TABLE `commit` DISABLE KEYS */;
/*!40000 ALTER TABLE `commit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `file` (
  `idFile` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(200) NOT NULL,
  `nome` varchar(45) NOT NULL,
  `repository` int(11) NOT NULL,
  `utente` varchar(45) NOT NULL,
  `tipo` varchar(45) NOT NULL,
  `formato` varchar(45) NOT NULL,
  PRIMARY KEY (`idFile`),
  KEY `utente4_idx` (`utente`),
  KEY `repoo_idx` (`repository`),
  CONSTRAINT `repoo` FOREIGN KEY (`repository`) REFERENCES `repository` (`idRepository`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `utente4` FOREIGN KEY (`utente`) REFERENCES `utenti` (`nickname`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=524 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partecipazione`
--

DROP TABLE IF EXISTS `partecipazione`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partecipazione` (
  `utente` varchar(45) NOT NULL,
  `repository` int(11) NOT NULL,
  `diritto` tinyint(1) NOT NULL,
  `data` datetime DEFAULT NULL,
  PRIMARY KEY (`utente`,`repository`),
  KEY `repo2_idx` (`repository`),
  CONSTRAINT `partecipazione1` FOREIGN KEY (`utente`) REFERENCES `utenti` (`nickname`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `repoooo` FOREIGN KEY (`repository`) REFERENCES `repository` (`idRepository`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partecipazione`
--

LOCK TABLES `partecipazione` WRITE;
/*!40000 ALTER TABLE `partecipazione` DISABLE KEYS */;
/*!40000 ALTER TABLE `partecipazione` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repository`
--

DROP TABLE IF EXISTS `repository`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `repository` (
  `idRepository` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) DEFAULT NULL,
  `descrizione` varchar(150) DEFAULT NULL,
  `avatar` varchar(200) DEFAULT NULL,
  `dataCreazione` datetime DEFAULT NULL,
  `admin` varchar(45) NOT NULL,
  `URL` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idRepository`),
  KEY `idUtente_idx` (`admin`),
  CONSTRAINT `admin1` FOREIGN KEY (`admin`) REFERENCES `utenti` (`nickname`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=306 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repository`
--

LOCK TABLES `repository` WRITE;
/*!40000 ALTER TABLE `repository` DISABLE KEYS */;
/*!40000 ALTER TABLE `repository` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `revg`
--

DROP TABLE IF EXISTS `revg`;
/*!50001 DROP VIEW IF EXISTS `revg`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `revg` (
  `ID` tinyint NOT NULL,
  `nomeFile` tinyint NOT NULL,
  `path` tinyint NOT NULL,
  `utente` tinyint NOT NULL,
  `tipo` tinyint NOT NULL,
  `padre1` tinyint NOT NULL,
  `padre2` tinyint NOT NULL,
  `branch` tinyint NOT NULL,
  `dataModifica` tinyint NOT NULL,
  `repository` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `utenti`
--

DROP TABLE IF EXISTS `utenti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utenti` (
  `nickname` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `nome` varchar(45) NOT NULL,
  `cognome` varchar(45) NOT NULL,
  `mail` varchar(45) NOT NULL,
  PRIMARY KEY (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utenti`
--

LOCK TABLES `utenti` WRITE;
/*!40000 ALTER TABLE `utenti` DISABLE KEYS */;
/*!40000 ALTER TABLE `utenti` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `revg`
--

/*!50001 DROP TABLE IF EXISTS `revg`*/;
/*!50001 DROP VIEW IF EXISTS `revg`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `revg` AS select `f`.`idFile` AS `ID`,`f`.`nome` AS `nomeFile`,`f`.`path` AS `path`,`f`.`utente` AS `utente`,`f`.`tipo` AS `tipo`,`c`.`padre1` AS `padre1`,`c`.`padre2` AS `padre2`,`c`.`branch` AS `branch`,`c`.`dataModifica` AS `dataModifica`,`f`.`repository` AS `repository` from (`commit` `c` join `file` `f`) where (`c`.`file` = `f`.`idFile`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-09-25 17:15:43
