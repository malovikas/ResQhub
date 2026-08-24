from flask import Flask, jsonify, request
from flask_cors import CORS
import requests


app = Flask(__name__)

CORS(app)


# ============================================================
# SERVICE URLS
# ============================================================

USER_SERVICE_URL = "http://127.0.0.1:5001"
INCIDENT_SERVICE_URL = "http://127.0.0.1:5002"
RESCUE_SERVICE_URL = "http://127.0.0.1:5003"
RESOURCE_SERVICE_URL = "http://127.0.0.1:5004"
NOTIFICATION_SERVICE_URL = "http://127.0.0.1:5005"


# ============================================================
# SERVICE HEALTH CHECK
# ============================================================

def check_service_health(service_name, service_url):

    try:

        response = requests.get(
            f"{service_url}/health",
            timeout=3
        )

        if response.ok:

            return {
                "service": service_name,
                "status": "online"
            }

        return {
            "service": service_name,
            "status": "offline"
        }

    except requests.exceptions.RequestException:

        return {
            "service": service_name,
            "status": "offline"
        }


# ============================================================
# SERVICES HEALTH
# ============================================================

@app.route(
    "/api/health/services",
    methods=["GET"]
)
def services_health():

    services = [

        check_service_health(
            "user-service",
            USER_SERVICE_URL
        ),

        check_service_health(
            "incident-service",
            INCIDENT_SERVICE_URL
        ),

        check_service_health(
            "rescue-service",
            RESCUE_SERVICE_URL
        ),

        check_service_health(
            "resource-service",
            RESOURCE_SERVICE_URL
        ),

        check_service_health(
            "notification-service",
            NOTIFICATION_SERVICE_URL
        )

    ]

    return jsonify({

        "gateway": "online",

        "services": services

    })


# ============================================================
# GATEWAY HEALTH
# ============================================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "service": "api-gateway",

        "status": "healthy"

    })


# ============================================================
# HOME
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "service": "api-gateway",

        "message":
            "ResQhub API Gateway is running"

    })


# ============================================================
# USER SERVICE
# ============================================================


# ------------------------------------------------------------
# REGISTER USER
# ------------------------------------------------------------

@app.route(
    "/api/users/register",
    methods=["POST"]
)
def register_user():

    try:

        response = requests.post(

            f"{USER_SERVICE_URL}/users",

            json=request.get_json()

        )

        return (

            jsonify(response.json()),

            response.status_code

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "User service is unavailable"

        }), 503


# ------------------------------------------------------------
# LOGIN USER
# ------------------------------------------------------------

@app.route(
    "/api/users/login",
    methods=["POST"]
)
def login_user():

    try:

        response = requests.post(

            f"{USER_SERVICE_URL}/users/login",

            json=request.get_json()

        )

        return (

            jsonify(response.json()),

            response.status_code

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "User service is unavailable"

        }), 503


# ------------------------------------------------------------
# GET USERS
# ------------------------------------------------------------

@app.route(
    "/api/users",
    methods=["GET"]
)
def get_users():

    try:

        response = requests.get(

            f"{USER_SERVICE_URL}/users"

        )

        return (

            jsonify(response.json()),

            response.status_code

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "User service is unavailable"

        }), 503


# ------------------------------------------------------------
# GET USER BY ID
# ------------------------------------------------------------

@app.route(
    "/api/users/<int:user_id>",
    methods=["GET"]
)
def get_user(user_id):

    try:

        response = requests.get(

            f"{USER_SERVICE_URL}/users/{user_id}"

        )

        return (

            jsonify(response.json()),

            response.status_code

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "User service is unavailable"

        }), 503


# ============================================================
# INCIDENT SERVICE
# ============================================================


# ------------------------------------------------------------
# GET / CREATE INCIDENT
# ------------------------------------------------------------

@app.route(
    "/api/incidents",
    methods=["GET", "POST"]
)
def incidents():

    try:

        if request.method == "GET":

            response = requests.get(

                f"{INCIDENT_SERVICE_URL}/incidents"

            )

        else:

            response = requests.post(

                f"{INCIDENT_SERVICE_URL}/incidents",

                json=request.get_json()

            )

        return (

            jsonify(response.json()),

            response.status_code

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Incident service is unavailable"

        }), 503


# ------------------------------------------------------------
# GET / UPDATE / DELETE INCIDENT
# ------------------------------------------------------------

@app.route(
    "/api/incidents/<string:incident_id>",
    methods=["GET", "PUT", "DELETE"]
)
def incident(incident_id):

    try:

        service_url = (

            f"{INCIDENT_SERVICE_URL}"
            f"/incidents/{incident_id}"

        )


        if request.method == "GET":

            response = requests.get(

                service_url

            )


        elif request.method == "PUT":

            response = requests.put(

                service_url,

                json=request.get_json()

            )


        else:

            response = requests.delete(

                service_url

            )


        return (

            jsonify(response.json()),

            response.status_code

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Incident service is unavailable"

        }), 503


# ============================================================
# RESCUE SERVICE
# ============================================================


# ------------------------------------------------------------
# GET / CREATE RESCUE TEAMS
# ------------------------------------------------------------

@app.route(
    "/api/rescue-teams",
    methods=["GET", "POST"]
)
def rescue_teams():

    try:

        if request.method == "GET":

            response = requests.get(

                f"{RESCUE_SERVICE_URL}/rescue-teams"

            )

        else:

            response = requests.post(

                f"{RESCUE_SERVICE_URL}/rescue-teams",

                json=request.get_json()

            )


        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Rescue service is unavailable"

        }), 503


# ------------------------------------------------------------
# GET / UPDATE / DELETE RESCUE TEAM
# ------------------------------------------------------------

@app.route(
    "/api/rescue-teams/<int:team_id>",
    methods=["GET", "PUT", "DELETE"]
)
def rescue_team(team_id):

    try:

        service_url = (

            f"{RESCUE_SERVICE_URL}"
            f"/rescue-teams/{team_id}"

        )


        # ====================================================
        # GET
        # ====================================================

        if request.method == "GET":

            response = requests.get(

                service_url

            )


        # ====================================================
        # PUT
        # ====================================================

        elif request.method == "PUT":

            response = requests.put(

                service_url,

                json=request.get_json()

            )


        # ====================================================
        # DELETE
        # ====================================================

        elif request.method == "DELETE":

            response = requests.delete(

                service_url

            )


        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Rescue service is unavailable"

        }), 503


# ------------------------------------------------------------
# ASSIGN RESCUE TEAM
# ------------------------------------------------------------

@app.route(
    "/api/rescue-teams/<int:team_id>/assign",
    methods=["POST"]
)
def assign_rescue_team(team_id):

    try:

        response = requests.post(

            f"{RESCUE_SERVICE_URL}"
            f"/rescue-teams/{team_id}/assign",

            json=request.get_json()

        )

        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Rescue service is unavailable"

        }), 503


# ------------------------------------------------------------
# RELEASE RESCUE TEAM
# ------------------------------------------------------------

@app.route(
    "/api/rescue-teams/<int:team_id>/release",
    methods=["POST"]
)
def release_rescue_team(team_id):

    try:

        response = requests.post(

            f"{RESCUE_SERVICE_URL}"
            f"/rescue-teams/{team_id}/release"

        )

        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Rescue service is unavailable"

        }), 503


# ============================================================
# RESOURCE SERVICE
# ============================================================


# ------------------------------------------------------------
# GET / CREATE RESOURCES
# ------------------------------------------------------------

@app.route(
    "/api/resources",
    methods=["GET", "POST"]
)
def resources():

    try:

        if request.method == "GET":

            response = requests.get(

                f"{RESOURCE_SERVICE_URL}/resources"

            )

        else:

            response = requests.post(

                f"{RESOURCE_SERVICE_URL}/resources",

                json=request.get_json()

            )


        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Resource service is unavailable"

        }), 503


# ------------------------------------------------------------
# GET / UPDATE / DELETE RESOURCE
# ------------------------------------------------------------

@app.route(
    "/api/resources/<int:resource_id>",
    methods=["GET", "PUT", "DELETE"]
)
def resource(resource_id):

    try:

        service_url = (

            f"{RESOURCE_SERVICE_URL}"
            f"/resources/{resource_id}"

        )


        # ====================================================
        # GET
        # ====================================================

        if request.method == "GET":

            response = requests.get(

                service_url

            )


        # ====================================================
        # PUT
        # ====================================================

        elif request.method == "PUT":

            response = requests.put(

                service_url,

                json=request.get_json()

            )


        # ====================================================
        # DELETE
        # ====================================================

        elif request.method == "DELETE":

            response = requests.delete(

                service_url

            )


        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Resource service is unavailable"

        }), 503


# ------------------------------------------------------------
# ASSIGN RESOURCE
# ------------------------------------------------------------

@app.route(
    "/api/resources/<int:resource_id>/assign",
    methods=["PUT"]
)
def assign_resource(resource_id):

    try:

        response = requests.put(

            f"{RESOURCE_SERVICE_URL}"
            f"/resources/{resource_id}/assign",

            json=request.get_json()

        )

        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Resource service is unavailable"

        }), 503


# ============================================================
# NOTIFICATION SERVICE
# ============================================================


# ------------------------------------------------------------
# GET / CREATE NOTIFICATIONS
# ------------------------------------------------------------

@app.route(
    "/api/notifications",
    methods=["GET", "POST"]
)
def notifications():

    try:

        if request.method == "GET":

            response = requests.get(

                f"{NOTIFICATION_SERVICE_URL}"
                "/notifications",

                params=request.args.to_dict()

            )

        else:

            response = requests.post(

                f"{NOTIFICATION_SERVICE_URL}"
                "/notifications",

                json=request.get_json()

            )


        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Notification service is unavailable"

        }), 503


# ------------------------------------------------------------
# MARK NOTIFICATION AS READ
# ------------------------------------------------------------

@app.route(
    "/api/notifications/<int:notification_id>/read",
    methods=["PUT"]
)
def mark_notification_read(notification_id):

    try:

        response = requests.put(

            f"{NOTIFICATION_SERVICE_URL}"
            f"/notifications/{notification_id}/read"

        )


        return (

            jsonify(response.json()),

            response.status_code

        )


    except requests.exceptions.RequestException:

        return jsonify({

            "success": False,

            "message":
                "Notification service is unavailable"

        }), 503


# ============================================================
# REGISTERED ROUTES
# ============================================================

print(
    "\n========== REGISTERED ROUTES =========="
)

print(app.url_map)

print(
    "=======================================\n"
)


# ============================================================
# START GATEWAY
# ============================================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )