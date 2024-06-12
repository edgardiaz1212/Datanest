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
        data_form = request.get_json()
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

@api.route('/user/<int:user_id>', methods=['GET'])
def get_current_user(user_id):
    if request.method == "GET":
        user = User.query.filter_by(id=user_id).first()
        if user:
            user_data = user.serialize()
            return jsonify(user_data), 200
        else:
            return jsonify({"message": "User not found"}), 404

@api.route('/addDescription', methods=['POST'])
def add_description():
    if request.method == "POST":
        data_form = request.get_json()
        new_description = Description(
            brand=data_form.get('brand'),
            model=data_form.get('model'),
            serial=data_form.get('serial'),
            partNumber=data_form.get('partNumber'),
            five_years_prevition=data_form.get('five_years_prevition'),
            observations=data_form.get('observations'),
            componentType=data_form.get('componentType'),
            requestType=data_form.get('requestType')
        )
        db.session.add(new_description)
        try:
            db.session.commit()
            description_id = new_description.id
            description_info = new_description.serialize()
            return jsonify(description_info), 201
        except Exception as error:
            db.session.rollback()
            return jsonify({"msg": "Error occurred while trying to upload description", "error": str(error)}), 500
        
@api.route('/addRack', methods=['POST'])
def add_rack():
    if request.method == "POST":
        data_form = request.get_json()

        # Check if user_id is provided in the request
        user_id = data_form.get('user_id')
        if not user_id:
            return jsonify({"msg": "user_id is required"}), 400

        # Validate if the user exists in the database
        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        new_rack = Rack(
            has_cabinet=data_form.get('has_cabinet'),
            leased=data_form.get('leased'),
            total_cabinets=data_form.get('total_cabinets'),
            open_closed=data_form.get('open_closed'),
            security=data_form.get('security'),
            type_security=data_form.get('type_security'),
            has_extractors=data_form.get('has_extractors'),
            extractors_ubication=data_form.get('extractors_ubication'),
            modular=data_form.get('modular'),
            lateral_doors=data_form.get('lateral_doors'),
            lateral_ubication=data_form.get('lateral_ubication'),
            rack_unit=data_form.get('rack_unit'),
            rack_position=data_form.get('rack_position'),
            rack_ubication=data_form.get('rack_ubication'),
            has_accessory=data_form.get('has_accessory'),
            accessory_description=data_form.get('accessory_description'),
            rack_width=data_form.get('rack_width'),
            rack_length=data_form.get('rack_length'),
            rack_height=data_form.get('rack_height'),
            internal_pdu=data_form.get('internal_pdu'),
            input_connector=data_form.get('input_connector'),
            fases=data_form.get('fases'),
            output_connector=data_form.get('output_connector'),
            neutro=data_form.get('neutro'),
            description_id=data_form.get('description_id'),
            user_id=user_id
        )
        db.session.add(new_rack)
        try:
            db.session.commit()
            rack_id = new_rack.id
            rack_info = new_rack.serialize()
            return jsonify(rack_info), 201
        except Exception as error:
            db.session.rollback()
            return jsonify({"msg": "Error occurred while trying to upload Rack", "error": str(error)}), 500

@api.route('/addEquipment', methods=['POST'])
def add_equipment():
    if request.method == "POST":
        data_form = request.get_json()
        new_equipment = Equipment(
            equipment_width=data_form.get('equipment_width'),
            equipment_height=data_form.get('equipment_height'),
            equipment_length=data_form.get('equipment_length'),
            packaging_width=data_form.get('packaging_width'),
            packaging_length=data_form.get('packaging_length'),
            packaging_height=data_form.get('packaging_height'),
            weight=data_form.get('weight'),
            anchor_type=data_form.get('anchor_type'),
            service_area=data_form.get('service_area'),
            service_frontal=data_form.get('service_frontal'),
            service_back=data_form.get('service_back'),
            service_lateral=data_form.get('service_lateral'),
            access_width=data_form.get('access_width'),
            access_inclination=data_form.get('access_inclination'),
            access_length=data_form.get('access_length'),
            rack_number=data_form.get('rack_number'),
            equip_rack_ubication=data_form.get('equip_rack_ubication'),
            rack_unit_position=data_form.get('rack_unit_position'),
            total_rack_units=data_form.get('total_rack_units'),
            ac_dc=data_form.get('ac_dc'),
            input_current=data_form.get('input_current'),
            power=data_form.get('power'),
            power_supply=data_form.get('power_supply'),
            operation_temp=data_form.get('operation_temp'),
            thermal_disipation=data_form.get('thermal_disipation'),
            power_config=data_form.get('power_config'),
            description_id=data_form.get('description_id'),
            user_id=data_form.get('user_id'),
            rack_id=data_form.get('rack_id')
        )
        db.session.add(new_equipment)
        try:
            db.session.commit()
            equipment_id = new_equipment.id
            equipment_info = new_equipment.serialize()
            return jsonify(equipment_info), 201
        except Exception as error:
            db.session.rollback()
            # Log the detailed error message
            import traceback
            error_message = traceback.format_exc()
            print(f"Error occurred while trying to upload Equipment: {error_message}")
            return jsonify({"msg": "Error occurred while trying to upload Equipment", "error": error_message}), 500
        
@api.route('/description/<int:user_id>', methods=['GET'])
def get_all_descriptions_by_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    descriptions = Description.query.all()
    descriptions_data = [description.serialize() for description in descriptions]
    return jsonify(descriptions_data), 200

@api.route('/descriptions/<int:description_id>', methods=['DELETE'])
def delete_description(description_id):
    description = Description.query.get(description_id)
    if description:
        db.session.delete(description)
        db.session.commit()
        return jsonify({'message': 'Description and related entities deleted successfully'}), 200
    else:
        return jsonify({'message': 'Description not found'}), 404

@api.route('/description/<int:description_id>', methods=['PUT'])
def update_description(description_id):
    data_form = request.get_json()
    description = Description.query.get(description_id)
    
    if not description:
        return jsonify({"message": "Description not found"}), 404

    description.brand = data_form.get('brand', description.brand)
    description.model = data_form.get('model', description.model)
    description.serial = data_form.get('serial', description.serial)
    description.partNumber = data_form.get('partNumber', description.partNumber)
    description.five_years_prevition = data_form.get('five_years_prevition', description.five_years_prevition)
    description.observations = data_form.get('observations', description.observations)
    description.componentType = data_form.get('componentType', description.componentType)
    description.requestType = data_form.get('requestType', description.requestType)

    try:
        db.session.commit()
        return jsonify(description.serialize()), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"msg": "Error occurred while trying to update description", "error": str(error)}), 500

@api.route('/rack/<int:rack_id>', methods=['PUT'])
def update_rack(rack_id):
    data_form = request.get_json()
    rack = Rack.query.get(rack_id)
    
    if not rack:
        return jsonify({"message": "Rack not found"}), 404

    rack.has_cabinet = data_form.get('has_cabinet', rack.has_cabinet)
    rack.leased = data_form.get('leased', rack.leased)
    rack.total_cabinets = data_form.get('total_cabinets', rack.total_cabinets)
    rack.open_closed = data_form.get('open_closed', rack.open_closed)
    rack.security = data_form.get('security', rack.security)
    rack.type_security = data_form.get('type_security', rack.type_security)
    rack.has_extractors = data_form.get('has_extractors', rack.has_extractors)
    rack.extractors_ubication = data_form.get('extractors_ubication', rack.extractors_ubication)
    rack.modular = data_form.get('modular', rack.modular)
    rack.lateral_doors = data_form.get('lateral_doors', rack.lateral_doors)
    rack.lateral_ubication = data_form.get('lateral_ubication', rack.lateral_ubication)
    rack.rack_unit = data_form.get('rack_unit', rack.rack_unit)
    rack.rack_position = data_form.get('rack_position', rack.rack_position)
    rack.rack_ubication = data_form.get('rack_ubication', rack.rack_ubication)
    rack.has_accessory = data_form.get('has_accessory', rack.has_accessory)
    rack.accessory_description = data_form.get('accessory_description', rack.accessory_description)
    rack.rack_width = data_form.get('rack_width', rack.rack_width)
    rack.rack_length = data_form.get('rack_length', rack.rack_length)
    rack.rack_height = data_form.get('rack_height', rack.rack_height)
    rack.internal_pdu = data_form.get('internal_pdu', rack.internal_pdu)
    rack.input_connector = data_form.get('input_connector', rack.input_connector)
    rack.fases = data_form.get('fases', rack.fases)
    rack.output_connector = data_form.get('output_connector', rack.output_connector)
    rack.neutro = data_form.get('neutro', rack.neutro)

    try:
        db.session.commit()
        return jsonify(rack.serialize()), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"msg": "Error occurred while trying to update rack", "error": str(error)}), 500

@api.route('/editEquipment/<int:equipment_id>', methods=['PUT'])
def edit_equipment(equipment_id):
    if request.method == 'PUT':
        data_form = request.get_json()
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({'message': 'Equipment not found'}), 404

        equipment.equipment_width = data_form.get('equipment_width', equipment.equipment_width)
        equipment.equipment_height = data_form.get('equipment_height', equipment.equipment_height)
        equipment.equipment_length = data_form.get('equipment_length', equipment.equipment_length)
        equipment.packaging_width= data_form.get('packaging_width', equipment.packaging_width)
        equipment.packaging_length= data_form.get('packaging_length',equipment.packaging_length)
        equipment.packaging_height= data_form.get('packaging_height',equipment.packaging_height)
        equipment.weight= data_form.get('weight',equipment.weight)
        equipment.anchor_type= data_form.get('anchor_type',equipment.anchor_type)
        equipment.service_area= data_form.get('service_area',equipment.service_area)
        equipment.service_frontal= data_form.get('service_frontal',equipment.service_frontal)
        equipment.service_back= data_form.get('service_back',equipment.service_back)
        equipment.service_lateral= data_form.get('service_lateral',equipment.service_lateral)
        equipment.access_width= data_form.get('access_width',equipment.access_width)
        equipment.access_inclination= data_form.get('access_inclination',equipment.access_inclination)
        equipment.access_length= data_form.get('access_length',equipment.access_length)
        equipment.rack_number= data_form.get('rack_number',equipment.rack_number)
        equipment.equip_rack_ubication= data_form.get('equip_rack_ubication',equipment.equip_rack_ubication)
        equipment.rack_unit_position= data_form.get('rack_unit_position',equipment.rack_unit_position)
        equipment.total_rack_units= data_form.get('total_rack_units',equipment.total_rack_units)
        equipment.ac_dc= data_form.get('ac_dc',equipment.ac_dc)
        equipment.input_current= data_form.get('input_current',equipment.input_current)
        equipment.power= data_form.get('power',equipment.power)
        equipment.power_supply= data_form.get('power_supply',equipment.power_supply)
        equipment.operation_temp= data_form.get('operation_temp',equipment.operation_temp)
        equipment.thermal_disipation= data_form.get('thermal_disipation',equipment.thermal_disipation)
        equipment.power_config= data_form.get('power_config',equipment.power_config)


        try:
            db.session.commit()
            return jsonify(equipment.serialize()), 200
        except Exception as error:
            db.session.rollback()
            return jsonify({"msg": "Error occurred while trying to update Equipment", "error": str(error)}), 500
