import { Injectable, computed, inject, signal } from '@angular/core';
import {
  LocationFee,
  NailLength,
  NailQuote,
  NailShape,
  PortfolioPreset,
  QuoteItem,
  TimeSlotStatus,
  WizardStep
} from '../models/nail-quote.model';
import { PRICING_CONFIG, PUEBLA_NEIGHBORHOODS, XCHERRY_PORTFOLIO_PRESETS } from '../config/pricing.config';
import { NailAnalysisResult, NailAnalyzerService } from './nail-analyzer.service';
import { DistancePricingService } from './distance-pricing.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteStateService {
  private readonly analyzerService = inject(NailAnalyzerService);
  private readonly distanceService = inject(DistancePricingService);

  // Paso actual del flujo guiado (1: Referencia IA -> 2: Personalización -> 3: Mapa Domicilio -> 4: Fecha/Hora -> 5: Datos y Ticket)
  readonly currentStep = signal<WizardStep>(1);

  // Estado reactivo con Angular Signals
  readonly isAnalyzing = signal<boolean>(false);
  readonly hasAnalyzedQuote = signal<boolean>(true);

  readonly mediaName = signal<string>('sample-dark-vampy.jpg');
  readonly mediaType = signal<'image' | 'video' | 'preset'>('preset');
  readonly mediaPreviewUrl = signal<string>(XCHERRY_PORTFOLIO_PRESETS[0].imageUrl);

  readonly styleTitle = signal<string>(XCHERRY_PORTFOLIO_PRESETS[0].title);
  readonly aiSummary = signal<string>(XCHERRY_PORTFOLIO_PRESETS[0].aiSummary);
  readonly confidenceScore = signal<number>(0.98);
  readonly analysisMode = signal<'gemini-vision-api' | 'smart-visual-mock'>('smart-visual-mock');

  readonly selectedLength = signal<NailLength>(XCHERRY_PORTFOLIO_PRESETS[0].length);
  readonly selectedShape = signal<NailShape>(XCHERRY_PORTFOLIO_PRESETS[0].shape);

  // Catálogo interactivo de items
  readonly addonItems = signal<QuoteItem[]>(
    this.buildAddonItemsFromActiveCodes(XCHERRY_PORTFOLIO_PRESETS[0].activeItemCodes)
  );

  // Estado de traslado a domicilio en Puebla, Puebla
  readonly locationFee = signal<LocationFee>(
    this.distanceService.calculateLocationFee({
      requiresHomeService: true,
      clientAddress: PUEBLA_NEIGHBORHOODS[1].sampleAddress,
      neighborhood: PUEBLA_NEIGHBORHOODS[1].name,
      referenceNotes: 'Portón negro, frente a parque',
      clientLat: PUEBLA_NEIGHBORHOODS[1].lat,
      clientLng: PUEBLA_NEIGHBORHOODS[1].lng
    })
  );

  // Fecha y horario seleccionados en el Paso 4
  readonly selectedScheduleDateIso = signal<string>('');
  readonly selectedScheduleDayLabel = signal<string>('');
  readonly selectedScheduleSlot = signal<TimeSlotStatus | null>(null);

  // Signals Computados
  readonly baseItem = computed<QuoteItem>(() => ({
    ...PRICING_CONFIG.baseService,
    included: true,
    mandatory: true
  }));

  readonly lengthItem = computed<QuoteItem>(() => {
    const len = this.selectedLength();
    const cfg = PRICING_CONFIG.lengths[len];
    return {
      id: `length-${len.toLowerCase()}`,
      code: `LENGTH_${len.toUpperCase()}`,
      name: `Largo ${cfg.label}`,
      category: 'length',
      description: cfg.description,
      processDetail: 'Ajuste estructural de tip Soft Gel y sellado de tensión.',
      price: cfg.extraPrice,
      durationMinutes: cfg.extraMinutes,
      included: true,
      mandatory: true
    };
  });

  readonly shapeItem = computed<QuoteItem>(() => {
    const shp = this.selectedShape();
    const cfg = PRICING_CONFIG.shapes.find(s => s.id === shp) ?? PRICING_CONFIG.shapes[0];
    return {
      id: `shape-${shp.toLowerCase()}`,
      code: `SHAPE_${shp.toUpperCase()}`,
      name: `Forma ${cfg.label}`,
      category: 'shape',
      description: cfg.description,
      processDetail: 'Personalización morfológica de punta y limado de precisión.',
      price: cfg.extraPrice,
      durationMinutes: cfg.extraMinutes,
      included: true,
      mandatory: true
    };
  });

  readonly allQuoteItems = computed<QuoteItem[]>(() => [
    this.baseItem(),
    this.lengthItem(),
    this.shapeItem(),
    ...this.addonItems()
  ]);

  readonly activeAddonItems = computed<QuoteItem[]>(() =>
    this.addonItems().filter(item => item.included)
  );

  readonly detectedEffectsList = computed<string[]>(() =>
    this.activeAddonItems()
      .filter(i => i.category === 'effect')
      .map(i => i.name)
  );

  readonly detectedDetailsList = computed<string[]>(() =>
    this.activeAddonItems()
      .filter(i => i.category === 'art' || i.category === 'jewelry')
      .map(i => i.name)
  );

  readonly nailsSubtotal = computed<number>(() => {
    const basePrice = this.baseItem().price;
    const lengthPrice = this.lengthItem().price;
    const shapePrice = this.shapeItem().price;
    const addonsPrice = this.activeAddonItems().reduce((sum, item) => sum + item.price, 0);
    return basePrice + lengthPrice + shapePrice + addonsPrice;
  });

  readonly estimatedCreationMinutes = computed<number>(() => {
    const baseMin = this.baseItem().durationMinutes;
    const lengthMin = this.lengthItem().durationMinutes;
    const shapeMin = this.shapeItem().durationMinutes;
    const addonsMin = this.activeAddonItems().reduce((sum, item) => sum + item.durationMinutes, 0);
    return baseMin + lengthMin + shapeMin + addonsMin;
  });

  readonly travelCost = computed<number>(() => this.locationFee().totalLocationFee);

  readonly totalRequiredMinutesForAgenda = computed<number>(() =>
    this.estimatedCreationMinutes() + this.locationFee().estimatedTravelMinutes
  );

  readonly totalFinal = computed<number>(() => this.nailsSubtotal() + this.travelCost());

  readonly currentQuote = computed<NailQuote>(() => ({
    id: 'XC-' + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    mediaName: this.mediaName(),
    mediaType: this.mediaType(),
    mediaPreviewUrl: this.mediaPreviewUrl(),
    styleTitle: this.styleTitle(),
    aiSummary: this.aiSummary(),
    confidenceScore: this.confidenceScore(),
    baseApplication: 'Aplicación de Soft Gel',
    length: this.selectedLength(),
    shape: this.selectedShape(),
    detectedEffects: this.detectedEffectsList(),
    detectedDetails: this.detectedDetailsList(),
    items: this.allQuoteItems(),
    nailsSubtotal: this.nailsSubtotal(),
    estimatedCreationMinutes: this.estimatedCreationMinutes(),
    locationFee: this.locationFee(),
    totalDurationWithTravelMinutes: this.totalRequiredMinutesForAgenda(),
    totalFinal: this.totalFinal()
  }));

  goToStep(step: WizardStep): void {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    const current = this.currentStep();
    if (current < 5) {
      this.goToStep((current + 1) as WizardStep);
    }
  }

  prevStep(): void {
    const current = this.currentStep();
    if (current > 1) {
      this.goToStep((current - 1) as WizardStep);
    }
  }

  async analyzeUploadedFile(file: File, previewUrl: string): Promise<void> {
    this.isAnalyzing.set(true);
    try {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov)$/i.test(file.name);
      this.mediaName.set(file.name);
      this.mediaType.set(isVideo ? 'video' : 'image');
      this.mediaPreviewUrl.set(previewUrl);

      const analysis = await this.analyzerService.analyzeMediaFile(file, previewUrl);
      this.applyAnalysisResult(analysis);
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  async loadPortfolioPreset(preset: PortfolioPreset): Promise<void> {
    this.isAnalyzing.set(true);
    try {
      this.mediaName.set(preset.title);
      this.mediaType.set('preset');
      this.mediaPreviewUrl.set(preset.imageUrl);

      const analysis = await this.analyzerService.analyzePortfolioPreset(preset);
      this.applyAnalysisResult(analysis);
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  setLength(length: NailLength): void {
    this.selectedLength.set(length);
  }

  setShape(shape: NailShape): void {
    this.selectedShape.set(shape);
  }

  toggleAddonItem(itemId: string): void {
    this.addonItems.update(items =>
      items.map(item =>
        item.id === itemId ? { ...item, included: !item.included } : item
      )
    );
  }

  updateHomeServiceLocation(params: {
    requiresHomeService: boolean;
    clientAddress: string;
    neighborhood?: string;
    referenceNotes?: string;
    clientLat: number;
    clientLng: number;
  }): void {
    const fee = this.distanceService.calculateLocationFee(params);
    this.locationFee.set(fee);
  }

  setSelectedSchedule(dateIso: string, dayLabel: string, slot: TimeSlotStatus | null): void {
    this.selectedScheduleDateIso.set(dateIso);
    this.selectedScheduleDayLabel.set(dayLabel);
    this.selectedScheduleSlot.set(slot);
  }

  private applyAnalysisResult(result: NailAnalysisResult): void {
    this.styleTitle.set(result.styleTitle);
    this.aiSummary.set(result.aiSummary);
    this.confidenceScore.set(result.confidenceScore);
    this.analysisMode.set(result.analysisMode);
    this.selectedLength.set(result.length);
    this.selectedShape.set(result.shape);

    const activeCodes = [...result.detectedEffectCodes, ...result.detectedDetailCodes];
    this.addonItems.set(this.buildAddonItemsFromActiveCodes(activeCodes));
    this.hasAnalyzedQuote.set(true);
  }

  private buildAddonItemsFromActiveCodes(activeCodes: string[]): QuoteItem[] {
    return PRICING_CONFIG.addonsCatalog.map(catalogItem => {
      const isDetected = activeCodes.includes(catalogItem.code);
      return {
        ...catalogItem,
        included: isDetected,
        detectedConfidence: isDetected ? 0.95 : undefined
      };
    });
  }
}
