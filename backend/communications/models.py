from django.db import models

from request_assigment.models_request_assigment import Private, Terna


class Evaluationhistory(models.Model):
    id = models.IntegerField(primary_key=True)
    evaluationid = models.ForeignKey(
        'execution_results.Evaluation',
        models.DO_NOTHING,
        db_column='evaluationId'
    )  # Field name made lowercase.
    state = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'EvaluationHistory'
