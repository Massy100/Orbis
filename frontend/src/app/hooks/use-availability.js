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

/**
 * @typedef {Object} Teacher
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} AvailabilityEvent
 * @property {string} docenteId
 * @property {number} diaSemana
 * @property {number} inicio
 * @property {number} fin
 */

/**
 * Custom hook for availability data
 * @param {number[]} [teacherIds]
 * @returns {{ teachers: Teacher[], events: AvailabilityEvent[], loading: boolean }}
 */
export function useAvailability(teacherIds = []) {
  /** @type {Teacher[]} */
  const [teachers, setTeachers] = useState([]);
  /** @type {AvailabilityEvent[]} */
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      availabilityService.getTeachers(),
      availabilityService.getPeriods(),
      availabilityService.getTeacherPeriods(teacherIds),
    ]).then(([allTeachers, periods, teacherPeriods]) => {

      const periodMap = Object.fromEntries(periods.map(p => [p.id, p]));

      const mapped = teacherPeriods.flatMap(tp => {
        const period = periodMap[tp.schedule];
        if (!period) return [];
        return [{
          docenteId: String(tp.teacher),
          diaSemana: DAY_MAP[period.day.toLowerCase()] ?? -1,
          inicio: timeToDecimal(period.starttime),
          fin: timeToDecimal(period.endtime),
        }];
      });

      setTeachers(allTeachers);
      setEvents(mapped);
      setLoading(false);
    });
  }, [JSON.stringify(teacherIds)]);

  return { teachers, events, loading };
}