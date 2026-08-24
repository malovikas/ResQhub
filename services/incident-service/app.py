from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid


# ============================================================
# APP CONFIGURATION
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///incidents.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# ============================================================
# INCIDENT MODEL
# ============================================================

class Incident(db.Model):

    __tablename__ = "incidents"

    id = db.Column(
        db.String(100),
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.String(1000),
        nullable=False
    )

    location = db.Column(
        db.String(300),
        nullable=False
    )

    priority = db.Column(
        db.String(50),
        nullable=False,
        default="MEDIUM"
    )

    status = db.Column(
        db.String(50),
        nullable=False,
        default="REPORTED"
    )


# ============================================================
# CONVERT INCIDENT TO JSON
# ============================================================

def incident_to_dict(incident):

    return {
        "id": incident.id,
        "user_id": incident.user_id,
        "title": incident.title,
        "description": incident.description,
        "location": incident.location,
        "priority": incident.priority,
        "status": incident.status
    }


# ============================================================
# HEALTH
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "service": "incident-service",
        "status": "healthy"
    })


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "service": "incident-service",
        "message": "ResQhub Incident Service is running"
    })


# ============================================================
# CREATE INCIDENT
# ============================================================

@app.route("/incidents", methods=["POST"])
def create_incident():

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is required"
        }), 400


    required_fields = [
        "user_id",
        "title",
        "description",
        "location"
    ]


    for field in required_fields:

        if field not in data:

            return jsonify({
                "error": f"{field} is required"
            }), 400


    # --------------------------------------------------------
    # VALIDATE USER ID
    # --------------------------------------------------------

    try:

        user_id = int(data["user_id"])

    except (TypeError, ValueError):

        return jsonify({
            "error": "user_id must be a number"
        }), 400


    # --------------------------------------------------------
    # CREATE INCIDENT
    # --------------------------------------------------------

    incident = Incident(

        id=str(uuid.uuid4()),

        user_id=user_id,

        title=data["title"],

        description=data["description"],

        location=data["location"],

        priority=data.get(
            "priority",
            "MEDIUM"
        ),

        status="REPORTED"
    )


    db.session.add(incident)

    db.session.commit()


    return jsonify({

        "message": "Incident reported successfully",

        "incident": incident_to_dict(
            incident
        )

    }), 201


# ============================================================
# GET ALL INCIDENTS
# ============================================================

@app.route("/incidents", methods=["GET"])
def get_incidents():

    incidents = Incident.query.order_by(
        Incident.id.asc()
    ).all()


    return jsonify({

        "count": len(incidents),

        "incidents": [

            incident_to_dict(incident)

            for incident in incidents

        ]

    }), 200


# ============================================================
# GET INCIDENT BY ID
# ============================================================

@app.route(
    "/incidents/<incident_id>",
    methods=["GET"]
)
def get_incident(incident_id):

    incident = Incident.query.filter_by(
        id=incident_id
    ).first()


    if incident is None:

        return jsonify({
            "error": "Incident not found"
        }), 404


    return jsonify(
        incident_to_dict(incident)
    ), 200


# ============================================================
# UPDATE INCIDENT
# ============================================================

@app.route(
    "/incidents/<incident_id>",
    methods=["PUT"]
)
def update_incident(incident_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "error": "Request body is required"
        }), 400


    incident = Incident.query.filter_by(
        id=incident_id
    ).first()


    if incident is None:

        return jsonify({
            "error": "Incident not found"
        }), 404


    # --------------------------------------------------------
    # UPDATE FIELDS
    # --------------------------------------------------------

    if "title" in data:

        incident.title = data["title"]


    if "description" in data:

        incident.description = data["description"]


    if "location" in data:

        incident.location = data["location"]


    if "priority" in data:

        incident.priority = data["priority"]


    if "status" in data:

        incident.status = data["status"]


    db.session.commit()


    return jsonify({

        "message": "Incident updated successfully",

        "incident": incident_to_dict(
            incident
        )

    }), 200


# ============================================================
# DELETE INCIDENT
# ============================================================

@app.route(
    "/incidents/<incident_id>",
    methods=["DELETE"]
)
def delete_incident(incident_id):

    incident = Incident.query.filter_by(
        id=incident_id
    ).first()


    if incident is None:

        return jsonify({
            "error": "Incident not found"
        }), 404


    db.session.delete(incident)

    db.session.commit()


    return jsonify({

        "message": "Incident deleted successfully"

    }), 200


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

with app.app_context():

    db.create_all()


# ============================================================
# START INCIDENT SERVICE
# ============================================================

if __name__ == "__main__":

    print("\n==============================================")
    print("        ResQhub Incident Service")
    print("==============================================")
    print("Incident Service : http://127.0.0.1:5002")
    print("Database         : SQLite")
    print("==============================================\n")


    app.run(
        host="0.0.0.0",
        port=5002,
        debug=True
    )