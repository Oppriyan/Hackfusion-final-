from flask import Blueprint, jsonify
from app.services.analytics_service import get_user_metrics

analytics_bp = Blueprint("analytics", __name__)


# -------------------------------------------------
# USER METRICS
# -------------------------------------------------
@analytics_bp.route("/user-metrics/<customer_id>", methods=["GET"])
def user_metrics_route(customer_id):

    response, status = get_user_metrics(customer_id)
    return jsonify(response), status