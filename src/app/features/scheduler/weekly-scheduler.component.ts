import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteStateService } from '../../core/services/quote-state.service';
import { AppointmentSchedulerService } from '../../core/services/appointment-scheduler.service';
import { DayScheduleView, TimeSlotStatus } from '../../core/models/nail-quote.model';

@Component({
  selector: 'app-weekly-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bg-white border border-[#111111] rounded-2xl p-5 sm:p-7 shadow-sharp relative">
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#111111]/10">
        <div>
          <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-[#B8001F] px-3 py-1 rounded-full">
            <span>Paso 4 de 5</span>
            <span>·</span>
            <span>Calendario de Citas (Mínimo 2 Días de Anticipación)</span>
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
            Elige la Fecha Exacta y Hora de tu Cita
          </h2>
          <p class="text-xs sm:text-sm text-[#111111]/70 mt-1">
            Por preparación de diseño personalizado, las citas se agendan con
            <strong class="text-[#B8001F]">mínimo 2 días de anticipación</strong> (no se permite agendar para hoy ni para mañana).
          </p>
        </div>

        <!-- Exact Date Calendar Picker + Week Navigator -->
        <div class="flex flex-wrap items-center gap-2 bg-[#F9F9F9] border border-[#111111]/20 rounded-xl p-2">
          <div class="flex items-center gap-2 pr-2 border-r border-[#111111]/15">
            <label for="exactDateInput" class="text-[11px] font-bold uppercase tracking-wider text-[#111111]">
              📅 Elegir Fecha Exacta:
            </label>
            <input
              id="exactDateInput"
              type="date"
              [min]="minAllowedDateIso"
              [ngModel]="exactDateInput()"
              (ngModelChange)="onExactDatePicked($event)"
              class="px-2.5 py-1.5 rounded-lg border border-[#111111]/30 bg-white font-mono text-xs font-bold text-[#111111] focus:outline-none focus:border-[#B8001F]"
            />
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              (click)="changeWeek(-1)"
              [disabled]="weekOffset() <= 0"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-white disabled:opacity-35 transition-all"
            >
              ← Ant.
            </button>
            <span class="font-mono text-xs font-bold text-[#111111] px-1.5">
              {{ weekRangeLabel() }}
            </span>
            <button
              type="button"
              (click)="changeWeek(1)"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#111111] text-white hover:bg-[#B8001F] transition-all"
            >
              Sig. →
            </button>
          </div>
        </div>
      </div>

      <!-- Advance Booking Notice Banner -->
      <div class="mt-4 bg-[#FFF0F3] border border-[#B8001F]/35 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 text-[#111111]">
          <span class="text-base">⏳</span>
          <span>
            <strong>Regla de Anticipación Activa:</strong> Hoy y mañana aparecen bloqueados automáticamente. Puedes reservar a partir del
            <strong class="text-[#B8001F] font-mono">{{ minAllowedDateIso }}</strong> en adelante.
          </span>
        </div>
        <span class="font-mono text-[11px] font-bold text-[#111111]">
          Tiempo a bloquear: {{ quoteState.totalRequiredMinutesForAgenda() }} min
        </span>
      </div>

      <!-- Mobile Day Tabs -->
      <div class="flex lg:hidden gap-1.5 overflow-x-auto pb-2 mt-4">
        @for (day of weeklyDays(); track day.dateIso; let idx = $index) {
          <button
            type="button"
            (click)="activeMobileDayIndex.set(idx)"
            class="px-3.5 py-2 rounded-xl border text-center shrink-0 transition-all"
            [ngClass]="activeMobileDayIndex() === idx
              ? 'bg-[#111111] text-white border-[#111111]'
              : day.isBlockedByAdvanceRule
                ? 'bg-[#E8E8E8]/60 text-[#111111]/45 border-dashed border-[#111111]/20'
                : 'bg-[#F9F9F9] text-[#111111] border-[#111111]/15'"
          >
            <div class="text-[10px] uppercase tracking-wider opacity-75">
              {{ day.isToday ? 'HOY' : day.isTomorrow ? 'MAÑANA' : day.dayNameShort }}
            </div>
            <div class="font-mono text-sm font-bold">{{ day.dayNumber }} {{ day.monthShort }}</div>
          </button>
        }
      </div>

      <!-- Weekly Calendar Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-7 gap-3 mt-4">
        @for (day of weeklyDays(); track day.dateIso; let idx = $index) {
          <div
            class="rounded-2xl border p-3 flex flex-col justify-between transition-all"
            [ngClass]="[
              day.isBlockedByAdvanceRule
                ? 'bg-[#F3F3F3] border-dashed border-[#111111]/20 opacity-75'
                : day.isOpen
                  ? 'bg-[#F9F9F9] border-[#111111]/20'
                  : 'bg-[#F9F9F9]/50 border-dashed border-[#111111]/15 opacity-70',
              idx === activeMobileDayIndex() ? 'block' : 'hidden lg:flex'
            ]"
          >
            <div>
              <!-- Day Header -->
              <div class="flex items-center justify-between border-b border-[#111111]/10 pb-2 mb-2.5">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#B8001F] block">
                    {{ day.dayNameFull }}
                  </span>
                  <span class="font-serif text-lg font-bold text-[#111111]">
                    {{ day.dayNumber }} {{ day.monthShort }}
                  </span>
                </div>
                @if (day.isToday) {
                  <span class="text-[9px] font-bold bg-[#111111] text-white px-2 py-0.5 rounded-full">
                    HOY (Bloqueado)
                  </span>
                } @else if (day.isTomorrow) {
                  <span class="text-[9px] font-bold bg-[#111111]/80 text-white px-2 py-0.5 rounded-full">
                    MAÑANA (Bloqueado)
                  </span>
                }
              </div>

              @if (day.isBlockedByAdvanceRule) {
                <div class="py-8 px-2 text-center space-y-1.5">
                  <div class="text-lg">🔒</div>
                  <p class="text-xs font-bold text-[#111111]">
                    No disponible
                  </p>
                  <p class="text-[11px] text-[#111111]/65 leading-snug">
                    Se requieren mínimo 2 días de anticipación para agendar tu cita.
                  </p>
                </div>
              } @else if (day.isOpen) {
                @if (day.appointments.length > 0) {
                  <div class="mb-2.5 space-y-1">
                    @for (app of day.appointments; track app.id) {
                      <div class="text-[10px] bg-[#111111] text-white px-2 py-1 rounded-lg flex items-center justify-between">
                        <span class="truncate">🔒 {{ app.startTime }}-{{ app.endTime }}</span>
                        <span class="text-[#D00024] font-semibold ml-1">Reservado</span>
                      </div>
                    }
                  </div>
                }

                <div class="space-y-1.5">
                  @for (slot of day.slots; track slot.time) {
                    <button
                      type="button"
                      [disabled]="!slot.available"
                      (click)="selectSlot(day, slot)"
                      class="w-full px-2.5 py-2 rounded-xl border text-left transition-all flex items-center justify-between"
                      [ngClass]="isSlotSelected(day.dateIso, slot.time)
                        ? 'bg-[#B8001F] text-white border-[#B8001F] shadow-sm font-bold scale-[1.01]'
                        : slot.available
                          ? 'bg-white text-[#111111] border-[#111111]/20 hover:border-[#B8001F] hover:bg-[#FFF0F3]/40'
                          : 'bg-[#E8E8E8]/70 text-[#111111]/40 border-transparent cursor-not-allowed line-through'"
                    >
                      <div>
                        <span class="font-mono text-xs font-semibold block">
                          {{ slot.time }} → {{ slot.endTimeIfBooked }}
                        </span>
                        @if (!slot.available) {
                          <span class="text-[9px] block no-underline leading-tight mt-0.5">
                            @if (slot.reason === 'occupied') {
                              Ocupado ({{ slot.conflictingAppointment?.label }})
                            } @else if (slot.reason === 'insufficient-time-before-existing') {
                              Empalma con {{ slot.conflictingAppointment?.startTime }}
                            } @else {
                              Excede cierre (20:00)
                            }
                          </span>
                        }
                      </div>

                      @if (isSlotSelected(day.dateIso, slot.time)) {
                        <span class="text-xs">🍒</span>
                      } @else if (slot.available) {
                        <span class="text-[10px] font-semibold text-[#B8001F]">Elegir</span>
                      }
                    </button>
                  }
                </div>
              } @else {
                <div class="py-8 text-center text-xs text-[#111111]/50">
                  Domingo de descanso
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Selected Date & Time Banner -->
      @if (quoteState.selectedScheduleDateIso() && quoteState.selectedScheduleSlot()) {
        <div class="mt-6 bg-[#111111] text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-2 border-[#B8001F]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#B8001F] text-white flex items-center justify-center text-lg">
              📅
            </div>
            <div>
              <span class="text-[10px] uppercase tracking-widest text-[#FFF0F3] block">Horario válido seleccionado</span>
              <h3 class="font-serif text-xl sm:text-2xl font-bold text-white">
                {{ quoteState.selectedScheduleDayLabel() }} · {{ quoteState.selectedScheduleSlot()!.time }} a {{ quoteState.selectedScheduleSlot()!.endTimeIfBooked }} hrs
              </h3>
            </div>
          </div>
          <span class="font-mono text-xs bg-white/10 px-3 py-1.5 rounded-lg text-[#FFF0F3]">
            Cumple +2 días de anticipación ✓
          </span>
        </div>
      }

      <!-- Step 4 Footer Navigation -->
      <div class="mt-7 pt-5 border-t border-[#111111]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          (click)="prevStep.emit()"
          class="w-full sm:w-auto btn-outline-dark px-5 py-3 text-xs sm:text-sm font-semibold rounded-xl"
        >
          ← Volver al Paso 3 (Ubicación)
        </button>

        <button
          type="button"
          [disabled]="!quoteState.selectedScheduleDateIso() || !quoteState.selectedScheduleSlot()"
          (click)="nextStep.emit()"
          class="w-full sm:w-auto btn-cherry px-7 py-3.5 text-sm font-bold rounded-xl"
        >
          <span>Continuar al Paso 5: Tus Datos y Ticket Oficial</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  `
})
export class WeeklySchedulerComponent implements OnInit {
  readonly quoteState = inject(QuoteStateService);
  readonly schedulerService = inject(AppointmentSchedulerService);

  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  readonly minAllowedDateIso = this.schedulerService.getMinAllowedDateIso();
  readonly weekOffset = signal<number>(0);
  readonly activeMobileDayIndex = signal<number>(2);
  readonly exactDateInput = signal<string>(this.minAllowedDateIso);

  readonly weeklyDays = computed<DayScheduleView[]>(() => {
    const requiredMin = this.quoteState.totalRequiredMinutesForAgenda();
    this.schedulerService.appointments();
    return this.schedulerService.getWeeklySchedule(this.weekOffset(), requiredMin);
  });

  readonly weekRangeLabel = computed<string>(() => {
    const days = this.weeklyDays();
    if (!days.length) return '';
    const first = days[0];
    const last = days[days.length - 1];
    return `${first.dayNumber} ${first.monthShort} - ${last.dayNumber} ${last.monthShort}`;
  });

  ngOnInit(): void {
    // Seleccionar automáticamente el primer día disponible que cumpla con los +2 días de anticipación
    const days = this.weeklyDays();
    const firstAllowedIdx = days.findIndex(d => !d.isBlockedByAdvanceRule && d.isOpen);
    if (firstAllowedIdx >= 0) {
      this.activeMobileDayIndex.set(firstAllowedIdx);
      const day = days[firstAllowedIdx];
      const firstOpenSlot = day.slots.find(s => s.available);
      if (firstOpenSlot && !this.quoteState.selectedScheduleSlot()) {
        this.selectSlot(day, firstOpenSlot);
      }
    } else {
      // Si la semana actual ya no tiene días abiertos con +2 días (ej. viernes/sábado), avanzar a la siguiente semana
      this.changeWeek(1);
    }
  }

  changeWeek(delta: number): void {
    const next = Math.max(0, this.weekOffset() + delta);
    this.weekOffset.set(next);
    const days = this.weeklyDays();
    const firstAllowedIdx = days.findIndex(d => !d.isBlockedByAdvanceRule && d.isOpen);
    if (firstAllowedIdx >= 0) {
      this.activeMobileDayIndex.set(firstAllowedIdx);
    }
  }

  onExactDatePicked(dateIso: string): void {
    if (!dateIso || !this.schedulerService.isDateAllowedByAdvanceRule(dateIso)) {
      return;
    }
    this.exactDateInput.set(dateIso);

    // Calcular en qué semana cae esa fecha respecto al lunes actual
    const [y, m, d] = dateIso.split('-').map(Number);
    const targetDate = new Date(y, (m || 1) - 1, d || 1);
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const diffDays = Math.floor((targetDate.getTime() - currentMonday.getTime()) / (1000 * 60 * 60 * 24));
    const targetWeekOffset = Math.max(0, Math.floor(diffDays / 7));

    this.weekOffset.set(targetWeekOffset);
    const days = this.weeklyDays();
    const idx = days.findIndex(dayItem => dayItem.dateIso === dateIso);
    if (idx >= 0) {
      this.activeMobileDayIndex.set(idx);
      const pickedDay = days[idx];
      const firstAvailable = pickedDay.slots.find(s => s.available) || null;
      if (firstAvailable) {
        this.selectSlot(pickedDay, firstAvailable);
      }
    }
  }

  selectSlot(day: DayScheduleView, slot: TimeSlotStatus): void {
    if (!slot.available || day.isBlockedByAdvanceRule) return;
    this.exactDateInput.set(day.dateIso);
    this.quoteState.setSelectedSchedule(
      day.dateIso,
      `${day.dayNameFull} ${day.dayNumber} ${day.monthShort}`,
      slot
    );
  }

  isSlotSelected(dateIso: string, time: string): boolean {
    return (
      this.quoteState.selectedScheduleDateIso() === dateIso &&
      this.quoteState.selectedScheduleSlot()?.time === time
    );
  }
}
