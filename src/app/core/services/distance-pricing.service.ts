import { Injectable } from '@angular/core';
import { LocationFee, PueblaNeighborhoodPreset } from '../models/nail-quote.model';
import { PRICING_CONFIG, PUEBLA_NEIGHBORHOODS } from '../config/pricing.config';

@Injectable({
  providedIn: 'root'
})
export class DistancePricingService {
  private readonly studioBase = PRICING_CONFIG.studioInfo.baseLocation;
  private readonly pricingRules = PRICING_CONFIG.distancePricing;

  getNeighborhoodPresets(): PueblaNeighborhoodPreset[] {
    return PUEBLA_NEIGHBORHOODS;
  }

  /**
   * Calcula la distancia y tarifa progresiva desde el punto base en Puebla, Puebla
   * hasta las coordenadas exactas seleccionadas en el mapa real Leaflet.
   */
  calculateLocationFee(params: {
    requiresHomeService: boolean;
    clientAddress: string;
    neighborhood?: string;
    referenceNotes?: string;
    clientLat: number;
    clientLng: number;
  }): LocationFee {
    const lat = Number(params.clientLat.toFixed(5));
    const lng = Number(params.clientLng.toFixed(5));
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    if (!params.requiresHomeService) {
      return {
        requiresHomeService: false,
        clientAddress: 'Sin traslado a domicilio (Punto Base XCHERRY Puebla)',
        neighborhood: params.neighborhood,
        referenceNotes: params.referenceNotes,
        studioCoordinates: { ...this.studioBase },
        clientCoordinates: { lat: this.studioBase.lat, lng: this.studioBase.lng },
        googleMapsUrl: `https://www.google.com/maps?q=${this.studioBase.lat},${this.studioBase.lng}`,
        distanceKm: 0,
        baseRadiusKm: this.pricingRules.baseRadiusKm,
        baseFee: 0,
        extraKm: 0,
        perKmRate: this.pricingRules.extraKmRate,
        totalLocationFee: 0,
        estimatedTravelMinutes: 0,
        calculationSource: 'puebla-geo-simulation'
      };
    }

    // Distancia lineal Haversine multiplicada por factor de traza urbana de Puebla (1.26x)
    const straightKm = this.calculateHaversineKm(
      this.studioBase.lat,
      this.studioBase.lng,
      lat,
      lng
    );

    const urbanRouteKm = Math.max(0.8, Number((straightKm * 1.26).toFixed(1)));
    const baseRadiusKm = this.pricingRules.baseRadiusKm;
    const baseFee = this.pricingRules.baseFeeUpToRadius;
    const extraKm = Math.max(0, Number((urbanRouteKm - baseRadiusKm).toFixed(1)));
    const extraCost = Math.round(extraKm * this.pricingRules.extraKmRate);
    const totalLocationFee = baseFee + extraCost;

    // Tiempo estimado de traslado + margen de instalación de equipo
    const driveMinutes = Math.round((urbanRouteKm / this.pricingRules.averageSpeedKmPerHour) * 60);
    const estimatedTravelMinutes = Math.max(15, driveMinutes + this.pricingRules.setupBufferMinutes);

    return {
      requiresHomeService: true,
      clientAddress: params.clientAddress.trim() || 'Domicilio seleccionado en Mapa de Puebla, Pue.',
      neighborhood: params.neighborhood,
      referenceNotes: params.referenceNotes,
      studioCoordinates: { ...this.studioBase },
      clientCoordinates: { lat, lng },
      googleMapsUrl,
      distanceKm: urbanRouteKm,
      baseRadiusKm,
      baseFee,
      extraKm,
      perKmRate: this.pricingRules.extraKmRate,
      totalLocationFee,
      estimatedTravelMinutes,
      calculationSource: 'puebla-geo-simulation'
    };
  }

  /**
   * Geocodificación inversa usando OpenStreetMap Nominatim para obtener la calle y colonia real
   * cuando la clienta toca o arrastra el pin en el mapa de Puebla.
   */
  async reverseGeocodePuebla(lat: number, lng: number): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data?. address) {
        const road = data.address.road || data.address.pedestrian || '';
        const houseNumber = data.address.house_number || '';
        const suburb = data.address.suburb || data.address.neighbourhood || data.address.quarter || data.address.village || '';
        const city = data.address.city || data.address.town || data.address.municipality || 'Puebla';
        const parts = [
          [road, houseNumber].filter(Boolean).join(' '),
          suburb ? `Col. ${suburb}` : '',
          `${city}, Pue.`
        ].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
      return data?.display_name || null;
    } catch {
      return null;
    }
  }

  /**
   * Búsqueda de dirección en Puebla mediante OpenStreetMap Nominatim
   */
  async searchAddressInPuebla(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
    const clean = query.trim();
    if (clean.length < 4) return null;
    try {
      const searchQ = clean.toLowerCase().includes('puebla') || clean.toLowerCase().includes('cholula')
        ? clean
        : `${clean}, Puebla, México`;
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQ)}&limit=1&accept-language=es`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return null;
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        return {
          lat: Number(parseFloat(items[0].lat).toFixed(5)),
          lng: Number(parseFloat(items[0].lon).toFixed(5)),
          displayName: items[0].display_name
        };
      }
    } catch {
      // Fallback local
    }
    const local = this.resolveAddressInPuebla(clean);
    return {
      lat: local.lat,
      lng: local.lng,
      displayName: clean
    };
  }

  resolveAddressInPuebla(addressText: string): { lat: number; lng: number; matchedZone?: string } {
    const normalized = addressText.toLowerCase();

    for (const preset of PUEBLA_NEIGHBORHOODS) {
      const tokens = preset.name.toLowerCase().split(/[\/\s,]+/).filter(t => t.length > 3);
      if (tokens.some(token => normalized.includes(token))) {
        return { lat: preset.lat, lng: preset.lng, matchedZone: preset.name };
      }
    }

    if (normalized.includes('cholula') || normalized.includes('udlap')) {
      return { lat: 19.0571, lng: -98.2948, matchedZone: 'San Andrés / San Pedro Cholula' };
    }
    if (normalized.includes('lomas') || normalized.includes('sonata')) {
      return { lat: 18.9835, lng: -98.2764, matchedZone: 'Lomas de Angelópolis' };
    }
    if (normalized.includes('angelopolis') || normalized.includes('angelópolis') || normalized.includes('solesta')) {
      return { lat: 19.0315, lng: -98.2485, matchedZone: 'Zona Angelópolis' };
    }
    if (normalized.includes('zavaleta')) {
      return { lat: 19.0548, lng: -98.2572, matchedZone: 'Calzada Zavaleta' };
    }
    if (normalized.includes('paz') || normalized.includes('juarez') || normalized.includes('juárez')) {
      return { lat: 19.0514, lng: -98.2238, matchedZone: 'La Paz / Av. Juárez' };
    }
    if (normalized.includes('centro') || normalized.includes('reforma') || normalized.includes('zocalo')) {
      return { lat: 19.0453, lng: -98.2035, matchedZone: 'Centro Histórico, Puebla' };
    }

    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash * 31 + normalized.charCodeAt(i)) % 1000;
    }
    const latOffset = ((hash % 80) - 40) * 0.0009;
    const lngOffset = (((hash >> 3) % 90) - 45) * 0.0011;

    return {
      lat: Number((this.studioBase.lat + latOffset).toFixed(5)),
      lng: Number((this.studioBase.lng + lngOffset).toFixed(5)),
      matchedZone: 'Zona Metropolitana Puebla, Pue.'
    };
  }

  private calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
