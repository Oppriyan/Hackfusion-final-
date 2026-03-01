from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from app.models.database import init_db
from app.utils.excel_loader import load_all_data

from app.routes.inventory import inventory_bp
from app.routes.order import order_bp
from app.routes.chat import chat_bp
from app.routes.prescription import prescription_bp
from app.routes.webhook import webhook_bp
from app.routes.analytics import analytics_bp
from app.routes.auth import auth_bp

from werkzeug.security import generate_password_hash
from app.models.database import get_db


def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

   

    # Initialize database
    init_db()

    # -------------------------------------------------
    # SEED DEFAULT USERS
    # -------------------------------------------------
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@pharmacy.com",))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, (
            "Admin",
            "admin@pharmacy.com",
            generate_password_hash("admin123"),
            "admin"
        ))

    cursor.execute("SELECT * FROM users WHERE email = ?", ("clerk@pharmacy.com",))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, (
            "Clerk",
            "clerk@pharmacy.com",
            generate_password_hash("clerk123"),
            "user"
        ))

    conn.commit()
    conn.close()

    # Load Excel data
    load_all_data()

    # Register blueprints
    app.register_blueprint(inventory_bp, url_prefix="/inventory")
    app.register_blueprint(order_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(prescription_bp)
    app.register_blueprint(webhook_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(auth_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    return app