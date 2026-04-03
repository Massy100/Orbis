import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'orbis_core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superusuario "{username}" creado exitosamente.')
else:
    print(f'Superusuario "{username}" ya existe, omitiendo creación.')