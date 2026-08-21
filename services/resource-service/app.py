from flask import Flask,jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

# Temporary in-memory resource storage
resources = []

# Temporary ID counter
next_resource_id = 1


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "service": "resource-service",
        "status": "healthy"
    })


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "resource-service",
        "message": "ResQhub Resource Service is running"
    })


# Create a new resource
@app.route("/resources", methods=["POST"])
def create_resource():
    global next_resource_id

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    resource_type = data.get("type")
    quantity = data.get("quantity")
    location = data.get("location")

    if not name or not resource_type or quantity is None or not location:
        return jsonify({
            "success": False,
            "message": "Name, type, quantity and location are required"
        }), 400

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({
            "success": False,
            "message": "Quantity must be a positive integer"
        }), 400

    resource = {
        "id": next_resource_id,
        "name": name,
        "type": resource_type,
        "quantity": quantity,
        "location": location,
        "status": "available"
    }

    resources.append(resource)
    next_resource_id += 1

    return jsonify({
        "success": True,
        "message": "Resource created successfully",
        "resource": resource
    }), 201


# Get all resources
@app.route("/resources", methods=["GET"])
def get_resources():
    return jsonify({
        "success": True,
        "count": len(resources),
        "resources": resources
    })


# Get resource by ID
@app.route("/resources/<int:resource_id>", methods=["GET"])
def get_resource(resource_id):
    for resource in resources:
        if resource["id"] == resource_id:
            return jsonify({
                "success": True,
                "resource": resource
            })

    return jsonify({
        "success": False,
        "message": "Resource not found"
    }), 404


# Update resource
@app.route("/resources/<int:resource_id>", methods=["PUT"])
def update_resource(resource_id):
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    for resource in resources:
        if resource["id"] == resource_id:

            if "name" in data:
                resource["name"] = data["name"]

            if "type" in data:
                resource["type"] = data["type"]

            if "quantity" in data:
                if not isinstance(data["quantity"], int) or data["quantity"] <= 0:
                    return jsonify({
                        "success": False,
                        "message": "Quantity must be a positive integer"
                    }), 400

                resource["quantity"] = data["quantity"]

            if "location" in data:
                resource["location"] = data["location"]

            if "status" in data:
                allowed_statuses = [
                    "available",
                    "assigned",
                    "maintenance",
                    "unavailable"
                ]

                if data["status"] not in allowed_statuses:
                    return jsonify({
                        "success": False,
                        "message": "Invalid resource status"
                    }), 400

                resource["status"] = data["status"]

            return jsonify({
                "success": True,
                "message": "Resource updated successfully",
                "resource": resource
            })

    return jsonify({
        "success": False,
        "message": "Resource not found"
    }), 404


# Delete resource
@app.route("/resources/<int:resource_id>", methods=["DELETE"])
def delete_resource(resource_id):
    for resource in resources:
        if resource["id"] == resource_id:
            resources.remove(resource)

            return jsonify({
                "success": True,
                "message": "Resource deleted successfully"
            })

    return jsonify({
        "success": False,
        "message": "Resource not found"
    }), 404


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5004,
        debug=True
    )