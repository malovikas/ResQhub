from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


# ============================================================
# APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# DATABASE
# ============================================================

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///notifications.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# ============================================================
# MODEL
# ============================================================

class Notification(db.Model):

    __tablename__ = "notifications"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )

    message = db.Column(
        db.String(500),
        nullable=False
    )

    type = db.Column(
        db.String(50),
        default="INFO"
    )

    status = db.Column(
        db.String(20),
        default="UNREAD"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):

        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "type": self.type,
            "status": self.status,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }


# ============================================================
# CREATE DATABASE
# ============================================================

with app.app_context():
    db.create_all()


# ============================================================
# HEALTH
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "service": "notification-service",
        "status": "healthy"
    }), 200


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "service": "notification-service",
        "message": "ResQhub Notification Service is running"
    }), 200


# ============================================================
# CREATE NOTIFICATION
# ============================================================

@app.route("/notifications", methods=["POST"])
def create_notification():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "error": "Request body is required"
        }), 400

    user_id = data.get("user_id")
    message = data.get("message")

    notification_type = data.get(
        "type",
        "INFO"
    )

    if user_id is None or not message:

        return jsonify({
            "success": False,
            "error": "user_id and message are required"
        }), 400

    try:

        user_id = int(user_id)

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "error": "user_id must be a number"
        }), 400

    notification = Notification(

        user_id=user_id,

        message=message,

        type=notification_type,

        status="UNREAD",

        created_at=datetime.utcnow()
    )

    db.session.add(notification)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Notification created successfully",

        "notification": notification.to_dict()

    }), 201


# ============================================================
# GET ALL NOTIFICATIONS
# ============================================================

@app.route("/notifications", methods=["GET"])
def get_notifications():

    user_id = request.args.get(
        "user_id"
    )

    query = Notification.query

    if user_id:

        try:

            user_id = int(user_id)

        except (TypeError, ValueError):

            return jsonify({
                "success": False,
                "error": "user_id must be a number"
            }), 400

        query = query.filter_by(
            user_id=user_id
        )

    notifications = query.order_by(
        Notification.created_at.desc()
    ).all()

    return jsonify({

        "success": True,

        "notifications": [
            notification.to_dict()
            for notification in notifications
        ]

    }), 200


# ============================================================
# GET SINGLE NOTIFICATION
# ============================================================

@app.route(
    "/notifications/<int:notification_id>",
    methods=["GET"]
)
def get_notification(notification_id):

    notification = Notification.query.get(
        notification_id
    )

    if not notification:

        return jsonify({
            "success": False,
            "error": "Notification not found"
        }), 404

    return jsonify({

        "success": True,

        "notification":
            notification.to_dict()

    }), 200


# ============================================================
# MARK AS READ
# ============================================================

@app.route(
    "/notifications/<int:notification_id>/read",
    methods=["PUT"]
)
def mark_as_read(notification_id):

    notification = Notification.query.get(
        notification_id
    )

    if not notification:

        return jsonify({
            "success": False,
            "error": "Notification not found"
        }), 404

    notification.status = "READ"

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "Notification marked as read",

        "notification":
            notification.to_dict()

    }), 200


# ============================================================
# DELETE
# ============================================================

@app.route(
    "/notifications/<int:notification_id>",
    methods=["DELETE"]
)
def delete_notification(notification_id):

    notification = Notification.query.get(
        notification_id
    )

    if not notification:

        return jsonify({
            "success": False,
            "error": "Notification not found"
        }), 404

    db.session.delete(notification)

    db.session.commit()

    return jsonify({

        "success": True,

        "message":
            "Notification deleted successfully"

    }), 200


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5005,
        debug=True
    )