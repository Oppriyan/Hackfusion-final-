from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from app.models.database import init_db
from app.utils.excel_loader import load_all_data

# Import blueprints
from app.routes.inventory import inventory_bp
from app.routes.order import order_bp
from app.routes.chat import chat_bp
from app.routes.prescription import prescription_bp
from app.routes.webhook import webhook_bp


def create_app():
    # Load environment variables
    load_dotenv()

    app = Flask(__name__)

    # Enable CORS for frontend / voice integrations
    CORS(app)

    # Initialize database
    init_db()

    # Load Excel data safely (idempotent)
    load_all_data()

    # Register blueprints
    app.register_blueprint(inventory_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(prescription_bp)
    app.register_blueprint(webhook_bp)

    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    return app