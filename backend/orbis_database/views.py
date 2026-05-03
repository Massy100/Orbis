from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from parsers.pensum_parser import parse_pensum
from django.contrib.auth.models import User
from rest_framework.decorators import action
from django.db.models import Count, Q
from django.db.models.functions import ExtractMonth
from .serializers import SystemUserSerializer


from .models import (
    Career, Faculty, Course, CourseTeacher,
    Speciality, SpecialityTeacher,
    Teacher, TeachersPeriod,
    Student, Studygroup, StudygroupTeacher,
    Period, Type, Evaluation, EvaluationTeacher, Result,
    Rol,
)
from .serializers import (
    CareerSerializer, FacultySerializer, RolSerializer,
    SpecialitySerializer, TypeSerializer, PeriodSerializer,
    CourseSerializer, CourseTeacherSerializer,
    TeacherSerializer, TeachersPeriodSerializer, SpecialityTeacherSerializer,
    StudentSerializer, StudygroupSerializer, StudygroupTeacherSerializer,
    EvaluationSerializer, EvaluationTeacherSerializer, ResultSerializer,
    SystemUserSerializer
)

# CRUD for simple tables

class CareerViewSet(viewsets.ModelViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class SpecialityViewSet(viewsets.ModelViewSet):
    queryset = Speciality.objects.all()
    serializer_class = SpecialitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class TypeViewSet(viewsets.ModelViewSet):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class PeriodViewSet(viewsets.ModelViewSet):
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['day']
    ordering_fields = ['day', 'starttime']

# CRUD for Course

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('career', 'faculty').all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['career', 'faculty']
    search_fields = ['name']
    ordering_fields = ['name']


class CourseTeacherViewSet(viewsets.ModelViewSet):
    queryset = CourseTeacher.objects.select_related('course', 'teacher').all()
    serializer_class = CourseTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'teacher']

# CRUD for Teacher

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related('rol', 'career', 'faculty').all()
    serializer_class = TeacherSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['isactive', 'career', 'faculty', 'rol']
    search_fields = ['name', 'cat']
    ordering_fields = ['name', 'evaluationcount']

    ## para soft delete (toggle isactive)
    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        teacher = self.get_object()
        teacher.isactive = not teacher.isactive
        teacher.save()

        estado_texto = 'Activo' if teacher.isactive else 'Inactivo'
        
        return Response({
            'message': f'Estado actualizado correctamente',
            'isactive': teacher.isactive,
            'status_text': estado_texto
        })


class TeachersPeriodViewSet(viewsets.ModelViewSet):
    queryset = TeachersPeriod.objects.select_related('teacher', 'schedule').all()
    serializer_class = TeachersPeriodSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'schedule']

    def get_queryset(self):
        qs = TeachersPeriod.objects.select_related('teacher', 'schedule').all()
        teacher_ids = self.request.query_params.getlist('teacher')
        if teacher_ids:
            qs = qs.filter(teacher__id__in=teacher_ids)
        return qs

class SpecialityTeacherViewSet(viewsets.ModelViewSet):
    queryset = SpecialityTeacher.objects.select_related('teacher', 'area').all()
    serializer_class = SpecialityTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'area']

# CRUD for Student

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('faculty', 'career').all()
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['isactive', 'haspayment', 'faculty', 'career']
    search_fields = ['name', 'est']
    ordering_fields = ['name']


class StudygroupViewSet(viewsets.ModelViewSet):
    queryset = Studygroup.objects.select_related('student').all()
    serializer_class = StudygroupSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['approvedgroup', 'student']
    search_fields = ['group']


class StudygroupTeacherViewSet(viewsets.ModelViewSet):
    queryset = StudygroupTeacher.objects.select_related('studygroup', 'teacher').all()
    serializer_class = StudygroupTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['studygroup', 'teacher']

# CRUD for Evaluation

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.select_related('studentid', 'type').all()
    serializer_class = EvaluationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['studentid', 'type', 'date', 'classroom', 'building']
    ordering_fields = ['date', 'hour']


class EvaluationTeacherViewSet(viewsets.ModelViewSet):
    queryset = EvaluationTeacher.objects.select_related('evaluation', 'teacher').all()
    serializer_class = EvaluationTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['evaluation', 'teacher']


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related('evaluationid').all()
    serializer_class = ResultSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['state', 'evaluationid']
    search_fields = ['state', 'observation']

# Espetial route for pensum upload

class PensumUploadView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        upload_type = request.data.get("type", "")
 
        if not file:
            return Response(
                {"error": "No file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        allowed_types = ("especial", "comprensiva")
        if upload_type not in allowed_types:
            return Response(
                {"error": f"'type' must be one of {allowed_types}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        try:
            stats = parse_pensum(file)
        except Exception as exc:
            return Response(
                {"error": f"Failed to parse the pensum file: {str(exc)}"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
 
        return Response(
            {
                "message": "Pensum uploaded successfully.",
                "type": upload_type,
                "stats": stats,
            },
            status=status.HTTP_201_CREATED,
        )
 


class DashboardStatsView(APIView):
    def get(self, request):
        total_teachers = Teacher.objects.count()
        active_teachers = Teacher.objects.filter(isactive=True).count()
        total_students = Student.objects.count()
        total_courses = Course.objects.count()
        total_evaluations = Evaluation.objects.count()

        roles_distribution = list(Teacher.objects.values('rol__name').annotate(total=Count('id')))

        return Response({
            'overview': {
                'total_teachers': total_teachers,
                'active_teachers': active_teachers,
                'total_students': total_students,
                'total_courses': total_courses,
                'total_evaluations': total_evaluations,
            },
            'charts': {
                'roles_distribution': roles_distribution
            }
        })
    
class SystemUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = SystemUserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    # logica del soft delete
    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        
        # Invertimos el estado actual del usuario
        user.is_active = not user.is_active
        user.save()
        
        estado_texto = 'Activo' if user.is_active else 'Inactivo'
        
        return Response({
            'message': 'Estado actualizado',
            'is_active': user.is_active,
            'status_text': estado_texto
        })
    
class DashboardMetricsView(APIView):
    def get(self, request):
        # 1. Totales de Tarjetas
        total_evaluaciones = Evaluation.objects.count()
        # Consideramos "Pendiente" si no existe un registro en la tabla Result para esa evaluacion
        evaluaciones_sin_resultado = Evaluation.objects.filter(result__isnull=True).count()

        # 2. Datos para Gráfica de Barras (especial vs comprensiva por mes)
        stats_mes = Evaluation.objects.annotate(month=ExtractMonth('date')).values('month').annotate(
            especial=Count('id', filter=Q(type__name__icontains='Especial')),
            comprensiva=Count('id', filter=Q(type__name__icontains='Comprensiva'))
        ).order_by('month')

        # Convertimos el número de mes a nombre corto (ENE, FEB, etc.)
        meses_map = {1:'ENE', 2:'FEB', 3:'MAR', 4:'ABR', 5:'MAY', 6:'JUN', 
                     7:'JUL', 8:'AGO', 9:'SEP', 10:'OCT', 11:'NOV', 12:'DIC'}
        
        chart_data = [
            {
                "mes": meses_map.get(item['month'], 'S/M'),
                "especial": item['especial'],
                "comprensiva": item['comprensiva']
            } for item in stats_mes
        ]

        # 3. Docentes Top
        top_teachers = Teacher.objects.order_by('-evaluationcount')[:4]
        teachers_data = [
            {
                "name": t.name,
                "initials": "".join([n[0] for n in t.name.split()[:2]]),
                "dept": t.faculty.name,
                "total": t.evaluationcount
            } for t in top_teachers
        ]

        return Response({
            "total_evaluations": total_evaluaciones,
            "pending_emails": evaluaciones_sin_resultado,
            "monthly_chart": chart_data,
            "top_teachers": teachers_data
        })
