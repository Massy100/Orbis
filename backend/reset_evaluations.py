import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Teacher, EvaluationTeacher
from django.utils import timezone

def reset_evaluation_counts():
    current_year = timezone.now().year
    teachers = Teacher.objects.all()
    
    for teacher in teachers:
        current_count = EvaluationTeacher.objects.filter(
            teacher=teacher,
            evaluation__date__year=current_year
        ).count()
        
        if teacher.evaluationcount != current_count:
            teacher.evaluationcount = current_count
            teacher.save()
            print(f"Actualizado {teacher.name}: {teacher.evaluationcount} evaluaciones")
    
    print(f"Reset completado para el año {current_year}")

if __name__ == "__main__":
    reset_evaluation_counts()