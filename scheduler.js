const TIME_SLOTS = ['07:00', '10:00', '14:00', '16:00'];
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function generateSchedules(routes, wards, startDate = new Date()) {
  if (!routes.length) throw new Error('No routes assigned');

  const usedSlots = {};
  const schedules = [];
  const truckMap = {};

  for (const route of routes) {
    if (!truckMap[route.truckName]) truckMap[route.truckName] = [];
    truckMap[route.truckName].push(route.wardName);
  }

  for (const truck of Object.keys(truckMap)) {
    let dayOffset = 0;
    for (const ward of truckMap[truck]) {
      const wardData = wards.find(w => w.wardName === ward);
      const supervisor = wardData ? wardData.supervisor : 'N/A';
      const area = wardData ? wardData.areaName : 'N/A';

      for (let visit = 0; visit < 3; visit++) {
        let assigned = false;
        while (!assigned && dayOffset < 365) {
          const dateObj = new Date(startDate);
          dateObj.setDate(dateObj.getDate() + dayOffset);
          const date = formatDate(dateObj);
          const day = WEEK_DAYS[dateObj.getDay()];

          for (const time of TIME_SLOTS) {
            const key = `${date}_${time}`;
            if (!usedSlots[key]) usedSlots[key] = { trucks: [], supervisors: [], truckAreas: [] };
            const slot = usedSlots[key];
            const sameTruckTime = slot.trucks.includes(truck);
            const sameSupervisorTime = slot.supervisors.includes(supervisor);
            const sameTruckSameArea = slot.truckAreas.includes(`${truck}_${area}`);

            if (!sameTruckTime && !sameSupervisorTime && !sameTruckSameArea) {
              schedules.push({ truck, ward, supervisor, area, date, day, time });
              slot.trucks.push(truck);
              slot.supervisors.push(supervisor);
              slot.truckAreas.push(`${truck}_${area}`);
              assigned = true;
              break;
            }
          }
          dayOffset++;
        }
        if (!assigned) throw new Error('Could not generate a collision-free schedule within one year');
      }
    }
  }
  return schedules;
}

module.exports = { generateSchedules, TIME_SLOTS, WEEK_DAYS };
