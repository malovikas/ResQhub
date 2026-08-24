from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import text
import os


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATABASE_PATH = os.path.join(
    BASE_DIR,
    "rescue_service.db"
)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///" + DATABASE_PATH
)

app.config[
    "SQLALCHEMY_TRACK_MODIFICATIONS"
] = False


db = SQLAlchemy(app)


# ============================================================
# RESCUE TEAM MODEL
# ============================================================

class RescueTeam(db.Model):

    __tablename__ = "rescue_teams"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    name = db.Column(
        db.String(100),
        nullable=False
    )


    team_leader = db.Column(
        db.String(100),
        nullable=False
    )


    members = db.Column(
        db.Integer,
        nullable=False
    )


    location = db.Column(
        db.String(200),
        nullable=False
    )


    status = db.Column(
        db.String(30),
        nullable=False,
        default="AVAILABLE"
    )


    assigned_incident_id = db.Column(
        db.String(100),
        nullable=True
    )


    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


# ============================================================
# DATABASE MIGRATION
# ============================================================

def migrate_database():

    with app.app_context():

        db.create_all()


        result = db.session.execute(

            text(
                "PRAGMA table_info(rescue_teams)"
            )

        )


        existing_columns = {

            row[1]

            for row in result

        }


        # ----------------------------------------------------
        # TEAM LEADER
        # ----------------------------------------------------

        if "team_leader" not in existing_columns:

            print(
                "Adding missing column: team_leader"
            )

            db.session.execute(

                text(
                    """
                    ALTER TABLE rescue_teams
                    ADD COLUMN team_leader VARCHAR(100)
                    """
                )

            )

            db.session.commit()


        # ----------------------------------------------------
        # MEMBERS
        # ----------------------------------------------------

        if "members" not in existing_columns:

            print(
                "Adding missing column: members"
            )

            db.session.execute(

                text(
                    """
                    ALTER TABLE rescue_teams
                    ADD COLUMN members INTEGER
                    """
                )

            )

            db.session.commit()


        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        if "location" not in existing_columns:

            print(
                "Adding missing column: location"
            )

            db.session.execute(

                text(
                    """
                    ALTER TABLE rescue_teams
                    ADD COLUMN location VARCHAR(200)
                    """
                )

            )

            db.session.commit()


        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        if "status" not in existing_columns:

            print(
                "Adding missing column: status"
            )

            db.session.execute(

                text(
                    """
                    ALTER TABLE rescue_teams
                    ADD COLUMN status VARCHAR(30)
                    """
                )

            )

            db.session.commit()


        # ----------------------------------------------------
        # ASSIGNED INCIDENT ID
        # ----------------------------------------------------

        if (
            "assigned_incident_id"
            not in existing_columns
        ):

            print(
                "Adding missing column: "
                "assigned_incident_id"
            )

            db.session.execute(

                text(
                    """
                    ALTER TABLE rescue_teams
                    ADD COLUMN assigned_incident_id VARCHAR(100)
                    """
                )

            )

            db.session.commit()


        # ----------------------------------------------------
        # CREATED AT
        # ----------------------------------------------------

        if "created_at" not in existing_columns:

            print(
                "Adding missing column: created_at"
            )

            db.session.execute(

                text(
                    """
                    ALTER TABLE rescue_teams
                    ADD COLUMN created_at DATETIME
                    """
                )

            )

            db.session.commit()


        print(
            "Rescue database migration completed."
        )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "service": "rescue-service",

        "status": "healthy"

    }), 200


# ============================================================
# HOME
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "service": "rescue-service",

        "message":
            "ResQhub Rescue Service is running"

    }), 200


# ============================================================
# CREATE RESCUE TEAM
# ============================================================

@app.route(
    "/rescue-teams",
    methods=["POST"]
)
def create_rescue_team():

    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "error":
                "Request body is required"

        }), 400


    name = data.get("name")


    team_leader = (

        data.get("team_leader")

        or

        data.get("leader")

    )


    members = data.get("members")


    location = data.get("location")


    status = data.get(

        "status",

        "AVAILABLE"

    )


    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if not name:

        return jsonify({

            "success": False,

            "error":
                "name is required"

        }), 400


    if not team_leader:

        return jsonify({

            "success": False,

            "error":
                "team leader is required"

        }), 400


    if members is None:

        return jsonify({

            "success": False,

            "error":
                "members are required"

        }), 400


    if not location:

        return jsonify({

            "success": False,

            "error":
                "location is required"

        }), 400


    try:

        members = int(members)

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "success": False,

            "error":
                "members must be a number"

        }), 400


    if members <= 0:

        return jsonify({

            "success": False,

            "error":
                "members must be greater than 0"

        }), 400


    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    allowed_statuses = [

        "AVAILABLE",

        "BUSY",

        "OFF_DUTY"

    ]


    status = str(status).upper()


    if status not in allowed_statuses:

        status = "AVAILABLE"


    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    team = RescueTeam(

        name=name.strip(),

        team_leader=team_leader.strip(),

        members=members,

        location=location.strip(),

        status=status,

        assigned_incident_id=None,

        created_at=datetime.utcnow()

    )


    try:

        db.session.add(team)

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "Create rescue team error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to create rescue team",

            "details":
                str(error)

        }), 500


    return jsonify({

        "success": True,

        "message":
            "Rescue team created successfully",

        "team":
            serialize_team(team)

    }), 201


# ============================================================
# GET ALL RESCUE TEAMS
# ============================================================

@app.route(
    "/rescue-teams",
    methods=["GET"]
)
def get_rescue_teams():

    teams = (

        RescueTeam.query

        .order_by(
            RescueTeam.id.desc()
        )

        .all()

    )


    return jsonify({

        "success": True,

        "teams": [

            serialize_team(team)

            for team in teams

        ]

    }), 200


# ============================================================
# GET SINGLE RESCUE TEAM
# ============================================================

@app.route(
    "/rescue-teams/<int:team_id>",
    methods=["GET"]
)
def get_rescue_team(team_id):

    team = db.session.get(
        RescueTeam,
        team_id
    )


    if not team:

        return jsonify({

            "success": False,

            "error":
                "Rescue team not found"

        }), 404


    return jsonify({

        "success": True,

        "team":
            serialize_team(team)

    }), 200


# ============================================================
# UPDATE RESCUE TEAM
# ============================================================

@app.route(
    "/rescue-teams/<int:team_id>",
    methods=["PUT"]
)
def update_rescue_team(team_id):

    team = db.session.get(
        RescueTeam,
        team_id
    )


    if not team:

        return jsonify({

            "success": False,

            "error":
                "Rescue team not found"

        }), 404


    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "error":
                "Request body is required"

        }), 400


    # --------------------------------------------------------
    # UPDATE NAME
    # --------------------------------------------------------

    if "name" in data:

        if not data["name"]:

            return jsonify({

                "success": False,

                "error":
                    "name cannot be empty"

            }), 400


        team.name = str(
            data["name"]
        ).strip()


    # --------------------------------------------------------
    # UPDATE LEADER
    # --------------------------------------------------------

    if "team_leader" in data:

        team.team_leader = str(
            data["team_leader"]
        ).strip()


    elif "leader" in data:

        team.team_leader = str(
            data["leader"]
        ).strip()


    # --------------------------------------------------------
    # UPDATE MEMBERS
    # --------------------------------------------------------

    if "members" in data:

        try:

            members = int(
                data["members"]
            )

        except (
            TypeError,
            ValueError
        ):

            return jsonify({

                "success": False,

                "error":
                    "members must be a number"

            }), 400


        if members <= 0:

            return jsonify({

                "success": False,

                "error":
                    "members must be greater than 0"

            }), 400


        team.members = members


    # --------------------------------------------------------
    # UPDATE LOCATION
    # --------------------------------------------------------

    if "location" in data:

        if not data["location"]:

            return jsonify({

                "success": False,

                "error":
                    "location cannot be empty"

            }), 400


        team.location = str(
            data["location"]
        ).strip()


    # --------------------------------------------------------
    # UPDATE STATUS
    # --------------------------------------------------------

    if "status" in data:

        status = str(
            data["status"]
        ).upper()


        allowed_statuses = [

            "AVAILABLE",

            "BUSY",

            "OFF_DUTY"

        ]


        if status not in allowed_statuses:

            return jsonify({

                "success": False,

                "error":
                    "Invalid status. "
                    "Use AVAILABLE, BUSY "
                    "or OFF_DUTY."

            }), 400


        team.status = status


        if status == "AVAILABLE":

            team.assigned_incident_id = None


    try:

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "Update rescue team error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to update rescue team",

            "details":
                str(error)

        }), 500


    return jsonify({

        "success": True,

        "message":
            "Rescue team updated successfully",

        "team":
            serialize_team(team)

    }), 200


# ============================================================
# ASSIGN RESCUE TEAM
# ============================================================

@app.route(
    "/rescue-teams/<int:team_id>/assign",
    methods=["POST"]
)
def assign_rescue_team(team_id):

    team = db.session.get(
        RescueTeam,
        team_id
    )


    if not team:

        return jsonify({

            "success": False,

            "error":
                "Rescue team not found"

        }), 404


    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "error":
                "Request body is required"

        }), 400


    incident_id = data.get(
        "incident_id"
    )


    if incident_id is None:

        return jsonify({

            "success": False,

            "error":
                "incident_id is required"

        }), 400


    # --------------------------------------------------------
    # CHECK BUSY
    # --------------------------------------------------------

    if team.status == "BUSY":

        return jsonify({

            "success": False,

            "error":
                "Rescue team is already "
                "assigned to an incident"

        }), 409


    # --------------------------------------------------------
    # ASSIGN
    # --------------------------------------------------------

    team.status = "BUSY"


    team.assigned_incident_id = str(
        incident_id
    )


    try:

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "Assign rescue team error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to assign rescue team",

            "details":
                str(error)

        }), 500


    return jsonify({

        "success": True,

        "message":
            "Rescue team assigned successfully",

        "team":
            serialize_team(team)

    }), 200


# ============================================================
# RELEASE RESCUE TEAM
# ============================================================

@app.route(
    "/rescue-teams/<int:team_id>/release",
    methods=["POST"]
)
def release_rescue_team(team_id):

    team = db.session.get(
        RescueTeam,
        team_id
    )


    if not team:

        return jsonify({

            "success": False,

            "error":
                "Rescue team not found"

        }), 404


    team.status = "AVAILABLE"


    team.assigned_incident_id = None


    try:

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "Release rescue team error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to release rescue team",

            "details":
                str(error)

        }), 500


    return jsonify({

        "success": True,

        "message":
            "Rescue team released successfully",

        "team":
            serialize_team(team)

    }), 200


# ============================================================
# DELETE RESCUE TEAM
# ============================================================

@app.route(
    "/rescue-teams/<int:team_id>",
    methods=["DELETE"]
)
def delete_rescue_team(team_id):

    team = db.session.get(
        RescueTeam,
        team_id
    )


    if not team:

        return jsonify({

            "success": False,

            "error":
                "Rescue team not found"

        }), 404


    # --------------------------------------------------------
    # DO NOT DELETE BUSY TEAM
    # --------------------------------------------------------

    if str(
        team.status
    ).upper() == "BUSY":

        return jsonify({

            "success": False,

            "error":
                "Busy rescue team cannot "
                "be deleted. Release the "
                "team first."

        }), 409


    try:

        db.session.delete(team)

        db.session.commit()


    except Exception as error:

        db.session.rollback()

        print(
            "Delete rescue team error:",
            error
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to delete rescue team",

            "details":
                str(error)

        }), 500


    return jsonify({

        "success": True,

        "message":
            "Rescue team deleted successfully"

    }), 200


# ============================================================
# SERIALIZE TEAM
# ============================================================

def serialize_team(team):

    return {

        "id":
            team.id,

        "name":
            team.name,

        "leader":
            team.team_leader,

        "team_leader":
            team.team_leader,

        "members":
            team.members,

        "location":
            team.location,

        "status":
            team.status,

        "assigned_incident_id":
            team.assigned_incident_id,

        "assigned_incident":
            team.assigned_incident_id,

        "created_at":

            team.created_at.isoformat()

            if team.created_at

            else None

    }


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "success": False,

        "error":
            "Endpoint not found"

    }), 404


@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({

        "success": False,

        "error":
            "Method not allowed"

    }), 405


# ============================================================
# START APPLICATION
# ============================================================

if __name__ == "__main__":

    migrate_database()


    print("=" * 60)

    print(
        "ResQhub Rescue Service"
    )

    print("=" * 60)

    print(
        "Database:",
        DATABASE_PATH
    )

    print(
        "Port: 5003"
    )

    print(
        "Health: "
        "http://127.0.0.1:5003/health"
    )

    print(
        "Teams: "
        "http://127.0.0.1:5003/rescue-teams"
    )

    print("=" * 60)


    app.run(

        host="0.0.0.0",

        port=5003,

        debug=True

    )