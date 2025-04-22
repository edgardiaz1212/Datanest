"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, UserForm, Equipment, Description, Rack, TrackerUsuario, AireAcondicionado, Lectura, Mantenimiento, UmbralConfiguracion, OtroEquipo
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import or_ # Para búsquedas OR
from datetime import datetime
import traceback


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)
# Para formulario 
#manejo de usuarios que usan el formulario
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
        new_user = UserForm(
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

@api.route('/users', methods=['GET'])
def get_users():
    try:
        users = UserForm.query.all()
        users_list = [user.serialize() for user in users]
        return jsonify(users_list), 200
    except Exception as error:
        return jsonify({
            "msg": "Error occurred while trying to fetch users",
            "error": str(error)
        }), 500


@api.route('/user/email/<string:email>', methods=['GET'])
def check_email(email):
    user = UserForm.query.filter_by(email=email).first()
    if user:
        return jsonify({"message": "El correo ya está registrado."}), 400
    return jsonify({"message": "Correo disponible."}), 200

@api.route('/user/<int:user_id>', methods=['GET'])
def get_current_user(user_id):
    if request.method == "GET":
        user = UserForm.query.filter_by(id=user_id).first()
        if user:
            user_data = user.serialize()
            return jsonify(user_data), 200
        else:
            return jsonify({"message": "User not found"}), 404

@api.route('/delete_user_data/<int:user_id>' , methods=['DELETE'])
def delete_user_info(user_id):
    users = UserForm.query.get(user_id)
    if not users:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    descriptions = Description.query.filter_by(user_id=user_id).all()
    racks = Rack.query.filter_by(user_id=user_id).all()
    equipments = Equipment.query.filter_by(user_id=user_id).all()
    
    for rack in racks:
        db.session.delete(rack)
    for eq in equipments:
        db.session.delete(eq)
    db.session.delete(users) 
    for desc in descriptions:
        db.session.delete(desc)
   
    try:
        db.session.commit()
        return jsonify({"msg": "Usuario y datos relacionados eliminados correctamente"}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"msg": str(error.args)}), 500

#Descripcion base equipo o rack
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
        user = UserForm.query.get(user_id)
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
#datos rack y equipo
@api.route('/description/<int:user_id>', methods=['GET'])
def get_all_descriptions_by_user(user_id):
    user = UserForm.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Obtener descripciones desde racks
    rack_descriptions = [rack.description for rack in user.racks if rack.description]
    
    # Obtener descripciones desde equipos
    equipment_descriptions = [equipment.description for equipment in user.equipments if equipment.description]
    
    # Combinar y serializar descripciones
    all_descriptions = list(set(rack_descriptions + equipment_descriptions))
    descriptions_data = [description.serialize() for description in all_descriptions]
    
    # Responder según el caso
    if not descriptions_data:
        return jsonify({"message": "No descriptions found for this user"}), 200
    
    return jsonify(descriptions_data), 200

@api.route('/rack/<int:description_id>', methods=['GET'])
def get_rack_by_description(description_id):
    rack = Rack.query.filter_by(description_id=description_id).first()
    if not rack:
        return jsonify({"message": "Rack not found"}), 404
    return jsonify(rack.serialize()), 200

@api.route('/rack', methods=['GET'])
def get_rack():
    try:
        racks = Rack.query.all()
        if not racks:
            return jsonify({"message": "Racks not found"}), 404
        
        serialized_racks = [rack.serialize() for rack in racks]
        return jsonify(serialized_racks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/equipment/<int:description_id>', methods=['GET'])
def get_equipment_by_description(description_id):
    equipment = Equipment.query.filter_by(description_id=description_id).first()
    if not equipment:
        return jsonify({"message": "Equipment not found"}), 404
    return jsonify(equipment.serialize()), 200

@api.route('/descriptions/<int:description_id>', methods=['DELETE'])
def delete_description(description_id):
    description = Description.query.get(description_id)
    if description:
        db.session.delete(description)
        db.session.commit()
        return jsonify({'message': 'Description and related entities deleted successfully'}), 200
    else:
        return jsonify({'message': 'Description not found'}), 404
#actualizaciones equipo y rack
@api.route('/editDescription/<int:description_id>', methods=['PUT'])
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

@api.route('/editRack/<int:rack_id>', methods=['PUT'])
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

#Manejo de usuario aircontrol
@api.route('/tracker/register', methods=['POST'])
def register_tracker_user():
    """Registra un nuevo usuario de tipo TrackerUsuario."""
    data_form = request.get_json()
    if not data_form:
        return jsonify({"msg": "No input data provided"}), 400

    # Campos requeridos para TrackerUsuario
    email = data_form.get('email')
    username = data_form.get('username')
    password = data_form.get('password')
    nombre = data_form.get('nombre')
    apellido = data_form.get('apellido')
    rol = data_form.get('rol', 'operador') # Rol por defecto

    if not email or not username or not password or not nombre or not apellido:
        return jsonify({"msg": "Nombre, apellido, email, username, and password are required"}), 400

    # Verificar si ya existe un usuario con ese email o username
    existing_user = TrackerUsuario.query.filter(
        or_(TrackerUsuario.email == email, TrackerUsuario.username == username)
    ).first()
    if existing_user:
        return jsonify({"msg": "Email or username already exists for tracker user"}), 409

    # Crear nuevo TrackerUsuario
    new_tracker_user = TrackerUsuario(
        nombre=nombre,
        apellido=apellido,
        email=email,
        username=username,
        rol=rol,
        activo=True, # Activo por defecto
        fecha_registro=datetime.utcnow() # Usar UTC es buena práctica
    )
    new_tracker_user.set_password(password) # Hashear y guardar contraseña

    db.session.add(new_tracker_user)
    try:
        db.session.commit()
        return jsonify(new_tracker_user.serialize()), 201
    except Exception as error:
        db.session.rollback()
        print(f"Error registering TrackerUsuario: {str(error)}")
        traceback.print_exc()
        return jsonify({"msg": "Error registering tracker user", "error": str(error)}), 500

@api.route('/tracker/login', methods=['POST'])
def login_tracker_user():
    """Autentica un usuario de tipo TrackerUsuario."""
    data_form = request.get_json()
    if not data_form:
        return jsonify({"msg": "No input data provided"}), 400

    identifier = data_form.get('identifier') # Puede ser email o username
    password = data_form.get('password')

    if not identifier or not password:
        return jsonify({"msg": "Identifier (email or username) and password are required"}), 400

    # Buscar TrackerUsuario por username o email
    user = TrackerUsuario.query.filter(
        or_(TrackerUsuario.username == identifier, TrackerUsuario.email == identifier)
    ).first()

    # Verificar si el usuario existe, está activo y la contraseña es correcta
    if user and user.activo and user.check_password(password):
        try:
            # Actualizar última conexión
            user.ultima_conexion = datetime.utcnow()
            db.session.commit()
            # Podrías generar un token JWT aquí
            return jsonify({
                "msg": "Tracker login successful",
                "user": user.serialize()
                # "token": generated_token # Si usas JWT
            }), 200
        except Exception as error:
             db.session.rollback()
             print(f"Error during tracker login (DB update): {str(error)}")
             traceback.print_exc()
             return jsonify({"msg": "An error occurred during tracker login", "error": str(error)}), 500
    else:
        return jsonify({"msg": "Invalid credentials or inactive tracker user"}), 401

@api.route('/tracker/users', methods=['GET'])
def get_tracker_users():
    """Obtiene todos los usuarios TrackerUsuario (opcionalmente solo activos)."""
    try:
        # Cambia a False si quieres todos, incluyendo inactivos
        solo_activos = request.args.get('activos', 'true').lower() == 'true'

        query = TrackerUsuario.query
        if solo_activos:
            query = query.filter_by(activo=True)

        users = query.all()
        users_list = [user.serialize() for user in users]
        return jsonify(users_list), 200
    except Exception as error:
        print(f"Error fetching tracker users: {str(error)}")
        traceback.print_exc()
        return jsonify({"msg": "Error fetching tracker users", "error": str(error)}), 500

@api.route('/tracker/user/<int:user_id>', methods=['GET'])
def get_tracker_user_by_id(user_id):
    """Obtiene un TrackerUsuario específico por su ID."""
    try:
        user = TrackerUsuario.query.get(user_id)
        if user:
            return jsonify(user.serialize()), 200
        else:
            return jsonify({"msg": "Tracker user not found"}), 404
    except Exception as error:
        print(f"Error fetching tracker user {user_id}: {str(error)}")
        traceback.print_exc()
        return jsonify({"msg": "Error fetching tracker user", "error": str(error)}), 500

@api.route('/tracker/user/<int:user_id>', methods=['PUT'])
def update_tracker_user(user_id):
    """Actualiza la información de un TrackerUsuario."""
    user = TrackerUsuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Tracker user not found"}), 404

    data_form = request.get_json()
    if not data_form:
        return jsonify({"msg": "No input data provided"}), 400

    updated = False

    # Actualizar campos permitidos (nombre, apellido, rol, activo)
    if 'nombre' in data_form and data_form['nombre'] != user.nombre:
        user.nombre = data_form['nombre']
        updated = True
    if 'apellido' in data_form and data_form['apellido'] != user.apellido:
        user.apellido = data_form['apellido']
        updated = True
    if 'rol' in data_form and data_form['rol'] != user.rol:
        user.rol = data_form['rol']
        updated = True
    if 'activo' in data_form and isinstance(data_form['activo'], bool) and data_form['activo'] != user.activo:
        user.activo = data_form['activo']
        updated = True
    # Actualizar email con validación de unicidad
    if 'email' in data_form and data_form['email'] != user.email:
        new_email = data_form['email']
        email_exists = TrackerUsuario.query.filter(TrackerUsuario.email == new_email, TrackerUsuario.id != user_id).first()
        if email_exists:
            return jsonify({"msg": f"Email '{new_email}' is already in use by another tracker user"}), 409
        user.email = new_email
        updated = True
    # NO permitir actualizar username o contraseña aquí por simplicidad/seguridad
    # Se podrían crear rutas específicas para cambio de contraseña si es necesario.

    if not updated:
         return jsonify({"msg": "No changes detected for tracker user"}), 200 # O 304

    try:
        db.session.commit()
        return jsonify(user.serialize()), 200
    except Exception as error:
        db.session.rollback()
        print(f"Error updating tracker user {user_id}: {str(error)}")
        traceback.print_exc()
        return jsonify({"msg": "Error updating tracker user", "error": str(error)}), 500

@api.route('/tracker/user/<int:user_id>', methods=['DELETE'])
def delete_tracker_user(user_id):
    """Elimina un TrackerUsuario."""
    user = TrackerUsuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Tracker user not found"}), 404

    # Aquí no parece haber datos relacionados directos con cascade delete,
    # así que solo eliminamos el usuario.
    db.session.delete(user)
    try:
        db.session.commit()
        return jsonify({"msg": f"Tracker user {user_id} deleted successfully"}), 200
    except Exception as error:
        db.session.rollback()
        print(f"Error deleting tracker user {user_id}: {str(error)}")
        traceback.print_exc()
        return jsonify({"msg": "Error deleting tracker user", "error": str(error)}), 500
