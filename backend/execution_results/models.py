from django.db import models

from tutors_evaluators.models_tutors_evaluators import Student


class Evaluation(models.Model):
    id = models.IntegerField(primary_key=True)
    studentid = models.ForeignKey(
        Student,
        models.DO_NOTHING,
        db_column='studentId'
    )  # Field name made lowercase.
    date = models.DateField(blank=True, null=True)
    hour = models.TimeField(blank=True, null=True)
    classroom = models.CharField(max_length=4, blank=True, null=True)
    building = models.CharField(max_length=20, blank=True, null=True)
    evaluationstatus = models.BooleanField(db_column='evaluationStatus', blank=True, null=True)  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Evaluation'


class Result(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(
        Evaluation,
        models.DO_NOTHING,
        db_column='evaluationId'
    )  # Field name made lowercase.
    score = models.FloatField(blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Result'