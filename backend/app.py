import datetime
import os
import sqlite3

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from flask_mail import Mail, Message
except ImportError:  # pragma: no cover - graceful fallback when dependency is missing
    Mail = None
    Message = None


app = Flask(__name__)
CORS(app)

app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "587"))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "false").lower() == "true"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER", app.config["MAIL_USERNAME"])

SECRET_KEY = "doctorproject123"
DATABASE = "doctor_appointment.db"
DEFAULT_DOCTOR_PASSWORD = "doctor123"
DEFAULT_ADMIN_EMAIL = "admin@login.com"
DEFAULT_ADMIN_PASSWORD = "admin"
DEFAULT_PAYMENT_MODE = "Pay at clinic after consultation"

mail = Mail(app) if Mail else None


def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


def create_token(email, role):
    return jwt.encode(
        {
            "email": email,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        },
        SECRET_KEY,
        algorithm="HS256",
    )


def is_mail_configured():
    return bool(
        mail
        and Message
        and app.config.get("MAIL_USERNAME")
        and app.config.get("MAIL_PASSWORD")
        and app.config.get("MAIL_DEFAULT_SENDER")
    )


def send_booking_confirmation_email(
    patient_email,
    patient_name,
    doctor_name,
    appointment_date,
    appointment_time,
    clinic_address,
    consultation_fee,
    payment_note,
):
    if not is_mail_configured():
        return False, "Email service is not configured yet."

    try:
        message = Message(
            subject="Appointment Booking Confirmation - CareFlow",
            recipients=[patient_email],
        )
        message.body = (
            f"Hello {patient_name},\n\n"
            f"Your appointment request has been booked successfully on CareFlow.\n\n"
            f"Doctor: {doctor_name}\n"
            f"Date: {appointment_date}\n"
            f"Time: {appointment_time}\n"
            f"Clinic Address: {clinic_address}\n"
            f"Consultation Fee: Rs. {consultation_fee}\n"
            f"Payment: {payment_note}\n"
            f"Status: Pending\n\n"
            "You will receive updates when the doctor responds.\n\n"
            "Thank you,\n"
            "CareFlow Team"
        )
        mail.send(message)
        return True, "Confirmation email sent."
    except Exception as exc:  # pragma: no cover - depends on mail transport
        return False, str(exc)


def ensure_doctor_password_column(cursor):
    cursor.execute("PRAGMA table_info(doctors)")
    columns = {column[1] for column in cursor.fetchall()}

    if "password" not in columns:
        cursor.execute(
            f"ALTER TABLE doctors ADD COLUMN password TEXT DEFAULT '{DEFAULT_DOCTOR_PASSWORD}'"
        )
        cursor.execute(
            "UPDATE doctors SET password=? WHERE password IS NULL OR password=''",
            (DEFAULT_DOCTOR_PASSWORD,),
        )


def ensure_doctor_profile_columns(cursor):
    cursor.execute("PRAGMA table_info(doctors)")
    columns = {column[1] for column in cursor.fetchall()}

    if "address" not in columns:
        cursor.execute("ALTER TABLE doctors ADD COLUMN address TEXT")

    if "consultation_fee" not in columns:
        cursor.execute("ALTER TABLE doctors ADD COLUMN consultation_fee INTEGER DEFAULT 500")

    if "payment_note" not in columns:
        cursor.execute(
            f"ALTER TABLE doctors ADD COLUMN payment_note TEXT DEFAULT '{DEFAULT_PAYMENT_MODE}'"
        )

    cursor.execute(
        """
        UPDATE doctors
        SET address = COALESCE(NULLIF(address, ''), 'Main CareFlow Clinic, City Center'),
            consultation_fee = COALESCE(consultation_fee, 500),
            payment_note = COALESCE(NULLIF(payment_note, ''), ?)
        """,
        (DEFAULT_PAYMENT_MODE,),
    )


def init_db():
    should_seed_doctors = not os.path.exists(DATABASE)

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'patient'
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            specialization TEXT NOT NULL,
            experience INTEGER,
            phone TEXT,
            password TEXT DEFAULT 'doctor123',
            address TEXT,
            consultation_fee INTEGER DEFAULT 500,
            payment_note TEXT DEFAULT 'Pay at clinic after consultation'
        )
        """
    )
    ensure_doctor_password_column(cursor)
    ensure_doctor_profile_columns(cursor)

    cursor.execute(
        """
        INSERT OR IGNORE INTO users(name, email, password, role)
        VALUES (?, ?, ?, 'admin')
        """,
        ("CareFlow Admin", DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD),
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (patient_id) REFERENCES users(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            feedback TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(patient_id, doctor_id),
            FOREIGN KEY (patient_id) REFERENCES users(id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )

    if should_seed_doctors:
        sample_doctors = [
            (
                "Dr. John Smith",
                "john@hospital.com",
                "Cardiology",
                10,
                "555-0101",
                DEFAULT_DOCTOR_PASSWORD,
                "12 Heart Care Avenue, Downtown Medical Center",
                900,
                DEFAULT_PAYMENT_MODE,
            ),
            (
                "Dr. Sarah Johnson",
                "sarah@hospital.com",
                "Dermatology",
                8,
                "555-0102",
                DEFAULT_DOCTOR_PASSWORD,
                "24 Skin Wellness Road, Lakeview Clinic Block",
                700,
                DEFAULT_PAYMENT_MODE,
            ),
            (
                "Dr. Michael Brown",
                "michael@hospital.com",
                "Orthopedics",
                12,
                "555-0103",
                DEFAULT_DOCTOR_PASSWORD,
                "8 Ortho Spine Street, Sunrise Hospital Wing B",
                1000,
                DEFAULT_PAYMENT_MODE,
            ),
            (
                "Dr. Emily Davis",
                "emily@hospital.com",
                "Pediatrics",
                7,
                "555-0104",
                DEFAULT_DOCTOR_PASSWORD,
                "31 Kids Care Lane, Green Park Family Clinic",
                600,
                DEFAULT_PAYMENT_MODE,
            ),
            (
                "Dr. Robert Wilson",
                "robert@hospital.com",
                "Neurology",
                15,
                "555-0105",
                DEFAULT_DOCTOR_PASSWORD,
                "5 Neuro Specialty Plaza, Central Health Campus",
                1200,
                DEFAULT_PAYMENT_MODE,
            ),
        ]

        cursor.executemany(
            """
            INSERT INTO doctors (
                name, email, specialization, experience, phone, password, address, consultation_fee, payment_note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            sample_doctors,
        )

    db.commit()
    db.close()


def serialize_patient_appointments(rows):
    return [
        {
            "id": row["id"],
            "doctor_id": row["doctor_id"],
            "doctor": row["doctor"],
            "address": row["address"],
            "consultation_fee": row["consultation_fee"],
            "payment_note": row["payment_note"],
            "date": row["date"],
            "time": row["time"],
            "status": row["status"],
            "review_submitted": bool(row["review_submitted"]),
        }
        for row in rows
    ]


def serialize_doctor_appointments(rows):
    return [
        {
            "id": row["id"],
            "patient": row["patient"],
            "date": row["date"],
            "time": row["time"],
            "status": row["status"],
        }
        for row in rows
    ]


def serialize_admin_appointments(rows):
    return [
        {
            "id": row["id"],
            "patient": row["patient"],
            "doctor": row["doctor"],
            "address": row["address"],
            "consultation_fee": row["consultation_fee"],
            "date": row["date"],
            "time": row["time"],
            "status": row["status"],
        }
        for row in rows
    ]


def serialize_reviews(rows):
    return [
        {
            "id": row["id"],
            "patient": row["patient"],
            "rating": row["rating"],
            "feedback": row["feedback"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def serialize_notifications(rows):
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "message": row["message"],
            "type": row["type"],
            "is_read": bool(row["is_read"]),
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def create_notification(user_id, title, message, notification_type):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, ?, 0)
        """,
        (user_id, title, message, notification_type),
    )
    db.commit()
    db.close()


init_db()


@app.route("/")
def home():
    return "Doctor Appointment Backend Running"


@app.route("/test")
def test():
    return jsonify({"message": "Backend is working"})


@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json or {}
        name = data.get("name")
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"message": "All fields required"}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE email=?", (email,))
        user = cursor.fetchone()

        if user:
            db.close()
            return jsonify({"message": "Email already registered"}), 400

        cursor.execute("SELECT id FROM doctors WHERE email=?", (email,))
        doctor = cursor.fetchone()

        if doctor:
            db.close()
            return jsonify({"message": "Email already registered"}), 400

        cursor.execute(
            "INSERT INTO users(name,email,password,role) VALUES(?,?,?,'patient')",
            (name, email, password),
        )
        db.commit()
        db.close()
        return jsonify({"message": "User Registered Successfully"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT id,name,specialization,email,password FROM doctors WHERE email=? AND password=?",
            (email, password),
        )
        doctor = cursor.fetchone()

        if doctor:
            db.close()
            return jsonify(
                {
                    "message": "Login Successful",
                    "token": create_token(doctor["email"], "doctor"),
                    "user": {
                        "id": doctor["id"],
                        "name": doctor["name"],
                        "email": doctor["email"],
                        "role": "doctor",
                        "specialization": doctor["specialization"],
                    },
                }
            )

        cursor.execute(
            "SELECT id,name,email,role FROM users WHERE email=? AND password=?",
            (email, password),
        )
        user = cursor.fetchone()
        db.close()

        if user:
            return jsonify(
                {
                    "message": "Login Successful",
                    "token": create_token(user["email"], user["role"]),
                    "user": {
                        "id": user["id"],
                        "name": user["name"],
                        "email": user["email"],
                        "role": user["role"],
                    },
                }
            )

        return jsonify({"message": "Invalid Login"}), 401
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/doctors", methods=["GET"])
def doctors():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT doctors.id,
                   doctors.name,
                   doctors.specialization,
                   doctors.email,
                   doctors.experience,
                   doctors.address,
                   doctors.consultation_fee,
                   doctors.payment_note,
                   AVG(reviews.rating) AS average_rating,
                   COUNT(reviews.id) AS review_count
            FROM doctors
            LEFT JOIN reviews ON doctors.id = reviews.doctor_id
            GROUP BY doctors.id, doctors.name, doctors.specialization, doctors.email, doctors.experience,
                     doctors.address, doctors.consultation_fee, doctors.payment_note
            ORDER BY doctors.id ASC
            """
        )
        result = cursor.fetchall()
        db.close()

        doctors_list = [
            {
                "id": doctor["id"],
                "name": doctor["name"],
                "specialization": doctor["specialization"],
                "email": doctor["email"],
                "experience": f"{doctor['experience'] or 5}+ Years",
                "address": doctor["address"],
                "consultation_fee": doctor["consultation_fee"],
                "payment_note": doctor["payment_note"],
                "average_rating": round(doctor["average_rating"] or 0, 1),
                "review_count": doctor["review_count"] or 0,
            }
            for doctor in result
        ]

        return jsonify(doctors_list)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/doctors/<int:doctor_id>", methods=["GET"])
def doctor_details(doctor_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT doctors.id,
                   doctors.name,
                   doctors.specialization,
                   doctors.email,
                   doctors.experience,
                   doctors.address,
                   doctors.consultation_fee,
                   doctors.payment_note,
                   AVG(reviews.rating) AS average_rating,
                   COUNT(reviews.id) AS review_count
            FROM doctors
            LEFT JOIN reviews ON doctors.id = reviews.doctor_id
            WHERE doctors.id=?
            GROUP BY doctors.id, doctors.name, doctors.specialization, doctors.email, doctors.experience,
                     doctors.address, doctors.consultation_fee, doctors.payment_note
            """,
            (doctor_id,),
        )
        doctor = cursor.fetchone()
        db.close()

        if not doctor:
            return jsonify({"message": "Doctor not found"}), 404

        return jsonify(
            {
                "id": doctor["id"],
                "name": doctor["name"],
                "specialization": doctor["specialization"],
                "email": doctor["email"],
                "experience": f"{doctor['experience'] or 5}+ Years",
                "address": doctor["address"],
                "consultation_fee": doctor["consultation_fee"],
                "payment_note": doctor["payment_note"],
                "average_rating": round(doctor["average_rating"] or 0, 1),
                "review_count": doctor["review_count"] or 0,
            }
        )
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/book", methods=["POST"])
def book():
    try:
        data = request.json or {}
        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        date = data.get("date")
        time = data.get("time")

        if not patient_id or not doctor_id or not date or not time:
            return jsonify({"message": "patient_id, doctor_id, date and time are required"}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT name, email FROM users WHERE id=?", (patient_id,))
        patient = cursor.fetchone()
        cursor.execute(
            "SELECT name, address, consultation_fee, payment_note FROM doctors WHERE id=?",
            (doctor_id,),
        )
        doctor = cursor.fetchone()

        if not patient or not doctor:
            db.close()
            return jsonify({"message": "Patient or doctor not found"}), 404

        cursor.execute(
            """
            INSERT INTO appointments (patient_id, doctor_id, date, time, status)
            VALUES (?, ?, ?, ?, 'Pending')
            """,
            (patient_id, doctor_id, date, time),
        )
        db.commit()
        db.close()

        email_sent, email_message = send_booking_confirmation_email(
            patient["email"],
            patient["name"],
            doctor["name"],
            date,
            time,
            doctor["address"],
            doctor["consultation_fee"],
            doctor["payment_note"],
        )

        response_message = "Appointment booked and confirmation email sent." if email_sent else "Appointment booked successfully."
        create_notification(
            patient_id,
            "Appointment booked",
            (
                f"Your appointment request with {doctor['name']} for {date} at {time} is now pending. "
                f"Meet at {doctor['address']}. Fee: Rs. {doctor['consultation_fee']}. "
                f"{doctor['payment_note']}."
            ),
            "booking",
        )
        return jsonify(
            {
                "message": response_message,
                "email_sent": email_sent,
                "email_message": email_message,
                "appointment_summary": {
                    "doctor": doctor["name"],
                    "address": doctor["address"],
                    "consultation_fee": doctor["consultation_fee"],
                    "payment_note": doctor["payment_note"],
                    "date": date,
                    "time": time,
                    "status": "Pending",
                },
            }
        )
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/appointments/<int:patient_id>", methods=["GET"])
def appointments(patient_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT appointments.id,
                   doctors.id AS doctor_id,
                   doctors.name AS doctor,
                   doctors.address,
                   doctors.consultation_fee,
                   doctors.payment_note,
                   appointments.date,
                   appointments.time,
                   appointments.status,
                   EXISTS(
                     SELECT 1
                     FROM reviews
                     WHERE reviews.patient_id = appointments.patient_id
                       AND reviews.doctor_id = appointments.doctor_id
                   ) AS review_submitted
            FROM appointments
            JOIN doctors ON appointments.doctor_id = doctors.id
            WHERE appointments.patient_id=?
            ORDER BY appointments.date ASC, appointments.time ASC
            """,
            (patient_id,),
        )
        result = cursor.fetchall()
        db.close()
        return jsonify(serialize_patient_appointments(result))
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/cancel/<int:appointment_id>", methods=["DELETE"])
def cancel(appointment_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT appointments.patient_id,
                   appointments.date,
                   appointments.time,
                   doctors.name AS doctor_name
            FROM appointments
            JOIN doctors ON appointments.doctor_id = doctors.id
            WHERE appointments.id=?
            """,
            (appointment_id,),
        )
        appointment = cursor.fetchone()

        if not appointment:
            db.close()
            return jsonify({"message": "Appointment not found"}), 404

        cursor.execute("DELETE FROM appointments WHERE id=?", (appointment_id,))
        db.commit()
        db.close()
        create_notification(
            appointment["patient_id"],
            "Appointment cancelled",
            (
                f"Your appointment with {appointment['doctor_name']} on {appointment['date']} at "
                f"{appointment['time']} has been cancelled."
            ),
            "booking",
        )
        return jsonify({"message": "Appointment Cancelled"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/update_status", methods=["POST"])
def update_status():
    try:
        data = request.json or {}
        appointment_id = data.get("appointment_id")
        status = data.get("status")

        if not appointment_id or status not in {"Pending", "Accepted", "Rejected"}:
            return jsonify({"message": "Valid appointment_id and status are required"}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT appointments.patient_id,
                   appointments.date,
                   appointments.time,
                   doctors.name AS doctor_name,
                   doctors.address,
                   doctors.consultation_fee,
                   doctors.payment_note
            FROM appointments
            JOIN doctors ON appointments.doctor_id = doctors.id
            WHERE appointments.id=?
            """,
            (appointment_id,),
        )
        appointment = cursor.fetchone()

        if not appointment:
            db.close()
            return jsonify({"message": "Appointment not found"}), 404

        cursor.execute(
            "UPDATE appointments SET status=? WHERE id=?",
            (status, appointment_id),
        )
        db.commit()
        db.close()

        create_notification(
            appointment["patient_id"],
            f"Appointment {status.lower()}",
            (
                f"{appointment['doctor_name']} has {status.lower()} your appointment for {appointment['date']} at "
                f"{appointment['time']}. Clinic: {appointment['address']}. Fee: Rs. {appointment['consultation_fee']}. "
                f"{appointment['payment_note']}."
            ),
            "status_update",
        )
        return jsonify({"message": "Status Updated"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/doctor/appointments/<int:doctor_id>", methods=["GET"])
def doctor_appointments(doctor_id):
    try:
        date = request.args.get("date")
        db = get_db()
        cursor = db.cursor()

        query = """
            SELECT appointments.id,
                   users.name AS patient,
                   appointments.date,
                   appointments.time,
                   appointments.status
            FROM appointments
            JOIN users ON appointments.patient_id = users.id
            WHERE appointments.doctor_id=?
        """
        params = [doctor_id]

        if date:
            query += " AND appointments.date=?"
            params.append(date)

        query += " ORDER BY appointments.date ASC, appointments.time ASC"

        cursor.execute(query, tuple(params))
        result = cursor.fetchall()
        db.close()
        return jsonify(serialize_doctor_appointments(result))
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/add_doctor", methods=["POST"])
def add_doctor():
    try:
        data = request.json or {}
        name = data.get("name")
        specialization = data.get("specialization")
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")
        experience = data.get("experience")
        phone = data.get("phone")
        address = (data.get("address") or "Main CareFlow Clinic, City Center").strip()
        consultation_fee = data.get("consultation_fee")
        payment_note = (data.get("payment_note") or DEFAULT_PAYMENT_MODE).strip()

        if not name or not specialization or not email or not password:
            return jsonify({"message": "All doctor fields are required"}), 400

        if not address:
            address = "Main CareFlow Clinic, City Center"

        try:
            consultation_fee = int(consultation_fee or 500)
        except (TypeError, ValueError):
            return jsonify({"message": "Consultation fee must be a valid number"}), 400

        if consultation_fee < 0:
            return jsonify({"message": "Consultation fee cannot be negative"}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id FROM doctors WHERE email=?", (email,))
        if cursor.fetchone():
            db.close()
            return jsonify({"message": "Doctor email already registered"}), 400

        cursor.execute("SELECT id FROM users WHERE email=?", (email,))
        if cursor.fetchone():
            db.close()
            return jsonify({"message": "Email already registered for a patient/admin account"}), 400

        cursor.execute(
            """
            INSERT INTO doctors (
                name, specialization, email, password, experience, phone, address, consultation_fee, payment_note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name,
                specialization,
                email,
                password,
                experience,
                phone,
                address,
                consultation_fee,
                payment_note,
            ),
        )
        db.commit()
        db.close()
        return jsonify({"message": "Doctor Added"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/delete_doctor/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id FROM doctors WHERE id=?", (doctor_id,))
        doctor = cursor.fetchone()
        if not doctor:
            db.close()
            return jsonify({"message": "Doctor not found"}), 404

        cursor.execute("DELETE FROM appointments WHERE doctor_id=?", (doctor_id,))
        cursor.execute("DELETE FROM reviews WHERE doctor_id=?", (doctor_id,))
        cursor.execute("DELETE FROM doctors WHERE id=?", (doctor_id,))
        db.commit()
        db.close()
        return jsonify({"message": "Doctor Removed"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/admin/stats", methods=["GET"])
def admin_stats():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) AS count FROM users WHERE role='patient'")
        total_users = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) AS count FROM doctors")
        total_doctors = cursor.fetchone()["count"]
        cursor.execute("SELECT COUNT(*) AS count FROM appointments")
        total_appointments = cursor.fetchone()["count"]
        db.close()

        return jsonify(
            {
                "total_users": total_users,
                "total_doctors": total_doctors,
                "total_appointments": total_appointments,
            }
        )
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/admin/users", methods=["GET"])
def admin_users():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT id, name, email, role
            FROM users
            ORDER BY
              CASE WHEN role='admin' THEN 0 ELSE 1 END,
              id ASC
            """
        )
        users = [
            {
                "id": row["id"],
                "name": row["name"],
                "email": row["email"],
                "role": row["role"],
            }
            for row in cursor.fetchall()
        ]
        db.close()
        return jsonify(users)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/admin/appointments", methods=["GET"])
def admin_appointments():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT appointments.id,
                   users.name AS patient,
                   doctors.name AS doctor,
                   doctors.address,
                   doctors.consultation_fee,
                   appointments.date,
                   appointments.time,
                   appointments.status
            FROM appointments
            JOIN users ON appointments.patient_id = users.id
            JOIN doctors ON appointments.doctor_id = doctors.id
            ORDER BY appointments.date DESC, appointments.time DESC, appointments.id DESC
            """
        )
        appointments = serialize_admin_appointments(cursor.fetchall())
        db.close()
        return jsonify(appointments)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/reviews", methods=["POST"])
def add_review():
    try:
        data = request.json or {}
        patient_id = data.get("patient_id")
        appointment_id = data.get("appointment_id")
        doctor_id = data.get("doctor_id")
        rating = data.get("rating")
        feedback = (data.get("feedback") or "").strip()

        if not patient_id or rating is None or (not appointment_id and not doctor_id):
            return jsonify({"message": "patient_id plus appointment_id or doctor_id, and rating are required"}), 400

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return jsonify({"message": "Rating must be a number between 1 and 5"}), 400

        if rating < 1 or rating > 5:
            return jsonify({"message": "Rating must be between 1 and 5"}), 400

        db = get_db()
        cursor = db.cursor()
        if appointment_id:
            cursor.execute(
                """
                SELECT doctor_id
                FROM appointments
                WHERE id=? AND patient_id=? AND status='Accepted'
                """,
                (appointment_id, patient_id),
            )
            appointment = cursor.fetchone()
            if appointment:
                doctor_id = appointment["doctor_id"]
        else:
            cursor.execute(
                """
                SELECT doctor_id
                FROM appointments
                WHERE patient_id=? AND doctor_id=? AND status='Accepted'
                """,
                (patient_id, doctor_id),
            )
            appointment = cursor.fetchone()

        if not appointment:
            db.close()
            return jsonify({"message": "You can review only accepted appointments"}), 400

        cursor.execute(
            """
            INSERT INTO reviews (patient_id, doctor_id, rating, feedback)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(patient_id, doctor_id)
            DO UPDATE SET rating=excluded.rating, feedback=excluded.feedback, created_at=CURRENT_TIMESTAMP
            """,
            (patient_id, doctor_id, rating, feedback),
        )
        db.commit()
        db.close()
        return jsonify({"message": "Review submitted successfully"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/reviews/doctor/<int:doctor_id>", methods=["GET"])
def doctor_reviews(doctor_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT reviews.id,
                   users.name AS patient,
                   reviews.rating,
                   reviews.feedback,
                   reviews.created_at
            FROM reviews
            JOIN users ON reviews.patient_id = users.id
            WHERE reviews.doctor_id=?
            ORDER BY reviews.created_at DESC
            """,
            (doctor_id,),
        )
        reviews = serialize_reviews(cursor.fetchall())
        db.close()
        return jsonify(reviews)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/notifications/<int:user_id>", methods=["GET"])
def user_notifications(user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            SELECT id, title, message, type, is_read, created_at
            FROM notifications
            WHERE user_id=?
            ORDER BY datetime(created_at) DESC, id DESC
            """,
            (user_id,),
        )
        notifications = serialize_notifications(cursor.fetchall())
        db.close()
        return jsonify(notifications)
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


@app.route("/notifications/read/<int:notification_id>", methods=["POST"])
def mark_notification_read(notification_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE notifications SET is_read=1 WHERE id=?",
            (notification_id,),
        )
        db.commit()
        db.close()
        return jsonify({"message": "Notification marked as read"})
    except Exception as exc:
        return jsonify({"message": str(exc)}), 500


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)
