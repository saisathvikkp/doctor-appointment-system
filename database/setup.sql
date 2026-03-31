-- Doctor Appointment System Database Setup

CREATE DATABASE IF NOT EXISTS doctor_appointment;
USE doctor_appointment;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  experience INT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Insert sample doctors
INSERT INTO doctors (name, email, specialization, experience, phone) VALUES
('Dr. John Smith', 'john@hospital.com', 'Cardiology', 10, '555-0101'),
('Dr. Sarah Johnson', 'sarah@hospital.com', 'Dermatology', 8, '555-0102'),
('Dr. Michael Brown', 'michael@hospital.com', 'Orthopedics', 12, '555-0103'),
('Dr. Emily Davis', 'emily@hospital.com', 'Pediatrics', 7, '555-0104'),
('Dr. Robert Wilson', 'robert@hospital.com', 'Neurology', 15, '555-0105');
