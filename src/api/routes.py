"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, send_file
from api.models import db, UserForm, Equipment, Description, Rack, TrackerUsuario, AireAcondicionado,Lectura, Mantenimiento, UmbralConfiguracion, OtroEquipo, ContactoProveedor 
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import or_ , func , distinct, desc
from datetime import datetime
import traceback
import sys
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity # Añade create_access_token
import io
import base64 # Importar base64
from sqlalchemy.orm import aliased # Añadir aliased



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
    """Autentica un usuario de tipo TrackerUsuario y devuelve un token JWT."""
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

            access_token = create_access_token(identity=str(user.id)) 

            # --- Devolver el token junto con los datos del usuario ---
            return jsonify({
                "msg": "Tracker login successful",
                "token": access_token, # <--- Token añadido aquí
                "user": user.serialize()
            }), 200

        except Exception as error:
             db.session.rollback()
             print(f"Error during tracker login (DB update or token generation): {str(error)}")
             traceback.print_exc()
             return jsonify({"msg": "An error occurred during tracker login", "error": str(error)}), 500
    else:
        # Mensaje de error genérico por seguridad
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
@jwt_required() # <--- Añadido aquí
def get_tracker_user_by_id(user_id):
    """Obtiene un TrackerUsuario específico por su ID. Requiere autenticación."""
    # Opcional: Podrías añadir lógica para verificar roles aquí
    # current_user_id = get_jwt_identity()
    # logged_in_user = TrackerUsuario.query.get(current_user_id)
    # if logged_in_user.rol != 'admin' and current_user_id != user_id:
    #     return jsonify({"msg": "Acceso no autorizado"}), 403

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
@jwt_required() # <--- Añadido aquí
def update_tracker_user(user_id):
    """Actualiza la información de un TrackerUsuario. Requiere autenticación."""
    # --- ¡IMPORTANTE: Añadir verificación de permisos! ---
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)

    # Solo un admin o el propio usuario pueden modificar
    if not logged_in_user or (logged_in_user.rol != 'admin' and current_user_id != user_id):
         return jsonify({"msg": "Acceso no autorizado para modificar este usuario"}), 403
    # --- Fin verificación de permisos ---

    user = TrackerUsuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Tracker user not found"}), 404

    data_form = request.get_json()
    if not data_form:
        return jsonify({"msg": "No input data provided"}), 400

    updated = False

    # --- Lógica de actualización (sin cambios) ---
    # (Solo permitir que un admin cambie el rol o el estado 'activo')
    is_admin = logged_in_user.rol == 'admin'

    if 'nombre' in data_form and data_form['nombre'] != user.nombre:
        user.nombre = data_form['nombre']
        updated = True
    if 'apellido' in data_form and data_form['apellido'] != user.apellido:
        user.apellido = data_form['apellido']
        updated = True
    if is_admin and 'rol' in data_form and data_form['rol'] != user.rol: # Solo admin cambia rol
        user.rol = data_form['rol']
        updated = True
    if is_admin and 'activo' in data_form and isinstance(data_form['activo'], bool) and data_form['activo'] != user.activo: # Solo admin cambia activo
        user.activo = data_form['activo']
        updated = True
    if 'email' in data_form and data_form['email'] != user.email:
        new_email = data_form['email']
        email_exists = TrackerUsuario.query.filter(TrackerUsuario.email == new_email, TrackerUsuario.id != user_id).first()
        if email_exists:
            return jsonify({"msg": f"Email '{new_email}' is already in use by another tracker user"}), 409
        user.email = new_email
        updated = True
    # --- Fin lógica de actualización ---

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

@api.route('/tracker/user/password', methods=['PUT'])
@jwt_required()
def change_tracker_user_password():
    """
    Permite al usuario autenticado cambiar su propia contraseña.
    Requiere autenticación JWT.
    Recibe 'current_password' y 'new_password' en el cuerpo JSON.
    """
    current_user_id_str = get_jwt_identity() # El identity es un string
    try:
        current_user_id = int(current_user_id_str)
    except ValueError:
        return jsonify({"msg": "Identidad de usuario inválida en el token"}), 400

    user = db.session.get(TrackerUsuario, current_user_id)
    if not user:
        # Esto no debería pasar si el token es válido, pero por seguridad
        return jsonify({"msg": "Usuario no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({"msg": "Se requieren 'current_password' y 'new_password'"}), 400

    # Verificar la contraseña actual
    if not user.check_password(current_password):
        return jsonify({"msg": "La contraseña actual es incorrecta"}), 401 # Unauthorized o Bad Request

    # Validar longitud mínima de la nueva contraseña (opcional pero recomendado)
    if len(new_password) < 6:
         return jsonify({"msg": "La nueva contraseña debe tener al menos 6 caracteres"}), 400

    # Establecer y hashear la nueva contraseña
    try:
        user.set_password(new_password)
        db.session.commit()
        return jsonify({"msg": "Contraseña actualizada correctamente"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al cambiar contraseña para usuario {current_user_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al actualizar la contraseña."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al cambiar contraseña para usuario {current_user_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al actualizar la contraseña."}), 500


@api.route('/tracker/user/<int:user_id>', methods=['DELETE'])
@jwt_required() # <--- Añadido aquí
def delete_tracker_user(user_id):
    """Elimina un TrackerUsuario. Requiere autenticación y permisos de admin."""
    # --- ¡IMPORTANTE: Añadir verificación de permisos! ---
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)

    # Solo un admin puede eliminar usuarios
    if not logged_in_user or logged_in_user.rol != 'admin':
         return jsonify({"msg": "Acceso no autorizado para eliminar usuarios"}), 403

    # Evitar que un admin se elimine a sí mismo (opcional pero recomendado)
    if current_user_id == user_id:
        return jsonify({"msg": "No puedes eliminar tu propia cuenta de administrador"}), 403
    # --- Fin verificación de permisos ---

    user = TrackerUsuario.query.get(user_id)
    if not user:
        return jsonify({"msg": "Tracker user not found"}), 404

    db.session.delete(user)
    try:
        db.session.commit()
        return jsonify({"msg": f"Tracker user {user_id} deleted successfully"}), 200
    except Exception as error:
        db.session.rollback()
        print(f"Error deleting tracker user {user_id}: {str(error)}")
        traceback.print_exc()
        return jsonify({"msg": "Error deleting tracker user", "error": str(error)}), 500

# --- Rutas para AireAcondicionado ---

@api.route('/aires', methods=['POST'])
@jwt_required() # <--- Añadido aquí
def agregar_aire_route():
    """
    Endpoint para agregar un nuevo aire acondicionado. Requiere autenticación.
    Recibe los datos en formato JSON.
    """
    # Opcional: Verificar si el usuario tiene permiso para agregar (ej: rol admin o supervisor)
    # current_user_id = get_jwt_identity()
    # logged_in_user = TrackerUsuario.query.get(current_user_id)
    # if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
    #     return jsonify({"msg": "Acceso no autorizado para agregar aires"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    # (Resto del código de la función sin cambios...)
    required_fields = [
        'nombre', 'ubicacion', 'fecha_instalacion', 'tipo', 'toneladas',
        'evaporadora_operativa', 'evaporadora_marca', 'evaporadora_modelo', 'evaporadora_serial',
        'evaporadora_codigo_inventario', 'evaporadora_ubicacion_instalacion',
        'condensadora_operativa', 'condensadora_marca', 'condensadora_modelo', 'condensadora_serial',
        'condensadora_codigo_inventario', 'condensadora_ubicacion_instalacion'
    ]
    if not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return jsonify({"msg": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

    try:
        fecha_instalacion_dt = None
        if data.get('fecha_instalacion'):
            try:
                fecha_instalacion_dt = datetime.strptime(data['fecha_instalacion'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({"msg": "Formato de fecha_instalacion inválido. Usar YYYY-MM-DD."}), 400

        toneladas_float = None
        if data.get('toneladas') is not None:
             try:
                 toneladas_float = float(data['toneladas'])
             except (ValueError, TypeError):
                 return jsonify({"msg": "Valor de toneladas inválido. Debe ser numérico."}), 400

        nuevo_aire = AireAcondicionado(
            nombre=data['nombre'],
            ubicacion=data['ubicacion'],
            fecha_instalacion=fecha_instalacion_dt,
            tipo=data['tipo'],
            toneladas=toneladas_float,
            evaporadora_operativa=bool(data['evaporadora_operativa']),
            evaporadora_marca=data['evaporadora_marca'],
            evaporadora_modelo=data['evaporadora_modelo'],
            evaporadora_serial=data['evaporadora_serial'],
            evaporadora_codigo_inventario=data['evaporadora_codigo_inventario'],
            evaporadora_ubicacion_instalacion=data['evaporadora_ubicacion_instalacion'],
            condensadora_operativa=bool(data['condensadora_operativa']),
            condensadora_marca=data['condensadora_marca'],
            condensadora_modelo=data['condensadora_modelo'],
            condensadora_serial=data['condensadora_serial'],
            condensadora_codigo_inventario=data['condensadora_codigo_inventario'],
            condensadora_ubicacion_instalacion=data['condensadora_ubicacion_instalacion']
        )

        db.session.add(nuevo_aire)
        db.session.commit()

        return jsonify(nuevo_aire.serialize()), 201

    except IntegrityError as e:
        db.session.rollback()
        error_info = str(e.orig)
        msg = "Error: Ya existe un registro con ese Serial o Código de Inventario."
        if 'UNIQUE constraint failed' in error_info:
             if 'evaporadora_serial' in error_info or 'condensadora_serial' in error_info:
                 msg = "Error: Ya existe un aire con ese número de serie."
             elif 'evaporadora_codigo_inventario' in error_info or 'condensadora_codigo_inventario' in error_info:
                 msg = "Error: Ya existe un aire con ese código de inventario."
        print(f"Error de integridad al agregar aire: {e}", file=sys.stderr)
        return jsonify({"msg": msg}), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy en agregar_aire_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al agregar el aire."}), 500

    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado en agregar_aire_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/aires', methods=['GET'])
@jwt_required() 
def obtener_aires_route():
    """
    Endpoint para obtener la lista de todos los aires acondicionados. Requiere autenticación.
    """
    # No se necesita get_jwt_identity() aquí a menos que quieras filtrar por usuario
    try:
        aires = AireAcondicionado.query.order_by(AireAcondicionado.nombre).all()
        aires_serializados = [aire.serialize() for aire in aires]
        return jsonify(aires_serializados), 200
    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_aires_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener aires."}), 500

@api.route('/aires/<int:aire_id>', methods=['GET'])
@jwt_required() 
def obtener_aire_por_id_route(aire_id):
    """
    Endpoint para obtener un aire acondicionado específico por su ID. Requiere autenticación.
    """
    # No se necesita get_jwt_identity() aquí a menos que quieras verificar permisos específicos
    try:
        if aire_id <= 0:
             return jsonify({"msg": "ID de aire inválido."}), 400

        aire = db.session.get(AireAcondicionado, aire_id)

        if not aire:
            return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

        return jsonify(aire.serialize()), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_aire_por_id_route para ID {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener el aire."}), 500

@api.route('/aires/<int:aire_id>', methods=['PUT'])
@jwt_required() # <--- Añadido aquí
def actualizar_aire_route(aire_id):

    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado para actualizar aires"}), 403

    aire = AireAcondicionado.query.get(aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    # (Resto del código de la función sin cambios...)
    try:
        aire.nombre = data.get('nombre', aire.nombre)
        aire.ubicacion = data.get('ubicacion', aire.ubicacion)
        aire.tipo = data.get('tipo', aire.tipo)

        if 'fecha_instalacion' in data:
            fecha_str = data['fecha_instalacion']
            if fecha_str:
                try:
                    aire.fecha_instalacion = datetime.strptime(fecha_str, '%Y-%m-%d').date()
                except (ValueError, TypeError):
                    return jsonify({"msg": "Formato de fecha_instalacion inválido. Usar YYYY-MM-DD o null."}), 400
            else:
                 aire.fecha_instalacion = None

        if 'toneladas' in data:
            toneladas_val = data['toneladas']
            if toneladas_val is not None and toneladas_val != '':
                 try:
                     aire.toneladas = float(toneladas_val)
                 except (ValueError, TypeError):
                     return jsonify({"msg": "Valor de toneladas inválido. Debe ser numérico."}), 400
            else:
                 aire.toneladas = None

        aire.evaporadora_operativa = bool(data.get('evaporadora_operativa', aire.evaporadora_operativa))
        aire.evaporadora_marca = data.get('evaporadora_marca', aire.evaporadora_marca)
        aire.evaporadora_modelo = data.get('evaporadora_modelo', aire.evaporadora_modelo)
        aire.evaporadora_serial = data.get('evaporadora_serial', aire.evaporadora_serial)
        aire.evaporadora_codigo_inventario = data.get('evaporadora_codigo_inventario', aire.evaporadora_codigo_inventario)
        aire.evaporadora_ubicacion_instalacion = data.get('evaporadora_ubicacion_instalacion', aire.evaporadora_ubicacion_instalacion)

        aire.condensadora_operativa = bool(data.get('condensadora_operativa', aire.condensadora_operativa))
        aire.condensadora_marca = data.get('condensadora_marca', aire.condensadora_marca)
        aire.condensadora_modelo = data.get('condensadora_modelo', aire.condensadora_modelo)
        aire.condensadora_serial = data.get('condensadora_serial', aire.condensadora_serial)
        aire.condensadora_codigo_inventario = data.get('condensadora_codigo_inventario', aire.condensadora_codigo_inventario)
        aire.condensadora_ubicacion_instalacion = data.get('condensadora_ubicacion_instalacion', aire.condensadora_ubicacion_instalacion)

        db.session.commit()
        return jsonify(aire.serialize()), 200

    except IntegrityError as e:
        db.session.rollback()
        error_info = str(e.orig)
        msg = "Error: Ya existe otro registro con ese Serial o Código de Inventario."
        print(f"Error de integridad al actualizar aire {aire_id}: {e}", file=sys.stderr)
        return jsonify({"msg": msg}), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al actualizar aire ID {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al actualizar el aire."}), 500

    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al actualizar aire ID {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500

@api.route('/aires/<int:aire_id>', methods=['DELETE'])
@jwt_required() 
def eliminar_aire_route(aire_id):
    """
    Endpoint para eliminar un aire acondicionado específico por su ID. Requiere autenticación.
    """

    # Solo un admin o supervisor debería poder eliminar
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
         return jsonify({"msg": "Acceso no autorizado para eliminar aires"}), 403

    try:
        aire = db.session.get(AireAcondicionado, aire_id)

        if not aire:
            return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

        db.session.delete(aire)
        db.session.commit()

        return '', 204

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al eliminar aire ID {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al eliminar el aire."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al eliminar aire ID {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al eliminar el aire."}), 500

# --- Rutas para Lectura ---
@api.route('/aires/<int:aire_id>/lecturas', methods=['POST'])
@jwt_required() # <--- Añadido aquí
def agregar_lectura_route(aire_id):
    """
    Endpoint para agregar una nueva lectura para un aire acondicionado específico.
    Requiere autenticación.
    Recibe los datos en formato JSON.
    """
    # Opcional: Verificar si el usuario tiene permiso para agregar lecturas
    # current_user_id = get_jwt_identity()
    # logged_in_user = TrackerUsuario.query.get(current_user_id)
    # if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor', 'operador']:
    #     return jsonify({"msg": "Acceso no autorizado para agregar lecturas"}), 403

    # Verificar que el aire acondicionado existe
    aire = AireAcondicionado.query.get(aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    # Validar campos requeridos para lectura
    if 'fecha' not in data or 'temperatura' not in data or 'humedad' not in data:
        return jsonify({"msg": "Faltan campos requeridos: fecha, temperatura, humedad"}), 400

    try:
        # Convertir fecha de string a datetime
        fecha_dt = None
        try:
            # Asume formato ISO 8601 (ej: 2023-10-27T10:30:00) o YYYY-MM-DD HH:MM:SS
            fecha_dt = datetime.fromisoformat(data['fecha'])
            # o fecha_dt = datetime.strptime(data['fecha'], '%Y-%m-%d %H:%M:%S')
        except (ValueError, TypeError):
            return jsonify({"msg": "Formato de fecha inválido. Usar formato ISO 8601 (YYYY-MM-DDTHH:MM:SS) o YYYY-MM-DD HH:MM:SS."}), 400

        # Convertir temperatura y humedad a float
        try:
            temperatura_float = float(data['temperatura'])
            humedad_float = float(data['humedad'])
        except (ValueError, TypeError):
             return jsonify({"msg": "Temperatura y humedad deben ser valores numéricos."}), 400

        # Crear nueva lectura
        nueva_lectura = Lectura(
            aire_id=aire_id,
            fecha=fecha_dt,
            temperatura=temperatura_float,
            humedad=humedad_float
        )

        db.session.add(nueva_lectura)
        db.session.commit()

        return jsonify(nueva_lectura.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy en agregar_lectura_route para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al guardar la lectura."}), 500

    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado en agregar_lectura_route para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al guardar la lectura."}), 500

@api.route('/aires/<int:aire_id>/lecturas', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_lecturas_por_aire_route(aire_id):
    """
    Endpoint para obtener todas las lecturas de un aire acondicionado específico.
    Requiere autenticación.
    """
    # Verificar que el aire acondicionado existe
    aire = AireAcondicionado.query.get(aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    try:
        # Consultar lecturas ordenadas por fecha
        lecturas = Lectura.query.filter_by(aire_id=aire_id).order_by(Lectura.fecha.desc()).all()
        lecturas_serializadas = [lectura.serialize() for lectura in lecturas]
        return jsonify(lecturas_serializadas), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_lecturas_por_aire_route para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener lecturas."}), 500


@api.route('/lecturas/<int:lectura_id>', methods=['DELETE'])
@jwt_required() # <--- Añadido aquí
def eliminar_lectura_route(lectura_id):
    """
    Endpoint para eliminar una lectura específica por su ID.
    Requiere autenticación.
    """
    # --- ¡IMPORTANTE: Añadir verificación de permisos! ---
    # Solo un admin o supervisor debería poder eliminar lecturas directamente
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
         return jsonify({"msg": "Acceso no autorizado para eliminar lecturas"}), 403
    # --- Fin verificación de permisos ---

    lectura = Lectura.query.get(lectura_id)
    if not lectura:
        return jsonify({"msg": f"Lectura con ID {lectura_id} no encontrada."}), 404

    try:
        db.session.delete(lectura)
        db.session.commit()
        return '', 204 # No Content

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al eliminar lectura ID {lectura_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al eliminar la lectura."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al eliminar lectura ID {lectura_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al eliminar la lectura."}), 500

@api.route('/aires/<int:aire_id>/estadisticas', methods=['GET'])
def obtener_estadisticas_por_aire_route(aire_id):
    """
    Endpoint para obtener estadísticas (promedio, min, max, desviación)
    de temperatura y humedad para un aire acondicionado específico.
    """
    # Verificar que el aire acondicionado existe
    aire = AireAcondicionado.query.get(aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    try:
        # Realizar la consulta de agregación
        result = db.session.query(
            func.avg(Lectura.temperatura).label('temp_avg'),
            func.min(Lectura.temperatura).label('temp_min'),
            func.max(Lectura.temperatura).label('temp_max'),
            func.stddev(Lectura.temperatura).label('temp_std'),
            func.avg(Lectura.humedad).label('hum_avg'),
            func.min(Lectura.humedad).label('hum_min'),
            func.max(Lectura.humedad).label('hum_max'),
            func.stddev(Lectura.humedad).label('hum_std')
        ).filter(Lectura.aire_id == aire_id).first()

        # Preparar el diccionario de respuesta, manejando valores None
        stats = {
            'temperatura_promedio': round(result.temp_avg, 2) if result.temp_avg is not None else 0,
            'temperatura_minima': round(result.temp_min, 2) if result.temp_min is not None else 0,
            'temperatura_maxima': round(result.temp_max, 2) if result.temp_max is not None else 0,
            'temperatura_desviacion': round(result.temp_std, 2) if result.temp_std is not None else 0,
            'humedad_promedio': round(result.hum_avg, 2) if result.hum_avg is not None else 0,
            'humedad_minima': round(result.hum_min, 2) if result.hum_min is not None else 0,
            'humedad_maxima': round(result.hum_max, 2) if result.hum_max is not None else 0,
            'humedad_desviacion': round(result.hum_std, 2) if result.hum_std is not None else 0,
        }

        return jsonify(stats), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_estadisticas_por_aire_route para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        # Devolver un objeto con ceros en caso de error es más seguro para el frontend
        default_stats = {
            'temperatura_promedio': 0, 'temperatura_minima': 0, 'temperatura_maxima': 0, 'temperatura_desviacion': 0,
            'humedad_promedio': 0, 'humedad_minima': 0, 'humedad_maxima': 0, 'humedad_desviacion': 0,
        }
        return jsonify({"msg": "Error inesperado al calcular estadísticas.", "stats": default_stats}), 500

def obtener_estadisticas_generales_helper():
    """
    Helper para obtener estadísticas generales de todas las lecturas.
    Retorna un diccionario o None en caso de error.
    """
    try:
        # Usa db.session en lugar de session
        result = db.session.query(
            func.avg(Lectura.temperatura).label('temp_avg'),
            func.min(Lectura.temperatura).label('temp_min'),
            func.max(Lectura.temperatura).label('temp_max'),
            func.avg(Lectura.humedad).label('hum_avg'),
            func.min(Lectura.humedad).label('hum_min'),
            func.max(Lectura.humedad).label('hum_max'),
            func.count(Lectura.id).label('total_lecturas') # Contar todas las lecturas
        ).first()

        # Si no hay resultados o el promedio es None (sin lecturas)
        if not result or result.temp_avg is None:
            return {
                'temperatura_promedio': 0, 'temperatura_minima': 0, 'temperatura_maxima': 0,
                'humedad_promedio': 0, 'humedad_minima': 0, 'humedad_maxima': 0,
                'total_lecturas': 0
            }

        # Devolver diccionario plano con redondeo y manejo de None
        return {
            'temperatura_promedio': round(result.temp_avg, 2) if result.temp_avg is not None else 0,
            'temperatura_minima': round(result.temp_min, 2) if result.temp_min is not None else 0,
            'temperatura_maxima': round(result.temp_max, 2) if result.temp_max is not None else 0,
            'humedad_promedio': round(result.hum_avg, 2) if result.hum_avg is not None else 0,
            'humedad_minima': round(result.hum_min, 2) if result.hum_min is not None else 0,
            'humedad_maxima': round(result.hum_max, 2) if result.hum_max is not None else 0,
            'total_lecturas': result.total_lecturas if result.total_lecturas is not None else 0
        }
    except Exception as e:
        # Loggear el error es importante para depuración
        print(f"Error en obtener_estadisticas_generales_helper: {e}", file=sys.stderr)
        traceback.print_exc()
        return None # Indicar que hubo un error

def obtener_ubicaciones_helper():
    """
    Helper para obtener todas las ubicaciones únicas de los aires.
    Retorna una lista de strings o None en caso de error.
    """
    try:
        # Usa db.session
        ubicaciones_result = db.session.query(distinct(AireAcondicionado.ubicacion)).all()
        # Extraer solo el string de cada tupla, filtrando None o vacíos
        return [ubicacion[0] for ubicacion in ubicaciones_result if ubicacion[0]]
    except Exception as e:
        print(f"Error en obtener_ubicaciones_helper: {e}", file=sys.stderr)
        traceback.print_exc()
        return None # Indicar error

def obtener_estadisticas_por_ubicacion_helper(ubicacion=None):
    """
    Helper para obtener estadísticas agrupadas por ubicación.
    Retorna una lista de diccionarios o None en caso de error.
    """
    try:
        # Usa db.session
        query_aires = db.session.query(AireAcondicionado.id, AireAcondicionado.ubicacion)
        if ubicacion:
            query_aires = query_aires.filter(AireAcondicionado.ubicacion == ubicacion)

        # Agrupar IDs de aires por ubicación
        aires_por_ubicacion = {}
        all_aires = query_aires.all()
        if not all_aires:
             # Si no hay aires (en general o para esa ubicación), devuelve lista vacía
             return []

        for aire_id, loc in all_aires:
            if loc not in aires_por_ubicacion:
                aires_por_ubicacion[loc] = []
            aires_por_ubicacion[loc].append(aire_id)

        # Lista para almacenar los diccionarios de resultados directamente
        resultados = []

        # Calcular estadísticas para cada ubicación encontrada
        for loc, aires_ids in aires_por_ubicacion.items():
            if not aires_ids: continue # Seguridad extra

            # Consultar estadísticas para los aires de esta ubicación
            result = db.session.query(
                func.avg(Lectura.temperatura).label('temp_avg'),
                func.min(Lectura.temperatura).label('temp_min'),
                func.max(Lectura.temperatura).label('temp_max'),
                func.stddev(Lectura.temperatura).label('temp_std'),
                func.avg(Lectura.humedad).label('hum_avg'),
                func.min(Lectura.humedad).label('hum_min'),
                func.max(Lectura.humedad).label('hum_max'),
                func.stddev(Lectura.humedad).label('hum_std'),
                func.count(Lectura.id).label('total_lecturas') # Contar todas las lecturas
            ).filter(Lectura.aire_id.in_(aires_ids)).first()

            # Preparar diccionario de datos para esta ubicación
            stats_data = {'ubicacion': loc, 'num_aires': len(aires_ids)}

            # Añadir resultados si se encontraron lecturas
            if result and result.total_lecturas > 0:
                stats_data.update({
                    'temperatura_promedio': round(result.temp_avg, 2) if result.temp_avg is not None else 0,
                    'temperatura_min': round(result.temp_min, 2) if result.temp_min is not None else 0,
                    'temperatura_max': round(result.temp_max, 2) if result.temp_max is not None else 0,
                    'temperatura_std': round(result.temp_std, 2) if result.temp_std is not None else 0,
                    'humedad_promedio': round(result.hum_avg, 2) if result.hum_avg is not None else 0,
                    'humedad_min': round(result.hum_min, 2) if result.hum_min is not None else 0,
                    'humedad_max': round(result.hum_max, 2) if result.hum_max is not None else 0,
                    'humedad_std': round(result.hum_std, 2) if result.hum_std is not None else 0,
                    'lecturas_totales': result.total_lecturas if result.total_lecturas is not None else 0
                })
            else:
                # Añadir diccionario con ceros si no hay lecturas para los aires de esta ubicación
                stats_data.update({
                    'temperatura_promedio': 0, 'temperatura_min': 0, 'temperatura_max': 0, 'temperatura_std': 0,
                    'humedad_promedio': 0, 'humedad_min': 0, 'humedad_max': 0, 'humedad_std': 0,
                    'lecturas_totales': 0
                })
            # Añadir el diccionario a la lista de resultados
            resultados.append(stats_data)

        # Devolver la lista de diccionarios
        return resultados

    except Exception as e:
        print(f"Error en obtener_estadisticas_por_ubicacion_helper para '{ubicacion}': {e}", file=sys.stderr)
        traceback.print_exc()
        return None # Indicar error

# --- Rutas de API que usan los Helpers ---

@api.route('/estadisticas/generales', methods=['GET'])
def get_estadisticas_generales_route():
    """Endpoint para obtener estadísticas generales de todas las lecturas."""
    stats = obtener_estadisticas_generales_helper()
    if stats is None:
        # Si el helper devolvió None, hubo un error interno
        return jsonify({"msg": "Error al calcular estadísticas generales."}), 500
    # Si todo ok, devuelve el diccionario de estadísticas
    return jsonify(stats), 200

@api.route('/aires/ubicaciones', methods=['GET'])
def get_ubicaciones_route():
    """Endpoint para obtener la lista de ubicaciones únicas de los aires."""
    ubicaciones = obtener_ubicaciones_helper()
    if ubicaciones is None:
        return jsonify({"msg": "Error al obtener ubicaciones."}), 500
    # Devuelve la lista de strings de ubicaciones
    return jsonify(ubicaciones), 200

@api.route('/aires/ubicacion/<string:ubicacion>', methods=['GET'])
def get_aires_por_ubicacion_route(ubicacion):
    """Endpoint para obtener los aires acondicionados de una ubicación específica."""
    df_aires = obtener_aires_por_ubicacion_helper(ubicacion)

    if df_aires is None: # Error ocurrido en el helper
        return jsonify({"msg": f"Error al obtener aires para la ubicación '{ubicacion}'."}), 500

    # Si el DataFrame está vacío (porque no se encontraron aires), devuelve una lista vacía JSON
    if df_aires.empty:
        return jsonify([]), 200

    # Convertir DataFrame a lista de diccionarios para la respuesta JSON
    aires_list = df_aires.to_dict(orient='records')
    return jsonify(aires_list), 200

# Ruta para obtener estadísticas por ubicación (todas o una específica)
@api.route('/estadisticas/ubicacion', defaults={'ubicacion': None}, methods=['GET'])
@api.route('/estadisticas/ubicacion/<string:ubicacion>', methods=['GET'])
@jwt_required() # Asegúrate que esta ruta también esté protegida si es necesario
def get_estadisticas_por_ubicacion_route(ubicacion):
    """
    Endpoint para obtener estadísticas por ubicación.
    Si no se especifica ubicación en la URL, devuelve para todas.
    Si se especifica /estadisticas/ubicacion/NombreUbicacion, filtra por esa.
    """
    # El helper ahora devuelve una lista de diccionarios o None
    stats_list = obtener_estadisticas_por_ubicacion_helper(ubicacion)

    if stats_list is None: # Error ocurrido en el helper
        msg = f"Error al calcular estadísticas para la ubicación '{ubicacion}'." if ubicacion else "Error al calcular estadísticas por ubicación."
        return jsonify({"msg": msg}), 500

    # --- CORRECCIÓN ---
    # Verificar si la lista está vacía (en lugar de df_stats.empty)
    if not stats_list:
        return jsonify([]), 200 # Devuelve lista vacía JSON si no hay datos

    return jsonify(stats_list), 200 # Devuelve la lista directamente
# --- Helper Functions (Opcional, pero recomendado para organización) ---

def agregar_otro_equipo_helper(data):
    """
    Helper para agregar un nuevo equipo diverso.
    Retorna el objeto serializado o None en caso de error.
    Lanza excepciones específicas para manejo en la ruta.
    """
    required_fields = ['nombre', 'tipo']
    if not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        raise ValueError(f"Faltan campos requeridos: {', '.join(missing)}") # Lanza error para 400

    # Convertir fecha si es string y es válida
    fecha_instalacion_dt = None
    fecha_str = data.get('fecha_instalacion')
    if fecha_str:
        try:
            fecha_instalacion_dt = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except (ValueError, TypeError):
             # Podrías lanzar un error aquí también si la fecha es obligatoria o debe ser válida
             print(f"Formato de fecha inválido para {fecha_str}. Se guardará como None.", file=sys.stderr)
             # raise ValueError("Formato de fecha inválido. Usar YYYY-MM-DD.")

    nuevo_equipo = OtroEquipo(
        nombre=data['nombre'],
        tipo=data['tipo'],
        ubicacion=data.get('ubicacion'),
        marca=data.get('marca'),
        modelo=data.get('modelo'),
        serial=data.get('serial'),
        codigo_inventario=data.get('codigo_inventario'),
        fecha_instalacion=fecha_instalacion_dt,
        # Asegurarse que el booleano se maneje correctamente desde JSON
        estado_operativo=bool(data.get('estado_operativo', True)),
        notas=data.get('notas')
    )
    db.session.add(nuevo_equipo)
    # El commit se maneja en la ruta para poder hacer rollback general
    return nuevo_equipo

# --- Rutas para OtroEquipo ---

@api.route('/otros_equipos', methods=['POST'])
@jwt_required() # <--- Añadido aquí
def agregar_otro_equipo_route():
    """
    Endpoint para agregar un nuevo equipo diverso (no Aire Acondicionado).
    Requiere autenticación. Recibe los datos en formato JSON.
    """
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado para agregar equipos diversos"}), 403


    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    try:
        # Llama al helper para crear la instancia (sin commit aún)
        nuevo_equipo = agregar_otro_equipo_helper(data)

        # Ahora intenta hacer commit
        db.session.commit()

        # Devuelve el objeto recién creado y guardado
        return jsonify(nuevo_equipo.serialize()), 201

    except ValueError as ve: # Captura errores de validación del helper
        db.session.rollback()
        return jsonify({"msg": str(ve)}), 400
    except IntegrityError as e:
        db.session.rollback()
        error_info = str(e.orig)
        msg = "Error de integridad al agregar equipo diverso."
        if 'UNIQUE constraint failed' in error_info: # Ejemplo SQLite
             if 'serial' in error_info:
                 msg = "Error: Ya existe un equipo con ese número de serie."
             elif 'codigo_inventario' in error_info:
                 msg = "Error: Ya existe un equipo con ese código de inventario."
        # Para otros DBs, el mensaje de error puede variar
        print(f"Error de integridad al agregar otro equipo: {e}", file=sys.stderr)
        return jsonify({"msg": msg}), 409 # 409 Conflict
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy en agregar_otro_equipo_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al agregar el equipo diverso."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado en agregar_otro_equipo_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/otros_equipos', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_otros_equipos_route():
    """
    Endpoint para obtener la lista de todos los equipos diversos. Requiere autenticación.
    Devuelve una lista de objetos JSON.
    """
    try:
        # Consulta directa con SQLAlchemy, ordenando por nombre
        equipos = db.session.query(OtroEquipo).order_by(OtroEquipo.nombre).all()

        # Serializar cada objeto
        equipos_serializados = [equipo.serialize() for equipo in equipos]

        return jsonify(equipos_serializados), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_otros_equipos_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener equipos diversos."}), 500


@api.route('/otros_equipos/<int:equipo_id>', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_otro_equipo_por_id_route(equipo_id):
    """
    Endpoint para obtener un equipo diverso específico por su ID. Requiere autenticación.
    """
    try:
        if equipo_id <= 0:
             return jsonify({"msg": "ID de equipo inválido."}), 400

        # Usar db.session.get() para obtener por PK
        equipo = db.session.get(OtroEquipo, equipo_id)

        if not equipo:
            return jsonify({"msg": f"Equipo diverso con ID {equipo_id} no encontrado."}), 404

        return jsonify(equipo.serialize()), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_otro_equipo_por_id_route para ID {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener el equipo diverso."}), 500


@api.route('/otros_equipos/<int:equipo_id>', methods=['PUT'])
@jwt_required() # <--- Añadido aquí
def actualizar_otro_equipo_route(equipo_id):
    """
    Endpoint para actualizar un equipo diverso existente. Requiere autenticación.
    Recibe los datos en formato JSON.
    """
    # --- Opcional: Verificación de Permisos ---
    # current_user_id = get_jwt_identity()
    # logged_in_user = TrackerUsuario.query.get(current_user_id)
    # if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
    #     return jsonify({"msg": "Acceso no autorizado para actualizar equipos diversos"}), 403
    # --- Fin Verificación ---

    equipo = db.session.get(OtroEquipo, equipo_id)
    if not equipo:
        return jsonify({"msg": f"Equipo diverso con ID {equipo_id} no encontrado."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    # (Resto del código sin cambios...)
    allowed_keys = ['nombre', 'tipo', 'ubicacion', 'marca', 'modelo', 'serial',
                    'codigo_inventario', 'fecha_instalacion', 'estado_operativo', 'notas']
    updated = False

    try:
        for key, value in data.items():
            if key in allowed_keys:
                current_value = getattr(equipo, key)

                # Convertir y validar antes de asignar
                if key == 'fecha_instalacion':
                    new_date = None
                    if value: # Si se proporciona un valor
                        try:
                            new_date = datetime.strptime(value, '%Y-%m-%d').date()
                        except (ValueError, TypeError):
                            return jsonify({"msg": f"Formato de fecha inválido para {key}: {value}. Usar YYYY-MM-DD o null."}), 400
                    if new_date != current_value:
                        setattr(equipo, key, new_date)
                        updated = True
                elif key == 'estado_operativo':
                    new_bool = bool(value) # Convertir a booleano
                    if new_bool != current_value:
                        setattr(equipo, key, new_bool)
                        updated = True
                elif value != current_value: # Para otros campos (strings, etc.)
                    setattr(equipo, key, value)
                    updated = True

        if updated:
            equipo.ultima_modificacion = datetime.utcnow() # Actualizar timestamp
            db.session.commit()
            return jsonify(equipo.serialize()), 200
        else:
            # Si no hubo cambios, puedes devolver 200 OK o 304 Not Modified
            return jsonify(equipo.serialize()), 200 # O return '', 304

    except IntegrityError as e:
        db.session.rollback()
        error_info = str(e.orig)
        msg = "Error: Ya existe otro equipo con ese Serial o Código de Inventario."
        # ... (lógica similar a agregar para mensajes más específicos) ...
        print(f"Error de integridad al actualizar otro equipo {equipo_id}: {e}", file=sys.stderr)
        return jsonify({"msg": msg}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al actualizar otro equipo ID {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al actualizar el equipo."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al actualizar otro equipo ID {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/otros_equipos/<int:equipo_id>', methods=['DELETE'])
@jwt_required() # <--- Añadido aquí
def eliminar_otro_equipo_route(equipo_id):
    """
    Endpoint para eliminar un equipo diverso específico por su ID. Requiere autenticación.
    Los mantenimientos asociados deberían eliminarse en cascada si la relación
    en el modelo Mantenimiento está configurada con cascade='all, delete-orphan'.
    """
    # --- ¡IMPORTANTE: Añadir verificación de permisos! ---
    # Solo un admin o supervisor debería poder eliminar
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
         return jsonify({"msg": "Acceso no autorizado para eliminar equipos diversos"}), 403
    # --- Fin verificación de permisos ---

    equipo = db.session.get(OtroEquipo, equipo_id)
    if not equipo:
        return jsonify({"msg": f"Equipo diverso con ID {equipo_id} no encontrado."}), 404

    try:
        # Eliminar el objeto (SQLAlchemy manejará la cascada si está configurada)
        db.session.delete(equipo)
        db.session.commit()

        return '', 204 # No Content

    except SQLAlchemyError as e: # Captura errores específicos de DB
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al eliminar otro equipo ID {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        # Podría ser un error de restricción si la cascada no está bien o hay otras dependencias
        return jsonify({"msg": "Error de base de datos al eliminar el equipo."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al eliminar otro equipo ID {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al eliminar el equipo."}), 500


# --- Rutas para Mantenimiento ---

# Ruta para agregar mantenimiento a un Aire Acondicionado
@api.route('/aires/<int:aire_id>/mantenimientos', methods=['POST'])
@jwt_required() # <--- Añadido aquí
def agregar_mantenimiento_aire_route(aire_id):
    """
    Endpoint para agregar un registro de mantenimiento a un Aire Acondicionado específico.
    Requiere autenticación. Recibe datos como multipart/form-data.
    """
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor', 'tecnico']:
        return jsonify({"msg": "Acceso no autorizado para agregar mantenimientos"}), 403

    # Verificar que el aire existe
    aire = db.session.get(AireAcondicionado, aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    if 'tipo_mantenimiento' not in request.form or 'descripcion' not in request.form or 'tecnico' not in request.form:
        return jsonify({"msg": "Faltan campos requeridos en el formulario: tipo_mantenimiento, descripcion, tecnico"}), 400

    tipo_mantenimiento = request.form['tipo_mantenimiento']
    descripcion = request.form['descripcion']
    tecnico = request.form['tecnico']

    imagen_datos = None
    imagen_nombre = None
    imagen_tipo = None
    imagen_file = request.files.get('imagen_file')

    if imagen_file and imagen_file.filename != '':
        try:
            imagen_nombre = secure_filename(imagen_file.filename)
            imagen_tipo = imagen_file.mimetype
            imagen_datos = imagen_file.read()
        except Exception as e:
             print(f"Error leyendo archivo de imagen: {e}", file=sys.stderr)
             return jsonify({"msg": "Error al procesar el archivo de imagen."}), 400

    try:
        nuevo_mantenimiento = Mantenimiento(
            aire_id=aire_id,
            otro_equipo_id=None,
            fecha=datetime.utcnow(),
            tipo_mantenimiento=tipo_mantenimiento,
            descripcion=descripcion,
            tecnico=tecnico,
            imagen_nombre=imagen_nombre,
            imagen_tipo=imagen_tipo,
            imagen_datos=imagen_datos
        )
        db.session.add(nuevo_mantenimiento)
        db.session.commit()
        return jsonify(nuevo_mantenimiento.serialize()), 201 # Usar serialize_with_details

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al agregar mantenimiento para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al guardar el mantenimiento."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al agregar mantenimiento para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


# Ruta para agregar mantenimiento a un OtroEquipo
@api.route('/otros_equipos/<int:equipo_id>/mantenimientos', methods=['POST'])
@jwt_required()
def agregar_mantenimiento_otro_equipo_route(equipo_id):
    """
    Endpoint para agregar un registro de mantenimiento a un OtroEquipo específico.
    Requiere autenticación. Recibe datos como multipart/form-data.
    """
    # --- Opcional: Verificación de Permisos ---
    # current_user_id = get_jwt_identity()
    # logged_in_user = TrackerUsuario.query.get(current_user_id)
    # if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor', 'tecnico']:
    #     return jsonify({"msg": "Acceso no autorizado para agregar mantenimientos"}), 403
    # --- Fin Verificación ---

    # Verificar que el equipo existe
    equipo = db.session.get(OtroEquipo, equipo_id)
    if not equipo:
        return jsonify({"msg": f"Equipo diverso con ID {equipo_id} no encontrado."}), 404

    # (Resto del código sin cambios...)
    if 'tipo_mantenimiento' not in request.form or 'descripcion' not in request.form or 'tecnico' not in request.form:
        return jsonify({"msg": "Faltan campos requeridos en el formulario: tipo_mantenimiento, descripcion, tecnico"}), 400

    tipo_mantenimiento = request.form['tipo_mantenimiento']
    descripcion = request.form['descripcion']
    tecnico = request.form['tecnico']

    imagen_datos = None
    imagen_nombre = None
    imagen_tipo = None
    imagen_file = request.files.get('imagen_file')

    if imagen_file and imagen_file.filename != '':
        try:
            imagen_nombre = secure_filename(imagen_file.filename)
            imagen_tipo = imagen_file.mimetype
            imagen_datos = imagen_file.read()
        except Exception as e:
             print(f"Error leyendo archivo de imagen: {e}", file=sys.stderr)
             return jsonify({"msg": "Error al procesar el archivo de imagen."}), 400

    try:
        nuevo_mantenimiento = Mantenimiento(
            aire_id=None,
            otro_equipo_id=equipo_id,
            fecha=datetime.utcnow(),
            tipo_mantenimiento=tipo_mantenimiento,
            descripcion=descripcion,
            tecnico=tecnico,
            imagen_nombre=imagen_nombre,
            imagen_tipo=imagen_tipo,
            imagen_datos=imagen_datos
        )
        db.session.add(nuevo_mantenimiento)
        db.session.commit()
        return jsonify(nuevo_mantenimiento.serialize_with_details()), 201 # Usar serialize_with_details

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al agregar mantenimiento para otro equipo {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al guardar el mantenimiento."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al agregar mantenimiento para otro equipo {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


# Ruta para obtener TODOS los mantenimientos (opcionalmente filtrados por query param)
@api.route('/mantenimientos', methods=['GET'])
@jwt_required()
def obtener_todos_mantenimientos_route():
    """
    Endpoint para obtener todos los registros de mantenimiento. Requiere autenticación.
    Opcionalmente filtra por ?aire_id=X o ?otro_equipo_id=Y.
    """
    try:
        query = db.session.query(Mantenimiento)

        aire_id_filter = request.args.get('aire_id', type=int)
        otro_equipo_id_filter = request.args.get('otro_equipo_id', type=int)

        if aire_id_filter:
            query = query.filter(Mantenimiento.aire_id == aire_id_filter)
        elif otro_equipo_id_filter:
            query = query.filter(Mantenimiento.otro_equipo_id == otro_equipo_id_filter)

        mantenimientos = query.order_by(Mantenimiento.fecha.desc()).all()
        results = [m.serialize() for m in mantenimientos]
        return jsonify(results), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_todos_mantenimientos_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener mantenimientos."}), 500


# Ruta para obtener mantenimientos de un Aire específico
@api.route('/aires/<int:aire_id>/mantenimientos', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_mantenimientos_aire_route(aire_id):
    """
    Endpoint para obtener los mantenimientos de un Aire Acondicionado específico.
    Requiere autenticación.
    """
    aire = db.session.get(AireAcondicionado, aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    try:
        mantenimientos = db.session.query(Mantenimiento)\
            .filter(Mantenimiento.aire_id == aire_id)\
            .order_by(Mantenimiento.fecha.desc())\
            .all()
        results = [m.serialize_with_details() for m in mantenimientos]
        return jsonify(results), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_mantenimientos_aire_route para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


# Ruta para obtener mantenimientos de un OtroEquipo específico
@api.route('/otros_equipos/<int:equipo_id>/mantenimientos', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_mantenimientos_otro_equipo_route(equipo_id):
    """
    Endpoint para obtener los mantenimientos de un OtroEquipo específico.
    Requiere autenticación.
    """
    equipo = db.session.get(OtroEquipo, equipo_id)
    if not equipo:
        return jsonify({"msg": f"Equipo diverso con ID {equipo_id} no encontrado."}), 404

    try:
        mantenimientos = db.session.query(Mantenimiento)\
            .filter(Mantenimiento.otro_equipo_id == equipo_id)\
            .order_by(Mantenimiento.fecha.desc())\
            .all()
        results = [m.serialize_with_details() for m in mantenimientos]
        return jsonify(results), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_mantenimientos_otro_equipo_route para equipo {equipo_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/mantenimientos/<int:mantenimiento_id>', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_mantenimiento_por_id_route(mantenimiento_id):
    """
    Endpoint para obtener un registro de mantenimiento específico por su ID.
    Requiere autenticación.
    """
    try:
        mantenimiento = db.session.get(Mantenimiento, mantenimiento_id)
        if not mantenimiento:
            return jsonify({"msg": f"Mantenimiento con ID {mantenimiento_id} no encontrado."}), 404

        if hasattr(mantenimiento, 'serialize_with_details'):
             return jsonify(mantenimiento.serialize_with_details()), 200
        else:
             return jsonify(mantenimiento.serialize()), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_mantenimiento_por_id_route para ID {mantenimiento_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


# Ruta para obtener la imagen de un mantenimiento
@api.route('/mantenimientos/<int:mantenimiento_id>/imagen', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_imagen_mantenimiento_route(mantenimiento_id):
    """
    Endpoint para obtener la imagen asociada a un mantenimiento. Requiere autenticación.
    """
    try:
        mantenimiento = db.session.get(Mantenimiento, mantenimiento_id)
        if not mantenimiento:
            return jsonify({"msg": f"Mantenimiento con ID {mantenimiento_id} no encontrado."}), 404

        if not mantenimiento.imagen_datos or not mantenimiento.imagen_tipo:
            return jsonify({"msg": "Este mantenimiento no tiene imagen asociada."}), 404

        return send_file(
            io.BytesIO(mantenimiento.imagen_datos),
            mimetype=mantenimiento.imagen_tipo,
            as_attachment=False,
            download_name=mantenimiento.imagen_nombre or f"imagen_{mantenimiento_id}"
        )

    except Exception as e:
        print(f"!!! ERROR inesperado al obtener imagen para mantenimiento ID {mantenimiento_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado al obtener la imagen."}), 500


@api.route('/mantenimientos/<int:mantenimiento_id>/imagen_base64', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_imagen_mantenimiento_base64_route(mantenimiento_id):
    """
    Endpoint para obtener la imagen asociada a un mantenimiento en formato Base64.
    Requiere autenticación.
    """
    try:
        mantenimiento = db.session.get(Mantenimiento, mantenimiento_id)
        if not mantenimiento:
            return jsonify({"msg": f"Mantenimiento con ID {mantenimiento_id} no encontrado."}), 404

        if not mantenimiento.imagen_datos or not mantenimiento.imagen_tipo:
            return jsonify({"msg": "Este mantenimiento no tiene imagen asociada."}), 404

        b64_data = base64.b64encode(mantenimiento.imagen_datos).decode('utf-8')
        data_url = f"data:{mantenimiento.imagen_tipo};base64,{b64_data}"
        return jsonify({"imagen_base64": data_url}), 200

    except Exception as e:
        print(f"!!! ERROR inesperado al obtener imagen base64 para mantenimiento ID {mantenimiento_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado al obtener la imagen en base64."}), 500


@api.route('/mantenimientos/<int:mantenimiento_id>', methods=['DELETE'])
@jwt_required() # <--- Añadido aquí
def eliminar_mantenimiento_route(mantenimiento_id):
    """
    Endpoint para eliminar un registro de mantenimiento específico por su ID.
    Requiere autenticación.
    """
    # --- ¡IMPORTANTE: Añadir verificación de permisos! ---
    # Solo un admin o supervisor debería poder eliminar
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
         return jsonify({"msg": "Acceso no autorizado para eliminar mantenimientos"}), 403
    # --- Fin verificación de permisos ---

    mantenimiento = db.session.get(Mantenimiento, mantenimiento_id)
    if not mantenimiento:
        return jsonify({"msg": f"Mantenimiento con ID {mantenimiento_id} no encontrado."}), 404

    try:
        db.session.delete(mantenimiento)
        db.session.commit()
        return '', 204 # No Content

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al eliminar mantenimiento ID {mantenimiento_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al eliminar el mantenimiento."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al eliminar mantenimiento ID {mantenimiento_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al eliminar el mantenimiento."}), 500

# --- Rutas para UmbralConfiguracion ---

@api.route('/umbrales', methods=['POST'])
@jwt_required() # <--- Añadido aquí
def crear_umbral_configuracion_route():
    """
    Endpoint para crear una nueva configuración de umbrales. Requiere autenticación.
    Recibe los datos en formato JSON.
    """
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado para crear umbrales"}), 403


    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    # (Resto del código sin cambios...)
    required_fields = ['nombre', 'es_global', 'temp_min', 'temp_max', 'hum_min', 'hum_max']
    if not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return jsonify({"msg": f"Faltan campos requeridos: {', '.join(missing)}"}), 400

    try:
        nombre = data['nombre']
        es_global = bool(data['es_global'])
        temp_min = float(data['temp_min'])
        temp_max = float(data['temp_max'])
        hum_min = float(data['hum_min'])
        hum_max = float(data['hum_max'])
        aire_id = data.get('aire_id')
        notificar_activo = bool(data.get('notificar_activo', True))

        if temp_min >= temp_max:
            return jsonify({"msg": "temp_min debe ser menor que temp_max"}), 400
        if hum_min >= hum_max:
            return jsonify({"msg": "hum_min debe ser menor que hum_max"}), 400
        if not es_global and aire_id is None:
            return jsonify({"msg": "Se requiere aire_id si el umbral no es global (es_global=false)"}), 400
        if es_global:
            aire_id = None

        if aire_id is not None:
            aire = db.session.get(AireAcondicionado, aire_id)
            if not aire:
                 return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

        nuevo_umbral = UmbralConfiguracion(
            nombre=nombre,
            es_global=es_global,
            aire_id=aire_id,
            temp_min=temp_min,
            temp_max=temp_max,
            hum_min=hum_min,
            hum_max=hum_max,
            notificar_activo=notificar_activo,
        )

        db.session.add(nuevo_umbral)
        db.session.commit()

        return jsonify(nuevo_umbral.serialize()), 201

    except (ValueError, TypeError) as ve:
        db.session.rollback()
        return jsonify({"msg": f"Error en el tipo de dato: {ve}. Asegúrate que los umbrales sean números."}), 400
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error de integridad al crear umbral: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de integridad al crear el umbral."}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy en crear_umbral_configuracion_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al crear el umbral."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado en crear_umbral_configuracion_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/umbrales', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_umbrales_configuracion_route():
    """
    Endpoint para obtener las configuraciones de umbrales. Requiere autenticación.
    Filtra por ?aire_id=X o ?solo_globales=true.
    Si no hay filtros, devuelve todos (globales y específicos).
    """
    try:
        query = db.session.query(UmbralConfiguracion)

        aire_id_filter = request.args.get('aire_id', type=int)
        solo_globales_filter = request.args.get('solo_globales', 'false').lower() == 'true'

        if solo_globales_filter:
            query = query.filter(UmbralConfiguracion.es_global == True)
        elif aire_id_filter:
            query = query.filter(
                or_(
                    UmbralConfiguracion.aire_id == aire_id_filter,
                    UmbralConfiguracion.es_global == True
                )
            )

        umbrales = query.order_by(UmbralConfiguracion.es_global.desc(), UmbralConfiguracion.nombre).all()
        results = [u.serialize() for u in umbrales]

        return jsonify(results), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_umbrales_configuracion_route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al obtener umbrales."}), 500


@api.route('/umbrales/<int:umbral_id>', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_umbral_por_id_route(umbral_id):
    """
    Endpoint para obtener una configuración de umbral específica por su ID.
    Requiere autenticación.
    """
    try:
        umbral = db.session.get(UmbralConfiguracion, umbral_id)
        if not umbral:
            return jsonify({"msg": f"Umbral con ID {umbral_id} no encontrado."}), 404

        return jsonify(umbral.serialize()), 200

    except Exception as e:
        print(f"!!! ERROR inesperado en obtener_umbral_por_id_route para ID {umbral_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/umbrales/<int:umbral_id>', methods=['PUT'])
@jwt_required() 
def actualizar_umbral_configuracion_route(umbral_id):
    """
    Endpoint para actualizar una configuración de umbral existente. Requiere autenticación.
    No permite cambiar 'es_global' ni 'aire_id'.
    """
    
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado para actualizar umbrales"}), 403
    
    umbral = db.session.get(UmbralConfiguracion, umbral_id)
    if not umbral:
        return jsonify({"msg": f"Umbral con ID {umbral_id} no encontrado."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos JSON"}), 400

    # (Resto del código sin cambios...)
    allowed_updates = ['nombre', 'temp_min', 'temp_max', 'hum_min', 'hum_max', 'notificar_activo']
    updated = False

    try:
        new_temp_min = float(data.get('temp_min', umbral.temp_min))
        new_temp_max = float(data.get('temp_max', umbral.temp_max))
        new_hum_min = float(data.get('hum_min', umbral.hum_min))
        new_hum_max = float(data.get('hum_max', umbral.hum_max))

        if new_temp_min >= new_temp_max:
            return jsonify({"msg": "temp_min debe ser menor que temp_max"}), 400
        if new_hum_min >= new_hum_max:
            return jsonify({"msg": "hum_min debe ser menor que hum_max"}), 400

        if 'nombre' in data and data['nombre'] != umbral.nombre:
            umbral.nombre = data['nombre']
            updated = True
        if new_temp_min != umbral.temp_min:
            umbral.temp_min = new_temp_min
            updated = True
        if new_temp_max != umbral.temp_max:
            umbral.temp_max = new_temp_max
            updated = True
        if new_hum_min != umbral.hum_min:
            umbral.hum_min = new_hum_min
            updated = True
        if new_hum_max != umbral.hum_max:
            umbral.hum_max = new_hum_max
            updated = True
        if 'notificar_activo' in data:
             new_notify = bool(data['notificar_activo'])
             if new_notify != umbral.notificar_activo:
                 umbral.notificar_activo = new_notify
                 updated = True

        if updated:
            db.session.commit()
            return jsonify(umbral.serialize()), 200
        else:
            return jsonify(umbral.serialize()), 200

    except (ValueError, TypeError) as ve:
        db.session.rollback()
        return jsonify({"msg": f"Error en el tipo de dato: {ve}. Asegúrate que los umbrales sean números."}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al actualizar umbral ID {umbral_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al actualizar el umbral."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al actualizar umbral ID {umbral_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor."}), 500


@api.route('/umbrales/<int:umbral_id>', methods=['DELETE'])
@jwt_required() # <--- Añadido aquí
def eliminar_umbral_configuracion_route(umbral_id):
    """
    Endpoint para eliminar una configuración de umbral por su ID. Requiere autenticación.
    """
    current_user_id = get_jwt_identity()
    logged_in_user = TrackerUsuario.query.get(current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
         return jsonify({"msg": "Acceso no autorizado para eliminar umbrales"}), 403

    umbral = db.session.get(UmbralConfiguracion, umbral_id)
    if not umbral:
        return jsonify({"msg": f"Umbral con ID {umbral_id} no encontrado."}), 404

    try:
        db.session.delete(umbral)
        db.session.commit()
        return '', 204 # No Content

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"!!! ERROR SQLAlchemy al eliminar umbral ID {umbral_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error de base de datos al eliminar el umbral."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"!!! ERROR inesperado al eliminar umbral ID {umbral_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({"msg": "Error inesperado en el servidor al eliminar el umbral."}), 500

def verificar_lectura_dentro_umbrales_helper(aire_id, temperatura, humedad):
    """
    Helper para verificar si una lectura está dentro de los umbrales configurados.

    Args:
        aire_id (int): ID del aire acondicionado.
        temperatura (float): Temperatura a verificar.
        humedad (float): Humedad a verificar.

    Returns:
        dict: {'dentro_limite': bool, 'alertas': list} o None en caso de error grave.
    """
    try:
        # Obtener umbrales aplicables (específicos del aire + globales)
        # Directamente con SQLAlchemy, sin Pandas
        umbrales_aplicables = db.session.query(UmbralConfiguracion).filter(
            UmbralConfiguracion.notificar_activo == True, # Solo umbrales activos
            or_(
                UmbralConfiguracion.aire_id == aire_id,
                UmbralConfiguracion.es_global == True
            )
        ).all()

        if not umbrales_aplicables:
            # Si no hay umbrales activos configurados, está dentro de límites
            return {
                'dentro_limite': True,
                'alertas': []
            }

        alertas = []

        # Verificar cada umbral aplicable
        for umbral in umbrales_aplicables:
            # Verificar temperatura
            if temperatura < umbral.temp_min:
                alertas.append({
                    'tipo': 'temperatura',
                    'umbral_id': umbral.id,
                    'umbral_nombre': umbral.nombre,
                    'valor': temperatura,
                    'limite': umbral.temp_min,
                    'mensaje': f"Temperatura ({temperatura}°C) por debajo del mínimo ({umbral.temp_min}°C) - Umbral '{umbral.nombre}'"
                })
            elif temperatura > umbral.temp_max:
                alertas.append({
                    'tipo': 'temperatura',
                    'umbral_id': umbral.id,
                    'umbral_nombre': umbral.nombre,
                    'valor': temperatura,
                    'limite': umbral.temp_max,
                    'mensaje': f"Temperatura ({temperatura}°C) por encima del máximo ({umbral.temp_max}°C) - Umbral '{umbral.nombre}'"
                })

            # Verificar humedad
            if humedad < umbral.hum_min:
                alertas.append({
                    'tipo': 'humedad',
                    'umbral_id': umbral.id,
                    'umbral_nombre': umbral.nombre,
                    'valor': humedad,
                    'limite': umbral.hum_min,
                    'mensaje': f"Humedad ({humedad}%) por debajo del mínimo ({umbral.hum_min}%) - Umbral '{umbral.nombre}'"
                })
            elif humedad > umbral.hum_max:
                alertas.append({
                    'tipo': 'humedad',
                    'umbral_id': umbral.id,
                    'umbral_nombre': umbral.nombre,
                    'valor': humedad,
                    'limite': umbral.hum_max,
                    'mensaje': f"Humedad ({humedad}%) por encima del máximo ({umbral.hum_max}%) - Umbral '{umbral.nombre}'"
                })

        # Devolver resultado
        return {
            'dentro_limite': len(alertas) == 0,
            'alertas': alertas
        }

    except Exception as e:
        print(f"Error en verificar_lectura_dentro_umbrales_helper para aire {aire_id}: {e}", file=sys.stderr)
        traceback.print_exc()
        return None # Indicar error


# --- Ruta de API para Verificar Umbrales ---

@api.route('/aires/<int:aire_id>/verificar_umbrales', methods=['GET'])
@jwt_required()
def verificar_umbrales_route(aire_id):
    """
    Endpoint para verificar si una lectura de temperatura y humedad
    está dentro de los umbrales configurados para un aire específico. Requiere autenticación.
    Recibe 'temp' y 'hum' como query parameters.
    Ej: /aires/1/verificar_umbrales?temp=28.5&hum=65
    """
    # Verificar que el aire acondicionado existe
    aire = db.session.get(AireAcondicionado, aire_id)
    if not aire:
        return jsonify({"msg": f"Aire acondicionado con ID {aire_id} no encontrado."}), 404

    # Obtener parámetros de la query string
    temp_str = request.args.get('temp')
    hum_str = request.args.get('hum')

    if temp_str is None or hum_str is None:
        return jsonify({"msg": "Parámetros 'temp' y 'hum' son requeridos en la URL."}), 400

    try:
        temperatura = float(temp_str)
        humedad = float(hum_str)
    except (ValueError, TypeError):
        return jsonify({"msg": "'temp' y 'hum' deben ser valores numéricos."}), 400

    # Llamar al helper para hacer la verificación
    resultado = verificar_lectura_dentro_umbrales_helper(aire_id, temperatura, humedad)

    if resultado is None:
        return jsonify({"msg": "Error al verificar los umbrales."}), 500

    return jsonify(resultado), 200

def contar_entidades_helper():
    """Helper para contar diferentes tipos de entidades."""
    counts = {}
    try:
        counts['aires'] = db.session.query(func.count(AireAcondicionado.id)).scalar() or 0
    except Exception as e:
        print(f"Error al contar aires: {e}", file=sys.stderr)
        counts['aires'] = -1 # Indicar error

    try:
        counts['lecturas'] = db.session.query(func.count(Lectura.id)).scalar() or 0
    except Exception as e:
        print(f"Error al contar lecturas: {e}", file=sys.stderr)
        counts['lecturas'] = -1

    try:
        counts['mantenimientos'] = db.session.query(func.count(Mantenimiento.id)).scalar() or 0
    except Exception as e:
        print(f"Error al contar mantenimientos: {e}", file=sys.stderr)
        counts['mantenimientos'] = -1

    try:
        counts['otros_equipos'] = db.session.query(func.count(OtroEquipo.id)).scalar() or 0
    except Exception as e:
        print(f"Error al contar otros equipos: {e}", file=sys.stderr)
        counts['otros_equipos'] = -1

    return counts

def contar_alertas_activas_helper():
    """
    Helper para contar el número de aires con al menos una alerta activa
    basada en su última lectura y los umbrales activos. (OPTIMIZADO)
    """
    print("\n--- [DEBUG] Iniciando contar_alertas_activas_helper (Optimizado) ---")
    try:
        # 1. Obtener la última lectura de cada aire (sin cambios)
        print("[DEBUG] Obteniendo últimas lecturas...")
        subquery = db.session.query(
            Lectura.aire_id,
            func.max(Lectura.fecha).label('max_fecha')
        ).group_by(Lectura.aire_id).subquery()

        ultimas_lecturas = db.session.query(Lectura).join(
            subquery,
            (Lectura.aire_id == subquery.c.aire_id) & (Lectura.fecha == subquery.c.max_fecha)
        ).all()
        print(f"[DEBUG] Últimas lecturas encontradas: {len(ultimas_lecturas)}")

        # --- OPTIMIZACIÓN: Pre-cargar y organizar umbrales ---
        print("[DEBUG] Pre-cargando y organizando umbrales activos...")

        # Pre-fetch global thresholds once
        global_umbrales = db.session.query(UmbralConfiguracion).filter(
            UmbralConfiguracion.notificar_activo == True,
            UmbralConfiguracion.es_global == True
        ).all()
        print(f"[DEBUG] Global umbrales ACTIVOS encontrados: {len(global_umbrales)}")

        # Pre-fetch specific thresholds into a dictionary {aire_id: [umbral1, umbral2]}
        specific_umbrales_raw = db.session.query(UmbralConfiguracion).filter(
            UmbralConfiguracion.notificar_activo == True,
            UmbralConfiguracion.es_global == False,
            UmbralConfiguracion.aire_id != None # Asegura que aire_id no sea null
        ).all()
        specific_umbrales_dict = {}
        for u in specific_umbrales_raw:
            if u.aire_id not in specific_umbrales_dict:
                specific_umbrales_dict[u.aire_id] = []
            specific_umbrales_dict[u.aire_id].append(u)
        print(f"[DEBUG] Specific umbrales ACTIVOS encontrados: {len(specific_umbrales_raw)} (organizados por aire_id)")
        # --- FIN OPTIMIZACIÓN ---

        # Si no hay ningún umbral activo (ni global ni específico), no puede haber alertas
        if not global_umbrales and not specific_umbrales_dict:
             print("[DEBUG] No hay umbrales activos (globales ni específicos). Devolviendo 0.")
             return 0

        # 3. Verificar cada última lectura contra los umbrales aplicables (usando los pre-cargados)
        alertas_count = 0
        aires_con_alerta = set()
        print("[DEBUG] Iniciando verificación de lecturas vs umbrales pre-cargados...")

        for lectura in ultimas_lecturas:
            print(f"\n[DEBUG] Verificando Aire ID: {lectura.aire_id} (T:{lectura.temperatura}, H:{lectura.humedad})")
            alerta_encontrada_para_este_aire = False

            # --- OPTIMIZACIÓN: Obtener umbrales aplicables eficientemente ---
            umbrales_specific_para_aire = specific_umbrales_dict.get(lectura.aire_id, [])
            umbrales_aplicables_para_aire = global_umbrales + umbrales_specific_para_aire # Combinar listas
            # --- FIN OPTIMIZACIÓN ---

            print(f"[DEBUG]   Umbrales aplicables para este aire: {len(umbrales_aplicables_para_aire)} (Global: {len(global_umbrales)}, Specific: {len(umbrales_specific_para_aire)})")

            if not umbrales_aplicables_para_aire:
                print("[DEBUG]   No hay umbrales aplicables para este aire.")
                continue

            # El resto del bucle de comparación permanece igual...
            for umbral in umbrales_aplicables_para_aire:
                print(f"[DEBUG]     Comparando con Umbral ID: {umbral.id} (T:[{umbral.temp_min},{umbral.temp_max}], H:[{umbral.hum_min},{umbral.hum_max}])")
                try:
                    temp_lectura = float(lectura.temperatura)
                    hum_lectura = float(lectura.humedad)
                    temp_min = float(umbral.temp_min)
                    temp_max = float(umbral.temp_max)
                    hum_min = float(umbral.hum_min)
                    hum_max = float(umbral.hum_max)

                    fuera_limite_temp = (temp_lectura < temp_min or temp_lectura > temp_max)
                    fuera_limite_hum = (hum_lectura < hum_min or hum_lectura > hum_max)
                    print(f"[DEBUG]       Temp fuera: {fuera_limite_temp} ({temp_lectura} vs [{temp_min}, {temp_max}])")
                    print(f"[DEBUG]       Hum fuera: {fuera_limite_hum} ({hum_lectura} vs [{hum_min}, {hum_max}])")

                    if fuera_limite_temp or fuera_limite_hum:
                        print(f"[DEBUG]       ¡VIOLACIÓN DETECTADA por umbral {umbral.id}!")
                        alerta_encontrada_para_este_aire = True
                        if lectura.aire_id not in aires_con_alerta:
                            print(f"[DEBUG]       Añadiendo Aire ID {lectura.aire_id} a alertas. Incrementando contador.")
                            alertas_count += 1
                            aires_con_alerta.add(lectura.aire_id)
                        else:
                            print(f"[DEBUG]       Aire ID {lectura.aire_id} ya estaba en alertas.")
                        break # Pasamos al siguiente aire si ya encontramos una alerta para este
                    else:
                         print(f"[DEBUG]       Dentro de límites para umbral {umbral.id}.")
                except Exception as e_compare:
                    print(f"[ERROR-DEBUG] Error al comparar lectura con umbral {umbral.id}: {e_compare}")

            if not alerta_encontrada_para_este_aire:
                 print(f"[DEBUG]   Lectura DENTRO de todos los umbrales aplicables para Aire ID {lectura.aire_id}.")

        print(f"\n--- [DEBUG] Fin contar_alertas_activas_helper (Optimizado). Total alertas contadas: {alertas_count} ---")
        return alertas_count

    except Exception as e:
        print(f"!!! ERROR GENERAL en contar_alertas_activas_helper (Optimizado): {e}", file=sys.stderr)
        traceback.print_exc()
        return -1 # Indicar error con -1

def obtener_ultimas_lecturas_con_info_aire_helper(limite=5):
    """
    Helper para obtener las últimas N lecturas con info del aire.
    Retorna una lista de diccionarios o None en caso de error.
    """
    try:
        # Alias para claridad
        LecturaAlias = aliased(Lectura)
        AireAlias = aliased(AireAcondicionado)

        # Consulta
        query = db.session.query(
            LecturaAlias.id,
            LecturaAlias.aire_id,
            AireAlias.nombre.label('nombre_aire'),
            AireAlias.ubicacion.label('ubicacion_aire'),
            LecturaAlias.temperatura,
            LecturaAlias.humedad,
            LecturaAlias.fecha
        ).join(
            AireAlias, LecturaAlias.aire_id == AireAlias.id
        ).order_by(
            desc(LecturaAlias.fecha)
        ).limit(limite)

        # Ejecutar y convertir a lista de diccionarios
        ultimas_lecturas_raw = query.all()

        # Convertir resultados (NamedTuple) a diccionarios serializables
        results = []
        for lectura in ultimas_lecturas_raw:
            results.append({
                'id': lectura.id,
                'aire_id': lectura.aire_id,
                'nombre_aire': lectura.nombre_aire,
                'ubicacion_aire': lectura.ubicacion_aire,
                'temperatura': lectura.temperatura,
                'humedad': lectura.humedad,
                # Formatear fecha a ISO string para JSON
                'fecha': lectura.fecha.isoformat() if lectura.fecha else None
            })

        return results

    except Exception as e:
        print(f"Error al obtener últimas lecturas con info aire: {e}", file=sys.stderr)
        traceback.print_exc()
        return None # Indicar error


# --- Rutas de API ---

@api.route('/contadores', methods=['GET'])
@jwt_required() 
def obtener_contadores_route():
    """
    Endpoint para obtener los contadores totales de aires, lecturas,
    mantenimientos y otros equipos. Requiere autenticación.
    """
    # No se necesita get_jwt_identity() aquí, solo autenticación
    counts = contar_entidades_helper()
    # Verificar si algún contador dio error (-1)
    if any(v == -1 for v in counts.values()):
         return jsonify({"msg": "Error al obtener algunos contadores.", "counts": counts}), 500
    return jsonify(counts), 200

@api.route('/alertas/activas/count', methods=['GET'])
@jwt_required() # <--- Añadido aquí
def obtener_contador_alertas_activas_route():
    """
    Endpoint para obtener el número de aires con alertas activas
    basado en su última lectura. Requiere autenticación.
    """
    # No se necesita get_jwt_identity() aquí, solo autenticación
    alert_count = contar_alertas_activas_helper()
    if alert_count == -1:
        return jsonify({"msg": "Error al calcular el número de alertas activas."}), 500
    return jsonify({"alertas_activas_count": alert_count}), 200

@api.route('/lecturas/ultimas', methods=['GET'])
@jwt_required() 
def obtener_ultimas_lecturas_route():
    """
    Endpoint para obtener las últimas N lecturas registradas,
    incluyendo información del aire asociado. Requiere autenticación.
    Acepta un query parameter 'limite' (default 5).
    """
    try:
        limite = request.args.get('limite', default=5, type=int)
        if limite <= 0 or limite > 100:
            limite = 5
    except ValueError:
        limite = 5

    # Llama al helper que ya tenías (asumiendo que está definido correctamente)
    ultimas_lecturas = obtener_ultimas_lecturas_con_info_aire_helper(limite)

    if ultimas_lecturas is None:
        return jsonify({"msg": "Error al obtener las últimas lecturas."}), 500

    return jsonify(ultimas_lecturas), 200

##Proveedores

@api.route('/proveedores', methods=['POST'])
@jwt_required()
def crear_proveedor_route():
    """Crea un nuevo proveedor."""
    current_user_id = get_jwt_identity()
    logged_in_user = db.session.get(TrackerUsuario, current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({"msg": "El campo 'nombre' es requerido."}), 400

    try:
        nuevo_proveedor = Proveedor(
            nombre=data['nombre'],
            email_proveedor=data.get('email_proveedor')
        )
        db.session.add(nuevo_proveedor)
        db.session.commit()
        return jsonify(nuevo_proveedor.serialize()), 201
    except ValueError as ve: # Captura validaciones del modelo
        db.session.rollback()
        return jsonify({"msg": str(ve)}), 400
    except IntegrityError: # Captura violación de unicidad (nombre)
        db.session.rollback()
        return jsonify({"msg": f"Ya existe un proveedor con el nombre '{data['nombre']}'."}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error DB creando proveedor: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de base de datos al crear proveedor."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado creando proveedor: {e}", file=sys.stderr)
        return jsonify({"msg": "Error inesperado en el servidor."}), 500

@api.route('/proveedores', methods=['GET'])
@jwt_required()
def obtener_proveedores_route():
    """Obtiene la lista de todos los proveedores."""
    try:
        proveedores = db.session.query(Proveedor).order_by(Proveedor.nombre).all()
        return jsonify([p.serialize() for p in proveedores]), 200
    except Exception as e:
        print(f"Error obteniendo proveedores: {e}", file=sys.stderr)
        return jsonify({"msg": "Error al obtener proveedores."}), 500

@api.route('/proveedores/<int:proveedor_id>', methods=['GET'])
@jwt_required()
def obtener_proveedor_por_id_route(proveedor_id):
    """Obtiene un proveedor específico por ID."""
    try:
        proveedor = db.session.get(Proveedor, proveedor_id)
        if not proveedor:
            return jsonify({"msg": "Proveedor no encontrado."}), 404
        return jsonify(proveedor.serialize()), 200
    except Exception as e:
        print(f"Error obteniendo proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error al obtener proveedor."}), 500

@api.route('/proveedores/<int:proveedor_id>', methods=['PUT'])
@jwt_required()
def actualizar_proveedor_route(proveedor_id):
    """Actualiza un proveedor existente."""
    current_user_id = get_jwt_identity()
    logged_in_user = db.session.get(TrackerUsuario, current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    proveedor = db.session.get(Proveedor, proveedor_id)
    if not proveedor:
        return jsonify({"msg": "Proveedor no encontrado."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos."}), 400

    updated = False
    try:
        if 'nombre' in data and data['nombre'] != proveedor.nombre:
            proveedor.nombre = data['nombre'] # La validación se dispara aquí
            updated = True
        # Permitir actualizar a None o vacío si se envía explícitamente
        if 'email_proveedor' in data and data['email_proveedor'] != proveedor.email_proveedor:
             proveedor.email_proveedor = data['email_proveedor'] if data['email_proveedor'] else None
             updated = True

        if updated:
            db.session.commit()
            return jsonify(proveedor.serialize()), 200
        else:
            return jsonify(proveedor.serialize()), 200 # O 304 Not Modified

    except ValueError as ve:
        db.session.rollback()
        return jsonify({"msg": str(ve)}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({"msg": f"Ya existe otro proveedor con el nombre '{data.get('nombre')}'."}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error DB actualizando proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de base de datos."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado actualizando proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error inesperado."}), 500

@api.route('/proveedores/<int:proveedor_id>', methods=['DELETE'])
@jwt_required()
def eliminar_proveedor_route(proveedor_id):
    """Elimina un proveedor y sus contactos asociados."""
    current_user_id = get_jwt_identity()
    logged_in_user = db.session.get(TrackerUsuario, current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin']: # Solo Admin puede borrar proveedores
        return jsonify({"msg": "Acceso no autorizado"}), 403

    proveedor = db.session.get(Proveedor, proveedor_id)
    if not proveedor:
        return jsonify({"msg": "Proveedor no encontrado."}), 404

    try:
        db.session.delete(proveedor) # Cascade debería eliminar contactos
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error DB eliminando proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de base de datos."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado eliminando proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error inesperado."}), 500

# --- Rutas para Contactos de Proveedor ---

@api.route('/proveedores/<int:proveedor_id>/contactos', methods=['POST'])
@jwt_required()
def crear_contacto_route(proveedor_id):
    """Crea un nuevo contacto para un proveedor específico."""
    current_user_id = get_jwt_identity()
    logged_in_user = db.session.get(TrackerUsuario, current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    proveedor = db.session.get(Proveedor, proveedor_id)
    if not proveedor:
        return jsonify({"msg": "Proveedor no encontrado."}), 404

    data = request.get_json()
    if not data or not data.get('nombre_contacto'):
        return jsonify({"msg": "El campo 'nombre_contacto' es requerido."}), 400

    try:
        nuevo_contacto = ContactoProveedor(
            proveedor_id=proveedor_id,
            nombre_contacto=data['nombre_contacto'],
            telefono_contacto=data.get('telefono_contacto'),
            email_contacto=data.get('email_contacto')
        )
        db.session.add(nuevo_contacto)
        db.session.commit()
        return jsonify(nuevo_contacto.serialize()), 201
    except ValueError as ve:
        db.session.rollback()
        return jsonify({"msg": str(ve)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error DB creando contacto para proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de base de datos."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado creando contacto: {e}", file=sys.stderr)
        return jsonify({"msg": "Error inesperado."}), 500

@api.route('/proveedores/<int:proveedor_id>/contactos', methods=['GET'])
@jwt_required()
def obtener_contactos_por_proveedor_route(proveedor_id):
    """Obtiene los contactos de un proveedor específico."""
    proveedor = db.session.get(Proveedor, proveedor_id)
    if not proveedor:
        return jsonify({"msg": "Proveedor no encontrado."}), 404

    try:
        # Accede a los contactos a través de la relación
        contactos = proveedor.contactos
        return jsonify([c.serialize() for c in contactos]), 200
    except Exception as e:
        print(f"Error obteniendo contactos para proveedor {proveedor_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error al obtener contactos."}), 500

@api.route('/contactos_proveedor/<int:contacto_id>', methods=['GET'])
@jwt_required()
def obtener_contacto_por_id_route(contacto_id):
    """Obtiene un contacto específico por su ID."""
    try:
        contacto = db.session.get(ContactoProveedor, contacto_id)
        if not contacto:
            return jsonify({"msg": "Contacto no encontrado."}), 404
        return jsonify(contacto.serialize()), 200
    except Exception as e:
        print(f"Error obteniendo contacto {contacto_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error al obtener contacto."}), 500

@api.route('/contactos_proveedor/<int:contacto_id>', methods=['PUT'])
@jwt_required()
def actualizar_contacto_route(contacto_id):
    """Actualiza un contacto existente."""
    current_user_id = get_jwt_identity()
    logged_in_user = db.session.get(TrackerUsuario, current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    contacto = db.session.get(ContactoProveedor, contacto_id)
    if not contacto:
        return jsonify({"msg": "Contacto no encontrado."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se recibieron datos."}), 400

    updated = False
    try:
        if 'nombre_contacto' in data and data['nombre_contacto'] != contacto.nombre_contacto:
            contacto.nombre_contacto = data['nombre_contacto'] # Validación se dispara
            updated = True
        if 'telefono_contacto' in data and data['telefono_contacto'] != contacto.telefono_contacto:
            contacto.telefono_contacto = data['telefono_contacto'] if data['telefono_contacto'] else None
            updated = True
        if 'email_contacto' in data and data['email_contacto'] != contacto.email_contacto:
            contacto.email_contacto = data['email_contacto'] if data['email_contacto'] else None
            updated = True

        if updated:
            db.session.commit()
            return jsonify(contacto.serialize()), 200
        else:
            return jsonify(contacto.serialize()), 200 # O 304

    except ValueError as ve:
        db.session.rollback()
        return jsonify({"msg": str(ve)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error DB actualizando contacto {contacto_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de base de datos."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado actualizando contacto {contacto_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error inesperado."}), 500

@api.route('/contactos_proveedor/<int:contacto_id>', methods=['DELETE'])
@jwt_required()
def eliminar_contacto_route(contacto_id):
    """Elimina un contacto específico."""
    current_user_id = get_jwt_identity()
    logged_in_user = db.session.get(TrackerUsuario, current_user_id)
    if not logged_in_user or logged_in_user.rol not in ['admin', 'supervisor']:
        return jsonify({"msg": "Acceso no autorizado"}), 403

    contacto = db.session.get(ContactoProveedor, contacto_id)
    if not contacto:
        return jsonify({"msg": "Contacto no encontrado."}), 404

    try:
        db.session.delete(contacto)
        db.session.commit()
        return '', 204
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Error DB eliminando contacto {contacto_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error de base de datos."}), 500
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado eliminando contacto {contacto_id}: {e}", file=sys.stderr)
        return jsonify({"msg": "Error inesperado."}), 500
