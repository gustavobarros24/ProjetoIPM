<script lang="ts">
import { defineComponent } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, CalendarOptions, EventClickArg } from '@fullcalendar/core'
import Skeleton from './Skeleton.vue'

export default defineComponent({
  name: 'Calendar',
  components: { FullCalendar, Skeleton },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    events: {
      type: Array as () => EventInput[],
      default: () => [],
    },
    eventClick: {
      type: Function as unknown as new () => (arg: EventClickArg) => void,
      required: false,
    },
  },
  data() {
    const baseOptions: CalendarOptions = {
      dayHeaderClassNames: 'calendar-day-headers',
      slotLabelClassNames: 'calendar-day-headers',
      headerToolbar: false,
      allDaySlot: false,
      plugins: [timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      weekends: false,
      dayHeaderFormat: { weekday: 'short' },
      
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',
      slotEventOverlap: false,
      displayEventTime: false,
      height: 'auto',
      eventInteractive: true, // accessibility
      // dayHeaderContent: (arg) => `<div>${arg.text}</div>`, // Customize header rendering
      dayHeaderDidMount: (arg) => arg.el.removeAttribute('role'), // remove aria role to prevent pa11y errors
      dayCellDidMount: (arg) => arg.el.removeAttribute('role'), // remove aria role to prevent pa11y errors
      viewDidMount: (arg) => {
        // remove aria role to prevent pa11y errors
        arg.el.querySelectorAll('tr, th, td, thead').forEach((el) => {
          el.removeAttribute('role')
        })

        arg.el
          .querySelectorAll('.fc-col-header table[role="presentation"]')
          .forEach((tbl) => tbl.removeAttribute('role'))

        arg.el
          .querySelectorAll(
            '.fc-col-header table[role="presentation"], ' +
              '.fc-scrollgrid-section-body table[role="presentation"], ' +
              'table[role="presentation"] > tbody[role="presentation"]',
          )
          .forEach((el) => {
            el.removeAttribute('role')
          })

        // only remove role="presentation" from the nested header table
        document
          .querySelectorAll('.fc-col-header table[role="presentation"]')
          .forEach((el) => el.removeAttribute('role'))

        const headerTable = document.querySelector('table > thead > tr > th > div > div > table')
        if (headerTable) {
          headerTable.removeAttribute('role')
        }
      },
    }

    return {
      baseOptions,
    }
  },
  computed: {
    calendarOptions(): CalendarOptions {
      return {
        ...this.baseOptions,
        events: this.events,
        eventClick: this.eventClick,
      }
    },
  },
})
</script>

<template>
  <Skeleton v-if="loading" class="skeleton-table" />

  <FullCalendar v-else :options="calendarOptions" class="calendar">
    <template v-slot:eventContent="arg">
      <b aria-label="Event Title">{{ arg.event.title }}</b>
      <p class="event-p event-capacity" aria-label="Event Capacity">
        {{ arg.event.extendedProps.enrolledCount }}/{{
          arg.event.extendedProps.classroom?.capacity
        }}
        alunos
      </p>
      <p class="event-p" aria-label="Event Location">
        {{ arg.event.extendedProps.building.abbreviation }}-{{
          arg.event.extendedProps.classroom.name
        }}
      </p>
    </template>
  </FullCalendar>
</template>

<style>
.skeleton-table {
  height: 500px;
}

.calendar-day-headers {
  background-color: black;
  color: white;
}

.calendar {
  tr:first-child td:first-child {
    background-color: black;
    color: white;
  }
}

.event-p {
  font-size: 10px;
}

.event-capacity {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dashed {
  border: dashed 3px #cccccc;
}

.solid {
  border: solid 3px;
}

.fc .fc-event.solid {
  cursor: not-allowed;
}

.fc .fc-event {
  overflow: hidden;
  padding-left: 3px;
  box-shadow: none;
}


.fc a.available {
  background-color: white;
  border: solid 2px rgb(2, 2, 2); /*var(--color-border);*/
  cursor: pointer;

  div {
    color: black;
  }
}

.fc a.conflict {
  background-color: hsl(0, 100%, 82%);
  border: dashed 2px hsl(0, 100%, 38%);
  cursor: pointer;

  div {
    color: hsl(0, 100%, 38%);
  }
}

.fc a.subscribed {
  background-color: #f0f0f0;
  /*border: solid 2px #d5d5d5;*/
  border:none;
  cursor:default;

  div {
    color: black;
  }
}

.fc a.old-subscribed {
  background-color: #f0f0f0;
  border: dashed 2px #000000; /*var(--color-border);*/

  div {
    color: black;
  }
}

.fc a.subscribed-matchcourse {
  background-color: #f0f0f0;
  border: solid 2px #000000;
  cursor:not-allowed;
  div {
    color: black;
  }
}

.fc a.selected {
  background-color: hsl(212, 100%, 82%);
  border: dashed 2px hsl(210, 100%, 38%);
  cursor: pointer;

  div {
    color: hsl(210, 100%, 38%);
  }
}

.fc a.selected-normal-cursor {
  cursor: default !important;
}

.fc-theme-standard .fc-scrollgrid {
  background-color: white !important;
}

.fc-theme-standard .fc-timegrid-slots,
.fc-theme-standard .fc-timegrid-axis,
.fc-theme-standard .fc-col-header {
  background-color: white !important;
}

/* background black in timeslots axis */
.fc-timegrid-slots table:nth-child(1) tbody:nth-child(2) tr td:nth-child(1) {
  background-color: black;
}


/* Hide half-hour lines (dotted) */
.fc-timegrid-slots .fc-timegrid-slot.fc-timegrid-slot-lane.fc-timegrid-slot-minor {
  border-top-style: none !important;
}



</style>
