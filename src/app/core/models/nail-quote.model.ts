export type NailLength = 'Corto' | 'Mediano' | 'Largo' | 'XL';

export type NailShape = 'Almendra' | 'Coffin' | 'Stiletto' | 'Cuadrada' | ' Oval';

export type QuoteCategory =
  | 'base'
  | 'length'
  | 'shape'
  | 'effect'
  | 'art'
  | 'jewelry';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface QuoteItem {
  id: string;
  code: string;
  name: string;
  category: QuoteCategory;
  description: string;
  processDetail: string;
  price: number;
  durationMinutes: number;
  included: boolean;
  mandatory?: boolean;
  detectedConfidence?: number;
  badge?: string;
}

export interface LocationFee {
  requiresHomeService: boolean;
  clientAddress: string;
  neighborhood?: string;
  referenceNotes?: string;
  studioCoordinates: {
    lat: number;
    lng: number;
    label: string;
  };
  clientCoordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  distanceKm: number;
  baseRadiusKm: number;
  baseFee: number;
  extraKm: number;
  perKmRate: number;
  totalLocationFee: number;
  estimatedTravelMinutes: number;
  calculationSource: 'google-distance-matrix' | 'openrouteservice' | 'puebla-geo-simulation';
}

export interface NailQuote {
  id: string;
  createdAt: string;
  mediaName: string;
  mediaType: 'image' | 'video' | 'preset';
  mediaPreviewUrl: string;
  styleTitle: string;
  aiSummary: string;
  confidenceScore: number;
  baseApplication: string;
  length: NailLength;
  shape: NailShape;
  detectedEffects: string[];
  detectedDetails: string[];
  items: QuoteItem[];
  nailsSubtotal: number;
  estimatedCreationMinutes: number;
  locationFee: LocationFee;
  totalDurationWithTravelMinutes: number;
  totalFinal: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientInstagram?: string;
  clientAddress: string;
  addressReferences: string;
  additionalNotes?: string;
  referenceMediaUrl: string;
  dateIso: string;        // YYYY-MM-DD
  dateFormatted: string;  // Ej. Jueves 26 Nov
  startTime: string;      // HH:mm (24h)
  endTime: string;        // HH:mm (24h)
  nailDurationMinutes: number;
  travelBufferMinutes: number;
  totalBlockedMinutes: number;
  quoteSnapshot: NailQuote;
  status: 'confirmed' | 'pending' | 'blocked';
  createdAt: string;
}

export interface TimeSlotStatus {
  time: string;           // HH:mm
  endTimeIfBooked: string;// HH:mm
  available: boolean;
  reason?: 'occupied' | 'insufficient-time-before-existing' | 'exceeds-closing-time' | 'min-advance-2-days';
  conflictingAppointment?: {
    startTime: string;
    endTime: string;
    label: string;
  };
}

export interface DayScheduleView {
  dateIso: string;        // YYYY-MM-DD
  dayNameShort: string;   // Lun, Mar...
  dayNameFull: string;    // Lunes, Martes...
  dayNumber: number;
  monthShort: string;
  isOpen: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isBlockedByAdvanceRule: boolean; // True para hoy y mañana (mínimo 2 días de anticipación)
  slots: TimeSlotStatus[];
  appointments: Appointment[];
}

export interface PueblaNeighborhoodPreset {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  sampleAddress: string;
}

export interface PortfolioPreset {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  length: NailLength;
  shape: NailShape;
  activeItemCodes: string[];
  aiSummary: string;
}
