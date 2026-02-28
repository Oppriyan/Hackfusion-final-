from flask import Blueprint, jsonify
from app.services.analytics_service import get_user_metrics
from app.services.analytics_service import get_user_metrics, get_admin_revenue

analytics_bp = Blueprint("analytics", __name__)


# -------------------------------------------------
# USER METRICS
# -------------------------------------------------
@analytics_bp.route("/user-metrics/<customer_id>", methods=["GET"])
def user_metrics_route(customer_id):

    response, status = get_user_metrics(customer_id)
    return jsonify(response), status

# -------------------------------------------------
# ADMIN REVENUE
# -------------------------------------------------
@analytics_bp.route("/admin/revenue", methods=["GET"])
def admin_revenue_route():

    response, status = get_admin_revenue()
    return jsonify(response), status