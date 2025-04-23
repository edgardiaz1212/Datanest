import os
import click
from flask.cli import with_appcontext
from .models import db, TrackerUsuario # Asegúrate que la importación sea correcta
from dotenv import load_dotenv

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

# Función para registrar los comandos en app.py
def setup_commands(app):
    """Registra los comandos CLI."""
    # Asegúrate de añadir tu nuevo grupo de comandos
    app.cli.add_command(db_cli)
    # Aquí puedes añadir otros comandos si los tienes
    # Ejemplo: app.cli.add_command(otro_comando)

