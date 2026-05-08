-- Representantes
CREATE TABLE IF NOT EXISTS representantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(20),
  userId INT,
  metaAnualFat DECIMAL(12, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX userIdIdx (userId),
  INDEX codigoIdx (codigo)
);

-- Client Representatives
CREATE TABLE IF NOT EXISTS clientRepresentatives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientId INT NOT NULL,
  representanteId INT NOT NULL,
  isPrimary BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX clientIdIdx (clientId),
  INDEX representanteIdIdx (representanteId)
);

-- Solutions
CREATE TABLE IF NOT EXISTS solutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  especie VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX codigoIdx (codigo)
);

-- Subsolutions
CREATE TABLE IF NOT EXISTS subsolutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solutionId INT NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX solutionIdIdx (solutionId)
);

-- Targets Meta
CREATE TABLE IF NOT EXISTS targetsMeta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  representanteId INT NOT NULL,
  subsolutionId INT NOT NULL,
  mes INT NOT NULL,
  ano INT NOT NULL,
  faturamento DECIMAL(12, 2) DEFAULT 0,
  volume DECIMAL(12, 2) DEFAULT 0,
  percentual DECIMAL(5, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX representanteIdIdx (representanteId),
  INDEX subsolutionIdIdx (subsolutionId),
  INDEX mesAnoIdx (mes, ano)
);
