from flask import Flask,jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

CORS(app)

# Temporary in-memory notification storage
notifications = []

# Temporary notification ID
next_notification_id = 1


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "notification-service",
        "message": "ResQhub Notification Service is running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "notification-service",
        "status": "healthy"
    })


@app.route("/notifications", methods=["POST"])
def create_notification():
    global next_notification_id

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    user_id = data.get("user_id")
    message = data.get("message")
    notification_type = data.get("type", "INFO")

    if not user_id or not message:
        return jsonify({
            "success": False,
            "message": "user_id and message are required"
        }), 400

    notification = {
        "id": next_notification_id,
        "user_id": user_id,
        "message": message,
        "type": notification_type,
        "status": "UNREAD",
        "created_at": datetime.now().isoformat()
    }

    notifications.append(notification)

    next_notification_id += 1

    return jsonify({
        "success": True,
        "message": "Notification created successfully",
        "notification": notification
    }), 201


@app.route("/notifications", methods=["GET"])
def get_notifications():
    user_id = request.args.get("user_id")

    if user_id:
        user_notifications = [
            notification
            for notification in notifications
            if str(notification["user_id"]) == str(user_id)
        ]

        return jsonify({
            "success": True,
            "notifications": user_notifications
        })

    return jsonify({
        "success": True,
        "notifications": notifications
    })


@app.route("/notifications/<int:notification_id>", methods=["GET"])
def get_notification(notification_id):
    for notification in notifications:
        if notification["id"] == notification_id:
            return jsonify({
                "success": True,
                "notification": notification
            })

    return jsonify({
        "success": False,
        "message": "Notification not found"
    }), 404


@app.route("/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_notification_read(notification_id):
    for notification in notifications:
        if notification["id"] == notification_id:

            notification["status"] = "READ"

            return jsonify({
                "success": True,
                "message": "Notification marked as read",
                "notification": notification
            })

    return jsonify({
        "success": False,
        "message": "Notification not found"
    }), 404


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5005,
        debug=True
    )