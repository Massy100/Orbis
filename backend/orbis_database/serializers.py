from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Career, Faculty, Course, CourseTeacher,
    Speciality, SpecialityTeacher,
    Teacher, TeachersPeriod,
    Student, Studygroup, StudygroupTeacher,
    Period, Type, Evaluation, EvaluationTeacher, Result,
    Rol,
)

# Simple tables

class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = '__all__'


class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = '__all__'


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'


class SpecialitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Speciality
        fields = '__all__'


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = '__all__'


class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = '__all__'

# Course

class CourseSerializer(serializers.ModelSerializer):
    career_name = serializers.CharField(source='career.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class CourseTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTeacher
        fields = '__all__'

# Teacher

class TeacherSerializer(serializers.ModelSerializer):
    rol_name = serializers.CharField(source='rol.name', read_only=True)
    career_name = serializers.CharField(source='career.name', read_only=True)
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    courses = serializers.SerializerMethodField()
    specialities = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
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
        model = TeachersPeriod
        fields = '__all__'


class SpecialityTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialityTeacher
        fields = '__all__'

# Student

class StudentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    career_name = serializers.CharField(source='career.name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'


class StudygroupSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = Studygroup
        fields = '__all__'


class StudygroupTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudygroupTeacher
        fields = '__all__'

# Evaluation

class EvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='studentid.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)

    class Meta:
        model = Evaluation
        fields = '__all__'


class EvaluationTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationTeacher
        fields = '__all__'


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class SystemUserSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'rol']

    def get_rol(self, obj):
        if obj.is_superuser:
            return "Administrador"
        elif obj.is_staff:
            return "Coordinador"
        return "Usuario"