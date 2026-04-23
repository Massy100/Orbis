# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class Career(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'career'


class Course(models.Model):
    name = models.CharField(max_length=50)
    career = models.ForeignKey(Career, models.DO_NOTHING)
    faculty = models.ForeignKey('Faculty', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'course'


class CourseTeacher(models.Model):
    course = models.OneToOneField(Course, models.DO_NOTHING, primary_key=True)  # The composite primary key (course_id, teacher_id) found, that is not supported. The first column is selected.
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'course_teacher'
        unique_together = (('course', 'teacher'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Evaluation(models.Model):
    studentid = models.ForeignKey('Student', models.DO_NOTHING, db_column='studentid')
    date = models.DateField()
    hour = models.TimeField()
    classroom = models.CharField(max_length=4)
    building = models.CharField(max_length=20)
    type = models.ForeignKey('Type', models.DO_NOTHING, db_column='type')

    class Meta:
        managed = False
        db_table = 'evaluation'


class EvaluationTeacher(models.Model):
    evaluation = models.OneToOneField(Evaluation, models.DO_NOTHING, primary_key=True)  # The composite primary key (evaluation_id, teacher_id) found, that is not supported. The first column is selected.
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'evaluation_teacher'
        unique_together = (('evaluation', 'teacher'),)


class Faculty(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'faculty'


class Period(models.Model):
    day = models.CharField(max_length=9)
    starttime = models.TimeField()
    endtime = models.TimeField()

    class Meta:
        managed = False
        db_table = 'period'


class Result(models.Model):
    state = models.CharField(max_length=50)
    observation = models.TextField()
    evaluationid = models.ForeignKey(Evaluation, models.DO_NOTHING, db_column='evaluationid')

    class Meta:
        managed = False
        db_table = 'result'


class Rol(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'rol'


class Speciality(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'speciality'


class SpecialityTeacher(models.Model):
    teacher = models.OneToOneField('Teacher', models.DO_NOTHING, primary_key=True)  # The composite primary key (teacher_id, area_id) found, that is not supported. The first column is selected.
    area = models.ForeignKey(Speciality, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'speciality_teacher'
        unique_together = (('teacher', 'area'),)


class Student(models.Model):
    name = models.CharField(max_length=50)
    est = models.CharField(max_length=50)
    isactive = models.BooleanField()
    haspayment = models.BooleanField()
    faculty = models.ForeignKey(Faculty, models.DO_NOTHING)
    career = models.ForeignKey(Career, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'student'


class Studygroup(models.Model):
    group = models.CharField(max_length=50)
    approvedgroup = models.BooleanField()
    student = models.ForeignKey(Student, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'studygroup'


class StudygroupTeacher(models.Model):
    studygroup = models.OneToOneField(Studygroup, models.DO_NOTHING, primary_key=True)  # The composite primary key (studygroup_id, teacher_id) found, that is not supported. The first column is selected.
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'studygroup_teacher'
        unique_together = (('studygroup', 'teacher'),)


class Teacher(models.Model):
    name = models.CharField(max_length=100)
    cat = models.CharField(max_length=50)
    isactive = models.BooleanField()
    evaluationcount = models.IntegerField()
    rol = models.ForeignKey(Rol, models.DO_NOTHING)
    career = models.ForeignKey(Career, models.DO_NOTHING)
    faculty = models.ForeignKey(Faculty, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'teacher'


class TeachersPeriod(models.Model):
    teacher = models.OneToOneField(Teacher, models.DO_NOTHING, primary_key=True)  # The composite primary key (teacher_id, schedule_id) found, that is not supported. The first column is selected.
    schedule = models.ForeignKey(Period, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'teachers_period'
        unique_together = (('teacher', 'schedule'),)


class Type(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'type'
