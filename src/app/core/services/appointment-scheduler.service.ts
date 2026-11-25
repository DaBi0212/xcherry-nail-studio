import { Injectable, signal } from '@angular/core';
import {
  Appointment,
  DayScheduleView,
  NailQuote,
  TimeSlotStatus
} from '../models/nail-quote.model';
import { PRICING_CONFIG } from '../config/pricing.config';

@Injectable({
  providedIn: 'root'
})
export class AppointmentSchedulerService {
  private readonly scheduleConfig = PRICING_CONFIG.schedule;

  // Inicia sin reservaciones previas para que todas las horas aparezcan 100% disponibles
  readonly appointments = signal<Appointment[]>([]);
  readonly lastConfirmedAppointment = signal<Appointment | null>(null);

  /**
   * Calcula la fecha mínima permitida para agendar: HOY + 2 DÍAS.
   * Bloquea estrictamente el mismo día (hoy) y el día siguiente (mañana).
   */
  getMinAllowedDate(): Date {
    const now = new Date();
    const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + this.scheduleConfig.minAdvanceDays);
    minDate.setHours(0, 0, 0, 0);
    return minDate;
  }

  getMinAllowedDateIso(): string {
    return this.formatDateIso(this.getMinAllowedDate());
  }

  isDateAllowedByAdvanceRule(dateIso: string): boolean {
    const minIso = this.getMinAllowedDateIso();
    return dateIso >= minIso;
  }

  getSingleDaySchedule(dateIso: string, requiredDurationMinutes: number): DayScheduleView {
    const [y, m, d] = dateIso.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return this.buildDayScheduleView(date, requiredDurationMinutes);
  }

  getWeeklySchedule(weekOffset: number, requiredDurationMinutes: number): DayScheduleView[] {
    const monday = this.getMondayOfCurrentWeek(weekOffset);
    const days: DayScheduleView[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(this.buildDayScheduleView(date, requiredDurationMinutes));
    }

    return days;
  }

  private buildDayScheduleView(date: Date, requiredDurationMinutes: number): DayScheduleView {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const minAllowed = this.getMinAllowedDate();

    const dateIso = this.formatDateIso(date);
    const todayIso = this.formatDateIso(today);
    const tomorrowIso = this.formatDateIso(tomorrow);
    const minAllowedIso = this.formatDateIso(minAllowed);

    const dayOfWeek = date.getDay();
    const isOpen = this.scheduleConfig.openDaysOfWeek.includes(dayOfWeek);
    const isBlockedByAdvanceRule = dateIso < minAllowedIso;

    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const dayAppointments = this.appointments()
      .filter(app => app.dateIso === dateIso && app.status !== 'pending')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const slots = isOpen
      ? this.computeDaySlots(dateIso, dayAppointments, requiredDurationMinutes, isBlockedByAdvanceRule)
      : [];

    return {
      dateIso,
      dayNameShort: dayNamesShort[dayOfWeek],
      dayNameFull: dayNamesFull[dayOfWeek],
      dayNumber: date.getDate(),
      monthShort: monthNamesShort[date.getMonth()],
      isOpen,
      isToday: dateIso === todayIso,
      isTomorrow: dateIso === tomorrowIso,
      isBlockedByAdvanceRule,
      slots,
      appointments: dayAppointments
    };
  }

  private computeDaySlots(
    dateIso: string,
    dayAppointments: Appointment[],
    requiredDurationMinutes: number,
    isBlockedByAdvanceRule: boolean
  ): TimeSlotStatus[] {
    const openMin = this.timeToMinutes(this.scheduleConfig.openingHour);
    const closeMin = this.timeToMinutes(this.scheduleConfig.closingHour);
    const interval = this.scheduleConfig.slotIntervalMinutes;
    const totalNeeded = Math.max(60, requiredDurationMinutes);

    const slots: TimeSlotStatus[] = [];

    for (let startMin = openMin; startMin < closeMin; startMin += interval) {
      const proposedEndMin = startMin + totalNeeded;
      const timeStr = this.minutesToTime(startMin);
      const endTimeStr = this.minutesToTime(proposedEndMin);

      // Regla 0: Mínimo 2 días de anticipación (bloquea hoy, mañana y fechas pasadas)
      if (isBlockedByAdvanceRule) {
        slots.push({
          time: timeStr,
          endTimeIfBooked: endTimeStr,
          available: false,
          reason: 'min-advance-2-days'
        });
        continue;
      }

      // Verificar únicamente si choca con otra cita real que se haya agendado en la sesión
      let conflictApp: Appointment | undefined;
      let isDirectOccupied = false;

      for (const app of dayAppointments) {
        const appStart = this.timeToMinutes(app.startTime);
        const appEnd = this.timeToMinutes(app.endTime);

        if (startMin < appEnd && proposedEndMin > appStart) {
          conflictApp = app;
          isDirectOccupied = startMin >= appStart && startMin < appEnd;
          break;
        }
      }

      if (conflictApp) {
        slots.push({
          time: timeStr,
          endTimeIfBooked: endTimeStr,
          available: false,
          reason: isDirectOccupied ? 'occupied' : 'insufficient-time-before-existing',
          conflictingAppointment: {
            startTime: conflictApp.startTime,
            endTime: conflictApp.endTime,
            label: `${conflictApp.startTime} - ${conflictApp.endTime}`
          }
        });
      } else {
        slots.push({
          time: timeStr,
          endTimeIfBooked: endTimeStr,
          available: true
        });
      }
    }

    return slots;
  }

  bookAppointment(params: {
    clientName: string;
    clientPhone: string;
    clientInstagram?: string;
    clientAddress: string;
    addressReferences: string;
    additionalNotes?: string;
    referenceMediaUrl: string;
    dateIso: string;
    dateFormatted: string;
    startTime: string;
    quote: NailQuote;
  }): Appointment {
    const startMin = this.timeToMinutes(params.startTime);
    const totalBlockedMinutes = params.quote.totalDurationWithTravelMinutes;
    const endMin = startMin + totalBlockedMinutes;

    const newAppointment: Appointment = {
      id: 'XC-' + Date.now().toString().slice(-6),
      clientName: params.clientName.trim(),
      clientPhone: params.clientPhone.trim(),
      clientInstagram: params.clientInstagram?.trim(),
      clientAddress: params.clientAddress.trim(),
      addressReferences: params.addressReferences.trim(),
      additionalNotes: params.additionalNotes?.trim(),
      referenceMediaUrl: params.referenceMediaUrl,
      dateIso: params.dateIso,
      dateFormatted: params.dateFormatted,
      startTime: params.startTime,
      endTime: this.minutesToTime(endMin),
      nailDurationMinutes: params.quote.estimatedCreationMinutes,
      travelBufferMinutes: params.quote.locationFee.estimatedTravelMinutes,
      totalBlockedMinutes,
      quoteSnapshot: params.quote,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    this.appointments.update(list => [...list, newAppointment]);
    this.lastConfirmedAppointment.set(newAppointment);
    return newAppointment;
  }

  buildWhatsAppBotTicketUrl(appointment: Appointment): string {
    const q = appointment.quoteSnapshot;
    const activeAddons = q.items
      .filter(i => i.included && i.category !== 'base' && i.category !== 'length' && i.category !== 'shape')
      .map(i => `  ▫️ ${i.name}: $${i.price} MXN`)
      .join('\n');

    const mapPinLink = q.locationFee.googleMapsUrl;

    const message = [
      `🤖 *XCHERRY NAIL BOT · NUEVO TICKET DE CITA* 🍒🖤`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🎟️ *FOLIO TICKET:* #${appointment.id}`,
      `📅 *FECHA AGENDADA:* ${appointment.dateFormatted} (${appointment.dateIso})`,
      `⏰ *HORARIO BLOQUEADO:* ${appointment.startTime} a ${appointment.endTime} hrs`,
      `⏳ *DURACIÓN TOTAL:* ${appointment.totalBlockedMinutes} min (${appointment.nailDurationMinutes}m uñas + ${appointment.travelBufferMinutes}m traslado)`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *DATOS DE LA CLIENTA:*`,
      `  • *Nombre:* ${appointment.clientName}`,
      `  • *Teléfono / WhatsApp:* ${appointment.clientPhone}`,
      appointment.clientInstagram ? `  • *Instagram:* ${appointment.clientInstagram}` : '',
      `  • *Ubicación / Domicilio:* ${appointment.clientAddress}`,
      `  • *Referencias de Casa:* ${appointment.addressReferences || 'Sin referencias adicionales'}`,
      `  • *Pin Exacto Google Maps:* ${mapPinLink}`,
      appointment.additionalNotes ? `  • *Comentarios:* ${appointment.additionalNotes}` : '',
      `━━━━━━━━━━━━━━━━━━━━`,
      `💅 *DISEÑO & PERSONALIZACIÓN (${q.styleTitle}):*`,
      `  • *Archivo Referencia:* ${q.mediaName}`,
      `  ▫️ Base Soft Gel: $${PRICING_CONFIG.baseService.price} MXN`,
      `  ▫️ Largo ${q.length}: +$${q.items.find(i => i.category === 'length')?.price ?? 0} MXN`,
      `  ▫️ Punta ${q.shape}: +$${q.items.find(i => i.category === 'shape')?.price ?? 0} MXN`,
      activeAddons ? activeAddons : '  ▫️ Sin efectos adicionales',
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *RESUMEN DE PAGO:*`,
      `  • Subtotal Uñas: $${q.nailsSubtotal} MXN`,
      `  • Traslado (${q.locationFee.distanceKm} km): $${q.locationFee.totalLocationFee} MXN`,
      `  🔥 *TOTAL DEL TICKET: $${q.totalFinal} MXN*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📎 _Adjunto en este chat mi Ticket descargado con la foto de referencia de mis uñas._`
    ]
      .filter(line => line !== '')
      .join('\n');

    const phone = PRICING_CONFIG.studioInfo.whatsappNumber;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  private getMondayOfCurrentWeek(weekOffset: number): Date {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + weekOffset * 7);
  }

  formatDateIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  minutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
