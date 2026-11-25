import { Component, ElementRef, EventEmitter, Output, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteStateService } from '../../core/services/quote-state.service';
import { NailAnalyzerService } from '../../core/services/nail-analyzer.service';
import { XCHERRY_PORTFOLIO_PRESETS } from '../../core/config/pricing.config';
import { PortfolioPreset } from '../../core/models/nail-quote.model';

@Component({
  selector: 'app-reference-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bg-white border border-[#111111] rounded-2xl p-5 sm:p-7 shadow-sharp relative overflow-hidden">
      <!-- Step Header -->
      <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#111111]/10">
        <div>
          <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-[#B8001F] px-3 py-1 rounded-full">
            <span>Paso 1 de 5</span>
            <span>·</span>
            <span>Tu Referencia</span>
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
            Sube la Imagen o Video de las Uñas que Quieres
          </h2>
          <p class="text-xs sm:text-sm text-[#111111]/70 mt-1">
            Sube tu captura de Instagram, Pinterest o TikTok. Nuestra IA detectará automáticamente el largo, forma, efectos, dibujo y tiempo estimado.
          </p>
        </div>

        <!-- Gemini Vision API Key Optional Config Toggle -->
        <button
          type="button"
          (click)="showApiConfig.set(!showApiConfig())"
          class="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-[#111111]/20 bg-[#F9F9F9] hover:border-[#B8001F] text-[#111111] flex items-center gap-1.5 transition-colors"
        >
          <span class="w-2 h-2 rounded-full" [ngClass]="analyzerService.hasGeminiApiKey() ? 'bg-emerald-600' : 'bg-[#B8001F]'"></span>
          <span>{{ analyzerService.hasGeminiApiKey() ? 'Gemini Vision API Activa' : 'Modo IA: Smart Mock' }}</span>
        </button>
      </div>

      @if (showApiConfig()) {
        <div class="mt-4 p-4 rounded-xl bg-[#F9F9F9] border border-[#111111]/20 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-[#111111]">Conectar Google Gemini Vision API (Opcional)</span>
            <button type="button" (click)="showApiConfig.set(false)" class="text-[#111111]/50 hover:text-[#111111]">✕</button>
          </div>
          <div class="flex gap-2">
            <input
              type="password"
              [(ngModel)]="apiKeyInput"
              placeholder="AIzaSy..."
              class="flex-1 px-3 py-2 rounded-lg border border-[#111111]/25 bg-white font-mono text-xs focus:outline-none focus:border-[#B8001F]"
            />
            <button
              type="button"
              (click)="saveApiKey()"
              class="bg-[#111111] hover:bg-[#B8001F] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Guardar Key
            </button>
          </div>
        </div>
      }

      <!-- Main Grid: Dropzone + Live Media Preview & Detection Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        <!-- Left Column: Drag & Drop + Portfolio Presets -->
        <div class="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
            class="cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] relative"
            [ngClass]="isDragging() ? 'border-[#B8001F] bg-[#FFF0F3]/60 scale-[1.01]' : 'border-[#111111]/30 bg-[#F9F9F9] hover:border-[#B8001F] hover:bg-[#FFF0F3]/25'"
          >
            <input
              #fileInput
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,image/*,video/mp4,video/quicktime"
              class="hidden"
              (change)="onFileSelected($event)"
            />

            <div class="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center mb-3 shadow-md">
              <svg class="w-7 h-7 text-[#D00024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <p class="font-serif text-xl font-bold text-[#111111]">
              Toca aquí para subir tu imagen o video de referencia
            </p>
            <p class="text-xs text-[#111111]/65 mt-1 max-w-xs">
              Formatos: <span class="font-mono">.jpg, .png, .webp, .mp4, .mov</span>. Esta imagen también se incluirá en tu ticket final.
            </p>

            <div class="mt-4">
              <span class="btn-cherry text-xs py-2.5 px-5 rounded-xl">
                📸 Elegir Foto o Video de Galería
              </span>
            </div>

            @if (errorMessage()) {
              <p class="mt-3 text-xs font-medium text-[#B8001F] bg-[#FFF0F3] px-3 py-1 rounded-lg border border-[#B8001F]/30">
                {{ errorMessage() }}
              </p>
            }
          </div>

          <!-- Quick Demo Samples from @xcherry.nails Instagram Feed -->
          <div class="bg-[#F9F9F9] border border-[#111111]/15 rounded-xl p-3.5">
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-[#111111]/80">
                🍒 O elige un diseño del catálogo &#64;xcherry.nails:
              </span>
              <span class="text-[10px] text-[#B8001F] font-medium">Toca para analizar</span>
            </div>

            <div class="grid grid-cols-5 gap-2">
              @for (preset of presets; track preset.id) {
                <button
                  type="button"
                  (click)="selectPreset(preset)"
                  class="group relative rounded-lg overflow-hidden border-2 transition-all aspect-square"
                  [ngClass]="quoteState.mediaPreviewUrl() === preset.imageUrl ? 'border-[#B8001F] ring-2 ring-[#B8001F]/30 scale-[1.02]' : 'border-transparent hover:border-[#111111]'"
                  [title]="preset.title"
                >
                  <img
                    [src]="preset.imageUrl"
                    [alt]="preset.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1">
                    <p class="text-[9px] text-white font-medium truncate leading-tight">
                      {{ preset.shape }}
                    </p>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Right Column: Uploaded Reference Preview + 6 Automatic AI Detections -->
        <div class="lg:col-span-6">
          <div class="bg-[#F9F9F9] border border-[#111111]/20 rounded-2xl p-4 h-full flex flex-col justify-between relative">
            @if (quoteState.isAnalyzing()) {
              <div class="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <div class="w-12 h-12 rounded-full border-3 border-[#111111] border-t-[#B8001F] animate-spin mb-3"></div>
                <p class="font-serif text-xl font-bold text-[#111111]">
                  Analizando tu referencia con IA...
                </p>
                <p class="text-xs text-[#111111]/65 mt-1">
                  Detectando largo, forma, efectos, mano alzada y costo base
                </p>
              </div>
            }

            <div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <div class="w-36 h-44 sm:w-40 sm:h-48 rounded-xl overflow-hidden border-2 border-[#111111] bg-[#111111] shrink-0 relative shadow-sm">
                @if (quoteState.mediaType() === 'video') {
                  <video
                    [src]="quoteState.mediaPreviewUrl()"
                    class="w-full h-full object-cover"
                    autoplay
                    loop
                    muted
                    playsinline
                    controls
                  ></video>
                  <span class="absolute top-2 left-2 bg-[#B8001F] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    VIDEO
                  </span>
                } @else {
                  <img
                    [src]="quoteState.mediaPreviewUrl()"
                    [alt]="quoteState.styleTitle()"
                    class="w-full h-full object-cover"
                  />
                  <span class="absolute top-2 left-2 bg-[#111111]/85 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    TU REFERENCIA
                  </span>
                }
                <div class="absolute bottom-2 right-2 bg-white/95 text-[#111111] font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#111111]">
                  IA {{ (quoteState.confidenceScore() * 100) | number:'1.0-0' }}%
                </div>
              </div>

              <div class="flex-1 text-left">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#B8001F] text-white px-2.5 py-0.5 rounded-full">
                    ✦ Resultado del Análisis
                  </span>
                </div>

                <h3 class="font-serif text-xl sm:text-2xl font-bold text-[#111111] mt-1.5 leading-snug">
                  {{ quoteState.styleTitle() }}
                </h3>

                <p class="text-xs text-[#111111]/75 mt-1.5 leading-relaxed bg-white p-2.5 rounded-xl border border-[#111111]/10">
                  {{ quoteState.aiSummary() }}
                </p>

                <div class="mt-2.5 flex items-center justify-between bg-[#111111] text-white px-3.5 py-2 rounded-xl">
                  <span class="text-xs text-white/80">Cotización inicial detectada:</span>
                  <span class="font-mono text-base font-bold text-[#FFF0F3]">\${{ quoteState.nailsSubtotal() }} MXN</span>
                </div>
              </div>
            </div>

            <!-- 6 Automatic Detection Badges -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
              <div class="bg-white border border-[#111111]/15 rounded-xl p-2.5">
                <span class="text-[10px] uppercase tracking-wider text-[#111111]/55 block">1. Base</span>
                <span class="text-xs font-bold text-[#111111] mt-0.5 block">Aplicación Soft Gel</span>
              </div>
              <div class="bg-white border border-[#111111]/15 rounded-xl p-2.5">
                <span class="text-[10px] uppercase tracking-wider text-[#111111]/55 block">2. Largo Detectado</span>
                <span class="text-xs font-bold text-[#B8001F] mt-0.5 block">{{ quoteState.selectedLength() }}</span>
              </div>
              <div class="bg-white border border-[#111111]/15 rounded-xl p-2.5">
                <span class="text-[10px] uppercase tracking-wider text-[#111111]/55 block">3. Forma / Punta</span>
                <span class="text-xs font-bold text-[#111111] mt-0.5 block">{{ quoteState.selectedShape() }}</span>
              </div>
              <div class="bg-white border border-[#111111]/15 rounded-xl p-2.5">
                <span class="text-[10px] uppercase tracking-wider text-[#111111]/55 block">4. Estilo / Efectos</span>
                <span class="text-xs font-semibold text-[#111111] mt-0.5 block line-clamp-2">
                  {{ quoteState.detectedEffectsList().length ? quoteState.detectedEffectsList().join(', ') : 'Natural / Lisas' }}
                </span>
              </div>
              <div class="bg-white border border-[#111111]/15 rounded-xl p-2.5">
                <span class="text-[10px] uppercase tracking-wider text-[#111111]/55 block">5. Detalles y Dibujo</span>
                <span class="text-xs font-semibold text-[#111111] mt-0.5 block line-clamp-2">
                  {{ quoteState.detectedDetailsList().length ? quoteState.detectedDetailsList().join(', ') : 'Sin mano alzada extra' }}
                </span>
              </div>
              <div class="bg-[#111111] text-white rounded-xl p-2.5">
                <span class="text-[10px] uppercase tracking-wider text-white/70 block">6. Tiempo Elaboración</span>
                <span class="font-mono text-sm font-bold text-[#FFF0F3] mt-0.5 block">
                  {{ quoteState.estimatedCreationMinutes() }} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1 Footer CTA -->
      <div class="mt-6 pt-5 border-t border-[#111111]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-[#111111]/70">
          ¿Ya subiste tu foto o elegiste tu referencia? En el siguiente paso podrás personalizar largo, forma y quitar o agregar efectos.
        </p>
        <button
          type="button"
          [disabled]="quoteState.isAnalyzing()"
          (click)="nextStep.emit()"
          class="w-full sm:w-auto btn-cherry px-7 py-3.5 text-sm font-bold rounded-xl"
        >
          <span>Continuar al Paso 2: Personalizar Uñas</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  `
})
export class ReferenceAnalyzerComponent {
  readonly quoteState = inject(QuoteStateService);
  readonly analyzerService = inject(NailAnalyzerService);

  @Output() nextStep = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly presets = XCHERRY_PORTFOLIO_PRESETS;
  readonly isDragging = signal(false);
  readonly errorMessage = signal('');
  readonly showApiConfig = signal(false);
  apiKeyInput = '';

  saveApiKey(): void {
    this.analyzerService.setGeminiApiKey(this.apiKeyInput);
    this.showApiConfig.set(false);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  selectPreset(preset: PortfolioPreset): void {
    this.errorMessage.set('');
    this.quoteState.loadPortfolioPreset(preset);
  }

  private processFile(file: File): void {
    this.errorMessage.set('');
    const validExtensions = /\.(jpg|jpeg|png|webp|mp4|mov)$/i;
    const isValidMime = file.type.startsWith('image/') || file.type.startsWith('video/');

    if (!isValidMime && !validExtensions.test(file.name)) {
      this.errorMessage.set('Formato no soportado. Sube una imagen (.jpg, .png, .webp) o video corto (.mp4, .mov).');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        this.quoteState.analyzeUploadedFile(file, dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      const previewUrl = URL.createObjectURL(file);
      this.quoteState.analyzeUploadedFile(file, previewUrl);
    }
  }
}
