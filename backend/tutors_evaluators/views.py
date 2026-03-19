from django.http import JsonResponse

# Este es un endpoint de prueba para verificar que el contexto de tutores y evaluadores está funcionando correctamente.
# Se puede eliminar este endpoint una vez que se hayan implementado las funcionalidades reales.
def test_tutores(request):
    return JsonResponse({"mensaje": "¡El contexto de tutores está conectado e independiente usando Django nativo!"})