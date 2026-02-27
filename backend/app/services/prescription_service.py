from datetime import datetime, timedelta
from app.models.database import get_db


# -------------------------------------------------
# VERIFY PRESCRIPTION
# -------------------------------------------------
def verify_prescription(customer_id: str, medicine: str):

    if not customer_id or not medicine:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Missing required fields"
        }, 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        # Find medicine
        cursor.execute("""
            SELECT id FROM medicines
            WHERE LOWER(name) LIKE LOWER(?)
            LIMIT 1
        """, (f"%{medicine}%",))

        medicine_row = cursor.fetchone()

        if not medicine_row:
            conn.close()
            return {
                "status": "error",
                "code": "not_found",
                "message": "Medicine not found"
            }, 404

        medicine_id = medicine_row["id"]

        now = datetime.utcnow()
        expires_at = now + timedelta(days=30)

        cursor.execute("""
            INSERT OR REPLACE INTO prescriptions
            (customer_id, medicine_id, verified_at, expires_at)
            VALUES (?, ?, ?, ?)
        """, (
            customer_id,
            medicine_id,
            now.isoformat(),
            expires_at.isoformat()
        ))

        conn.commit()
        conn.close()

        return {
            "status": "verified",
            "valid_until": expires_at.isoformat()
        }, 200

    except Exception:
        conn.rollback()
        conn.close()
        return {
            "status": "error",
            "code": "internal_error",
            "message": "Verification failed"
        }, 500


# -------------------------------------------------
# CHECK IF VERIFIED (Used By Order Service)
# -------------------------------------------------
def is_verified(customer_id: str, medicine_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT expires_at
        FROM prescriptions
        WHERE customer_id = ? AND medicine_id = ?
    """, (customer_id, medicine_id))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return False

    try:
        expires_at = datetime.fromisoformat(row["expires_at"])
    except Exception:
        return False

    return datetime.utcnow() <= expires_at


# -------------------------------------------------
# GET PRESCRIPTION STATUS
# -------------------------------------------------
def get_prescription_status(customer_id: str, medicine: str):

    if not customer_id or not medicine:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Missing required fields"
        }, 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM medicines
            WHERE LOWER(name) LIKE LOWER(?)
            LIMIT 1
        """, (f"%{medicine}%",))

        medicine_row = cursor.fetchone()

        if not medicine_row:
            conn.close()
            return {
                "status": "error",
                "code": "not_found",
                "message": "Medicine not found"
            }, 404

        medicine_id = medicine_row["id"]

        cursor.execute("""
            SELECT expires_at
            FROM prescriptions
            WHERE customer_id = ? AND medicine_id = ?
        """, (customer_id, medicine_id))

        row = cursor.fetchone()
        conn.close()

        if not row:
            return {
                "status": "not_verified"
            }, 200

        expires_at = datetime.fromisoformat(row["expires_at"])

        if datetime.utcnow() > expires_at:
            return {
                "status": "expired",
                "expired_at": row["expires_at"]
            }, 200

        return {
            "status": "valid",
            "valid_until": row["expires_at"]
        }, 200

    except Exception:
        conn.close()
        return {
            "status": "error",
            "code": "internal_error",
            "message": "Status lookup failed"
        }, 500