import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuoteStateService } from '../../core/services/quote-state.service';
import { AppointmentSchedulerService } from '../../core/services/appointment-scheduler.service';
import { PRICING_CONFIG } from '../../core/config/pricing.config';
import { Appointment } from '../../core/models/nail-quote.model';

@Component({
  selector: 'app-client-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="bg-white border border-[#111111] rounded-2xl p-5 sm:p-7 shadow-sharp">
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#111111]/10">
        <div>
          <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-[#B8001F] px-3 py-1 rounded-full">
            <span>Paso 5 de 5</span>
            <span>·</span>
            <span>Datos Personales, Ticket Descargable & Bot WhatsApp</span>
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
            Confirma tus Datos y Genera tu Ticket Oficial
          </h2>
          <p class="text-xs sm:text-sm text-[#111111]/70 mt-1">
            Completa tus datos para descargar tu <strong>Ticket Oficial con tu foto de referencia</strong> y enviarlo automáticamente al WhatsApp de <strong>XCHERRY ({{ studio.whatsappDisplay }})</strong>.
          </p>
        </div>

        <!-- Selected Schedule Pill -->
        @if (quoteState.selectedScheduleSlot(); as slot) {
          <div class="bg-[#111111] text-white px-4 py-2.5 rounded-xl text-xs">
            <span class="text-[10px] uppercase tracking-wider text-[#D00024] font-bold block">Fecha y Hora Elegida</span>
            <span class="font-mono font-bold">{{ quoteState.selectedScheduleDayLabel() }} · {{ slot.time }} - {{ slot.endTimeIfBooked }}</span>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 mt-6 items-start">
        <!-- Left 6 Cols: Complete Personal Data Form -->
        <div class="lg:col-span-6 bg-[#F9F9F9] border border-[#111111]/20 rounded-2xl p-5">
          <h3 class="font-serif text-xl font-bold text-[#111111] pb-3 mb-4 border-b border-[#111111]/10">
            1. Tus Datos de Contacto y Referencia
          </h3>

          <form [formGroup]="checkoutForm" (ngSubmit)="generateTicketAndBook()" class="space-y-4">
            <!-- Nombre Completo -->
            <div>
              <label class="block text-xs font-bold text-[#111111] mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                formControlName="clientName"
                placeholder="Ej. Valeria Mendoza"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
              />
            </div>

            <!-- Teléfono y Usuario Instagram -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs font-bold text-[#111111] mb-1">
                  Número Telefónico / WhatsApp *
                </label>
                <input
                  type="tel"
                  formControlName="clientPhone"
                  placeholder="Ej. 222 123 4567"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#B8001F]"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#111111] mb-1">
                  Instagram (Opcional)
                </label>
                <input
                  type="text"
                  formControlName="clientInstagram"
                  placeholder="Ej. @vale.pue"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
                />
              </div>
            </div>

            <!-- Ubicación confirmada -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-[#111111]">
                  Ubicación / Dirección a Domicilio *
                </label>
                <a
                  [href]="quoteState.locationFee().googleMapsUrl"
                  target="_blank"
                  rel="noopener"
                  class="text-[11px] font-semibold text-[#B8001F] hover:underline"
                >
                  📍 Ver pin elegido en Mapa ↗
                </a>
              </div>
              <input
                type="text"
                formControlName="clientAddress"
                placeholder="Calle, número exterior/interior, colonia, Puebla..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
              />
            </div>

            <!-- Referencias del domicilio -->
            <div>
              <label class="block text-xs font-bold text-[#111111] mb-1">
                Referencias del Domicilio (Fachada, portón, entre calles) *
              </label>
              <input
                type="text"
                formControlName="addressReferences"
                placeholder="Ej. Casa fachada blanca con portón negro, frente al parque..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
              />
            </div>

            <!-- Comentarios opcionales -->
            <div>
              <label class="block text-xs font-bold text-[#111111] mb-1">
                Comentarios Adicionales (Opcional)
              </label>
              <textarea
                rows="2"
                formControlName="additionalNotes"
                placeholder="Ej. Necesito retiro de gel anterior, o algún color específico que quieras comentar..."
                class="w-full px-3.5 py-2 rounded-xl border border-[#111111]/25 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
              ></textarea>
            </div>

            <!-- Imagen de uñas de referencia -->
            <div class="bg-white border border-[#111111]/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 rounded-lg overflow-hidden border border-[#111111] bg-[#111111] shrink-0">
                  @if (quoteState.mediaType() === 'video') {
                    <video [src]="quoteState.mediaPreviewUrl()" class="w-full h-full object-cover" muted></video>
                  } @else {
                    <img [src]="quoteState.mediaPreviewUrl()" alt="Referencia de uñas" class="w-full h-full object-cover" />
                  }
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#B8001F] block">
                    Imagen de Uñas de Referencia
                  </span>
                  <span class="text-xs font-bold text-[#111111] block truncate max-w-[180px]">
                    {{ quoteState.styleTitle() }}
                  </span>
                  <span class="text-[11px] text-[#111111]/65 block">
                    Incluida automáticamente en tu Ticket
                  </span>
                </div>
              </div>

              <label class="cursor-pointer text-xs font-semibold text-[#111111] hover:text-[#B8001F] bg-[#F9F9F9] border border-[#111111]/25 px-3 py-2 rounded-lg transition-colors shrink-0">
                <span>Cambiar foto</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  (change)="onReferenceImageChange($event)"
                />
              </label>
            </div>

            <button
              type="submit"
              [disabled]="checkoutForm.invalid"
              class="w-full btn-cherry py-3.5 text-sm font-bold rounded-xl"
            >
              <span>🎟️ Generar Ticket Oficial y Confirmar Cita</span>
            </button>
          </form>
        </div>

        <!-- Right 6 Cols: Official Visual Ticket + Download PNG & Send to Girlfriend's WhatsApp Bot (2213900561) -->
        <div class="lg:col-span-6 space-y-4">
          <!-- Official Boutique Ticket Card -->
          <div class="bg-[#111111] text-white rounded-2xl p-5 sm:p-6 border-2 border-[#111111] shadow-sharp-cherry relative overflow-hidden">
            <!-- Top Ticket Notch Decoration -->
            <div class="flex items-center justify-between border-b border-dashed border-white/25 pb-4">
              <div class="flex items-center gap-3">
                <img
                  src="assets/logo-xcherry.png"
                  alt="XCHERRY NAIL STUDIO"
                  class="w-14 h-14 rounded-full bg-white p-0.5 border border-[#B8001F]"
                />
                <div>
                  <span class="text-[10px] uppercase tracking-[0.22em] text-[#D00024] font-bold block">
                    Ticket Oficial de Cita
                  </span>
                  <h3 class="font-serif text-2xl font-bold text-white leading-none mt-0.5">
                    XCHERRY NAIL STUDIO
                  </h3>
                  <span class="text-[11px] text-white/65 italic font-serif">"Cherry soul, dark heart" · Puebla, Pue.</span>
                </div>
              </div>

              <div class="text-right">
                <span class="text-[10px] uppercase tracking-wider text-white/60 block">Folio</span>
                <span class="font-mono text-sm font-bold bg-[#B8001F] text-white px-2.5 py-1 rounded-lg inline-block mt-0.5">
                  #{{ currentTicketFolio() }}
                </span>
              </div>
            </div>

            <!-- Reference Nail Image + Main Details Row -->
            <div class="grid grid-cols-12 gap-4 py-4 border-b border-dashed border-white/20 items-center">
              <div class="col-span-4">
                <div class="aspect-square rounded-xl overflow-hidden border-2 border-[#B8001F] bg-black relative">
                  @if (quoteState.mediaType() === 'video') {
                    <video [src]="quoteState.mediaPreviewUrl()" class="w-full h-full object-cover" muted autoplay loop playsinline></video>
                  } @else {
                    <img [src]="quoteState.mediaPreviewUrl()" alt="Referencia" class="w-full h-full object-cover" />
                  }
                  <span class="absolute bottom-1 inset-x-1 bg-black/80 text-white text-[9px] text-center py-0.5 rounded font-semibold">
                    Foto Referencia
                  </span>
                </div>
              </div>

              <div class="col-span-8 space-y-1.5 text-xs">
                <div>
                  <span class="text-[10px] uppercase tracking-wider text-white/55 block">Clienta & Contacto</span>
                  <span class="font-bold text-sm text-white block">
                    {{ checkoutForm.value.clientName || 'Nombre de la clienta' }}
                  </span>
                  <span class="font-mono text-xs text-[#FFF0F3]">
                    📱 {{ checkoutForm.value.clientPhone || 'Sin teléfono' }}
                    @if (checkoutForm.value.clientInstagram) {
                      <span> · {{ checkoutForm.value.clientInstagram }}</span>
                    }
                  </span>
                </div>

                <div class="pt-1">
                  <span class="text-[10px] uppercase tracking-wider text-white/55 block">Fecha y Hora Reservada</span>
                  <span class="font-mono text-xs font-bold text-[#D00024] bg-white/10 px-2.5 py-1 rounded inline-block mt-0.5">
                    📅 {{ quoteState.selectedScheduleDayLabel() || 'Fecha por elegir' }} ·
                    {{ quoteState.selectedScheduleSlot()?.time || '10:00' }} a {{ quoteState.selectedScheduleSlot()?.endTimeIfBooked || '12:00' }} hrs
                  </span>
                </div>
              </div>
            </div>

            <!-- Location & References Section -->
            <div class="py-3.5 border-b border-dashed border-white/20 text-xs space-y-1">
              <span class="text-[10px] uppercase tracking-wider text-white/55 block">Ubicación a Domicilio & Referencias</span>
              <p class="font-semibold text-white">
                📍 {{ checkoutForm.value.clientAddress }}
              </p>
              <p class="text-white/75">
                🏠 <strong>Referencias:</strong> {{ checkoutForm.value.addressReferences || 'Sin referencias especificadas' }}
              </p>
              @if (checkoutForm.value.additionalNotes) {
                <p class="text-[#FFF0F3]/85 italic">
                  💬 <strong>Comentarios:</strong> "{{ checkoutForm.value.additionalNotes }}"
                </p>
              }
            </div>

            <!-- Itemized Breakdown -->
            <div class="py-3.5 border-b border-dashed border-white/20 space-y-1.5 text-xs">
              <span class="text-[10px] uppercase tracking-wider text-white/55 block mb-1">
                Desglose del Diseño ({{ quoteState.styleTitle() }})
              </span>

              <div class="flex justify-between text-white/90">
                <span>• Base Soft Gel + Largo {{ quoteState.selectedLength() }} ({{ quoteState.selectedShape() }})</span>
                <span class="font-mono">\${{ quoteState.baseItem().price + quoteState.lengthItem().price + quoteState.shapeItem().price }} MXN</span>
              </div>

              @for (item of quoteState.activeAddonItems(); track item.id) {
                <div class="flex justify-between text-white/80">
                  <span class="truncate pr-2">• {{ item.name }}</span>
                  <span class="font-mono">+\${{ item.price }} MXN</span>
                </div>
              }

              <div class="flex justify-between text-white/90 pt-1 border-t border-white/10">
                <span>• Traslado a Domicilio ({{ quoteState.locationFee().distanceKm }} km)</span>
                <span class="font-mono">+\${{ quoteState.locationFee().totalLocationFee }} MXN</span>
              </div>
            </div>

            <!-- Total Final -->
            <div class="pt-4 flex items-baseline justify-between">
              <div>
                <span class="text-[10px] uppercase tracking-widest text-white/60 block">Total Final a Pagar</span>
                <span class="text-[11px] text-white/70">Duración total: {{ quoteState.totalRequiredMinutesForAgenda() }} min</span>
              </div>
              <span class="font-mono text-3xl font-bold text-white">
                \${{ quoteState.totalFinal() }} <span class="text-sm font-normal text-[#D00024]">MXN</span>
              </span>
            </div>
          </div>

          <!-- Dual Action Buttons: 1) Download Client Ticket PNG + 2) Send Bot Ticket to Girlfriend's WhatsApp (2213900561) -->
          <div class="bg-[#FFF0F3] border-2 border-[#B8001F] rounded-2xl p-4 sm:p-5 space-y-3">
            @if (ticketConfirmed()) {
              <div class="bg-emerald-950 text-emerald-200 border border-emerald-600/40 rounded-xl px-3.5 py-2.5 text-xs font-medium flex items-center gap-2">
                <span>✅</span>
                <span>¡Tu Ticket <strong>#{{ currentTicketFolio() }}</strong> está listo! Descárgalo abajo y envíalo al Bot de WhatsApp para finalizar.</span>
              </div>
            }

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Button 1: Client Downloads PNG Ticket -->
              <button
                type="button"
                (click)="downloadClientTicketPng()"
                [disabled]="isGeneratingPng()"
                class="w-full bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📥 {{ isGeneratingPng() ? 'Generando Imagen...' : '1. Descargar Mi Ticket (PNG)' }}</span>
              </button>

              <!-- Button 2: Send Automated Bot Message to Girlfriend's WhatsApp 2213900561 -->
              <button
                type="button"
                (click)="sendTicketToWhatsAppBot()"
                class="w-full bg-[#25D366] hover:bg-[#1EBE5A] text-[#111111] font-bold text-xs sm:text-sm py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>🤖 2. Enviar Ticket por WhatsApp ({{ studio.whatsappDisplay }})</span>
              </button>
            </div>

            <p class="text-[11px] text-[#111111]/75 text-center leading-snug">
              Al tocar <strong>"Enviar Ticket por WhatsApp"</strong>, se enviará automáticamente toda la ficha del ticket (datos, ubicación en Google Maps, referencias, desglose y total) al número <strong>{{ studio.whatsappDisplay }}</strong>.
            </p>
          </div>
        </div>
      </div>

      <!-- Step 5 Footer Navigation -->
      <div class="mt-7 pt-5 border-t border-[#111111]/15 flex items-center justify-between">
        <button
          type="button"
          (click)="prevStep.emit()"
          class="btn-outline-dark px-5 py-3 text-xs sm:text-sm font-semibold rounded-xl"
        >
          ← Volver al Paso 4 (Fecha y Hora)
        </button>
      </div>
    </section>
  `
})
export class ClientCheckoutComponent implements OnInit {
  readonly quoteState = inject(QuoteStateService);
  readonly schedulerService = inject(AppointmentSchedulerService);
  private readonly fb = inject(FormBuilder);

  @Output() prevStep = new EventEmitter<void>();

  readonly studio = PRICING_CONFIG.studioInfo;
  readonly isGeneratingPng = signal<boolean>(false);
  readonly ticketConfirmed = signal<boolean>(false);
  readonly generatedFolio = signal<string>('XC-' + Date.now().toString().slice(-6));

  readonly checkoutForm = this.fb.nonNullable.group({
    clientName: ['', [Validators.required, Validators.minLength(2)]],
    clientPhone: ['', [Validators.required, Validators.minLength(8)]],
    clientInstagram: [''],
    clientAddress: ['', [Validators.required]],
    addressReferences: ['', [Validators.required]],
    additionalNotes: ['']
  });

  readonly currentTicketFolio = computed(() => {
    const confirmed = this.schedulerService.lastConfirmedAppointment();
    return confirmed ? confirmed.id : this.generatedFolio();
  });

  ngOnInit(): void {
    const loc = this.quoteState.locationFee();
    this.checkoutForm.patchValue({
      clientAddress: loc.clientAddress,
      addressReferences: loc.referenceNotes || 'Portón negro, frente a parque'
    });
  }

  onReferenceImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        this.quoteState.mediaPreviewUrl.set(dataUrl);
        this.quoteState.mediaName.set(file.name);
        this.quoteState.mediaType.set('image');
      };
      reader.readAsDataURL(file);
    }
  }

  generateTicketAndBook(): Appointment {
    const raw = this.checkoutForm.getRawValue();
    const slot = this.quoteState.selectedScheduleSlot();
    const dateIso = this.quoteState.selectedScheduleDateIso() || this.schedulerService.getMinAllowedDateIso();
    const dateFormatted = this.quoteState.selectedScheduleDayLabel() || dateIso;

    // Actualizar dirección y referencias en el estado de cotización
    const currentLoc = this.quoteState.locationFee();
    this.quoteState.updateHomeServiceLocation({
      requiresHomeService: currentLoc.requiresHomeService,
      clientAddress: raw.clientAddress || currentLoc.clientAddress,
      referenceNotes: raw.addressReferences,
      clientLat: currentLoc.clientCoordinates.lat,
      clientLng: currentLoc.clientCoordinates.lng
    });

    const appointment = this.schedulerService.bookAppointment({
      clientName: raw.clientName || 'Clienta XCHERRY',
      clientPhone: raw.clientPhone || 'Sin teléfono',
      clientInstagram: raw.clientInstagram,
      clientAddress: raw.clientAddress || currentLoc.clientAddress,
      addressReferences: raw.addressReferences || 'Sin referencias',
      additionalNotes: raw.additionalNotes,
      referenceMediaUrl: this.quoteState.mediaPreviewUrl(),
      dateIso,
      dateFormatted,
      startTime: slot?.time || '11:00',
      quote: this.quoteState.currentQuote()
    });

    this.ticketConfirmed.set(true);
    return appointment;
  }

  async sendTicketToWhatsAppBot(): Promise<void> {
    const appointment = this.schedulerService.lastConfirmedAppointment() || this.generateTicketAndBook();
    const botUrl = this.schedulerService.buildWhatsAppBotTicketUrl(appointment);
    window.open(botUrl, '_blank', 'noopener');
  }

  /**
   * Renderiza el Ticket Oficial en un Canvas HTML5 de alta resolución (incluyendo logo oficial,
   * foto de referencia de las uñas, folio, datos personales, ubicación, referencias y desglose)
   * y lo descarga como archivo PNG en el dispositivo de la clienta.
   */
  async downloadClientTicketPng(): Promise<void> {
    this.isGeneratingPng.set(true);
    try {
      const appointment = this.schedulerService.lastConfirmedAppointment() || this.generateTicketAndBook();
      const q = appointment.quoteSnapshot;

      const canvas = document.createElement('canvas');
      canvas.width = 860;
      canvas.height = 1360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fondo principal oscuro elegante con tarjeta interior blanca
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Borde rojo cereza interior
      ctx.strokeStyle = '#B8001F';
      ctx.lineWidth = 4;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      // Encabezado del Ticket
      ctx.fillStyle = '#B8001F';
      ctx.fillRect(26, 26, canvas.width - 52, 145);

      // Cargar logo oficial
      try {
        const logoImg = await this.loadImage('assets/logo-xcherry.png');
        ctx.save();
        ctx.beginPath();
        ctx.arc(98, 98, 48, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(logoImg, 50, 50, 96, 96);
        ctx.restore();
      } catch {
        // Fallback si el logo no carga
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px Georgia, serif';
      ctx.fillText('XCHERRY NAIL STUDIO', 165, 82);

      ctx.fillStyle = '#FFF0F3';
      ctx.font = 'italic 18px Georgia, serif';
      ctx.fillText('"Cherry soul, dark heart" · Soft Gel a Domicilio (Puebla)', 165, 112);

      ctx.font = 'bold 16px monospace';
      ctx.fillText(`FOLIO: #${appointment.id}   |   WHATSAPP STUDIO: 221 390 0561`, 165, 145);

      // Cuerpo blanco del Ticket
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(44, 190, canvas.width - 88, canvas.height - 235);

      // Foto de referencia de las uñas (esquina superior derecha del cuerpo)
      if (q.mediaType !== 'video') {
        try {
          const refImg = await this.loadImage(q.mediaPreviewUrl);
          ctx.save();
          ctx.fillStyle = '#111111';
          ctx.fillRect(canvas.width - 275, 215, 205, 205);
          ctx.drawImage(refImg, canvas.width - 271, 219, 197, 197);
          ctx.fillStyle = '#B8001F';
          ctx.fillRect(canvas.width - 275, 392, 205, 28);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText('IMAGEN DE REFERENCIA', canvas.width - 252, 411);
          ctx.restore();
        } catch {
          // Continuar si es video o imagen externa
        }
      }

      let y = 238;
      const leftX = 72;

      // Sección 1: Fecha y Hora Reservada
      ctx.fillStyle = '#B8001F';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('1. FECHA Y HORARIO RESERVADO (MÍN. 2 DÍAS DE ANTICIPACIÓN)', leftX, y);
      y += 28;
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${appointment.dateFormatted} (${appointment.dateIso})`, leftX, y);
      y += 28;
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#B8001F';
      ctx.fillText(`Horario: ${appointment.startTime} a ${appointment.endTime} hrs (${appointment.totalBlockedMinutes} min)`, leftX, y);

      // Sección 2: Datos Personales de la Clienta
      y += 45;
      ctx.fillStyle = '#B8001F';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('2. DATOS DE LA CLIENTA', leftX, y);
      y += 26;
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 19px sans-serif';
      ctx.fillText(`Clienta: ${appointment.clientName}`, leftX, y);
      y += 25;
      ctx.font = '17px monospace';
      ctx.fillText(`Teléfono / WhatsApp: ${appointment.clientPhone}`, leftX, y);
      if (appointment.clientInstagram) {
        y += 24;
        ctx.fillText(`Instagram: ${appointment.clientInstagram}`, leftX, y);
      }

      // Sección 3: Ubicación y Referencias
      y = Math.max(y + 45, 455);
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftX, y - 20);
      ctx.lineTo(canvas.width - 72, y - 20);
      ctx.stroke();

      ctx.fillStyle = '#B8001F';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('3. UBICACIÓN A DOMICILIO Y REFERENCIAS (PUEBLA, PUE.)', leftX, y);
      y += 26;
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 16px sans-serif';
      y = this.drawWrappedText(ctx, `Dirección: ${appointment.clientAddress}`, leftX, y, canvas.width - 144, 22);
      y += 6;
      ctx.font = '15px sans-serif';
      y = this.drawWrappedText(ctx, `Referencias: ${appointment.addressReferences}`, leftX, y, canvas.width - 144, 21);
      if (appointment.additionalNotes) {
        y += 6;
        ctx.fillStyle = '#555555';
        ctx.font = 'italic 15px sans-serif';
        y = this.drawWrappedText(ctx, `Comentarios: "${appointment.additionalNotes}"`, leftX, y, canvas.width - 144, 21);
      }

      // Sección 4: Desglose de Diseño y Costos
      y += 34;
      ctx.strokeStyle = '#E5E5E5';
      ctx.beginPath();
      ctx.moveTo(leftX, y - 16);
      ctx.lineTo(canvas.width - 72, y - 16);
      ctx.stroke();

      ctx.fillStyle = '#B8001F';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`4. DESGLOSE DE TU DISEÑO: ${q.styleTitle.toUpperCase()}`, leftX, y);
      y += 28;

      const drawRow = (label: string, amount: string, bold = false) => {
        ctx.fillStyle = '#111111';
        ctx.font = bold ? 'bold 17px sans-serif' : '16px sans-serif';
        ctx.fillText(label, leftX, y);
        ctx.font = bold ? 'bold 18px monospace' : '16px monospace';
        const w = ctx.measureText(amount).width;
        ctx.fillText(amount, canvas.width - 72 - w, y);
        y += 26;
      };

      drawRow(`• ${PRICING_CONFIG.baseService.name}`, `$${PRICING_CONFIG.baseService.price} MXN`);
      const lenPrice = q.items.find(i => i.category === 'length')?.price ?? 0;
      const shpPrice = q.items.find(i => i.category === 'shape')?.price ?? 0;
      drawRow(`• Largo ${q.length} + Punta ${q.shape}`, `+$${lenPrice + shpPrice} MXN`);

      const activeAddons = q.items.filter(
        i => i.included && i.category !== 'base' && i.category !== 'length' && i.category !== 'shape'
      );
      for (const addon of activeAddons) {
        drawRow(`• ${addon.name}`, `+$${addon.price} MXN`);
      }

      y += 6;
      drawRow(`Subtotal Servicio de Uñas (${q.estimatedCreationMinutes} min)`, `$${q.nailsSubtotal} MXN`, true);
      drawRow(`Costo de Traslado a Domicilio (${q.locationFee.distanceKm} km)`, `+$${q.locationFee.totalLocationFee} MXN`);

      // Caja Total Final
      y += 14;
      ctx.fillStyle = '#111111';
      ctx.fillRect(leftX, y, canvas.width - 144, 74);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('TOTAL FINAL DEL TICKET', leftX + 24, y + 44);

      const totalText = `$${q.totalFinal} MXN`;
      ctx.fillStyle = '#FFF0F3';
      ctx.font = 'bold 30px monospace';
      const tw = ctx.measureText(totalText).width;
      ctx.fillText(totalText, canvas.width - 96 - tw, y + 47);

      // Pie de Ticket
      ctx.fillStyle = '#555555';
      ctx.font = '13px sans-serif';
      ctx.fillText(
        'Conserva este ticket · Dudas o cambios vía WhatsApp al 221 390 0561 · @xcherry.nails',
        leftX,
        canvas.height - 62
      );

      // Descargar archivo PNG
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Ticket-XCHERRY-${appointment.id}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      this.isGeneratingPng.set(false);
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = err => reject(err);
      img.src = src;
    });
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  }
}
