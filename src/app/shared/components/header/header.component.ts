import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PRICING_CONFIG } from '../../../core/config/pricing.config';
import { WizardStep } from '../../../core/models/nail-quote.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Dark Coquette Announcement Bar -->
    <div class="bg-[#111111] text-white text-xs py-2 px-4 border-b border-[#B8001F]/40">
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-[#D00024] animate-pulse"></span>
          <span class="font-serif italic tracking-wider text-sm text-[#FFF0F3]">"{{ studio.slogan }}"</span>
          <span class="hidden sm:inline text-white/40">|</span>
          <span class="hidden sm:inline text-white/80 tracking-wide">{{ studio.specialty }} · 📍 {{ studio.city }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[11px] font-mono text-white/80 hidden xs:inline">WhatsApp: {{ studio.whatsappDisplay }}</span>
          <a
            href="https://instagram.com/xcherry.nails"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-white/90 hover:text-[#D00024] transition-colors font-medium"
          >
            <span>{{ studio.instagramHandle }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Main Boutique Header with prominent XCHERRY NAIL STUDIO logo -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#111111]/15">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <!-- Brand Logo & Title -->
        <button type="button" (click)="selectStep.emit(1)" class="flex items-center gap-3.5 group text-left">
          <div class="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 border-[#111111] p-0.5 bg-white shadow-sharp group-hover:border-[#B8001F] transition-colors overflow-hidden shrink-0">
            <img
              src="assets/logo-xcherry.png"
              alt="XCHERRY NAIL STUDIO Logo Oficial"
              class="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full"
            />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#B8001F] bg-[#FFF0F3] border border-[#B8001F]/30 px-2 py-0.5 rounded-full">
                Soft Gel Boutique
              </span>
              <span class="text-[10px] uppercase tracking-widest text-[#111111]/60 hidden xs:inline">
                Puebla, Pue.
              </span>
            </div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] leading-none mt-0.5">
              XCHERRY <span class="font-normal italic text-[#B8001F]">Nail Studio</span>
            </h1>
          </div>
        </button>

        <!-- Live Quote Summary Pill -->
        <div class="flex items-center gap-2.5 bg-[#111111] text-white px-3.5 py-2 rounded-xl shadow-sm">
          <div class="text-left">
            <div class="text-[10px] uppercase tracking-wider text-white/70 leading-none">Total Actual</div>
            <div class="font-mono text-sm sm:text-base font-semibold leading-tight">
              \${{ totalFinal }} <span class="text-[10px] font-normal">MXN</span>
            </div>
          </div>
          <span class="w-px h-6 bg-white/20"></span>
          <div class="text-xs font-mono text-[#FFF0F3] flex items-center gap-1">
            <span>Paso {{ currentStep }}/5</span>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() totalFinal = 0;
  @Input() totalMinutes = 0;
  @Input() currentStep: WizardStep = 1;
  @Output() selectStep = new EventEmitter<WizardStep>();

  readonly studio = PRICING_CONFIG.studioInfo;
}
