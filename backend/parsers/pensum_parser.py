import xlrd
from orbis_database.models import Faculty, Career, Course


# Column indices in the pensum sheet (0-based)
COL_FACULTY = 2   
COL_CAREER  = 3   
COL_COURSE  = 5   

# Row where actual data starts (rows 0-5 are title/header rows)
DATA_START_ROW = 6

# Max lengths must match the CharField(max_length=N) in models.py
MAX_FACULTY = 50
MAX_CAREER  = 50
MAX_COURSE  = 50


def _clean(value, max_length=None):
    """Strip whitespace, normalize empty cells to None, and optionally truncate."""
    text = str(value).strip() if value else ""
    if not text:
        return None
    if max_length and len(text) > max_length:
        text = text[:max_length]
    return text


def parse_pensum(file_obj):
    """
    Read an XLS/XLSX pensum file and upsert Faculty, Career and Course records.

    Args:
        file_obj: A Django InMemoryUploadedFile (or any file-like object).

    Returns:
        dict with counts of created/skipped records per model.
    """
    contents = file_obj.read()
    workbook = xlrd.open_workbook(file_contents=contents)
    sheet = workbook.sheet_by_index(0)

    stats = {
        "faculties": {"created": 0, "skipped": 0},
        "careers":   {"created": 0, "skipped": 0},
        "courses":   {"created": 0, "skipped": 0},
    }

    # collect unique (faculty, career, course) combinations 
    faculty_names = set()
    career_entries = {}   
    course_entries = []   

    for row_idx in range(DATA_START_ROW, sheet.nrows):
        row = sheet.row_values(row_idx)

        faculty_name = _clean(row[COL_FACULTY], MAX_FACULTY)
        career_name  = _clean(row[COL_CAREER],  MAX_CAREER)
        course_name  = _clean(row[COL_COURSE],  MAX_COURSE)

        # Skip incomplete rows
        if not all([faculty_name, career_name, course_name]):
            continue

        faculty_names.add(faculty_name)

        if career_name not in career_entries:
            career_entries[career_name] = faculty_name

        course_entries.append((faculty_name, career_name, course_name))

    # upsert Faculty 
    faculty_map = {}  # Faculty instance

    for name in faculty_names:
        obj, created = Faculty.objects.get_or_create(name=name)
        faculty_map[name] = obj
        stats["faculties"]["created" if created else "skipped"] += 1

    # upsert Career 
    career_map = {}  # Career instance

    for career_name, faculty_name in career_entries.items():
        obj, created = Career.objects.get_or_create(name=career_name)
        career_map[career_name] = obj
        stats["careers"]["created" if created else "skipped"] += 1

    # upsert Course 
    seen_courses = set()  # avoid duplicates within the same file

    for faculty_name, career_name, course_name in course_entries:
        dedup_key = (career_name, course_name)
        if dedup_key in seen_courses:
            stats["courses"]["skipped"] += 1
            continue
        seen_courses.add(dedup_key)

        faculty = faculty_map.get(faculty_name)
        career  = career_map.get(career_name)

        if not faculty or not career:
            stats["courses"]["skipped"] += 1
            continue

        _, created = Course.objects.get_or_create(
            name=course_name,
            career=career,
            faculty=faculty,
        )
        stats["courses"]["created" if created else "skipped"] += 1

    return stats