from flask import Flask,jsonify, request
from flask_cors import CORS
import uuid


app = Flask(__name__)

CORS(app)

# Temporary in-memory storage
incidents = []


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "incident-service",
        "status": "healthy"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "incident-service",
        "message": "ResQhub Incident Service is running"
    })


# Create a new incident
@app.route("/incidents", methods=["POST"])
def create_incident():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    required_fields = ["user_id", "title", "description", "location"]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"{field} is required"
            }), 400

    incident = {
        "id": str(uuid.uuid4()),
        "user_id": data["user_id"],
        "title": data["title"],
        "description": data["description"],
        "location": data["location"],
        "priority": data.get("priority", "MEDIUM"),
        "status": "REPORTED"
    }

    incidents.append(incident)

    return jsonify({
        "message": "Incident reported successfully",
        "incident": incident
    }), 201


# Get all incidents
@app.route("/incidents", methods=["GET"])
def get_incidents():

    return jsonify({
        "count": len(incidents),
        "incidents": incidents
    })


# Get a single incident
@app.route("/incidents/<incident_id>", methods=["GET"])
def get_incident(incident_id):

    for incident in incidents:

        if incident["id"] == incident_id:
            return jsonify(incident)

    return jsonify({
        "error": "Incident not found"
    }), 404


# Update incident
@app.route("/incidents/<incident_id>", methods=["PUT"])
def update_incident(incident_id):

    data = request.get_json()

    for incident in incidents:

        if incident["id"] == incident_id:

            if "title" in data:
                incident["title"] = data["title"]

            if "description" in data:
                incident["description"] = data["description"]

            if "location" in data:
                incident["location"] = data["location"]

            if "priority" in data:
                incident["priority"] = data["priority"]

            if "status" in data:
                incident["status"] = data["status"]

            return jsonify({
                "message": "Incident updated successfully",
                "incident": incident
            })

    return jsonify({
        "error": "Incident not found"
    }), 404


# Delete incident
@app.route("/incidents/<incident_id>", methods=["DELETE"])
def delete_incident(incident_id):

    for incident in incidents:

        if incident["id"] == incident_id:

            incidents.remove(incident)

            return jsonify({
                "message": "Incident deleted successfully"
            })

    return jsonify({
        "error": "Incident not found"
    }), 404


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5002,
        debug=True
    )