import { useEffect, useState } from 'react';
import { availabilityService } from '@/src/app/services/availability-service';

const DAY_MAP = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3,
  jueves: 4, viernes: 5, sábado: 6,
};

const timeToDecimal = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};

/** limit of evaluations/tutoring sessions allowed */
const MAX_EVALUATIONS = 15;

/**
 * @typedef {Object} Teacher
 * @property {number} id
 * @property {string} name
 * @property {number|null} evaluationcount
 */

/**
 * @typedef {Object} AvailabilityEvent
 * @property {string} docenteId
 * @property {number} diaSemana
 * @property {number} inicio
 * @property {number} fin
 */

/**
 * filter options for availability data, used to determine exclusion lists and filtering logic:
 *
 * @typedef {Object} FilterOptions
 * @property {'comprehensive' | 'special'} [mode]
 * @property {number} [studygroupId]
 */

/**
 * Custom hook for availability data with optional teacher filtering.
 *
 * @param {number[]} [teacherIds] 
 * @param {FilterOptions} [filterOptions]   
 * @returns {{ teachers: Teacher[], events: AvailabilityEvent[], loading: boolean }}
 */
export function useAvailability(teacherIds = [], filterOptions = {}) {
  const { mode, studygroupId } = filterOptions;

  /** @type {[Teacher[], Function]} */
  const [teachers, setTeachers] = useState([]);
  /** @type {[AvailabilityEvent[], Function]} */
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);

    // Decide filter of exclusion list based on mode:
    const exclusionFetch = mode && studygroupId
      ? mode === 'comprehensive'
        ? availabilityService.getStudyGroupTeachers(studygroupId)   
        : availabilityService.getCourseTutorials(studygroupId)      
      : Promise.resolve([]);

    Promise.all([
      availabilityService.getTeachers(),
      availabilityService.getPeriods(),
      availabilityService.getTeacherPeriods(teacherIds),
      exclusionFetch,
    ]).then(([allTeachers, periods, teacherPeriods, exclusionList]) => {

      const excludedIds = new Set(
        exclusionList.map(item => String(item.teacher))
      );

      // Filter teachers based on mode and exclusion list, and also by evaluation count if in a mode:
      const filteredTeachers = mode && studygroupId
        ? allTeachers.filter(t =>
            !excludedIds.has(String(t.id)) &&
            (t.evaluationcount ?? 0) < MAX_EVALUATIONS
          )
        : allTeachers;

      // Construye el mapa de periodos
      const periodMap = Object.fromEntries(periods.map(p => [p.id, p]));

      // Construye un set rápido de IDs elegibles para filtrar eventos
      const eligibleIds = new Set(filteredTeachers.map(t => String(t.id)));

      // Mapea los periodos a eventos, omitiendo los docentes excluidos o con límite alcanzado
      const mapped = teacherPeriods.flatMap(tp => {
        // Omite si el docente no está en la lista elegible (excluido por rol o por límite)
        if (mode && studygroupId && !eligibleIds.has(String(tp.teacher))) return [];

        const period = periodMap[tp.schedule];
        if (!period) return [];

        return [{
          docenteId: String(tp.teacher),
          diaSemana: DAY_MAP[period.day.toLowerCase()] ?? -1,
          inicio: timeToDecimal(period.starttime),
          fin: timeToDecimal(period.endtime),
        }];
      });

      setTeachers(filteredTeachers);
      setEvents(mapped);
      setLoading(false);
    });
  }, [JSON.stringify(teacherIds), mode, studygroupId]);

  return { teachers, events, loading };
}