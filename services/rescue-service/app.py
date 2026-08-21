from flask import Flask,jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

# Temporary in-memory storage
rescue_teams = []

# Temporary ID counter
next_team_id = 1


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "rescue-service",
        "message": "ResQhub Rescue Service is running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "rescue-service",
        "status": "healthy"
    })


@app.route("/rescue-teams", methods=["POST"])
def create_rescue_team():
    global next_team_id

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    leader = data.get("leader")
    members = data.get("members")
    location = data.get("location")

    if not name or not leader or members is None or not location:
        return jsonify({
            "success": False,
            "message": "Name, leader, members and location are required"
        }), 400

    if not isinstance(members, int) or members <= 0:
        return jsonify({
            "success": False,
            "message": "Members must be a positive number"
        }), 400

    team = {
        "id": next_team_id,
        "name": name,
        "leader": leader,
        "members": members,
        "location": location,
        "status": "AVAILABLE",
        "assigned_incident": None
    }

    rescue_teams.append(team)
    next_team_id += 1

    return jsonify({
        "success": True,
        "message": "Rescue team created successfully",
        "team": team
    }), 201


@app.route("/rescue-teams", methods=["GET"])
def get_rescue_teams():
    return jsonify({
        "success": True,
        "count": len(rescue_teams),
        "teams": rescue_teams
    })


@app.route("/rescue-teams/<int:team_id>", methods=["GET"])
def get_rescue_team(team_id):

    for team in rescue_teams:
        if team["id"] == team_id:
            return jsonify({
                "success": True,
                "team": team
            })

    return jsonify({
        "success": False,
        "message": "Rescue team not found"
    }), 404


@app.route("/rescue-teams/<int:team_id>", methods=["PUT"])
def update_rescue_team(team_id):

    team = None

    for item in rescue_teams:
        if item["id"] == team_id:
            team = item
            break

    if team is None:
        return jsonify({
            "success": False,
            "message": "Rescue team not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    if "name" in data:
        team["name"] = data["name"]

    if "leader" in data:
        team["leader"] = data["leader"]

    if "members" in data:
        if not isinstance(data["members"], int) or data["members"] <= 0:
            return jsonify({
                "success": False,
                "message": "Members must be a positive number"
            }), 400

        team["members"] = data["members"]

    if "location" in data:
        team["location"] = data["location"]

    if "status" in data:
        allowed_statuses = [
            "AVAILABLE",
            "BUSY",
            "OFF_DUTY"
        ]

        if data["status"] not in allowed_statuses:
            return jsonify({
                "success": False,
                "message": "Invalid team status"
            }), 400

        team["status"] = data["status"]

    return jsonify({
        "success": True,
        "message": "Rescue team updated successfully",
        "team": team
    })


@app.route("/rescue-teams/<int:team_id>", methods=["DELETE"])
def delete_rescue_team(team_id):

    for team in rescue_teams:

        if team["id"] == team_id:

            if team["status"] == "BUSY":
                return jsonify({
                    "success": False,
                    "message": "Busy rescue team cannot be deleted"
                }), 400

            rescue_teams.remove(team)

            return jsonify({
                "success": True,
                "message": "Rescue team deleted successfully"
            })

    return jsonify({
        "success": False,
        "message": "Rescue team not found"
    }), 404


@app.route("/rescue-teams/<int:team_id>/assign", methods=["POST"])
def assign_team(team_id):

    team = None

    for item in rescue_teams:
        if item["id"] == team_id:
            team = item
            break

    if team is None:
        return jsonify({
            "success": False,
            "message": "Rescue team not found"
        }), 404

    if team["status"] == "BUSY":
        return jsonify({
            "success": False,
            "message": "Rescue team is already assigned to an incident"
        }), 400

    data = request.get_json()

    if not data or not data.get("incident_id"):
        return jsonify({
            "success": False,
            "message": "incident_id is required"
        }), 400

    incident_id = data["incident_id"]

    team["status"] = "BUSY"
    team["assigned_incident"] = incident_id

    return jsonify({
        "success": True,
        "message": "Rescue team assigned successfully",
        "team": team
    })


@app.route("/rescue-teams/<int:team_id>/release", methods=["POST"])
def release_team(team_id):

    team = None

    for item in rescue_teams:
        if item["id"] == team_id:
            team = item
            break

    if team is None:
        return jsonify({
            "success": False,
            "message": "Rescue team not found"
        }), 404

    if team["status"] != "BUSY":
        return jsonify({
            "success": False,
            "message": "Rescue team is not currently assigned"
        }), 400

    team["status"] = "AVAILABLE"
    team["assigned_incident"] = None

    return jsonify({
        "success": True,
        "message": "Rescue team released successfully",
        "team": team
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5003,
        debug=True
    )