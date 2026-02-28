from app.models.database import get_db


# -------------------------------------------------
# USER METRICS
# -------------------------------------------------
def get_user_metrics(customer_id: str):

    if not customer_id:
        return {
            "status": "error",
            "code": "validation_error",
            "message": "Customer ID required"
        }, 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        # Total Orders
        cursor.execute("""
            SELECT COUNT(*) as total_orders
            FROM orders
            WHERE customer_id = ?
        """, (customer_id,))
        total_orders = cursor.fetchone()["total_orders"]

        # Total Spent
        cursor.execute("""
            SELECT COALESCE(SUM(total_price), 0) as total_spent
            FROM orders
            WHERE customer_id = ?
        """, (customer_id,))
        total_spent = cursor.fetchone()["total_spent"]

        # Last Order Date
        cursor.execute("""
            SELECT purchase_date
            FROM orders
            WHERE customer_id = ?
            ORDER BY purchase_date DESC
            LIMIT 1
        """, (customer_id,))
        row = cursor.fetchone()
        last_order_date = row["purchase_date"] if row else None

        # Active Prescriptions
        cursor.execute("""
            SELECT COUNT(*) as active_prescriptions
            FROM prescriptions
            WHERE customer_id = ?
              AND expires_at > datetime('now')
        """, (customer_id,))
        active_prescriptions = cursor.fetchone()["active_prescriptions"]

        conn.close()

        return {
            "status": "success",
            "data": {
                "total_orders": total_orders,
                "total_spent": round(total_spent, 2),
                "active_prescriptions": active_prescriptions,
                "last_order_date": last_order_date
            }
        }, 200

    except Exception:
        conn.close()
        return {
            "status": "error",
            "code": "internal_error",
            "message": "Failed to calculate user metrics"
        }, 500