from django.db import models


class Student(models.Model):
    carne = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    active = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Student'


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


class Studygroup(models.Model):
    id = models.IntegerField(primary_key=True)
    mentorid = models.ForeignKey(
        Mentor,
        models.DO_NOTHING,
        db_column='mentorId'
    )  # Field name made lowercase.
    area = models.CharField(max_length=50, blank=True, null=True)
    approvedgroup = models.BooleanField(db_column='approvedGroup', blank=True, null=True)  # Field name made lowercase.
    active = models.BooleanField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'StudyGroup'


class StudygroupStudent(models.Model):
    pk = models.CompositePrimaryKey('studygroupid', 'studentid')
    studygroupid = models.ForeignKey(
        Studygroup,
        models.DO_NOTHING,
        db_column='studyGroupId'
    )  # Field name made lowercase.
    studentid = models.ForeignKey(
        Student,
        models.DO_NOTHING,
        db_column='studentId'
    )  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'StudyGroup-Student'