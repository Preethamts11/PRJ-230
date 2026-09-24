from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///vehicle_tracking.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Vehicle table
class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.String(20), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default="Stopped")
    timestamp = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Save vehicle location
@app.route("/api/location", methods=["POST"])
def save_location():

    data = request.get_json()

    vehicle = Vehicle(
        vehicle_id=data["vehicle_id"],
        latitude=data["latitude"],
        longitude=data["longitude"],
        speed=data["speed"],
        status=data["status"]
    )

    db.session.add(vehicle)
    db.session.commit()

    return jsonify({
        "message": "Vehicle location saved successfully"
    })


# Get latest vehicle location
@app.route("/api/location/latest", methods=["GET"])
def latest_location():

    vehicle = Vehicle.query.order_by(
        Vehicle.timestamp.desc()
    ).first()

    if vehicle is None:
        return jsonify({
            "message": "No vehicle data found"
        }), 404

    return jsonify({
        "vehicle_id": vehicle.vehicle_id,
        "latitude": vehicle.latitude,
        "longitude": vehicle.longitude,
        "speed": vehicle.speed,
        "status": vehicle.status,
        "timestamp": vehicle.timestamp.isoformat()
    })


# Create database
with app.app_context():
    db.create_all()


# Start Flask
if __name__ == "__main__":
    app.run(debug=True)