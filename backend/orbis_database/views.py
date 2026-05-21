import json
import urllib.request
import urllib.error
import os

from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.db import transaction, connection
from django.db.models.functions import ExtractMonth, ExtractYear
from django.utils import timezone

from parsers.pensum_parser import parse_pensum
from parsers.teacher_schedule_parser import parse_teacher_schedule_excel

from .serializers import SystemUserSerializer, CourseTutorialSerializer, StudyGroupSerializer, StudyGroupStudentSerializer
from .models import (
    Career, Faculty, Course, CourseTeacher,
    Speciality, SpecialityTeacher,
    Teacher, TeachersPeriod,
    Student,
    StudyGroup, StudyGroupStudent, StudyGroupTeacher,
    CourseTutorial,
    Period, Type, Evaluation, EvaluationTeacher, Result,
)

from .serializers import (
    CareerSerializer, FacultySerializer,
    SpecialitySerializer, TypeSerializer, PeriodSerializer,
    CourseSerializer, CourseTeacherSerializer,
    TeacherSerializer, TeachersPeriodSerializer, SpecialityTeacherSerializer,
    StudentSerializer,
    StudyGroupSerializer, StudyGroupStudentSerializer,
    StudyGroupTeacherSerializer, CourseTutorialSerializer,
    EvaluationSerializer, EvaluationTeacherSerializer, ResultSerializer,
    SystemUserSerializer,
)

class CareerViewSet(viewsets.ModelViewSet):
    queryset = Career.objects.all()
    serializer_class = CareerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']

class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']

class SpecialityViewSet(viewsets.ModelViewSet):
    queryset = Speciality.objects.all()
    serializer_class = SpecialitySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class TypeViewSet(viewsets.ModelViewSet):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class PeriodViewSet(viewsets.ModelViewSet):
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['day']
    ordering_fields = ['day', 'starttime']

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('career', 'faculty').all()
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['career', 'faculty']
    search_fields = ['name']
    ordering_fields = ['name']

class CourseTeacherViewSet(viewsets.ModelViewSet):
    queryset = CourseTeacher.objects.select_related('course', 'teacher').all()
    serializer_class = CourseTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course', 'teacher']

class TeacherViewSet(viewsets.ModelViewSet):
    serializer_class = TeacherSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['isactive', 'career', 'faculty']
    search_fields = ['name', 'cat']
    ordering_fields = ['name', 'evaluationcount']

    def get_queryset(self):
        qs = Teacher.objects.select_related('career', 'faculty').all()
        show_inactive = self.request.query_params.get('show_inactive')
        if show_inactive == 'true':
            return qs
        return qs.filter(isactive=True)

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        teacher = self.get_object()
        teacher.isactive = not teacher.isactive
        teacher.save()
        estado_texto = 'Activo' if teacher.isactive else 'Inactivo'
        return Response({
            'message': 'Estado actualizado correctamente',
            'isactive': teacher.isactive,
            'status_text': estado_texto,
        })

    @action(detail=True, methods=['post'], url_path='update_relations')
    @transaction.atomic
    def update_relations(self, request, pk=None):
        teacher = self.get_object()
        course_ids = request.data.get('courses', [])
        speciality_ids = request.data.get('specialities', [])

        CourseTeacher.objects.filter(teacher=teacher).delete()
        SpecialityTeacher.objects.filter(teacher=teacher).delete()

        for course_id in course_ids:
            CourseTeacher.objects.create(teacher=teacher, course_id=course_id)

        for speciality_id in speciality_ids:
            SpecialityTeacher.objects.create(teacher=teacher, area_id=speciality_id)

        return Response({'message': 'Relaciones actualizadas'}, status=status.HTTP_200_OK)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        course_ids = request.data.get('courses', [])
        speciality_ids = request.data.get('specialities', [])

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()

        for course_id in course_ids:
            CourseTeacher.objects.create(teacher=teacher, course_id=course_id)

        for speciality_id in speciality_ids:
            SpecialityTeacher.objects.create(teacher=teacher, area_id=speciality_id)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class TeachersPeriodViewSet(viewsets.ModelViewSet):
    serializer_class = TeachersPeriodSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'schedule']

    def get_queryset(self):
        qs = TeachersPeriod.objects.select_related('teacher', 'schedule').all()
        teacher_ids = self.request.query_params.getlist('teacher')
        if teacher_ids:
            qs = qs.filter(teacher__id__in=teacher_ids)
        return qs

class SpecialityTeacherViewSet(viewsets.ModelViewSet):
    queryset = SpecialityTeacher.objects.select_related('teacher', 'area').all()
    serializer_class = SpecialityTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher', 'area']

class TeacherScheduleUploadView(APIView):
    @transaction.atomic
    def post(self, request):
        file = request.FILES.get('file')
        teacher_code = request.data.get('teacher_code')
        teacher_id = request.data.get('teacher_id')
        replace = request.data.get('replace') == 'true'

        if not file:
            return Response({'error': 'No se envió ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)
        if not teacher_code:
            return Response({'error': 'Debe enviar teacher_code.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parsed = parse_teacher_schedule_excel(file, teacher_code)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        schedules = parsed.get('schedules', [])

        if replace and len(schedules) == 0:
            return Response({
                'error': 'El archivo no tiene horarios marcados para este docente. No se reemplazó el horario anterior.',
                'teacher_code': parsed.get('teacher_code'),
                'teacher_name_from_excel': parsed.get('teacher_name'),
                'total_schedules_found': 0,
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        try:
            if teacher_id:
                teacher = Teacher.objects.get(id=teacher_id)
            else:
                teacher = Teacher.objects.get(cat=str(teacher_code).strip())
        except Teacher.DoesNotExist:
            return Response({
                'error': f'No existe un docente registrado con código {teacher_code}.'
            }, status=status.HTTP_404_NOT_FOUND)

        deleted_relations = 0
        if replace:
            deleted_relations, _ = TeachersPeriod.objects.filter(teacher=teacher).delete()

        created_periods = 0
        created_relations = 0
        already_existing = 0

        for schedule in schedules:
            period, created = Period.objects.get_or_create(
                day=schedule['day'],
                starttime=schedule['starttime'],
                endtime=schedule['endtime'],
            )
            if created:
                created_periods += 1

            _, relation_created = TeachersPeriod.objects.get_or_create(
                teacher=teacher,
                schedule=period,
            )
            if relation_created:
                created_relations += 1
            else:
                already_existing += 1

        return Response({
            'message': 'Horario procesado correctamente.',
            'teacher_code': parsed.get('teacher_code'),
            'teacher_name_from_excel': parsed.get('teacher_name'),
            'teacher_id': teacher.id,
            'replace': replace,
            'deleted_relations': deleted_relations,
            'total_schedules_found': len(schedules),
            'created_periods': created_periods,
            'created_relations': created_relations,
            'already_existing': already_existing,
        }, status=status.HTTP_201_CREATED)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('faculty', 'career').all()
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['isactive', 'faculty', 'career']
    search_fields = ['name', 'est']
    ordering_fields = ['name']

    @action(detail=False, methods=['get'])
    def search_by_est(self, request):
        est = request.query_params.get("est")
        if not est:
            return Response({"error": "Debe proporcionar un carnet"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = Student.objects.get(est=est)
            return Response({"id": student.id, "name": student.name, "est": student.est})
        except Student.DoesNotExist:
            return Response({"error": "Estudiante no encontrado"}, status=status.HTTP_404_NOT_FOUND)

class StudyGroupViewSet(viewsets.ModelViewSet):
    serializer_class = StudyGroupSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['approvedgroup']
    search_fields = ['group']

    def get_queryset(self):
        return StudyGroup.objects.filter(isactive=True)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        teachers = request.data.get('teachers', [])
        students = request.data.get('students', [])

        if len(teachers) != 3:
            return Response({'error': 'El grupo debe tener exactamente 3 tutores.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(students) < 1 or len(students) > 6:
            return Response({'error': 'El grupo debe tener entre 1 y 6 estudiantes.'}, status=status.HTTP_400_BAD_REQUEST)

        group = StudyGroup.objects.create(group=request.data.get('group'))

        for teacher_data in teachers:
            StudyGroupTeacher.objects.create(
                studygroup=group,
                teacher_id=teacher_data['teacher'],
                hasaccepted=teacher_data['hasaccepted']
            )
        for student_data in students:
            StudyGroupStudent.objects.create(
                studygroup=group,
                student_id=student_data['student'],
                haspayment=student_data['haspayment']
            )

        all_teachers_accepted = all(t['hasaccepted'] for t in teachers)
        all_students_paid = all(s['haspayment'] for s in students)
        group.approvedgroup = all_teachers_accepted and all_students_paid
        group.save()

        serializer = self.get_serializer(group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        group = self.get_object()
        teachers = request.data.get("teachers", [])
        students = request.data.get("students", [])

        if len(teachers) != 3:
            return Response({"error": "El grupo debe tener exactamente 3 tutores."}, status=status.HTTP_400_BAD_REQUEST)
        if len(students) < 1 or len(students) > 6:
            return Response({"error": "El grupo debe tener entre 1 y 6 estudiantes."}, status=status.HTTP_400_BAD_REQUEST)

        group.group = request.data.get("group")
        StudyGroupTeacher.objects.filter(studygroup=group).delete()
        StudyGroupStudent.objects.filter(studygroup=group).delete()

        for teacher_data in teachers:
            StudyGroupTeacher.objects.create(
                studygroup=group,
                teacher_id=teacher_data["teacher"],
                hasaccepted=teacher_data["hasaccepted"]
            )
        for student_data in students:
            StudyGroupStudent.objects.create(
                studygroup=group,
                student_id=student_data["student"],
                haspayment=student_data["haspayment"]
            )

        all_teachers_accepted = all(t["hasaccepted"] for t in teachers)
        all_students_paid = all(s["haspayment"] for s in students)
        group.approvedgroup = all_teachers_accepted and all_students_paid
        group.save()

        serializer = self.get_serializer(group)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def soft_delete(self, request, pk=None):
        group = self.get_object()
        group.isactive = False
        group.save()
        return Response({"message": "Grupo desactivado correctamente"}, status=status.HTTP_200_OK)

class StudyGroupStudentViewSet(viewsets.ModelViewSet):
    queryset = StudyGroupStudent.objects.select_related('studygroup', 'student').all()
    serializer_class = StudyGroupStudentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['studygroup', 'student', 'haspayment']

class StudyGroupTeacherViewSet(viewsets.ModelViewSet):
    queryset = StudyGroupTeacher.objects.select_related('studygroup', 'teacher').all()
    serializer_class = StudyGroupTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['studygroup', 'teacher', 'hasaccepted']

# ✅ Una sola definición, la completa con select_related
class CourseTutorialViewSet(viewsets.ModelViewSet):
    queryset = CourseTutorial.objects.select_related('studygroup', 'teacher', 'course').all()
    serializer_class = CourseTutorialSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['studygroup', 'teacher', 'course', 'hasaccepted', 'haspayment']

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.select_related('studentid', 'type').all()
    serializer_class = EvaluationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['studentid', 'type', 'date', 'classroom', 'building', 'haspayment']
    ordering_fields = ['date', 'starthour']

class EvaluationTeacherViewSet(viewsets.ModelViewSet):
    queryset = EvaluationTeacher.objects.select_related('evaluation', 'teacher').all()
    serializer_class = EvaluationTeacherSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['evaluation', 'teacher']

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related('evaluationid').all()
    serializer_class = ResultSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['state', 'evaluationid']
    search_fields = ['state', 'observation']

class SystemUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = SystemUserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': 'Estado actualizado',
            'is_active': user.is_active,
            'status_text': 'Activo' if user.is_active else 'Inactivo',
        })

class PensumUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        upload_type = request.data.get('type', '')

        if not file:
            return Response({'error': 'No file was provided.'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ('especial', 'comprensiva')
        if upload_type not in allowed_types:
            return Response({'error': f"'type' must be one of {allowed_types}."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stats = parse_pensum(file)
        except Exception as exc:
            return Response({'error': f'Failed to parse the pensum file: {str(exc)}'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return Response({
            'message': 'Pensum uploaded successfully.',
            'type': upload_type,
            'stats': stats,
        }, status=status.HTTP_201_CREATED)

class DashboardStatsView(APIView):
    def get(self, request):
        total_teachers = Teacher.objects.count()
        active_teachers = Teacher.objects.filter(isactive=True).count()
        total_students = Student.objects.count()
        total_courses = Course.objects.count()
        total_evals = Evaluation.objects.count()

        return Response({
            'overview': {
                'total_teachers': total_teachers,
                'active_teachers': active_teachers,
                'total_students': total_students,
                'total_courses': total_courses,
                'total_evaluations': total_evals,
            },
            'charts': {'roles_distribution': []}
        })

class DashboardMetricsView(APIView):
    def get(self, request):
        total_comprensivas = Evaluation.objects.filter(type__name__icontains='Comprensiva').count()
        total_especiales = Evaluation.objects.filter(type__name__icontains='Especial').count()

        stats_mes = Evaluation.objects.annotate(
            month=ExtractMonth('date'),
            year=ExtractYear('date')
        ).values('year', 'month').annotate(
            especial=Count('id', filter=Q(type__name__icontains='Especial')),
            comprensiva=Count('id', filter=Q(type__name__icontains='Comprensiva'))
        ).order_by('-year', '-month')[:3]

        stats_mes_list = list(stats_mes)[::-1]
        meses_map = {1:'ENE', 2:'FEB', 3:'MAR', 4:'ABR', 5:'MAY', 6:'JUN',
                     7:'JUL', 8:'AGO', 9:'SEP', 10:'OCT', 11:'NOV', 12:'DIC'}

        chart_data = [
            {"mes": meses_map.get(item['month'], 'S/M'), "especial": item['especial'], "comprensiva": item['comprensiva']}
            for item in stats_mes_list
        ]

        top_comprensiva = Teacher.objects.filter(
            evaluationteacher__evaluation__type__name__icontains='Comprensiva'
        ).annotate(total=Count('evaluationteacher')).order_by('-total')[:4]

        top_especial = Teacher.objects.filter(
            evaluationteacher__evaluation__type__name__icontains='Especial'
        ).annotate(total=Count('evaluationteacher')).order_by('-total')[:4]

        def format_teacher(t):
            initials = "".join([word[0] for word in t.name.split()[:2]]) if t.name else "NN"
            return {
                "name": t.name,
                "initials": initials.upper(),
                "dept": t.faculty.name if t.faculty else "Sin Facultad",
                "total": t.total
            }

        conf_eval_comp = Result.objects.filter(state__icontains='Confirmado', evaluationid__type__name__icontains='Evaluación Comprensiva').count()
        conf_tut_comp  = Result.objects.filter(state__icontains='Confirmado', evaluationid__type__name__icontains='Tutoría Comprensiva').count()
        conf_eval_esp  = Result.objects.filter(state__icontains='Confirmado', evaluationid__type__name__icontains='Evaluación Especial').count()
        conf_tut_esp   = Result.objects.filter(state__icontains='Confirmado', evaluationid__type__name__icontains='Tutoría Especial').count()

        return Response({
            "cards_totals": {"comprensivas": total_comprensivas, "especiales": total_especiales},
            "monthly_chart": chart_data,
            "top_teachers": {
                "comprensivas": [format_teacher(t) for t in top_comprensiva],
                "especiales": [format_teacher(t) for t in top_especial]
            },
            "confirmations": [
                {"label": "Tutoría Comprensiva",    "value": conf_tut_comp,  "max": total_comprensivas, "color": "#2563EB"},
                {"label": "Evaluación Comprensiva", "value": conf_eval_comp, "max": total_comprensivas, "color": "#3B82F6"},
                {"label": "Tutoría Especial",       "value": conf_tut_esp,   "max": total_especiales,   "color": "#93C5FD"},
                {"label": "Evaluación Especial",    "value": conf_eval_esp,  "max": total_especiales,   "color": "#DBEAFE"},
            ]
        })

class TeacherScheduleDetailView(APIView):
    def get(self, request, teacher_code):
        try:
            teacher = Teacher.objects.get(cat=str(teacher_code).strip())
        except Teacher.DoesNotExist:
            return Response({'error': f'No existe un docente con código {teacher_code}.'}, status=status.HTTP_404_NOT_FOUND)

        schedules = (
            TeachersPeriod.objects
            .filter(teacher=teacher)
            .select_related('schedule')
            .order_by('schedule__day', 'schedule__starttime')
        )

        data = [
            {'day': item.schedule.day, 'starttime': item.schedule.starttime, 'endtime': item.schedule.endtime}
            for item in schedules
        ]

        return Response({
            'teacher_id': teacher.id,
            'teacher_code': teacher.cat,
            'teacher_name': teacher.name,
            'total_schedules': len(data),
            'schedules': data,
        })

class ResultReportsView(APIView):
    def get(self, request):
        evaluations = Evaluation.objects.select_related('studentid', 'type').all()
        especial_reports = []
        comprensiva_reports = []

        for eval_obj in evaluations:
            result_obj = Result.objects.filter(evaluationid=eval_obj).first()
            calificacion = result_obj.state if result_obj else "Sin Calificación"
            et_list = EvaluationTeacher.objects.filter(evaluation=eval_obj)
            evaluadores = [et.teacher.name for et in et_list if et.teacher]

            est_name = eval_obj.studentid.name if eval_obj.studentid else "Sin asignar"
            est_id = str(eval_obj.studentid.id) if eval_obj.studentid else "N/A"
            est = eval_obj.studentid.est if eval_obj.studentid else "N/A"
            fecha_str = "Sin fecha"

            if eval_obj.date:
                try:
                    fecha_str = eval_obj.date.strftime("%d/%m/%Y")
                except AttributeError:
                    parts = str(eval_obj.date).split("-")
                    fecha_str = f"{parts[2]}/{parts[1]}/{parts[0]}" if len(parts) == 3 else str(eval_obj.date)

            type_name = eval_obj.type.name if eval_obj.type else ""
            base_data = {
                "id": eval_obj.id,
                "nombre": est_name,
                "idEstudiante": est_id,
                "est": est,
                "fecha": fecha_str,
                "calificacion": calificacion,
                "evaluadores": evaluadores
            }

            if 'Especial' in type_name:
                base_data["curso"] = "Curso de Especialización"
                especial_reports.append(base_data)
            elif 'Comprensiva' in type_name:
                if eval_obj.studentid:
                    try:
                        grupos_rel = StudyGroupStudent.objects.filter(student=eval_obj.studentid).select_related('studygroup')
                        base_data["gruposEstudio"] = [g.studygroup.group for g in grupos_rel if g.studygroup] if grupos_rel.exists() else ["Sin grupo asignado"]
                    except Exception:
                        base_data["gruposEstudio"] = ["Sin grupo asignado"]
                else:
                    base_data["gruposEstudio"] = ["Sin grupo asignado"]
                comprensiva_reports.append(base_data)

        return Response({"especial": especial_reports, "comprensiva": comprensiva_reports})

class UpdateResultCalificacionView(APIView):
    def patch(self, request, evaluation_id):
        state = request.data.get("state")

        valid_states = ["Aprobado", "No Aprobado", "No se Presento"]

        if state not in valid_states:
            return Response(
                {"error": "Calificación no válida"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            evaluation = Evaluation.objects.get(id=evaluation_id)
        except Evaluation.DoesNotExist:
            return Response(
                {"error": "Evaluación no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        result_obj, created = Result.objects.get_or_create(
            evaluationid=evaluation,
            defaults={"state": state}
        )

        if not created:
            result_obj.state = state
            result_obj.save()

        return Response({
            "message": "Calificación actualizada correctamente",
            "created": created,
            "evaluationId": evaluation.id,
            "state": result_obj.state
        })

class SendEmailView(APIView):
    def post(self, request):
        subject = request.data.get('subject', '')
        body = request.data.get('body', '')
        correo_destino = request.data.get('to')

        if not subject or not body or not correo_destino:
            return Response({"error": "Faltan datos de asunto, cuerpo o destino"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv('SENDGRID_API_KEY')
        from_email = os.getenv('DEFAULT_FROM_EMAIL')

        url = "https://api.sendgrid.com/v3/mail/send"
        payload = {
            "personalizations": [{"to": [{"email": correo_destino}]}],
            "from": {"email": from_email},
            "subject": subject,
            "content": [{"type": "text/plain", "value": body}]
        }

        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })

        try:
            with urllib.request.urlopen(req) as response:
                return Response({"message": "Correo enviado con éxito por SendGrid API"}, status=status.HTTP_200_OK)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print("ERROR SENDGRID API:", error_body)
            return Response({"error": error_body}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print("ERROR GENERAL:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)