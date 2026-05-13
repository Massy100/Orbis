# backend/seed.py
import os
import django
from datetime import date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'orbis_core.settings')
django.setup()

from orbis_database.models import Type, Teacher, Evaluation, EvaluationTeacher, Result, Faculty, Career, Rol

def run_seed():
    print("Iniciando llenado de datos en Neon DB...")

    # 1. Crear Facultades, Carreras y Roles
    fac, _ = Faculty.objects.get_or_create(name="Ingeniería")
    car, _ = Career.objects.get_or_create(name="Sistemas")
    rol, _ = Rol.objects.get_or_create(name="Docente Titular")

    # 2. Crear Tipos Exactos
    tipos = [
        "Evaluación Comprensiva", 
        "Tutoría Comprensiva", 
        "Evaluación Especial", 
        "Tutoría Especial"
    ]
    db_tipos = {}
    for t in tipos:
        obj, _ = Type.objects.get_or_create(name=t)
        db_tipos[t] = obj

    # 3. Crear Docentes Falsos
    nombres = ["Dr. Elena Rodríguez", "MSc. Juan Carlos Mora", "Dra. Marta Sánchez", "Lic. Luis Montero", "Ing. Pedro Paz"]
    docentes = []
    for nom in nombres:
        t, _ = Teacher.objects.get_or_create(
            name=nom, 
            defaults={'cat': 'A', 'isactive': True, 'evaluationcount': random.randint(10, 50), 'rol': rol, 'career': car, 'faculty': fac}
        )
        docentes.append(t)

    # 4. Crear Evaluaciones y Confirmaciones
    for i in range(1, 40):
        # Elegir un tipo aleatorio
        tipo_str = random.choice(tipos)
        
        # Crear la evaluación
        mes_aleatorio = random.randint(1, 6) # Meses de enero a junio
        fecha = date(2026, mes_aleatorio, random.randint(1, 28))
        
        eval_obj = Evaluation.objects.create(
            studentid_id=1, # Asumiendo que existe un estudiante con ID 1 (puedes ajustarlo si da error)
            date=fecha,
            hour="10:00:00",
            classroom="A101",
            building="Edificio Central",
            type=db_tipos[tipo_str]
        )

        # Asignar a un docente (Top)
        EvaluationTeacher.objects.create(
            evaluation=eval_obj,
            teacher=random.choice(docentes)
        )

        # Simular que algunos confirmaron (50% de probabilidad)
        if random.choice([True, False]):
            Result.objects.create(
                state="Confirmado",
                observation="Docente aceptó la asignación",
                evaluationid=eval_obj
            )

    print("✅ ¡Datos insertados exitosamente en Neon!")

if __name__ == '__main__':
    run_seed()