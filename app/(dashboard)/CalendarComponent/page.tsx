"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

type CalendarEvent = {
  id?: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
};

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: any) => void;
  onDateClick?: (date: string) => void;
}

export default function CalendarComponent({
  events,
  onEventClick,
  onDateClick,
}: CalendarProps) {
  return (
    <div className="border rounded-xl p-3 bg-white shadow-sm w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        }}
        height="80vh"
        events={events}
        eventClick={(info) => {
          if (onEventClick) onEventClick(info.event);
        }}
        dateClick={(info) => {
          if (onDateClick) onDateClick(info.dateStr);
        }}
        editable={false}
        selectable={true}
        eventDisplay="block"
        eventBorderColor="#4b5563"
        eventTextColor="#1f2937"
      />
    </div>
  );
}
