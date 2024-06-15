from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120),  nullable=False)
    coordination = db.Column(db.String(120), nullable=False)
    clientName = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    
    # Relación con Racks (un cliente puede tener muchos racks)
    racks = db.relationship('Rack', backref='user', lazy=True)
    
    # Relación con Equipos (un cliente puede tener muchos equipos)
    equipments = db.relationship('Equipment', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        created_at_formatted = self.created_at.strftime('%d/%m/%Y')
        return {
            "id": self.id,
            "email": self.email,
            "coordination": self.coordination,
            "username": self.username,
            "clientName": self.clientName,
            "created_at": created_at_formatted,
        }
class Description(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(120), nullable=False)
    model = db.Column(db.String(120), nullable=False)
    serial = db.Column(db.String(120), unique=False, nullable=False)
    partNumber = db.Column(db.String(120))
    five_years_prevition = db.Column(db.String(255))
    observations = db.Column(db.String(255))
    componentType = db.Column(db.String(100), nullable=False)
    requestType = db.Column(db.String(50))
    
    # Relaciones con Rack y Equipment (un equipo y un rack tienen una descripción)
    rack = db.relationship('Rack', uselist=False, back_populates='description', cascade='all, delete-orphan')
    equipment = db.relationship('Equipment', uselist=False, back_populates='description', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Description {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'brand': self.brand,
            'model': self.model,
            'serial': self.serial,
            'partNumber': self.partNumber,
            'five_years_prevition': self.five_years_prevition,
            'observations': self.observations,
            'componentType': self.componentType,
            'requestType': self.requestType,
           
        }
class Rack(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    has_cabinet = db.Column(db.Boolean())
    leased = db.Column(db.Boolean())
    total_cabinets = db.Column(db.String(10))
    open_closed = db.Column(db.Boolean())
    security = db.Column(db.Boolean())
    type_security = db.Column(db.String(50))
    has_extractors = db.Column(db.Boolean())
    extractors_ubication = db.Column(db.String(50))
    modular = db.Column(db.Boolean())
    lateral_doors = db.Column(db.Boolean())
    lateral_ubication = db.Column(db.String(50))
    rack_unit = db.Column(db.String(10))
    rack_position = db.Column(db.String(120))
    rack_ubication = db.Column(db.String(50))
    has_accessory = db.Column(db.Boolean())
    accessory_description = db.Column(db.String(50))
    rack_width = db.Column(db.String(10))
    rack_length = db.Column(db.String(10))
    rack_height = db.Column(db.String(10))
    internal_pdu = db.Column(db.String(10))
    input_connector = db.Column(db.String(100))
    fases = db.Column(db.String(10))
    output_connector = db.Column(db.String(20))
    neutro = db.Column(db.Boolean())

    description_id = db.Column(db.Integer, db.ForeignKey('description.id'), nullable=False)
    description = db.relationship('Description', uselist=False, back_populates='rack', cascade='all, delete')

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Relación con Equipos (un rack puede tener varios equipos)
    equipments = db.relationship('Equipment', backref='rack')

    def __repr__(self):
        return f'<Rack {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'has_cabinet': self.has_cabinet,
            'leased': self.leased,
            'total_cabinets': self.total_cabinets,
            'open_closed': self.open_closed,
            'security': self.security,
            'type_security': self.type_security,
            'has_extractors': self.has_extractors,
            'extractors_ubication': self.extractors_ubication,
            'modular': self.modular,
            'lateral_doors': self.lateral_doors,
            'lateral_ubication': self.lateral_ubication,
            'rack_unit': self.rack_unit,
            'rack_position': self.rack_position,
            'rack_ubication': self.rack_ubication,
            'has_accessory': self.has_accessory,
            'accessory_description': self.accessory_description,
            'rack_width': self.rack_width,
            'rack_length': self.rack_length,
            'rack_height': self.rack_height,
            'internal_pdu': self.internal_pdu,
            'input_connector': self.input_connector,
            'fases': self.fases,
            'output_connector': self.output_connector,
            'neutro': self.neutro,
            'description': self.description.serialize(),
            'user': self.user.serialize()
        }
class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    equipment_width = db.Column(db.String(120))
    equipment_height = db.Column(db.String(120))
    equipment_length = db.Column(db.String(120))
    packaging_width = db.Column(db.String(120))
    packaging_length = db.Column(db.String(120))
    packaging_height = db.Column(db.String(120))
    weight = db.Column(db.String(120))
    anchor_type = db.Column(db.String(120))
    service_area = db.Column(db.Boolean())
    service_frontal = db.Column(db.Boolean())
    service_back = db.Column(db.Boolean())
    service_lateral = db.Column(db.Boolean())  
    access_width = db.Column(db.String(120))
    access_inclination = db.Column(db.String(120))
    access_length = db.Column(db.String(120))
    rack_number = db.Column(db.String(10))
    equip_rack_ubication = db.Column(db.String(10))
    rack_unit_position = db.Column(db.String(120))
    total_rack_units = db.Column(db.String(10))
    ac_dc = db.Column(db.String(10))
    input_current = db.Column(db.String(50))
    power = db.Column(db.String(20))
    power_supply = db.Column(db.String(20))
    operation_temp = db.Column(db.String(20))
    thermal_disipation = db.Column(db.String(20))
    power_config = db.Column(db.String(20))
    
    description_id = db.Column(db.Integer, db.ForeignKey('description.id'), nullable=False)
    description = db.relationship('Description', uselist=False, back_populates='equipment', cascade = "all,delete")
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relación con Rack (un equipo pertenece a un rack)
    rack_id = db.Column(db.Integer, db.ForeignKey('rack.id'), nullable=True)
    #rack = db.relationship('Rack', back_populates='equipments')
    
    def __repr__(self):
        return f'<Equipment {self.id}>'
    
    def serialize(self):
             return {
            'id': self.id,
            'equipment_width':self.equipment_width,
            'equipment_height':self.equipment_height,
            'equipment_length':self.equipment_length,
            'packaging_width':self.packaging_width,
            'packaging_length':self.packaging_length,
            'packaging_height':self.packaging_height,
            'weight':self.weight,
            "anchor_type":self.anchor_type,
            'service_area':self.service_area,
            'service_frontal': self.service_frontal,
            'service_back': self.service_back,
            'service_lateral': self.service_lateral,
            'access_width':self.access_width,
            'access_inclination':self.access_inclination,
            'access_length':self.access_length,
            'rack_number':self.rack_number,
            'equip_rack_ubication':self.equip_rack_ubication,
            'rack_unit_position':self.rack_unit_position,
            'total_rack_units':self.total_rack_units,
            'ac_dc':self.ac_dc,
            'input_current':self.input_current,
            'power':self.power,
            'power_supply':self.power_supply,
            'operation_temp':self.operation_temp,
            'thermal_disipation':self.thermal_disipation,
            'power_config':self.power_config,
            'description':self.description.serialize(),
            'user':self.user.serialize()
             }