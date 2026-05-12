# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Career(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'career'


class Course(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)
    career = models.ForeignKey(Career, models.DO_NOTHING, blank=True, null=True)
    faculty = models.ForeignKey('Faculty', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'course'


class CourseTeacher(models.Model):
    course = models.ForeignKey(Course, models.DO_NOTHING, blank=True, null=True)
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'course_teacher'
        unique_together = (('course', 'teacher'),)


class CourseTutorial(models.Model):
    hasaccepted = models.BooleanField(blank=True, null=True)
    haspayment = models.BooleanField(blank=True, null=True)
    studygroup = models.ForeignKey('Studygroup', models.DO_NOTHING, blank=True, null=True)
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING, blank=True, null=True)
    course = models.ForeignKey(Course, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'course_tutorial'
        unique_together = (('studygroup', 'teacher', 'course'),)


class Evaluation(models.Model):
    studentid = models.ForeignKey('Student', models.DO_NOTHING, db_column='studentid', blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    starthour = models.TimeField(blank=True, null=True)
    endhour = models.TimeField(blank=True, null=True)
    haspayment = models.BooleanField(blank=True, null=True)
    classroom = models.CharField(max_length=4, blank=True, null=True)
    building = models.CharField(max_length=20, blank=True, null=True)
    type = models.ForeignKey('Type', models.DO_NOTHING, db_column='type', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'evaluation'


class EvaluationTeacher(models.Model):
    evaluation = models.ForeignKey(Evaluation, models.DO_NOTHING, blank=True, null=True)
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'evaluation_teacher'
        unique_together = (('evaluation', 'teacher'),)


class Faculty(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'faculty'


class Period(models.Model):
    day = models.CharField(max_length=9, blank=True, null=True)
    starttime = models.TimeField(blank=True, null=True)
    endtime = models.TimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'period'


class Result(models.Model):
    state = models.CharField(max_length=50, blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    evaluationid = models.ForeignKey(Evaluation, models.DO_NOTHING, db_column='evaluationid', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'result'


class Speciality(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'speciality'


class SpecialityTeacher(models.Model):
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING, blank=True, null=True)
    area = models.ForeignKey(Speciality, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'speciality_teacher'
        unique_together = (('teacher', 'area'),)


class Student(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)
    est = models.CharField(max_length=50, blank=True, null=True)
    isactive = models.BooleanField(blank=True, null=True)
    faculty = models.ForeignKey(Faculty, models.DO_NOTHING, blank=True, null=True)
    career = models.ForeignKey(Career, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'student'


class StudyGroup(models.Model):
    group = models.CharField(max_length=50, blank=True, null=True)
    approvedgroup = models.BooleanField(blank=True, null=True)
    isactive = models.BooleanField(default=True)

    class Meta:
        managed = True
        db_table = 'studygroup'


class StudyGroupStudent(models.Model):
    haspayment = models.BooleanField(blank=True, null=True)
    studygroup = models.ForeignKey(StudyGroup, models.DO_NOTHING, blank=True, null=True)
    student = models.ForeignKey(Student, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'studygroup_student'
        unique_together = (('studygroup', 'student'),)


class StudyGroupTeacher(models.Model):
    hasaccepted = models.BooleanField(blank=True, null=True)
    studygroup = models.ForeignKey(StudyGroup, models.DO_NOTHING, blank=True, null=True)
    teacher = models.ForeignKey('Teacher', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'studygroup_teacher'
        unique_together = (('studygroup', 'teacher'),)


class Teacher(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    cat = models.CharField(max_length=50, blank=True, null=True)
    isactive = models.BooleanField(blank=True, null=True)
    evaluationcount = models.IntegerField(blank=True, null=True)
    career = models.ForeignKey(Career, models.DO_NOTHING, blank=True, null=True)
    faculty = models.ForeignKey(Faculty, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'teacher'


class TeachersPeriod(models.Model):
    teacher = models.ForeignKey(Teacher, models.DO_NOTHING, blank=True, null=True)
    schedule = models.ForeignKey(Period, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'teachers_period'
        unique_together = (('teacher', 'schedule'),)


class Type(models.Model):
    name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'type'
