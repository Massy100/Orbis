from django.db import models
from tutors_evaluators.models import Evaluator, Mentor, Studygroup
from execution_results.models import Evaluation

class Private(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(
        Evaluation,
        models.DO_NOTHING,
        db_column='evaluationId'
    )  # Field name made lowercase.
    mentorid = models.ForeignKey(
        Mentor,
        models.DO_NOTHING,
        db_column='mentorId'
    )  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Private'


class PrivateEvaluator(models.Model):
    pk = models.CompositePrimaryKey('privateid', 'evaluatorid')
    privateid = models.ForeignKey(
        Private,
        models.DO_NOTHING,
        db_column='privateId'
    )  # Field name made lowercase.
    evaluatorid = models.ForeignKey(
        Evaluator,
        models.DO_NOTHING,
        db_column='evaluatorId'
    )  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Private-Evaluator'


class PrivateStudygroup(models.Model):
    pk = models.CompositePrimaryKey('privateid', 'studygroupid')
    privateid = models.ForeignKey(
        Private,
        models.DO_NOTHING,
        db_column='privateId'
    )  # Field name made lowercase.
    studygroupid = models.ForeignKey(
        Studygroup,
        models.DO_NOTHING,
        db_column='studyGroupId'
    )  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Private-StudyGroup'


class Terna(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(
        Evaluation,
        models.DO_NOTHING,
        db_column='evaluationId'
    )  # Field name made lowercase.
    mentorid = models.ForeignKey(
        Mentor,
        models.DO_NOTHING,
        db_column='mentorId'
    )  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Terna'