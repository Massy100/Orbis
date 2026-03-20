from django.db import models

from tutors_evaluators.models_tutors_evaluators import Evaluator, Mentor


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


class EvaluatorSchedule(models.Model):
    pk = models.CompositePrimaryKey('evaluatorid', 'scheduleid')
    evaluatorid = models.ForeignKey(
        Evaluator,
        models.DO_NOTHING,
        db_column='evaluatorId'
    )  # Field name made lowercase.
    scheduleid = models.ForeignKey(
        Schedule,
        models.DO_NOTHING,
        db_column='scheduleId'
    )  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Evaluator-Schedule'


class MentorSchedule(models.Model):
    pk = models.CompositePrimaryKey('mentorid', 'scheduleid')
    mentorid = models.ForeignKey(
        Mentor,
        models.DO_NOTHING,
        db_column='mentorId'
    )  # Field name made lowercase.
    scheduleid = models.ForeignKey(
        Schedule,
        models.DO_NOTHING,
        db_column='scheduleId'
    )  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Mentor-Schedule'