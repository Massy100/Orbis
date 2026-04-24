from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from parsers.pensum_parser import parse_pensum

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


class TeachersPeriodViewSet(viewsets.ModelViewSet):
    queryset = TeachersPeriod.objects.select_related('teacher', 'schedule').all()
    serializer_class = TeachersPeriodSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'schedule']


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
 
