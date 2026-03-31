import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Sathvik@4kp",
    database="doctor_system"
)

cursor = db.cursor()