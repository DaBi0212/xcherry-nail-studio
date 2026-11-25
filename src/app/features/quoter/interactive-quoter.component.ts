import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteStateService } from '../../core/services/quote-state.service';
import { PRICING_CONFIG } from '../../core/config/pricing.config';
import { NailLength } from '../../core/models/nail-quote.model';

@Component({
  selector: 'app-interactive-quoter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-white border border-[#111111] rounded-2xl p-5 sm:p-7 shadow-sharp">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#111111]/10">
        <div>
          <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-[#B8001F] px-3 py-1 rounded-full">
            <span>Paso 2 de 5</span>
            <span>·</span>
            <span>Personalización de Uñas</span>
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
            Personaliza tu Diseño y Ajusta tu Presupuesto
          </h2>
          <p class="text-xs sm:text-sm text-[#111111]/70 mt-1">
            Modifica el largo, la forma o activa/desactiva efectos, dibujo a mano alzada y pedrería. El precio se actualiza al instante.
          </p>
        </div>

        <!-- Reference Mini Badge + Instant Subtotal Pill -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2.5 bg-[#F9F9F9] border border-[#111111]/20 rounded-xl p-2 pr-3">
            @if (quoteState.mediaType() !== 'video') {
              <img [src]="quoteState.mediaPreviewUrl()" alt="Ref" class="w-10 h-10 rounded-lg object-cover border border-[#111111]" />
            }
            <div class="text-xs">
              <span class="text-[10px] text-[#111111]/60 block">Referencia activa</span>
              <span class="font-bold text-[#111111] truncate max-w-[130px] block">{{ quoteState.styleTitle() }}</span>
            </div>
          </div>

          <div class="bg-[#F9F9F9] border-2 border-[#111111] rounded-2xl px-4 py-2.5 flex items-center gap-4">
            <div>
              <span class="text-[10px] uppercase tracking-wider text-[#111111]/60 block">Subtotal Uñas</span>
              <span class="font-mono text-xl sm:text-2xl font-bold text-[#B8001F]">
                \${{ quoteState.nailsSubtotal() }} <span class="text-xs font-normal text-[#111111]">MXN</span>
              </span>
            </div>
            <div class="w-px h-8 bg-[#111111]/15"></div>
            <div>
              <span class="text-[10px] uppercase tracking-wider text-[#111111]/60 block">Tiempo Uñas</span>
              <span class="font-mono text-base sm:text-lg font-bold text-[#111111]">
                {{ quoteState.estimatedCreationMinutes() }} min
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 1: Base Soft Gel Mandatory Card -->
      <div class="mt-5 bg-[#FFF0F3]/60 border border-[#B8001F]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#B8001F] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            01
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm sm:text-base text-[#111111]">
                {{ baseConfig.name }}
              </h3>
              <span class="text-[10px] font-semibold uppercase tracking-wider bg-[#111111] text-white px-2 py-0.5 rounded-full">
                Incluido
              </span>
            </div>
            <p class="text-xs text-[#111111]/75 mt-1">{{ baseConfig.description }}</p>
            <p class="text-[11px] text-[#B8001F] font-medium mt-0.5">Proceso: {{ baseConfig.processDetail }}</p>
          </div>
        </div>

        <div class="flex sm:flex-col items-center sm:items-end justify-between shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#B8001F]/20">
          <span class="font-mono text-lg font-bold text-[#111111]">\${{ baseConfig.price }} MXN</span>
          <span class="font-mono text-xs text-[#111111]/65">{{ baseConfig.durationMinutes }} min</span>
        </div>
      </div>

      <!-- STEP 2: Length & Shape Interactive Selectors -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <!-- Selector de Largo -->
        <div class="bg-[#F9F9F9] border border-[#111111]/15 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <label for="lengthSelect" class="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <span class="w-5 h-5 rounded bg-[#111111] text-white font-mono text-[10px] inline-flex items-center justify-center">02</span>
              <span>Selecciona el Largo (Soft Gel Tip)</span>
            </label>
            <span class="font-mono text-xs font-semibold text-[#B8001F]">
              +\${{ quoteState.lengthItem().price }} MXN · +{{ quoteState.lengthItem().durationMinutes }}m
            </span>
          </div>

          <div class="grid grid-cols-4 gap-2 mb-3">
            @for (len of lengthOptions; track len) {
              <button
                type="button"
                (click)="quoteState.setLength(len)"
                class="py-2 px-2 rounded-xl border text-center transition-all"
                [ngClass]="quoteState.selectedLength() === len
                  ? 'bg-[#111111] text-white border-[#111111] shadow-sm font-semibold'
                  : 'bg-white text-[#111111] border-[#111111]/20 hover:border-[#B8001F]'"
              >
                <div class="text-xs">{{ len }}</div>
                <div class="font-mono text-[10px] opacity-80">
                  {{ lengthsConfig[len].extraPrice === 0 ? 'Incluido' : '+$' + lengthsConfig[len].extraPrice }}
                </div>
              </button>
            }
          </div>

          <select
            id="lengthSelect"
            [value]="quoteState.selectedLength()"
            (change)="onLengthSelectChange($event)"
            class="w-full px-3 py-2 rounded-lg border border-[#111111]/25 bg-white text-xs font-medium text-[#111111] focus:outline-none focus:border-[#B8001F]"
          >
            @for (len of lengthOptions; track len) {
              <option [value]="len">
                {{ lengthsConfig[len].label }} — {{ lengthsConfig[len].extraPrice === 0 ? 'Sin costo extra' : '+$' + lengthsConfig[len].extraPrice + ' MXN' }}
              </option>
            }
          </select>
        </div>

        <!-- Selector de Forma / Punta -->
        <div class="bg-[#F9F9F9] border border-[#111111]/15 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
              <span class="w-5 h-5 rounded bg-[#111111] text-white font-mono text-[10px] inline-flex items-center justify-center">03</span>
              <span>Forma de Punta</span>
            </span>
            <span class="font-mono text-xs font-semibold text-[#B8001F]">
              +\${{ quoteState.shapeItem().price }} MXN · +{{ quoteState.shapeItem().durationMinutes }}m
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            @for (shape of shapesConfig; track shape.id) {
              <button
                type="button"
                (click)="quoteState.setShape(shape.id)"
                class="py-2.5 px-2.5 rounded-xl border text-left transition-all flex flex-col justify-between"
                [ngClass]="quoteState.selectedShape() === shape.id
                  ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                  : 'bg-white text-[#111111] border-[#111111]/20 hover:border-[#B8001F]'"
              >
                <div class="text-xs font-bold">{{ shape.id }}</div>
                <div class="font-mono text-[10px] mt-1" [ngClass]="quoteState.selectedShape() === shape.id ? 'text-[#FFF0F3]' : 'text-[#111111]/60'">
                  {{ shape.extraPrice === 0 ? 'Base $0' : '+$' + shape.extraPrice + ' MXN' }}
                </div>
              </button>
            }
          </div>
          <p class="text-[11px] text-[#111111]/70 mt-2.5">
            {{ quoteState.shapeItem().description }}
          </p>
        </div>
      </div>

      <!-- STEP 3: Toggleable Effects, Freehand Art & Charms/Rhinestones -->
      <div class="mt-6 space-y-6">
        <!-- Category 1: Estilo y Efectos Especiales -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-serif text-xl font-bold text-[#111111] flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#B8001F] text-white font-sans text-xs font-bold inline-flex items-center justify-center">4</span>
              <span>Estilo y Efectos Especiales (Chrome, Aura, Cat-Eye, 3D)</span>
            </h3>
            <span class="text-xs text-[#111111]/60">Activa o desactiva con un toque</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (item of effectAddons(); track item.id) {
              <label
                class="cursor-pointer rounded-xl p-3.5 border transition-all flex items-start justify-between gap-3 select-none"
                [ngClass]="item.included
                  ? 'bg-[#FFF0F3]/45 border-[#B8001F] shadow-sm'
                  : 'bg-[#F9F9F9] border-[#111111]/15 hover:border-[#111111]/40 opacity-85'"
              >
                <div class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    [checked]="item.included"
                    (change)="quoteState.toggleAddonItem(item.id)"
                    class="mt-1 w-4 h-4 accent-[#B8001F] rounded cursor-pointer"
                  />
                  <div>
                    <div class="flex flex-wrap items-center gap-1.5">
                      <span class="text-sm font-bold text-[#111111]">{{ item.name }}</span>
                      @if (item.detectedConfidence) {
                        <span class="text-[10px] font-semibold bg-[#111111] text-white px-2 py-0.5 rounded-full">
                          Detectado por IA
                        </span>
                      }
                      @if (item.badge) {
                        <span class="text-[10px] font-semibold bg-[#B8001F]/15 text-[#B8001F] px-2 py-0.5 rounded-full">
                          {{ item.badge }}
                        </span>
                      }
                    </div>
                    <p class="text-xs text-[#111111]/75 mt-1 leading-relaxed">{{ item.description }}</p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-mono text-sm font-bold block" [ngClass]="item.included ? 'text-[#B8001F]' : 'text-[#111111]'">
                    +\${{ item.price }}
                  </span>
                  <span class="font-mono text-[11px] text-[#111111]/60 block">
                    +{{ item.durationMinutes }} min
                  </span>
                </div>
              </label>
            }
          </div>
        </div>

        <!-- Category 2: Mano Alzada, Pedrería, Charms y Relieves -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-serif text-xl font-bold text-[#111111] flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#111111] text-white font-sans text-xs font-bold inline-flex items-center justify-center">5</span>
              <span>Detalles, Dibujo a Mano Alzada, Pedrería y Charms</span>
            </h3>
            <span class="text-xs text-[#111111]/60">Ajusta según tu presupuesto</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (item of artAndJewelryAddons(); track item.id) {
              <label
                class="cursor-pointer rounded-xl p-3.5 border transition-all flex items-start justify-between gap-3 select-none"
                [ngClass]="item.included
                  ? 'bg-[#FFF0F3]/45 border-[#B8001F] shadow-sm'
                  : 'bg-[#F9F9F9] border-[#111111]/15 hover:border-[#111111]/40 opacity-85'"
              >
                <div class="flex items-start gap-3">
                  <input
                    type="checkbox"
                    [checked]="item.included"
                    (change)="quoteState.toggleAddonItem(item.id)"
                    class="mt-1 w-4 h-4 accent-[#B8001F] rounded cursor-pointer"
                  />
                  <div>
                    <div class="flex flex-wrap items-center gap-1.5">
                      <span class="text-sm font-bold text-[#111111]">{{ item.name }}</span>
                      @if (item.detectedConfidence) {
                        <span class="text-[10px] font-semibold bg-[#111111] text-white px-2 py-0.5 rounded-full">
                          Detectado por IA
                        </span>
                      }
                      @if (item.badge) {
                        <span class="text-[10px] font-semibold bg-[#B8001F]/15 text-[#B8001F] px-2 py-0.5 rounded-full">
                          {{ item.badge }}
                        </span>
                      }
                    </div>
                    <p class="text-xs text-[#111111]/75 mt-1 leading-relaxed">{{ item.description }}</p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-mono text-sm font-bold block" [ngClass]="item.included ? 'text-[#B8001F]' : 'text-[#111111]'">
                    +\${{ item.price }}
                  </span>
                  <span class="font-mono text-[11px] text-[#111111]/60 block">
                    +{{ item.durationMinutes }} min
                  </span>
                </div>
              </label>
            }
          </div>
        </div>
      </div>

      <!-- Step 2 Footer Navigation -->
      <div class="mt-7 pt-5 border-t border-[#111111]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          (click)="prevStep.emit()"
          class="w-full sm:w-auto btn-outline-dark px-5 py-3 text-xs sm:text-sm font-semibold rounded-xl"
        >
          ← Volver al Paso 1 (Referencia)
        </button>

        <button
          type="button"
          (click)="nextStep.emit()"
          class="w-full sm:w-auto btn-cherry px-7 py-3.5 text-sm font-bold rounded-xl"
        >
          <span>Continuar al Paso 3: Ubicación a Domicilio</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  `
})
export class InteractiveQuoterComponent {
  readonly quoteState = inject(QuoteStateService);

  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  readonly baseConfig = PRICING_CONFIG.baseService;
  readonly lengthsConfig = PRICING_CONFIG.lengths;
  readonly lengthOptions: NailLength[] = ['Corto', 'Mediano', 'Largo', 'XL'];
  readonly shapesConfig = PRICING_CONFIG.shapes;

  readonly effectAddons = computed(() =>
    this.quoteState.addonItems().filter(item => item.category === 'effect')
  );

  readonly artAndJewelryAddons = computed(() =>
    this.quoteState.addonItems().filter(item => item.category === 'art' || item.category === 'jewelry')
  );

  onLengthSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.quoteState.setLength(select.value as NailLength);
  }
}
