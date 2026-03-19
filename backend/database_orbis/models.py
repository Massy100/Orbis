# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Evaluation(models.Model):
    id = models.IntegerField(primary_key=True)
    studentid = models.ForeignKey('Student', models.DO_NOTHING, db_column='studentId')  # Field name made lowercase.
    date = models.DateField(blank=True, null=True)
    hour = models.TimeField(blank=True, null=True)
    classroom = models.CharField(max_length=4, blank=True, null=True)
    building = models.CharField(max_length=20, blank=True, null=True)
    evaluationstatus = models.BooleanField(db_column='evaluationStatus', blank=True, null=True)  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Evaluation'


class Evaluationhistory(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(Evaluation, models.DO_NOTHING, db_column='evaluationId')  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'EvaluationHistory'


class Evaluator(models.Model):
    id = models.IntegerField(primary_key=True)
    cat = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    evaluationsperformed = models.IntegerField(db_column='evaluationsPerformed', blank=True, null=True)  # Field name made lowercase.
    active = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Evaluator'


class EvaluatorSchedule(models.Model):
    pk = models.CompositePrimaryKey('evaluatorid', 'scheduleid')
    evaluatorid = models.ForeignKey(Evaluator, models.DO_NOTHING, db_column='evaluatorId')  # Field name made lowercase.
    scheduleid = models.ForeignKey('Schedule', models.DO_NOTHING, db_column='scheduleId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Evaluator-Schedule'


class Mentor(models.Model):
    id = models.IntegerField(primary_key=True)
    cat = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    evaluationsperformed = models.IntegerField(db_column='evaluationsPerformed', blank=True, null=True)  # Field name made lowercase.
    active = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Mentor'


class MentorSchedule(models.Model):
    pk = models.CompositePrimaryKey('mentorid', 'scheduleid')
    mentorid = models.ForeignKey(Mentor, models.DO_NOTHING, db_column='mentorId')  # Field name made lowercase.
    scheduleid = models.ForeignKey('Schedule', models.DO_NOTHING, db_column='scheduleId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Mentor-Schedule'


class Private(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(Evaluation, models.DO_NOTHING, db_column='evaluationId')  # Field name made lowercase.
    mentorid = models.ForeignKey(Mentor, models.DO_NOTHING, db_column='mentorId')  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Private'


class PrivateEvaluator(models.Model):
    pk = models.CompositePrimaryKey('privateid', 'evaluatorid')
    privateid = models.ForeignKey(Private, models.DO_NOTHING, db_column='privateId')  # Field name made lowercase.
    evaluatorid = models.ForeignKey(Evaluator, models.DO_NOTHING, db_column='evaluatorId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Private-Evaluator'


class PrivateStudygroup(models.Model):
    pk = models.CompositePrimaryKey('privateid', 'studygroupid')
    privateid = models.ForeignKey(Private, models.DO_NOTHING, db_column='privateId')  # Field name made lowercase.
    studygroupid = models.ForeignKey('Studygroup', models.DO_NOTHING, db_column='studyGroupId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Private-StudyGroup'


class Result(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(Evaluation, models.DO_NOTHING, db_column='evaluationId')  # Field name made lowercase.
    score = models.FloatField(blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Result'


class Schedule(models.Model):
    id = models.IntegerField(primary_key=True)
    day = models.CharField(max_length=9, blank=True, null=True)
    starttime = models.TimeField(db_column='startTime', blank=True, null=True)  # Field name made lowercase.
    endtime = models.TimeField(db_column='endTime', blank=True, null=True)  # Field name made lowercase.
    occupied = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Schedule'


class Student(models.Model):
    carne = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    active = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Student'


class Studygroup(models.Model):
    id = models.IntegerField(primary_key=True)
    mentorid = models.ForeignKey(Mentor, models.DO_NOTHING, db_column='mentorId')  # Field name made lowercase.
    area = models.CharField(max_length=50, blank=True, null=True)
    approvedgroup = models.BooleanField(db_column='approvedGroup', blank=True, null=True)  # Field name made lowercase.
    active = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'StudyGroup'


class StudygroupStudent(models.Model):
    pk = models.CompositePrimaryKey('studygroupid', 'studentid')
    studygroupid = models.ForeignKey(Studygroup, models.DO_NOTHING, db_column='studyGroupId')  # Field name made lowercase.
    studentid = models.ForeignKey(Student, models.DO_NOTHING, db_column='studentId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'StudyGroup-Student'


class Terna(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(Evaluation, models.DO_NOTHING, db_column='evaluationId')  # Field name made lowercase.
    mentorid = models.ForeignKey(Mentor, models.DO_NOTHING, db_column='mentorId')  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Terna'


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
