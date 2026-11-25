import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteStateService } from '../../core/services/quote-state.service';
import { DistancePricingService } from '../../core/services/distance-pricing.service';
import { PRICING_CONFIG } from '../../core/config/pricing.config';
import { PueblaNeighborhoodPreset } from '../../core/models/nail-quote.model';

declare const L: any;

@Component({
  selector: 'app-distance-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="bg-white border border-[#111111] rounded-2xl p-5 sm:p-7 shadow-sharp">
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#111111]/10">
        <div>
          <div class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white bg-[#B8001F] px-3 py-1 rounded-full">
            <span>Paso 3 de 5</span>
            <span>·</span>
            <span>Ubicación en Mapa Real (Puebla, Pue.)</span>
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#111111] mt-2">
            Elige en el Mapa el Punto Exacto de tu Domicilio
          </h2>
          <p class="text-xs sm:text-sm text-[#111111]/70 mt-1">
            Toca o arrastra el marcador rojo en el mapa real de Puebla hasta tu casa o lugar donde te harás tus uñitas, o usa tu GPS actual.
          </p>
        </div>

        <!-- Home Delivery Switch -->
        <div class="flex items-center gap-2 bg-[#F9F9F9] border border-[#111111]/20 p-1.5 rounded-xl">
          <button
            type="button"
            (click)="setHomeServiceMode(true)"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            [ngClass]="requiresHomeService() ? 'bg-[#B8001F] text-white shadow-sm' : 'text-[#111111]/70 hover:text-[#111111]'"
          >
            🚗 Servicio a Domicilio
          </button>
          <button
            type="button"
            (click)="setHomeServiceMode(false)"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            [ngClass]="!requiresHomeService() ? 'bg-[#111111] text-white shadow-sm' : 'text-[#111111]/70 hover:text-[#111111]'"
          >
            📍 Punto Base ($0 traslado)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        <!-- Left 7 Cols: Real Leaflet Map of Puebla + Search & GPS -->
        <div class="lg:col-span-7 space-y-4">
          @if (requiresHomeService()) {
            <!-- GPS & Search Bar -->
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1 flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="searchOnMap()"
                  placeholder="Buscar calle, colonia o fraccionamiento en Puebla..."
                  class="flex-1 px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-[#F9F9F9] focus:bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
                />
                <button
                  type="button"
                  (click)="searchOnMap()"
                  [disabled]="isSearchingMap()"
                  class="bg-[#111111] hover:bg-[#B8001F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
                >
                  {{ isSearchingMap() ? 'Buscando...' : '🔍 Buscar' }}
                </button>
              </div>

              <button
                type="button"
                (click)="useCurrentGpsLocation()"
                [disabled]="isLocatingGps()"
                class="inline-flex items-center justify-center gap-1.5 bg-[#FFF0F3] hover:bg-[#B8001F] text-[#B8001F] hover:text-white border border-[#B8001F] text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors shrink-0"
              >
                <span>📍 {{ isLocatingGps() ? 'Ubicando...' : 'Usar mi GPS actual' }}</span>
              </button>
            </div>

            <!-- Quick Zone Selector Pills -->
            <div>
              <span class="block text-[11px] font-bold uppercase tracking-wider text-[#111111]/75 mb-1.5">
                O centra rápido el mapa en tu zona de Puebla:
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (preset of neighborhoods; track preset.id) {
                  <button
                    type="button"
                    (click)="selectNeighborhood(preset)"
                    class="px-2.5 py-1.5 rounded-lg border text-xs transition-all"
                    [ngClass]="selectedPresetId() === preset.id
                      ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                      : 'bg-[#F9F9F9] text-[#111111] border-[#111111]/15 hover:border-[#B8001F]'"
                  >
                    {{ preset.name }}
                  </button>
                }
              </div>
            </div>

            <!-- REAL LEAFLET INTERACTIVE MAP -->
            <div class="bg-[#F9F9F9] border-2 border-[#111111] rounded-2xl p-2.5 shadow-sm">
              <div class="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-[#B8001F] flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-[#B8001F] animate-ping"></span>
                  <span>Toca tu calle o arrastra el pin rojo 📍 en el mapa real:</span>
                </span>
                <a
                  [href]="quoteState.locationFee().googleMapsUrl"
                  target="_blank"
                  rel="noopener"
                  class="text-[11px] font-mono text-[#111111] underline hover:text-[#B8001F]"
                >
                  Ver punto en Google Maps ↗
                </a>
              </div>

              <div
                #leafletMapContainer
                class="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-[#111111]/30 z-10 relative"
              ></div>

              <div class="flex flex-wrap items-center justify-between gap-2 mt-2 px-1 text-[11px] text-[#111111]/75">
                <span>
                  🍒 Tarifa base: <strong>\${{ distanceRules.baseFeeUpToRadius }} MXN</strong> (hasta {{ distanceRules.baseRadiusKm }} km) +
                  <strong>\${{ distanceRules.extraKmRate }} MXN</strong>/km adicional.
                </span>
                <span class="font-mono font-bold text-[#111111]">
                  Distancia: {{ quoteState.locationFee().distanceKm }} km · Traslado: \${{ quoteState.locationFee().totalLocationFee }} MXN
                </span>
              </div>
            </div>

            <!-- Selected Street Address & Home References -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div class="sm:col-span-7">
                <label class="block text-xs font-bold text-[#111111] mb-1">
                  Dirección del domicilio (detectada del mapa o edítala):
                </label>
                <input
                  type="text"
                  [(ngModel)]="addressInput"
                  (ngModelChange)="recalculateFee()"
                  placeholder="Calle, número exterior/interior y colonia en Puebla..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-[#F9F9F9] focus:bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
                />
              </div>
              <div class="sm:col-span-5">
                <label class="block text-xs font-bold text-[#111111] mb-1">
                  Referencias de fachada / acceso:
                </label>
                <input
                  type="text"
                  [(ngModel)]="referenceNotes"
                  (ngModelChange)="recalculateFee()"
                  placeholder="Color de portón, entre qué calles, caseta..."
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#111111]/25 bg-[#F9F9F9] focus:bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B8001F]"
                />
              </div>
            </div>
          } @else {
            <div class="bg-[#F9F9F9] border border-[#111111]/20 rounded-2xl p-8 text-center space-y-2">
              <div class="text-3xl">🍒</div>
              <h3 class="font-serif text-2xl font-bold text-[#111111]">
                Atención en Punto Base XCHERRY (Centro / Paseo Bravo, Puebla)
              </h3>
              <p class="text-xs sm:text-sm text-[#111111]/70 max-w-md mx-auto">
                Sin cargo por traslado a domicilio ($0 MXN). Puedes cambiar a "Servicio a Domicilio" arriba si prefieres que vayamos a tu casa.
              </p>
            </div>
          }
        </div>

        <!-- Right 5 Cols: Summary Card -->
        <div class="lg:col-span-5">
          <div class="bg-[#111111] text-white rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between border-2 border-[#111111] shadow-sharp-cherry">
            <div>
              <div class="flex items-center justify-between border-b border-white/15 pb-3">
                <div>
                  <span class="text-[10px] uppercase tracking-[0.2em] text-[#D00024] font-bold block">
                    Resumen Parcial · Paso 3
                  </span>
                  <h3 class="font-serif text-2xl font-bold text-white">
                    Servicio + Traslado
                  </h3>
                </div>
                <img src="assets/logo-xcherry.png" alt="XCHERRY" class="w-11 h-11 rounded-full bg-white p-0.5" />
              </div>

              <div class="mt-4 space-y-2.5 text-xs">
                <div class="flex items-center justify-between text-white/90">
                  <span>• Base Soft Gel + {{ quoteState.selectedLength() }} ({{ quoteState.selectedShape() }})</span>
                  <span class="font-mono font-semibold">
                    \${{ quoteState.baseItem().price + quoteState.lengthItem().price + quoteState.shapeItem().price }} MXN
                  </span>
                </div>

                @for (item of quoteState.activeAddonItems(); track item.id) {
                  <div class="flex items-center justify-between text-white/80">
                    <span class="truncate pr-2">• {{ item.name }}</span>
                    <span class="font-mono shrink-0">+\${{ item.price }} MXN</span>
                  </div>
                }

                <div class="border-t border-white/15 pt-2.5 flex items-center justify-between font-semibold text-sm">
                  <span>Subtotal Uñas ({{ quoteState.estimatedCreationMinutes() }} min)</span>
                  <span class="font-mono">\${{ quoteState.nailsSubtotal() }} MXN</span>
                </div>

                <!-- Location Fee Breakdown -->
                <div class="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1.5">
                  <div class="flex items-center justify-between text-xs font-semibold text-[#FFF0F3]">
                    <span>Traslado a Domicilio ({{ quoteState.locationFee().distanceKm }} km)</span>
                    <span class="font-mono">+\${{ quoteState.locationFee().totalLocationFee }} MXN</span>
                  </div>
                  @if (quoteState.locationFee().requiresHomeService) {
                    <p class="text-[11px] text-white/65 leading-snug">
                      Base hasta {{ quoteState.locationFee().baseRadiusKm }} km (\${{ quoteState.locationFee().baseFee }})
                      @if (quoteState.locationFee().extraKm > 0) {
                        <span> + {{ quoteState.locationFee().extraKm }} km extra × \${{ quoteState.locationFee().perKmRate }}/km</span>
                      }
                    </p>
                    <p class="text-[11px] text-white/80 line-clamp-2">
                      📍 {{ quoteState.locationFee().clientAddress }}
                    </p>
                    @if (referenceNotes) {
                      <p class="text-[11px] text-[#FFF0F3]/80 italic">
                        Ref: {{ referenceNotes }}
                      </p>
                    }
                  }
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-white/20">
              <div class="flex items-baseline justify-between mb-1">
                <span class="text-xs uppercase tracking-widest text-white/70">Total Estimado</span>
                <span class="font-mono text-3xl font-bold text-white">
                  \${{ quoteState.totalFinal() }} <span class="text-sm font-normal text-[#D00024]">MXN</span>
                </span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-white/65">
                <span>Tiempo total a reservar (Uñas + Traslado):</span>
                <span class="font-mono font-semibold text-[#FFF0F3]">{{ quoteState.totalRequiredMinutesForAgenda() }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3 Footer Navigation -->
      <div class="mt-7 pt-5 border-t border-[#111111]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          (click)="prevStep.emit()"
          class="w-full sm:w-auto btn-outline-dark px-5 py-3 text-xs sm:text-sm font-semibold rounded-xl"
        >
          ← Volver al Paso 2 (Personalización)
        </button>

        <button
          type="button"
          (click)="nextStep.emit()"
          class="w-full sm:w-auto btn-cherry px-7 py-3.5 text-sm font-bold rounded-xl"
        >
          <span>Continuar al Paso 4: Elegir Fecha y Hora</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  `
})
export class DistanceCalculatorComponent implements AfterViewInit, OnDestroy {
  readonly quoteState = inject(QuoteStateService);
  readonly distanceService = inject(DistancePricingService);

  @Output() prevStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  @ViewChild('leafletMapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  readonly neighborhoods = this.distanceService.getNeighborhoodPresets();
  readonly distanceRules = PRICING_CONFIG.distancePricing;
  readonly studioBase = PRICING_CONFIG.studioInfo.baseLocation;

  readonly requiresHomeService = signal<boolean>(this.quoteState.locationFee().requiresHomeService);
  readonly selectedPresetId = signal<string>(this.neighborhoods[1].id);
  readonly clientLat = signal<number>(this.quoteState.locationFee().clientCoordinates.lat);
  readonly clientLng = signal<number>(this.quoteState.locationFee().clientCoordinates.lng);
  readonly isSearchingMap = signal<boolean>(false);
  readonly isLocatingGps = signal<boolean>(false);

  searchQuery = '';
  addressInput = this.quoteState.locationFee().clientAddress;
  referenceNotes = this.quoteState.locationFee().referenceNotes || 'Portón negro, frente a parque';

  private map: any = null;
  private clientMarker: any = null;
  private routeLine: any = null;

  ngAfterViewInit(): void {
    setTimeout(() => this.initRealLeafletMap(), 80);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initRealLeafletMap(): void {
    if (!this.mapContainer?.nativeElement || typeof L === 'undefined') {
      return;
    }
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    const startLat = this.clientLat();
    const startLng = this.clientLng();

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [startLat, startLng],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap · XCHERRY Puebla'
    }).addTo(this.map);

    // Marcador de Punto Base XCHERRY en Centro / Paseo Bravo Puebla
    const studioIcon = L.divIcon({
      className: 'xcherry-studio-marker',
      html: `<div style="background:#111111;color:#FFFFFF;border:2px solid #FFFFFF;border-radius:9999px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,0.4);">🍒</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([this.studioBase.lat, this.studioBase.lng], { icon: studioIcon })
      .addTo(this.map)
      .bindPopup('<b>Punto Base XCHERRY NAIL STUDIO</b><br>Centro / Paseo Bravo, Puebla');

    // Círculo de radio base (3 km)
    L.circle([this.studioBase.lat, this.studioBase.lng], {
      radius: this.distanceRules.baseRadiusKm * 1000,
      color: '#B8001F',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#B8001F',
      fillOpacity: 0.08
    }).addTo(this.map);

    // Marcador arrastrable del Domicilio de la Clienta
    const clientIcon = L.divIcon({
      className: 'xcherry-client-marker',
      html: `<div style="background:#B8001F;color:#FFFFFF;border:2.5px solid #FFFFFF;border-radius:9999px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(184,0,31,0.55);cursor:grab;">📍</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    this.clientMarker = L.marker([startLat, startLng], {
      icon: clientIcon,
      draggable: true
    })
      .addTo(this.map)
      .bindPopup('<b>Tu Domicilio</b><br>Arrástrame o toca cualquier punto del mapa');

    this.routeLine = L.polyline(
      [
        [this.studioBase.lat, this.studioBase.lng],
        [startLat, startLng]
      ],
      {
        color: '#B8001F',
        weight: 3,
        dashArray: '6, 6'
      }
    ).addTo(this.map);

    // Evento al arrastrar el marcador
    this.clientMarker.on('dragend', () => {
      const pos = this.clientMarker.getLatLng();
      this.updateCoordinatesFromMap(pos.lat, pos.lng, true);
    });

    // Evento al hacer clic en cualquier parte del mapa real
    this.map.on('click', (e: any) => {
      if (e?.latlng) {
        this.updateCoordinatesFromMap(e.latlng.lat, e.latlng.lng, true);
      }
    });
  }

  private async updateCoordinatesFromMap(lat: number, lng: number, doReverseGeocode: boolean): Promise<void> {
    const cleanLat = Number(lat.toFixed(5));
    const cleanLng = Number(lng.toFixed(5));
    this.clientLat.set(cleanLat);
    this.clientLng.set(cleanLng);
    this.selectedPresetId.set('');

    if (this.clientMarker) {
      this.clientMarker.setLatLng([cleanLat, cleanLng]);
    }
    if (this.routeLine) {
      this.routeLine.setLatLngs([
        [this.studioBase.lat, this.studioBase.lng],
        [cleanLat, cleanLng]
      ]);
    }

    this.recalculateFee();

    if (doReverseGeocode) {
      const address = await this.distanceService.reverseGeocodePuebla(cleanLat, cleanLng);
      if (address) {
        this.addressInput = address;
        this.recalculateFee();
      }
    }
  }

  async searchOnMap(): Promise<void> {
    if (!this.searchQuery.trim()) return;
    this.isSearchingMap.set(true);
    try {
      const found = await this.distanceService.searchAddressInPuebla(this.searchQuery);
      if (found) {
        this.addressInput = found.displayName;
        await this.updateCoordinatesFromMap(found.lat, found.lng, false);
        if (this.map) {
          this.map.setView([found.lat, found.lng], 16);
        }
      }
    } finally {
      this.isSearchingMap.set(false);
    }
  }

  useCurrentGpsLocation(): void {
    if (!navigator.geolocation) {
      return;
    }
    this.isLocatingGps.set(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        this.isLocatingGps.set(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await this.updateCoordinatesFromMap(lat, lng, true);
        if (this.map) {
          this.map.setView([lat, lng], 16);
        }
      },
      () => {
        this.isLocatingGps.set(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  setHomeServiceMode(enabled: boolean): void {
    this.requiresHomeService.set(enabled);
    this.recalculateFee();
    if (enabled) {
      setTimeout(() => this.initRealLeafletMap(), 80);
    }
  }

  selectNeighborhood(preset: PueblaNeighborhoodPreset): void {
    this.selectedPresetId.set(preset.id);
    this.addressInput = preset.sampleAddress;
    this.updateCoordinatesFromMap(preset.lat, preset.lng, false);
    if (this.map) {
      this.map.setView([preset.lat, preset.lng], 15);
    }
  }

  recalculateFee(): void {
    this.quoteState.updateHomeServiceLocation({
      requiresHomeService: this.requiresHomeService(),
      clientAddress: this.addressInput,
      referenceNotes: this.referenceNotes,
      clientLat: this.clientLat(),
      clientLng: this.clientLng()
    });
  }
}
