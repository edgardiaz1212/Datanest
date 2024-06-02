"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, User, Equipment, Description, Rack
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/addUser', methods=['POST'])
def addUser():
    if request.method == "POST":
        data_form = request.form
        data = {
            "email": data_form.get('email'),
            "coordination": data_form.get('coordination'),
            "username": data_form.get('username'),
            "clientName": data_form.get('clientName'),
        }
        new_user = User(
            username=data.get('username'),
            coordination=data.get('coordination'),
            email=data.get('email'),
            clientName=data.get('clientName'),
        )
        db.session.add(new_user)
        try:
            db.session.commit()
            user_id = new_user.id
            user_info = {
                "user_id": user_id,
                "username": new_user.username,
                "coordination": new_user.coordination,
                "email": new_user.email,
                "clientName": new_user.clientName,
            }
            return jsonify(user_info), 201
        except Exception as error:
            db.session.rollback()
            return jsonify({"msg": "Error occurred while trying to upload User", "error": str(error)}), 500
        return jsonify([]), 200

@api.route('/user/<int:user_id>', methods=['GET'])
def get_current_user(user_id):
    if request.method == "GET":
        user = User.query.filter_by(id=user_id).first()
        if user:
            user_data = user.serialize()
            return jsonify(user_data), 200
        else:
            return jsonify({"message": "User not found"}), 404

@api.route('/description', methods=['POST'])
def addDescription():
    if request.method == 'POST':
        try:
            data_form = request.form
            data = {
                "brand": data_form.get("brand"),
                "model": data_form.get("model"),
                "serial": data_form.get("serial"),
                "number_part": data_form.get("number_part"),
                "componentType": data_form.get("componentType"),
                "five_years_prevition": data_form.get("five_years_prevition"),
                "observations": data_form.get("observations"),
                "contract": data_form.get("contract"),
                "service": data_form.get("service"),
            }
            new_description = Description(
                brand=data.get("brand"),
                model=data.get('model'),
                serial=data.get('serial'),
                number_part=data.get('number_part'),
                five_years_prevition=data.get('five_years_prevition'),
                observations=data.get('observations'),
                componentType=data.get('componentType'),
                contract=data.get('contract'),
                service=data.get('service')
            )
            db.session.add(new_description)
            db.session.commit()
            return jsonify({"description_id": new_description.id}), 201
        except Exception as error:
            db.session.rollback()
            return jsonify({"msg": "Error occurred while trying to upload Description", "error": str(error)}), 500
        return jsonify([]), 200
