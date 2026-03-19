from django.contrib import admin
from django.urls import path, include

# Urls principal del proyecto, que incluye las rutas de cada aplicación.
urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/communications/', include('communications.urls')),
    path('api/execution-results/', include('execution_results.urls')),
    path('api/request-assignment/', include('request_assignment.urls')),
    path('api/schedule-availability/', include('schedule_availability.urls')),
    path('api/security/', include('security.urls')),
    path('api/tutors-evaluators/', include('tutors_evaluators.urls')),
]