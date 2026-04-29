from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 
from .views import SystemUserSerializer

router = DefaultRouter()

# Routes for simple tables 
router.register(r'careers',      views.CareerViewSet,      basename='career')
router.register(r'faculties',    views.FacultyViewSet,     basename='faculty')
router.register(r'roles',        views.RolViewSet,         basename='rol')
router.register(r'specialities', views.SpecialityViewSet,  basename='speciality')
router.register(r'types',        views.TypeViewSet,        basename='type')
router.register(r'periods',      views.PeriodViewSet,      basename='period')

# Routes for Course
router.register(r'courses',         views.CourseViewSet,        basename='course')
router.register(r'course-teachers', views.CourseTeacherViewSet, basename='course-teacher')

# Routes for Teacher
router.register(r'teachers',             views.TeacherViewSet,          basename='teacher')
router.register(r'teachers-periods',     views.TeachersPeriodViewSet,   basename='teachers-period')
router.register(r'speciality-teachers',  views.SpecialityTeacherViewSet,basename='speciality-teacher')

# Routes for Student 
router.register(r'students',           views.StudentViewSet,          basename='student')
router.register(r'studygroups',        views.StudygroupViewSet,       basename='studygroup')
router.register(r'studygroup-teachers',views.StudygroupTeacherViewSet,basename='studygroup-teacher')

# Routes for Evaluation
router.register(r'evaluations',         views.EvaluationViewSet,       basename='evaluation')
router.register(r'evaluation-teachers', views.EvaluationTeacherViewSet,basename='evaluation-teacher')
router.register(r'results',             views.ResultViewSet,           basename='result')

# Route for System Users
router.register(r'system-users',       views.SystemUserViewSet,       basename='system-user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/dashboard-stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('api/dashboard-metrics/', views.DashboardMetricsView.as_view(), name='dashboard-metrics'),
]