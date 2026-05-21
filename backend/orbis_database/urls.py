from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 

router = DefaultRouter()

# Routes for simple tables 
router.register(r'careers',      views.CareerViewSet,      basename='career')
router.register(r'faculties',    views.FacultyViewSet,     basename='faculty')
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
router.register(r'students',            views.StudentViewSet,          basename='student')
router.register(r'studygroups',         views.StudyGroupViewSet,       basename='studygroup')
router.register(r'studygroup-teachers', views.StudyGroupTeacherViewSet,basename='studygroup-teacher')
router.register(r'studygroup-students', views.StudyGroupStudentViewSet,basename='studygroup-student')

# Routes for Course Tutorial
router.register(r'course-tutorials', views.CourseTutorialViewSet, basename='course-tutorial')

# Routes for Evaluation
router.register(r'evaluations',         views.EvaluationViewSet,       basename='evaluation')
router.register(r'evaluation-teachers', views.EvaluationTeacherViewSet,basename='evaluation-teacher')
router.register(r'results',             views.ResultViewSet,           basename='result')

# Route for System Users
router.register(r'system-users', views.SystemUserViewSet, basename='system-user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/pensum/upload/', views.PensumUploadView.as_view(), name='pensum-upload'),
    path('api/teacher-schedules/upload/', views.TeacherScheduleUploadView.as_view(), name='teacher-schedule-upload'),
    path('api/teacher-schedules/<str:teacher_code>/', views.TeacherScheduleDetailView.as_view(), name='teacher-schedule-detail'),
    path('api/dashboard-stats/',   views.DashboardStatsView.as_view(),   name='dashboard-stats'),
    path('api/dashboard-metrics/', views.DashboardMetricsView.as_view(), name='dashboard-metrics'),
    path('api/result-reports/', views.ResultReportsView.as_view(), name='result-reports'),
    path('api/send-email/', views.SendEmailView.as_view(), name='send-email'),
    path('api/result-reports/<int:evaluation_id>/calificacion/',  views.UpdateResultCalificacionView.as_view(), name="update-result-calificacion"),
    path('api/reset-yearly-evaluations/', views.ResetYearlyEvaluationsView.as_view(), name='reset-yearly-evaluations'),

]