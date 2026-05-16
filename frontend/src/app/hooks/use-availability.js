import { useEffect, useState } from 'react';
import { availabilityService } from '@/src/app/services/availability-service';

const DAY_NAME_MAP = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3,
  jueves: 4, viernes: 5, sabado: 6, sábado: 6,
};

const parseDay = (day) => {
  const num = parseInt(day, 10);
  if (!isNaN(num)) {
    return num === 7 ? 0 : num;
  }
  return DAY_NAME_MAP[day?.toLowerCase()] ?? -1;
};

const timeToDecimal = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};

/** Maximum number of evaluations/tutoring sessions a teacher can have */
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
 * Availability modes that drive filtering logic.
 * @typedef {'group-mentor' | 'group-evaluator' | 'tutorial-tutor' | 'tutorial-evaluator'} AvailabilityMode
 */

/**
 * @typedef {Object} FilterOptions
 * @property {AvailabilityMode} [mode]
 * @property {number} [studygroupId]  Required when mode needs an exclusion list
 */

/**
 * Custom hook for availability data with mode-based teacher filtering.
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const needsExclusion = studygroupId && (
      mode === 'group-evaluator' || mode === 'tutorial-evaluator'
    );

    const exclusionFetch = needsExclusion
      ? mode === 'group-evaluator'
        ? availabilityService.getStudyGroupTeachers(studygroupId)
        : availabilityService.getCourseTutorials(studygroupId)
      : Promise.resolve([]);

    const appliesEvalCap = Boolean(mode);

    Promise.all([
      availabilityService.getTeachers(),
      availabilityService.getPeriods(),
      availabilityService.getTeacherPeriods(teacherIds),
      exclusionFetch,
    ]).then(([allTeachers, periods, teacherPeriods, exclusionList]) => {

      const excludedIds = new Set(
        exclusionList.map(item => String(item.teacher))
      );

      const filteredTeachers = allTeachers.filter(t => {
        if (appliesEvalCap && (t.evaluationcount ?? 0) >= MAX_EVALUATIONS) return false;
        if (needsExclusion && excludedIds.has(String(t.id))) return false;
        return true;
      });

      // Use String keys so numeric tp.schedule lookup always matches
      const periodMap = Object.fromEntries(periods.map(p => [String(p.id), p]));

      const eligibleIds = new Set(filteredTeachers.map(t => String(t.id)));

      const mapped = teacherPeriods.flatMap(tp => {
        if (appliesEvalCap && !eligibleIds.has(String(tp.teacher))) return [];

        const period = periodMap[String(tp.schedule)];
        if (!period) return [];

        return [{
          docenteId: String(tp.teacher),
          diaSemana: parseDay(period.day),
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