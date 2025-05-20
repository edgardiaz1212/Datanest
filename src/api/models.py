from flask_sqlalchemy import SQLAlchemy
import base64
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, LargeBinary, Boolean, Date, CheckConstraint
from sqlalchemy.orm import validates
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Enum as SQLAlchemyEnum # Para el campo estatus
import enum
from sqlalchemy.sql import func

db = SQLAlchemy()

class UserForm(db.Model):
    __tablename__ = 'user_form'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120),  nullable=False)
    coordination = db.Column(db.String(120), nullable=False)
    clientName = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    
    # Relación con Racks (un cliente puede tener muchos racks)
    racks = db.relationship('Rack', backref='user_form', lazy=True)
    
    # Relación con Equipos (un cliente puede tener muchos equipos)
    equipments = db.relationship('Equipment', backref='user_form', lazy=True)
    
    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "coordination": self.coordination,
            "username": self.username,
            "clientName": self.clientName,
            'created_at': self.created_at.isoformat() if self.created_at else None,

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

    @property
    def user_id(self):
        if self.rack:
            return self.rack.user_id
        elif self.equipment:
            return self.equipment.user_id
        return None

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
            'user_id': self.user_id 
           
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

    user_id = db.Column(db.Integer, db.ForeignKey('user_form.id'), nullable=False)

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
            'description': self.description.serialize() if self.description else None, 
            # Corregido: usar user_form
            'user': self.user_form.serialize() if self.user_form else None
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
    
    user_id = db.Column(db.Integer, db.ForeignKey('user_form.id'), nullable=False)
    
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
            'description':self.description.serialize() if self.description else None, # Añadir chequeo por si acaso
            # Corregido: usar user_form
            'user':self.user_form.serialize() if self.user_form else None
             }
# --- Nuevos Modelos (Temperature Tracker) ---
# --- Enums para DiagnosticoComponente ---
class ParteACEnum(enum.Enum):
    EVAPORADORA = "evaporadora"
    CONDENSADORA = "condensadora"
    GENERAL = "general" # Para diagnósticos que afectan al sistema en general

class TipoAireRelevanteEnum(enum.Enum):
    CONFORT = "confort"
    PRECISION = "precision"
    AMBOS = "ambos"
# --- Fin Enums ---

# --- Enum for Operative State ---
class OperativaStateEnum(enum.Enum):
    OPERATIVA = "operativa"
    PARCIALMENTE_OPERATIVA = "parcialmente_operativa"
    NO_OPERATIVA = "no_operativa"

class DiagnosticoComponente(db.Model):
    __tablename__ = 'diagnostico_componente'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False, unique=True)
    # A qué parte principal del AC se refiere este diagnóstico (Evaporadora, Condensadora, General)
    parte_ac = db.Column(SQLAlchemyEnum(ParteACEnum), nullable=False)
    # Para qué tipo de aire es más relevante este diagnóstico (ayuda a filtrar en el frontend)
    tipo_aire_sugerido = db.Column(SQLAlchemyEnum(TipoAireRelevanteEnum), nullable=False, default=TipoAireRelevanteEnum.AMBOS)
    # Descripción o ejemplos, como los que proporcionaste con porcentajes
    descripcion_ayuda = db.Column(db.Text, nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False) # Para habilitar/deshabilitar opciones

    def __repr__(self):
        return f"<DiagnosticoComponente(id={self.id}, nombre='{self.nombre}')>"

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'parte_ac': self.parte_ac.value if self.parte_ac else None,
            'tipo_aire_sugerido': self.tipo_aire_sugerido.value if self.tipo_aire_sugerido else None,
            'descripcion_ayuda': self.descripcion_ayuda,
            'activo': self.activo
        }

class AireAcondicionado(db.Model):
    __tablename__ = 'aires_acondicionados'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    ubicacion = db.Column(db.String(200), comment="Ubicación general del equipo completo")
    fecha_instalacion = db.Column(db.Date, nullable=True)
    tipo = db.Column(db.String(50), nullable=True, comment="Tipo de aire (confort, precision, etc.)") # Mantener como string o cambiar a Enum
    toneladas = db.Column(db.Float, nullable=True, comment="Capacidad en toneladas de refrigeración")

    # --- Detalles Evaporadora ---
    evaporadora_operativa = db.Column(SQLAlchemyEnum(OperativaStateEnum), nullable=False, default=OperativaStateEnum.OPERATIVA, comment="Estado operativo actual de la evaporadora")
    evaporadora_marca = db.Column(db.String(100), nullable=True)
    evaporadora_modelo = db.Column(db.String(100), nullable=True)
    evaporadora_serial = db.Column(db.String(100), nullable=True)
    evaporadora_codigo_inventario = db.Column(db.String(100), nullable=True,)
    evaporadora_ubicacion_instalacion = db.Column(db.String(200), nullable=True, comment="Ubicación específica de la evaporadora")
    

    # --- Detalles Condensadora ---
    condensadora_operativa = db.Column(SQLAlchemyEnum(OperativaStateEnum), nullable=False, default=OperativaStateEnum.OPERATIVA, comment="Estado operativo de la condensadora")
    condensadora_marca = db.Column(db.String(100), nullable=True)
    condensadora_modelo = db.Column(db.String(100), nullable=True)
    condensadora_serial = db.Column(db.String(100), nullable=True)
    condensadora_codigo_inventario = db.Column(db.String(100), nullable=True)
    condensadora_ubicacion_instalacion = db.Column(db.String(200), nullable=True, comment="Ubicación específica de la condensadora")
    

    # Relaciones
    registros_diagnostico = db.relationship("RegistroDiagnosticoAire", back_populates="aire", cascade="all, delete-orphan")
    lecturas = db.relationship("Lectura", back_populates="aire", cascade="all, delete-orphan")
    mantenimientos = db.relationship("Mantenimiento", back_populates="aire", cascade="all, delete-orphan")
    umbrales = db.relationship("UmbralConfiguracion", back_populates="aire", cascade="all, delete-orphan") 

    def __repr__(self):
        return f"<AireAcondicionado(id={self.id}, nombre='{self.nombre}')>"

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ubicacion': self.ubicacion,
            'fecha_instalacion': self.fecha_instalacion.isoformat() if self.fecha_instalacion else None,
            'tipo': self.tipo,
            'toneladas': self.toneladas,

            'evaporadora_operativa': self.evaporadora_operativa.value if self.evaporadora_operativa else None,
            'evaporadora_marca': self.evaporadora_marca,
            'evaporadora_modelo': self.evaporadora_modelo,
            'evaporadora_serial': self.evaporadora_serial,
            'evaporadora_codigo_inventario': self.evaporadora_codigo_inventario,
            'evaporadora_ubicacion_instalacion': self.evaporadora_ubicacion_instalacion,

            'condensadora_operativa': self.condensadora_operativa.value if self.condensadora_operativa else None,
            'condensadora_marca': self.condensadora_marca,
            'condensadora_modelo': self.condensadora_modelo,
            'condensadora_serial': self.condensadora_serial,
            'condensadora_codigo_inventario': self.condensadora_codigo_inventario,
            'condensadora_ubicacion_instalacion': self.condensadora_ubicacion_instalacion,

        }
        
class RegistroDiagnosticoAire(db.Model):
    __tablename__ = 'registros_diagnostico_aire'

    id = db.Column(db.Integer, primary_key=True)
    aire_id = db.Column(db.Integer, db.ForeignKey('aires_acondicionados.id'), nullable=False)
    # A qué parte del AC se refiere este registro específico
    parte_ac = db.Column(SQLAlchemyEnum(ParteACEnum), nullable=False) # 'evaporadora', 'condensadora', 'general'
    diagnostico_id = db.Column(db.Integer, db.ForeignKey('diagnostico_componente.id'), nullable=False) # El tipo de diagnóstico predefinido
    fecha_hora = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now()) # Fecha y hora del registro
    notas = db.Column(db.Text, nullable=True) # Notas específicas para este registro
    registrado_por_usuario_id = db.Column(db.Integer, db.ForeignKey('tracker_usuarios.id'), nullable=True) # Quién registró (opcional)
    # --- Nuevos campos para marcar como solucionado ---
    solucionado = db.Column(db.Boolean, default=False, nullable=False)
    fecha_solucion = db.Column(db.DateTime(timezone=True), nullable=True)

    # Relaciones
    aire = db.relationship("AireAcondicionado", back_populates="registros_diagnostico")
    diagnostico = db.relationship("DiagnosticoComponente") # Relación con el diagnóstico predefinido
    registrado_por = db.relationship("TrackerUsuario") # Relación con el usuario (si aplica)

    def __repr__(self):
        return f"<RegistroDiagnosticoAire(id={self.id}, aire_id={self.aire_id}, parte='{self.parte_ac.value}', diag_id={self.diagnostico_id}, fecha='{self.fecha_hora}')>"

    def serialize(self):
        return {
            'id': self.id,
            'aire_id': self.aire_id,
            'parte_ac': self.parte_ac.value if self.parte_ac else None,
            'diagnostico_id': self.diagnostico_id,
            'fecha_hora': self.fecha_hora.isoformat() if self.fecha_hora else None,
            'notas': self.notas,
            'registrado_por_usuario_id': self.registrado_por_usuario_id,
            # Incluir nombre del diagnóstico y usuario para conveniencia
            'diagnostico_nombre': self.diagnostico.nombre if self.diagnostico else None,
            'registrado_por_username': self.registrado_por.username if self.registrado_por else None,
            'solucionado': self.solucionado,
            'fecha_solucion': self.fecha_solucion.isoformat() if self.fecha_solucion else None,
        }
        
class Lectura(db.Model):
    __tablename__ = 'lecturas'

    id = db.Column(db.Integer, primary_key=True)
    aire_id = db.Column(db.Integer, db.ForeignKey('aires_acondicionados.id'), nullable=True) # Corregido ForeignKey
    otro_equipo_id = db.Column(db.Integer, db.ForeignKey('otros_equipos.id'), nullable=True) # Corregido ForeignKey
    fecha = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    temperatura = db.Column(db.Float, nullable=False)
    humedad = db.Column(db.Float, nullable=True)

    # Relación
    aire = db.relationship("AireAcondicionado", back_populates="lecturas")
    otro_equipo = db.relationship('OtroEquipo', back_populates='lecturas') 
    
    __table_args__ = (
        db.CheckConstraint('(aire_id IS NOT NULL AND otro_equipo_id IS NULL) OR (aire_id IS NULL AND otro_equipo_id IS NOT NULL)', name='chk_lectura_device_exclusive'),
    )

    def __repr__(self):
        return f"<Lectura(id={self.id}, aire_id={self.aire_id}, fecha='{self.fecha}')>"

    def serialize(self):
        data = {
            'id': self.id,
            'aire_id': self.aire_id,
            'otro_equipo_id': self.otro_equipo_id,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'temperatura': self.temperatura,
            'humedad': self.humedad,
            "nombre_dispositivo": None,
            "ubicacion_dispositivo": None,
            "tipo_dispositivo": None
        }
        if self.aire_id and self.aire:
            data["nombre_dispositivo"] = self.aire.nombre
            data["ubicacion_dispositivo"] = self.aire.ubicacion
            data["tipo_dispositivo"] = self.aire.tipo
        elif self.otro_equipo_id and self.otro_equipo:
            data["nombre_dispositivo"] = self.otro_equipo.nombre
            data["ubicacion_dispositivo"] = self.otro_equipo.ubicacion
            data["tipo_dispositivo"] = self.otro_equipo.tipo
        return data

class Mantenimiento(db.Model):
    __tablename__ = 'mantenimientos'

    id = db.Column(db.Integer, primary_key=True)
    aire_id = db.Column(db.Integer, db.ForeignKey('aires_acondicionados.id'), nullable=True)
    otro_equipo_id = db.Column(db.Integer, db.ForeignKey('otros_equipos.id'), nullable=True)
    fecha = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    tipo_mantenimiento = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    tecnico = db.Column(db.String(100))
    imagen_nombre = db.Column(db.String(255))
    imagen_tipo = db.Column(db.String(50))
    imagen_datos = db.Column(db.LargeBinary)
    alertas_resueltas_info = db.Column(db.Text, nullable=True, comment="Información sobre las alertas que este mantenimiento resolvió") # <--- NUEVO CAMPO

    # Relaciones
    aire = db.relationship("AireAcondicionado", back_populates="mantenimientos")
    otro_equipo = db.relationship("OtroEquipo", back_populates="mantenimientos")

    # Restricción para asegurar que solo uno de aire_id u otro_equipo_id esté lleno
    __table_args__ = (
        db.CheckConstraint('(aire_id IS NOT NULL AND otro_equipo_id IS NULL) OR (aire_id IS NULL AND otro_equipo_id IS NOT NULL)',
                        name='chk_mantenimiento_target'),
    )

    def __repr__(self):
        target_id = f"aire_id={self.aire_id}" if self.aire_id else f"otro_equipo_id={self.otro_equipo_id}"
        return f"<Mantenimiento(id={self.id}, {target_id}, fecha='{self.fecha}')>"

    # Método para convertir la imagen a base64
    def get_imagen_base64(self):
        if self.imagen_datos and self.imagen_tipo:
            b64_data = base64.b64encode(self.imagen_datos).decode('utf-8')
            return f"data:{self.imagen_tipo};base64,{b64_data}"
        return None

    def serialize(self):
        tiene_imagen = bool(self.imagen_datos)

        # Determinar qué equipo está asociado y obtener sus detalles
        equipo_nombre = None
        equipo_ubicacion = None
        equipo_tipo = None # Opcional: incluir el tipo de equipo

        if self.aire:
            equipo_nombre = self.aire.nombre
            equipo_ubicacion = self.aire.ubicacion
            equipo_tipo = self.aire.tipo # O self.aire.tipo si quieres el tipo de aire
        elif self.otro_equipo:
            equipo_nombre = self.otro_equipo.nombre
            equipo_ubicacion = self.otro_equipo.ubicacion
            equipo_tipo = self.otro_equipo.tipo # O self.otro_equipo.tipo si quieres el tipo de otro equipo

        return {
            'id': self.id,
            'aire_id': self.aire_id,
            'otro_equipo_id': self.otro_equipo_id,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'tipo_mantenimiento': self.tipo_mantenimiento,
            'descripcion': self.descripcion,
            'tecnico': self.tecnico,
            'imagen_nombre': self.imagen_nombre,
            'imagen_tipo': self.imagen_tipo,
            'tiene_imagen': tiene_imagen,
            # --- Nuevos campos incluidos ---
            'equipo_nombre': equipo_nombre,
            'equipo_ubicacion': equipo_ubicacion,
            'equipo_tipo': equipo_tipo,
            'alertas_resueltas_info': self.alertas_resueltas_info, # <--- AÑADIR AL SERIALIZE

        }
class UmbralConfiguracion(db.Model):
    __tablename__ = 'umbrales_configuracion'

    id = db.Column(db.Integer, primary_key=True)
    aire_id = db.Column(db.Integer, db.ForeignKey('aires_acondicionados.id'), nullable=True) # Nulo si es global
    nombre = db.Column(db.String(100), nullable=False)
    es_global = db.Column(db.Boolean, default=False, nullable=False) # No permitir nulo

    # Umbrales
    temp_min = db.Column(db.Float, nullable=False)
    temp_max = db.Column(db.Float, nullable=False)
    hum_min = db.Column(db.Float, nullable=False)
    hum_max = db.Column(db.Float, nullable=False)

    # Notificaciones
    notificar_activo = db.Column(db.Boolean, default=True, nullable=False) # No permitir nulo

    # Timestamps
    fecha_creacion = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    ultima_modificacion = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relación (opcional, solo si no es global)
    aire = db.relationship("AireAcondicionado", back_populates="umbrales")

    def __repr__(self):
        target = "global" if self.es_global else f"aire_id={self.aire_id}"
        return f"<UmbralConfiguracion(id={self.id}, nombre='{self.nombre}', {target})>"

    def serialize(self):
        return {
            'id': self.id,
            'aire_id': self.aire_id,
            'nombre': self.nombre,
            'es_global': self.es_global,
            'temp_min': self.temp_min,
            'temp_max': self.temp_max,
            'hum_min': self.hum_min,
            'hum_max': self.hum_max,
            'notificar_activo': self.notificar_activo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'ultima_modificacion': self.ultima_modificacion.isoformat() if self.ultima_modificacion else None,
        }

class TrackerUsuario(db.Model):
    __tablename__ = 'tracker_usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default='operador')
    activo = db.Column(db.Boolean, default=True, nullable=False) # No permitir nulo
    fecha_registro = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    ultima_conexion = db.Column(db.DateTime(timezone=True), nullable=True)
    documentos_cargados = db.relationship('DocumentoExterno', back_populates='usuario_carga', lazy=True)

    def __repr__(self):
        return f'<TrackerUsuario {self.id}: {self.username}>'

    def set_password(self, password_plaintext):
        """Genera y guarda el hash de la contraseña."""
        # Usamos un método más seguro que el SHA-256 simple
        # Werkzeug genera hashes con salt automáticamente
        self.password = generate_password_hash(password_plaintext)

    def check_password(self, password_plaintext):
        """Verifica la contraseña contra el hash almacenado."""
        # Werkzeug compara el texto plano con el hash almacenado
        return check_password_hash(self.password, password_plaintext)

    def serialize(self):
        # ¡NUNCA serializar la contraseña!
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email,
            'username': self.username,
            'rol': self.rol,
            'activo': self.activo,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
            'ultima_conexion': self.ultima_conexion.isoformat() if self.ultima_conexion else None,
        }

class OtroEquipo(db.Model):
    __tablename__ = 'otros_equipos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, comment="Nombre descriptivo del equipo")
    tipo = db.Column(db.String(50), nullable=False, comment="Tipo de equipo (Motogenerador, UPS, PDU, etc.)")
    ubicacion = db.Column(db.String(200), nullable=True)
    marca = db.Column(db.String(100), nullable=True)
    modelo = db.Column(db.String(100), nullable=True)
    serial = db.Column(db.String(100), nullable=True, unique=True)
    codigo_inventario = db.Column(db.String(100), nullable=True, unique=True)
    fecha_instalacion = db.Column(db.Date, nullable=True)
    estado_operativo = db.Column(db.Boolean, nullable=False, default=True)
    notas = db.Column(db.Text, nullable=True, comment="Información adicional relevante")
    fecha_creacion = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    ultima_modificacion = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relación
    mantenimientos = db.relationship("Mantenimiento", back_populates="otro_equipo", cascade="all, delete-orphan")
    lecturas = db.relationship("Lectura", back_populates="otro_equipo", lazy=True, cascade="all, delete-orphan")
    def __repr__(self):
        return f"<OtroEquipo(id={self.id}, nombre='{self.nombre}', tipo='{self.tipo}')>"

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'tipo': self.tipo,
            'ubicacion': self.ubicacion,
            'marca': self.marca,
            'modelo': self.modelo,
            'serial': self.serial,
            'codigo_inventario': self.codigo_inventario,
            'fecha_instalacion': self.fecha_instalacion.isoformat() if self.fecha_instalacion else None,
            'estado_operativo': self.estado_operativo,
            'notas': self.notas,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'ultima_modificacion': self.ultima_modificacion.isoformat() if self.ultima_modificacion else None,
            # No serializar mantenimientos por defecto
            # 'mantenimientos': [m.serialize() for m in self.mantenimientos]
        }

class Proveedor(db.Model):
    __tablename__ = 'proveedores'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False, unique=True) # Nombre único para proveedor
    email_proveedor = db.Column(db.String(120), nullable=True) # Email general del proveedor
    fecha_registro = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    # Relación uno-a-muchos con ContactoProveedor
    contactos = db.relationship('ContactoProveedor', back_populates='proveedor', lazy=True, cascade='all, delete-orphan')
    actividades = db.relationship('ActividadProveedor', back_populates='proveedor', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Proveedor(id={self.id}, nombre='{self.nombre}')>"

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'email_proveedor': self.email_proveedor,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
            # Opcional: Contar contactos directamente aquí si es útil
            # 'num_contactos': len(self.contactos)
        }

    # Validación simple para asegurar que el nombre no esté vacío
    @validates('nombre')
    def validate_nombre(self, key, nombre):
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del proveedor no puede estar vacío.")
        return nombre.strip()

class ContactoProveedor(db.Model):
    __tablename__ = 'contactos_proveedor'

    id = db.Column(db.Integer, primary_key=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable=False)
    cargo =db.Column(db.String(100), nullable=True)
    telefono_contacto = db.Column(db.String(50), nullable=True)
    email_contacto = db.Column(db.String(120), nullable=True)
    fecha_registro = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())

    # Relación muchos-a-uno con Proveedor
    proveedor = db.relationship('Proveedor', back_populates='contactos')

    def __repr__(self):
        return f"<ContactoProveedor(id={self.id}, nombre='{self.nombre_contacto}', proveedor_id={self.proveedor_id})>"

    def serialize(self):
        return {
            'id': self.id,
            'proveedor_id': self.proveedor_id,
            'cargo': self.cargo, # <-- Añadido cargo
            'nombre_contacto': self.nombre_contacto,
            'telefono_contacto': self.telefono_contacto,
            'email_contacto': self.email_contacto,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None,
            # Opcional: Incluir nombre del proveedor para conveniencia
            'nombre_proveedor': self.proveedor.nombre if self.proveedor else None,

        }

    # Validación simple
    @validates('nombre_contacto')
    def validate_nombre_contacto(self, key, nombre_contacto):
        if not nombre_contacto or not nombre_contacto.strip():
            raise ValueError("El nombre del contacto no puede estar vacío.")
        return nombre_contacto.strip()

# Enum para los estados de la actividad
class EstatusActividad(enum.Enum):
    PENDIENTE = 'Pendiente'
    EN_PROGRESO = 'En Progreso'
    COMPLETADO = 'Completado'
    CANCELADO = 'Cancelado'

class ActividadProveedor(db.Model):
    __tablename__ = 'actividades_proveedor'

    id = db.Column(db.Integer, primary_key=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    fecha_ocurrencia = db.Column(db.DateTime(timezone=True), nullable=False)
    fecha_reporte = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    numero_reporte = db.Column(db.String(100), nullable=True) # Opcional
    estatus = db.Column(SQLAlchemyEnum(EstatusActividad), nullable=False, default=EstatusActividad.PENDIENTE)
    fecha_creacion = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    ultima_modificacion = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relación muchos-a-uno con Proveedor
    proveedor = db.relationship('Proveedor') # No necesitamos back_populates si no accedemos desde Proveedor

    def __repr__(self):
        return f"<ActividadProveedor(id={self.id}, proveedor_id={self.proveedor_id}, estatus='{self.estatus.value}')>"

    def serialize(self):
        return {
            'id': self.id,
            'proveedor_id': self.proveedor_id,
            'nombre_proveedor': self.proveedor.nombre if self.proveedor else None, # Incluir nombre para conveniencia
            'descripcion': self.descripcion,
            'fecha_ocurrencia': self.fecha_ocurrencia.isoformat() if self.fecha_ocurrencia else None,
            'fecha_reporte': self.fecha_reporte.isoformat() if self.fecha_reporte else None,
            'numero_reporte': self.numero_reporte,
            'estatus': self.estatus.value if self.estatus else None, # Devuelve el valor del Enum
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'ultima_modificacion': self.ultima_modificacion.isoformat() if self.ultima_modificacion else None,
        }

    # Validación simple
    @validates('descripcion')
    def validate_descripcion(self, key, descripcion):
        if not descripcion or not descripcion.strip():
            raise ValueError("La descripción de la actividad no puede estar vacía.")
        return descripcion.strip()

    @validates('fecha_ocurrencia', 'fecha_reporte')
    def validate_fechas(self, key, fecha):
        if not fecha:
            raise ValueError(f"La {key.replace('_', ' ')} no puede estar vacía.")
        # Podrías añadir más validaciones de fecha aquí si es necesario
        return fecha

    @validates('estatus')
    def validate_estatus(self, key, estatus):
        if isinstance(estatus, str):
            try:
                return EstatusActividad(estatus) # Convierte string a Enum si es necesario
            except ValueError:
                raise ValueError(f"Valor de estatus inválido: {estatus}")
        if not isinstance(estatus, EstatusActividad):
             raise ValueError("Estatus debe ser un valor válido (Pendiente, En Progreso, Completado, Cancelado)")
        return estatus

class DocumentoExterno(db.Model):
    __tablename__ = 'documento_externo'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    nombre_archivo_original = db.Column(db.String(255), nullable=False)
    datos_archivo = db.Column(LargeBinary, nullable=False) # <--- Columna para guardar el contenido
    # -------------------------------------------------------
    tipo_mime = db.Column(db.String(100), nullable=False)
    fecha_carga = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relación con el usuario que subió el archivo
    usuario_carga_id = db.Column(db.Integer, db.ForeignKey('tracker_usuarios.id'), nullable=True)
    # --- Actualizar back_populates ---
    usuario_carga = db.relationship('TrackerUsuario', back_populates='documentos_cargados')
    # ---------------------------------

    def __repr__(self):
        return f'<DocumentoExterno {self.id}: {self.nombre}>'

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "nombre_archivo_original": self.nombre_archivo_original,
            "tipo_mime": self.tipo_mime,
            "fecha_carga": self.fecha_carga.isoformat() if self.fecha_carga else None,
            "usuario_carga": self.usuario_carga.username if self.usuario_carga else "Desconocido"
            # La URL de descarga se sigue construyendo en la ruta GET
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    # Quién realizó la acción
    user_id = db.Column(db.Integer, db.ForeignKey('tracker_usuarios.id'), nullable=False)
    username = db.Column(db.String(50), nullable=False) # Para mostrar directamente y evitar joins constantes en la vista de logs

    # Qué acción se realizó
    action = db.Column(db.String(255), nullable=False) # Ej: "crear_lectura", "actualizar_aire", "eliminar_umbral"

    # Sobre qué entidad (opcional, pero útil)
    entity_type = db.Column(db.String(100), nullable=True) # Ej: "Lectura", "AireAcondicionado", "UmbralConfiguracion"
    entity_id = db.Column(db.Integer, nullable=True) # ID del objeto afectado (si aplica)
    entity_description = db.Column(db.Text, nullable=True) # Un nombre o breve descripción del objeto para referencia rápida

    # Detalles adicionales (opcional, podría ser un JSON string)
    details = db.Column(db.Text, nullable=True)

    # Relación para poder acceder a más datos del usuario si es necesario (opcional para la serialización básica)
    user = db.relationship('TrackerUsuario', backref=db.backref('audit_logs', lazy=True))

    def __repr__(self):
        return f'<AuditLog {self.id} - {self.username} {self.action} on {self.entity_type or "system"} at {self.timestamp}>'

    def serialize(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "user_id": self.user_id,
            "username": self.username,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "entity_description": self.entity_description,
            "details": self.details,
        }