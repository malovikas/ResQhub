from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


# ============================================================
# APP CONFIGURATION
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# ============================================================
# USER MODEL
# ============================================================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        nullable=False
    )


# ============================================================
# CONVERT USER TO JSON
# ============================================================

def user_to_dict(user):

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone
    }


# ============================================================
# HEALTH
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "service": "user-service",
        "status": "healthy"
    })


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "service": "user-service",
        "message": "ResQhub User Service is running"
    })


# ============================================================
# REGISTER USER
# ============================================================

@app.route("/users", methods=["POST"])
def create_user():

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


    # --------------------------------------------------------
    # CHECK DUPLICATE EMAIL
    # --------------------------------------------------------

    existing_user = User.query.filter_by(
        email=email
    ).first()


    if existing_user:

        return jsonify({
            "error": "Email already registered"
        }), 409


    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    user = User(
        name=name,
        email=email,
        phone=phone
    )


    db.session.add(user)
    db.session.commit()


    return jsonify({

        "message": "User created successfully",

        "user": user_to_dict(user)

    }), 201


# ============================================================
# LOGIN
# ============================================================

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


    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = User.query.filter_by(
        email=email,
        phone=phone
    ).first()


    if user:

        return jsonify({

            "message": "Login successful",

            "user": user_to_dict(user)

        }), 200


    return jsonify({
        "error": "Invalid email or phone"
    }), 401


# ============================================================
# GET ALL USERS
# ============================================================

@app.route("/users", methods=["GET"])
def get_users():

    users = User.query.order_by(
        User.id.asc()
    ).all()


    return jsonify({

        "users": [
            user_to_dict(user)
            for user in users
        ]

    }), 200


# ============================================================
# GET USER BY ID
# ============================================================

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):

    user = User.query.get(user_id)


    if user is None:

        return jsonify({
            "error": "User not found"
        }), 404


    return jsonify({

        "user": user_to_dict(user)

    }), 200


# ============================================================
# UPDATE USER
# ============================================================

@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is required"
        }), 400


    user = User.query.get(user_id)


    if user is None:

        return jsonify({
            "error": "User not found"
        }), 404


    # --------------------------------------------------------
    # UPDATE NAME
    # --------------------------------------------------------

    if "name" in data:

        user.name = data["name"]


    # --------------------------------------------------------
    # UPDATE EMAIL
    # --------------------------------------------------------

    if "email" in data:

        new_email = data["email"]

        existing_user = User.query.filter(
            User.email == new_email,
            User.id != user_id
        ).first()


        if existing_user:

            return jsonify({
                "error": "Email already registered"
            }), 409


        user.email = new_email


    # --------------------------------------------------------
    # UPDATE PHONE
    # --------------------------------------------------------

    if "phone" in data:

        user.phone = data["phone"]


    db.session.commit()


    return jsonify({

        "message": "User updated successfully",

        "user": user_to_dict(user)

    }), 200


# ============================================================
# DELETE USER
# ============================================================

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):

    user = User.query.get(user_id)


    if user is None:

        return jsonify({
            "error": "User not found"
        }), 404


    db.session.delete(user)

    db.session.commit()


    return jsonify({

        "message": "User deleted successfully"

    }), 200


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

with app.app_context():

    db.create_all()


# ============================================================
# START USER SERVICE
# ============================================================

if __name__ == "__main__":

    print("\n==============================================")
    print("          ResQhub User Service")
    print("==============================================")
    print("User Service : http://127.0.0.1:5001")
    print("Database     : SQLite")
    print("==============================================\n")


    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )