import os
import click
from flask.cli import with_appcontext
from .models import db, UserForm, Rack, Equipment, Description # Importa los modelos
from dotenv import load_dotenv
from datetime import datetime, timedelta # Importa datetime y timedelta
from sqlalchemy.orm import joinedload # Para cargar relaciones eficientemente
load_dotenv() # Carga las variables de entorno

# Puedes agrupar comandos relacionados con la base de datos
@click.group()
def db_cli():
    """Comandos relacionados con la base de datos."""
    pass

@db_cli.command("create-default-user")
@with_appcontext # Asegura que estamos en el contexto de la aplicación
def create_default_user_command():
    """Crea el usuario Tracker predefinido si no existe."""
    default_username = os.getenv('DEFAULT_TRACKER_USERNAME', 'admin_tracker')
    default_email = os.getenv('DEFAULT_TRACKER_EMAIL', 'admin@tracker.com')

    # Verifica si ya existe
    existing_user = TrackerUsuario.query.filter(
        (TrackerUsuario.username == default_username) | (TrackerUsuario.email == default_email)
    ).first()

    if not existing_user:
        print(f"Creando usuario predefinido para Tracker: {default_username}")
        default_password = os.getenv('DEFAULT_TRACKER_PASSWORD')
        if not default_password:
            print("Error: La variable de entorno DEFAULT_TRACKER_PASSWORD no está definida.")
            return # Salir si no hay contraseña

        new_user = TrackerUsuario(
            nombre="Admin",
            apellido="Tracker",
            email=default_email,
            username=default_username,
            rol="admin"
        )
        new_user.set_password(default_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            print(f"Usuario predefinido '{default_username}' creado exitosamente.")
        except Exception as e:
            db.session.rollback()
            print(f"Error al crear usuario predefinido: {e}")
    else:
        print(f"El usuario predefinido '{default_username}' ya existe.")
@db_cli.command("cleanup-old-form-data")
@click.option('--hours', default=12, type=int, help='Número de horas para considerar datos como antiguos.')
@with_appcontext
def cleanup_old_form_data_command(hours):
    """Elimina datos de UserForm, Rack, Equipment y Description más antiguos que X horas."""
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    print(f"Buscando datos de formularios anteriores a: {cutoff_time.strftime('%Y-%m-%d %H:%M:%S')} UTC")

    try:
        # 1. Encontrar UserForms antiguos
        # Usamos joinedload para cargar relaciones y evitar N+1 queries si accedemos a ellas luego
        # Aunque aquí borraremos directamente, es buena práctica si necesitaras verificar algo.
        old_user_forms = UserForm.query.filter(UserForm.created_at < cutoff_time).all()

        if not old_user_forms:
            print("No se encontraron datos de formularios antiguos para eliminar.")
            return

        print(f"Se encontraron {len(old_user_forms)} formularios antiguos para procesar.")
        deleted_count = {'users': 0, 'racks': 0, 'equipments': 0, 'descriptions': 0}

        for user_form in old_user_forms:
            user_id = user_form.id
            print(f"Procesando UserForm ID: {user_id} (Creado: {user_form.created_at})")

            # 2. Eliminar Equipments asociados
            equipments_to_delete = Equipment.query.filter_by(user_id=user_id).all()
            if equipments_to_delete:
                print(f"  Eliminando {len(equipments_to_delete)} Equipment(s)...")
                for eq in equipments_to_delete:
                    # Podríamos necesitar eliminar Description asociada si no hay cascade
                    # description_id = eq.description_id # Guardar ID si es necesario
                    db.session.delete(eq)
                deleted_count['equipments'] += len(equipments_to_delete)

            # 3. Eliminar Racks asociados
            racks_to_delete = Rack.query.filter_by(user_id=user_id).all()
            if racks_to_delete:
                print(f"  Eliminando {len(racks_to_delete)} Rack(s)...")
                for rack in racks_to_delete:
                    # Podríamos necesitar eliminar Description asociada si no hay cascade
                    # description_id = rack.description_id # Guardar ID si es necesario
                    db.session.delete(rack)
                deleted_count['racks'] += len(racks_to_delete)

            
            # 5. Eliminar el UserForm
            print(f"  Eliminando UserForm ID: {user_id}...")
            db.session.delete(user_form)
            deleted_count['users'] += 1

        # 6. Confirmar los cambios en la base de datos
        db.session.commit()
        print("\nLimpieza completada.")
        print(f"  Usuarios eliminados: {deleted_count['users']}")
        print(f"  Equipos eliminados: {deleted_count['equipments']}")
        print(f"  Racks eliminados: {deleted_count['racks']}")
        # print(f"  Descripciones eliminadas: {deleted_count['descriptions']}") # Descomentar si se implementa el paso 4 explícito

    except Exception as e:
        db.session.rollback()
        print(f"\nError durante la limpieza: {e}")
        import traceback
        traceback.print_exc()

# Función para registrar los comandos en app.py
def setup_commands(app):
    """Registra los comandos CLI."""
    # Asegúrate de añadir tu nuevo grupo de comandos
    app.cli.add_command(db_cli)
    # Aquí puedes añadir otros comandos si los tienes
    # Ejemplo: app.cli.add_command(otro_comando)


