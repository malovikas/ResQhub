from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# DATABASE CONFIGURATION
# --------------------------------------------------

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///resources.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# --------------------------------------------------
# RESOURCE MODEL
# --------------------------------------------------

class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    type = db.Column(db.String(100), nullable=False)

    quantity = db.Column(db.Integer, nullable=False)

    location = db.Column(db.String(200), nullable=False)

    status = db.Column(
        db.String(50),
        nullable=False,
        default="AVAILABLE"
    )

    assigned_incident_id = db.Column(
        db.Integer,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "quantity": self.quantity,
            "location": self.location,
            "status": self.status,
            "assigned_incident_id": self.assigned_incident_id,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }


# --------------------------------------------------
# CREATE DATABASE
# --------------------------------------------------

with app.app_context():
    db.create_all()


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "service": "resource-service",
        "status": "healthy"
    }), 200


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "service": "resource-service",
        "message": "ResQhub Resource Service is running"
    }), 200


# --------------------------------------------------
# CREATE RESOURCE
# --------------------------------------------------

@app.route("/resources", methods=["POST"])
def create_resource():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    resource_type = data.get("type")
    quantity = data.get("quantity")
    location = data.get("location")

    if not name or not resource_type or quantity is None or not location:
        return jsonify({
            "error": "name, type, quantity and location are required"
        }), 400

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return jsonify({
            "error": "quantity must be a number"
        }), 400

    if quantity < 0:
        return jsonify({
            "error": "quantity cannot be negative"
        }), 400

    resource = Resource(
        name=name,
        type=resource_type,
        quantity=quantity,
        location=location,
        status=data.get("status", "AVAILABLE"),
        assigned_incident_id=data.get("assigned_incident_id")
    )

    db.session.add(resource)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Resource created successfully",
        "resource": resource.to_dict()
    }), 201


# --------------------------------------------------
# GET ALL RESOURCES
# --------------------------------------------------

@app.route("/resources", methods=["GET"])
def get_resources():

    resources = Resource.query.order_by(
        Resource.id.desc()
    ).all()

    return jsonify({
        "resources": [
            resource.to_dict()
            for resource in resources
        ]
    }), 200


# --------------------------------------------------
# GET RESOURCE BY ID
# --------------------------------------------------

@app.route("/resources/<int:resource_id>", methods=["GET"])
def get_resource(resource_id):

    resource = Resource.query.get(resource_id)

    if not resource:
        return jsonify({
            "error": "Resource not found"
        }), 404

    return jsonify({
        "resource": resource.to_dict()
    }), 200


# --------------------------------------------------
# UPDATE RESOURCE
# --------------------------------------------------

@app.route("/resources/<int:resource_id>", methods=["PUT"])
def update_resource(resource_id):

    resource = Resource.query.get(resource_id)

    if not resource:
        return jsonify({
            "error": "Resource not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    if "name" in data:
        resource.name = data["name"]

    if "type" in data:
        resource.type = data["type"]

    if "quantity" in data:

        try:
            quantity = int(data["quantity"])
        except (TypeError, ValueError):

            return jsonify({
                "error": "quantity must be a number"
            }), 400

        if quantity < 0:
            return jsonify({
                "error": "quantity cannot be negative"
            }), 400

        resource.quantity = quantity

    if "location" in data:
        resource.location = data["location"]

    if "status" in data:
        resource.status = data["status"]

    if "assigned_incident_id" in data:
        resource.assigned_incident_id = (
            data["assigned_incident_id"]
        )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Resource updated successfully",
        "resource": resource.to_dict()
    }), 200


# --------------------------------------------------
# DELETE RESOURCE
# --------------------------------------------------

@app.route("/resources/<int:resource_id>", methods=["DELETE"])
def delete_resource(resource_id):

    resource = Resource.query.get(resource_id)

    if not resource:
        return jsonify({
            "error": "Resource not found"
        }), 404

    db.session.delete(resource)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Resource deleted successfully"
    }), 200


# --------------------------------------------------
# ASSIGN RESOURCE TO INCIDENT
# --------------------------------------------------

@app.route(
    "/resources/<int:resource_id>/assign",
    methods=["PUT"]
)
def assign_resource(resource_id):

    resource = Resource.query.get(resource_id)

    if not resource:
        return jsonify({
            "error": "Resource not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    incident_id = data.get("incident_id")

    if incident_id is None:
        return jsonify({
            "error": "incident_id is required"
        }), 400

    # Check if already assigned
    if resource.assigned_incident_id is not None:

        return jsonify({
            "error": "Resource is already assigned to an incident"
        }), 409

    resource.assigned_incident_id = incident_id
    resource.status = "ASSIGNED"

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Resource assigned successfully",
        "resource": resource.to_dict()
    }), 200


# --------------------------------------------------
# UNASSIGN RESOURCE
# --------------------------------------------------

@app.route(
    "/resources/<int:resource_id>/unassign",
    methods=["PUT"]
)
def unassign_resource(resource_id):

    resource = Resource.query.get(resource_id)

    if not resource:
        return jsonify({
            "error": "Resource not found"
        }), 404

    resource.assigned_incident_id = None
    resource.status = "AVAILABLE"

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Resource unassigned successfully",
        "resource": resource.to_dict()
    }), 200


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5004,
        debug=True
    )