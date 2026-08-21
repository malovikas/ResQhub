from flask import Flask,jsonify,request
from flask_cors import CORS


app = Flask(__name__)

CORS(app)

# Temporary in-memory user data
users = []
next_user_id = 1

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "user-service",
        "status": "healthy"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "user-service",
        "message": "ResQhub User Service is running"
    })


# Register a new user
@app.route("/users", methods=["POST"])
def create_user():
    global next_user_id

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")

    if not name or not email or not phone:
        return jsonify({
            "error": "name, email and phone are required"
        }), 400

    # Check whether email already exists
    for user in users:
        if user["email"] == email:
            return jsonify({
                "error": "Email already registered"
            }), 409

    user = {
        "id": next_user_id,
        "name": name,
        "email": email,
        "phone": phone
    }

    users.append(user)
    next_user_id += 1

    return jsonify({
        "message": "User created successfully",
        "user": user
    }), 201

# -------------LOGIN--------------------

@app.route("/users/login", methods=["POST"])
def login_user():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    email = data.get("email")
    phone = data.get("phone")

    if not email or not phone:
        return jsonify({
            "error": "email and phone are required"
        }), 400

    for user in users:

        if user["email"] == email and user["phone"] == phone:

            return jsonify({
                "message": "Login successful",
                "user": user
            }), 200

    return jsonify({
        "error": "Invalid email or phone"
    }), 401



# Get all users
@app.route("/users", methods=["GET"])
def get_users():
    return jsonify({
        "users": users
    }), 200


# Get user by ID
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):

    for user in users:
        if user["id"] == user_id:
            return jsonify({
                "user": user
            }), 200

    return jsonify({
        "error": "User not found"
    }), 404


# Update user
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    for user in users:

        if user["id"] == user_id:

            if "name" in data:
                user["name"] = data["name"]

            if "email" in data:
                user["email"] = data["email"]

            if "phone" in data:
                user["phone"] = data["phone"]

            return jsonify({
                "message": "User updated successfully",
                "user": user
            }), 200

    return jsonify({
        "error": "User not found"
    }), 404


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )