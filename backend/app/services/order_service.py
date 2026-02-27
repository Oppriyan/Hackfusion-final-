from app.models.database import get_db
from app.services.prescription_service import is_verified


def create_order(customer_id: str, medicine_id: int, quantity: int):

    # -------------------------
    # Validation
    # -------------------------
    if not customer_id or medicine_id is None or quantity is None:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Missing required fields"
        }, 400

    try:
        medicine_id = int(medicine_id)
        quantity = int(quantity)
    except (ValueError, TypeError):
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Invalid numeric values"
        }, 400

    if quantity <= 0:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Quantity must be positive"
        }, 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        # -------------------------
        # Fetch medicine by ID
        # -------------------------
        cursor.execute("""
            SELECT id, name, price, stock, prescription_required
            FROM medicines
            WHERE id = ?
        """, (medicine_id,))

        medicine_row = cursor.fetchone()

        if not medicine_row:
            conn.close()
            return {
                "status": "error",
                "code": "not_found",
                "message": "Medicine not found"
            }, 404

        # -------------------------
        # Prescription Enforcement
        # -------------------------
        if medicine_row["prescription_required"] == "Yes":
            if not is_verified(customer_id, medicine_row["id"]):
                conn.close()
                return {
                    "status": "error",
                    "code": "prescription_required",
                    "message": "Valid prescription required"
                }, 403

        # -------------------------
        # Stock Check
        # -------------------------
        if medicine_row["stock"] < quantity:
            conn.close()
            return {
                "status": "error",
                "code": "insufficient_stock",
                "available_stock": medicine_row["stock"]
            }, 400

        total_price = medicine_row["price"] * quantity

        # -------------------------
        # Atomic Transaction
        # -------------------------
        cursor.execute("""
            UPDATE medicines
            SET stock = stock - ?
            WHERE id = ?
        """, (quantity, medicine_row["id"]))

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
    
    # -------------------------------------------------
# CUSTOMER ORDER HISTORY
# -------------------------------------------------
def get_customer_history(customer_id: str):

    if not customer_id:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "customer_id required"
        }, 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, product_name, quantity, purchase_date, total_price
            FROM orders
            WHERE customer_id = ?
            ORDER BY id DESC
        """, (customer_id,))

        rows = cursor.fetchall()
        conn.close()

        history = []

        for row in rows:
            history.append({
                "order_id": row["id"],
                "medicine": row["product_name"],
                "quantity": row["quantity"],
                "purchase_date": row["purchase_date"],
                "total_price": row["total_price"]
            })

        return {
            "status": "success",
            "count": len(history),
            "data": history
        }, 200

    except Exception:
        conn.close()
        return {
            "status": "error",
            "code": "internal_error",
            "message": "Failed to fetch order history"
        }, 500