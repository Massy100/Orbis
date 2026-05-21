from api.models import Teacher, EvaluationTeacher
from django.utils import timezone

def reset_evaluation_counts():
    current_year = timezone.now().year
    teachers = Teacher.objects.all()
    updated_count = 0
    
    print(f"=== Reset de contadores de evaluaciones - Año {current_year} ===")
    
    for teacher in teachers:
        current_count = EvaluationTeacher.objects.filter(
            teacher=teacher,
            evaluation__date__year=current_year
        ).count()
        
        if teacher.evaluationcount != current_count:
            teacher.evaluationcount = current_count
            teacher.save()
            updated_count += 1
            print(f"✓ {teacher.name}: {teacher.evaluationcount} evaluaciones")
    
    print(f"Reset completado. {updated_count} docentes actualizados.")
    return f"Reset completado para {current_year}"

def check_evaluation_counts():
    current_year = timezone.now().year
    print(f"=== Verificación de contadores - Año {current_year} ===")
    
    teachers_with_many = Teacher.objects.filter(evaluationcount__gte=15)
    print(f"Docentes con 15+ evaluaciones: {teachers_with_many.count()}")
    
    for teacher in teachers_with_many[:10]:  
        print(f"{teacher.name}: {teacher.evaluationcount} evaluaciones")
    
    return "Verificación completada"