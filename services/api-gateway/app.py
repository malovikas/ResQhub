from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)

CORS(app)

# --------------------------------------------------
# Service URLs
# --------------------------------------------------

USER_SERVICE_URL = "http://127.0.0.1:5001"
INCIDENT_SERVICE_URL = "http://127.0.0.1:5002"
RESCUE_SERVICE_URL = "http://127.0.0.1:5003"
RESOURCE_SERVICE_URL = "http://127.0.0.1:5004"
NOTIFICATION_SERVICE_URL = "http://127.0.0.1:5005"


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


@app.route("/api/health/services", methods=["GET"])
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

# --------------------------------------------------
# Gateway Health
# --------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "api-gateway",
        "status": "healthy"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "api-gateway",
        "message": "ResQhub API Gateway is running"
    })


# --------------------------------------------------
# USER SERVICE
# --------------------------------------------------

@app.route("/api/users/register", methods=["POST"])
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
            "message": "User service is unavailable"
        }), 503

#------------REGISTRATION---------

@app.route("/api/users/login", methods=["POST"])
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
            "message": "User service is unavailable"
        }), 503



@app.route("/api/users", methods=["GET"])
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
            "message": "User service is unavailable"
        }), 503


@app.route("/api/users/<int:user_id>", methods=["GET"])
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
            "message": "User service is unavailable"
        }), 503


# --------------------------------------------------
# INCIDENT SERVICE
# --------------------------------------------------

@app.route("/api/incidents", methods=["GET", "POST"])
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
            "message": "Incident service is unavailable"
        }), 503


@app.route("/api/incidents/<string:incident_id>", methods=["GET", "PUT", "DELETE"])
def incident(incident_id):

    try:

        service_url = (
            f"{INCIDENT_SERVICE_URL}/incidents/{incident_id}"
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
            "message": "Incident service is unavailable"
        }), 503

# --------------------------------------------------
# RESCUE SERVICE
# --------------------------------------------------

@app.route("/api/rescue-teams", methods=["GET", "POST"])
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
            "message": "Rescue service is unavailable"
        }), 503


@app.route(
    "/api/rescue-teams/<int:team_id>",
    methods=["GET", "PUT"]
)
def rescue_team(team_id):

    try:

        service_url = (
            f"{RESCUE_SERVICE_URL}/rescue-teams/{team_id}"
        )

        if request.method == "GET":

            response = requests.get(service_url)

        else:

            response = requests.put(
                service_url,
                json=request.get_json()
            )

        return (
            jsonify(response.json()),
            response.status_code
        )

    except requests.exceptions.RequestException:
        return jsonify({
            "success": False,
            "message": "Rescue service is unavailable"
        }), 503


# --------------------------------------------------
# RESOURCE SERVICE
# --------------------------------------------------

@app.route("/api/resources", methods=["GET", "POST"])
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
            "message": "Resource service is unavailable"
        }), 503


@app.route(
    "/api/resources/<int:resource_id>",
    methods=["GET", "PUT", "DELETE"]
)
def resource(resource_id):

    try:

        service_url = (
            f"{RESOURCE_SERVICE_URL}/resources/{resource_id}"
        )

        if request.method == "GET":

            response = requests.get(service_url)

        elif request.method == "PUT":

            response = requests.put(
                service_url,
                json=request.get_json()
            )

        else:

            response = requests.delete(service_url)

        return (
            jsonify(response.json()),
            response.status_code
        )

    except requests.exceptions.RequestException:
        return jsonify({
            "success": False,
            "message": "Resource service is unavailable"
        }), 503


# --------------------------------------------------
# NOTIFICATION SERVICE
# --------------------------------------------------

@app.route("/api/notifications", methods=["GET", "POST"])
def notifications():

    try:

        if request.method == "GET":

            response = requests.get(
                f"{NOTIFICATION_SERVICE_URL}/notifications"
            )

        else:

            response = requests.post(
                f"{NOTIFICATION_SERVICE_URL}/notifications",
                json=request.get_json()
            )

        return (
            jsonify(response.json()),
            response.status_code
        )

    except requests.exceptions.RequestException:
        return jsonify({
            "success": False,
            "message": "Notification service is unavailable"
        }), 503


print("\n========== REGISTERED ROUTES ==========")
print(app.url_map)
print("=======================================\n")



# --------------------------------------------------
# Start Gateway
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )