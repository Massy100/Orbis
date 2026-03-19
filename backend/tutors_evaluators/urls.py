from django.urls import path
from . import views

urlpatterns = [
    # el endpoint de prueba para verificar que el contexto de tutores y evaluadores está funcionando correctamente
    # eliminar este endpoint una vez que se hayan implementado las funcionalidades reales
    path('test/', views.test_tutores, name='test_tutores'),
]