from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Career, Faculty, Course, CourseTeacher,
    Speciality, SpecialityTeacher,
    Teacher, TeachersPeriod,
    Student,
    StudyGroup, StudyGroupStudent, StudyGroupTeacher,
    CourseTutorial,
    Period, Type, Evaluation, EvaluationTeacher, Result,
)

# Simple tables

class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Career
        fields = '__all__'


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Faculty
        fields = '__all__'

class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Speciality
        fields = '__all__'


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Type
        fields = '__all__'


class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Period
        fields = '__all__'


# Course

class CourseSerializer(serializers.ModelSerializer):
    career_name  = serializers.CharField(source='career.name',  read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    class Meta:
        model  = Course
        fields = '__all__'


class CourseTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CourseTeacher
        fields = '__all__'


# Teacher 

class TeacherSerializer(serializers.ModelSerializer):
    career_name  = serializers.CharField(source='career.name',  read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    courses = serializers.SerializerMethodField()
    specialities = serializers.SerializerMethodField()

    class Meta:
        model  = Teacher
        fields = '__all__'

    def get_courses(self, obj):
        return [
            {
                "id": item.course.id,
                "name": item.course.name,
            }
            for item in CourseTeacher.objects.filter(
                teacher=obj
            ).select_related('course')
        ]

    def get_specialities(self, obj):
        return [
            {
                "id": item.area.id,
                "name": item.area.name,
            }
            for item in SpecialityTeacher.objects.filter(
                teacher=obj
            ).select_related('area')
        ]

class TeachersPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model  = TeachersPeriod
        fields = '__all__'


class SpecialityTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SpecialityTeacher
        fields = '__all__'


# Student 

class StudentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    career_name  = serializers.CharField(source='career.name',  read_only=True)

    class Meta:
        model  = Student
        fields = '__all__'


# StudyGroup 

class StudyGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StudyGroup
        fields = '__all__'


class StudyGroupStudentSerializer(serializers.ModelSerializer):
    """REPLACES old StudygroupSerializer (which had student FK embedded)."""
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model  = StudyGroupStudent
        fields = '__all__'


class StudyGroupTeacherSerializer(serializers.ModelSerializer):
    """REPLACES old StudygroupTeacherSerializer."""
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model  = StudyGroupTeacher
        fields = '__all__'


class CourseTutorialSerializer(serializers.ModelSerializer):
    """NEW: links StudyGroup + Teacher + Course."""
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    course_name  = serializers.CharField(source='course.name',  read_only=True)

    class Meta:
        model  = CourseTutorial
        fields = '__all__'


# Evaluation 

class EvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='studentid.name', read_only=True)
    type_name    = serializers.CharField(source='type.name',       read_only=True)

    class Meta:
        model  = Evaluation
        fields = '__all__'


class EvaluationTeacherSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    evaluation_id = serializers.IntegerField(source='evaluation.id', read_only=True)

    class Meta:
        model  = EvaluationTeacher
        fields = '__all__'


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Result
        fields = '__all__'


# System Users 

class SystemUserSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'rol']

    def get_rol(self, obj):
        if obj.is_superuser:
            return 'Administrador'
        elif obj.is_staff:
            return 'Coordinador'
        return 'Usuario'
    
# Agregar al final del archivo serializers.py

class TeacherForSpecialEvaluationSerializer(serializers.ModelSerializer):
    """Serializer específico para la evaluación especial"""
    curso = serializers.SerializerMethodField()
    facultad = serializers.CharField(source='faculty.name', read_only=True)
    codigo = serializers.CharField(source='cat', read_only=True)
    evaluaciones = serializers.IntegerField(source='evaluationcount', read_only=True)
    
    class Meta:
        model = Teacher
        fields = ['id', 'nombre', 'curso', 'evaluaciones', 'facultad', 'codigo']
    
    def get_nombre(self, obj):
        return obj.name
    
    def get_curso(self, obj):
        # Obtener el primer curso del docente (puedes modificar la lógica)
        first_course = CourseTeacher.objects.filter(teacher=obj).select_related('course').first()
        return first_course.course.name if first_course and first_course.course else "Sin curso asignado"

class CreateSpecialEvaluationSerializer(serializers.Serializer):
    estudiante_nombre = serializers.CharField(max_length=100)
    estudiante_carnet = serializers.CharField(max_length=50)
    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    lugar = serializers.CharField(max_length=20)
    salon = serializers.CharField(max_length=4)
    pagado = serializers.BooleanField()
    teacher_id = serializers.IntegerField()
    
    def validate_teacher_id(self, value):
        try:
            teacher = Teacher.objects.get(id=value, isactive=True)
            return value
        except Teacher.DoesNotExist:
            raise serializers.ValidationError("El docente no existe o no está activo")
    
    def validate(self, data):
        if data['hora_inicio'] >= data['hora_fin']:
            raise serializers.ValidationError("La hora de inicio debe ser menor a la hora de fin")
        return data