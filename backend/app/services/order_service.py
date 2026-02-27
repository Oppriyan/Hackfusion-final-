from app.models.database import get_db
from app.services.prescription_service import is_verified


def create_order(customer_id: str = None, medicine: str = None, quantity: int = None):

    # -------------------------------------------------
    # SAFE DEFAULTS (TOLERANT BACKEND)
    # -------------------------------------------------

    if not customer_id:
        customer_id = "PAT999"  # Demo fallback user

    if quantity is None:
        quantity = 1  # Default quantity

    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Quantity must be an integer"
        }, 400

    if quantity <= 0:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Quantity must be positive"
        }, 400

    if not medicine:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Medicine name is required"
        }, 400

    medicine = medicine.strip()

    conn = get_db()
    cursor = conn.cursor()

    try:
        # -------------------------------------------------
        # Fetch medicine
        # -------------------------------------------------
        cursor.execute("""
            SELECT id, name, price, stock, prescription_required
            FROM medicines
            WHERE name LIKE ?
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

        # -------------------------------------------------
        # Prescription Enforcement
        # -------------------------------------------------
        if medicine_row["prescription_required"] == "Yes":
            if not is_verified(customer_id, medicine_id):
                conn.close()
                return {
                    "status": "error",
                    "code": "prescription_required",
                    "message": "A valid prescription is required for this medicine."
                }, 403

        # -------------------------------------------------
        # Stock Check
        # -------------------------------------------------
        if medicine_row["stock"] < quantity:
            conn.close()
            return {
                "status": "error",
                "code": "insufficient_stock",
                "message": "Insufficient stock available.",
                "available_stock": medicine_row["stock"]
            }, 400

        total_price = medicine_row["price"] * quantity

        # -------------------------------------------------
        # Atomic Transaction
        # -------------------------------------------------
        cursor.execute("""
            UPDATE medicines
            SET stock = stock - ?
            WHERE id = ?
        """, (quantity, medicine_id))

        cursor.execute("""
            INSERT INTO orders (
                customer_id,
                product_name,
                quantity,
                purchase_date,
                total_price,
                dosage_frequency,
                prescription_required
            ) VALUES (?, ?, ?, datetime('now'), ?, ?, ?)
        """, (
            customer_id,
            medicine_row["name"],
            quantity,
            total_price,
            "N/A",
            medicine_row["prescription_required"]
        ))

        order_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return {
            "status": "success",
            "data": {
                "order_id": order_id,
                "medicine": medicine_row["name"],
                "quantity": quantity,
                "total_price": total_price
            }
        }, 201

    except Exception:
        conn.rollback()
        conn.close()
        return {
            "status": "error",
            "code": "internal_error",
            "message": "Transaction failed"
        }, 500