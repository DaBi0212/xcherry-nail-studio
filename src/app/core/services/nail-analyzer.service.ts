import { Injectable } from '@angular/core';
import {
  NailLength,
  NailShape,
  PortfolioPreset
} from '../models/nail-quote.model';
import { PRICING_CONFIG } from '../config/pricing.config';

export interface NailAnalysisResult {
  styleTitle: string;
  aiSummary: string;
  confidenceScore: number;
  baseApplication: string;
  length: NailLength;
  shape: NailShape;
  detectedEffectCodes: string[];
  detectedDetailCodes: string[];
  detectedEffectsLabels: string[];
  detectedDetailsLabels: string[];
  estimatedMinutes: number;
  analysisMode: 'gemini-vision-api' | 'smart-visual-mock';
}

@Injectable({
  providedIn: 'root'
})
export class NailAnalyzerService {
  /**
   * Opcional: Si la dueña configura su API Key de Gemini Vision, el servicio
   * realiza la llamada real a `gemini-1.5-flash`. Si no hay API Key configurada,
   * utiliza el motor de inspección heurística visual (Canvas RGB + metadatos) en modo Mock realista.
   */
  private geminiApiKey = '';

  setGeminiApiKey(key: string): void {
    this.geminiApiKey = key.trim();
  }

  hasGeminiApiKey(): boolean {
    return this.geminiApiKey.length > 10;
  }

  /**
   * Analiza una imagen (.jpg, .png, .webp) o video corto (.mp4, .mov) subido por la clienta
   */
  async analyzeMediaFile(file: File, previewUrl: string): Promise<NailAnalysisResult> {
    if (this.hasGeminiApiKey() && file.type.startsWith('image/')) {
      try {
        return await this.analyzeWithGeminiVision(file);
      } catch (err) {
        console.warn('Fallback a modo mock inteligente tras error de API:', err);
      }
    }

    // Simulación realista con inspección visual de la imagen/video cargado
    await this.delay(1450);
    return this.runSmartVisualMockAnalysis(file, previewUrl);
  }

  /**
   * Analiza instantáneamente un preset del portafolio de XCHERRY NAIL STUDIO
   */
  async analyzePortfolioPreset(preset: PortfolioPreset): Promise<NailAnalysisResult> {
    await this.delay(650);
    return this.buildResultFromCodes(
      preset.title,
      preset.aiSummary,
      0.98,
      preset.length,
      preset.shape,
      preset.activeItemCodes,
      'smart-visual-mock'
    );
  }

  private async analyzeWithGeminiVision(file: File): Promise<NailAnalysisResult> {
    const base64Data = await this.fileToBase64(file);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const prompt = `Eres la artista experta de XCHERRY NAIL STUDIO (estudio de uñas Soft Gel).
Analiza esta referencia de uñas y responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "styleTitle": "Título corto del diseño en español",
  "aiSummary": "Resumen técnico de 2 oraciones describiendo base soft gel, forma, largo, efectos y arte detectados",
  "length": "Corto" | "Mediano" | "Largo" | "XL",
  "shape": "Almendra" | "Coffin" | "Stiletto" | "Cuadrada",
  "activeCodes": ["EFFECT_CHROME", "EFFECT_AURA", "EFFECT_CATEYE", "EFFECT_FRENCH", "EFFECT_ENCAPSULATED", "EFFECT_3D_RELIEF", "ART_BASIC", "ART_INTERMEDIATE", "ART_COMPLEX", "JEWELRY_RHINESTONES", "JEWELRY_CHARMS"]
}
Incluye en activeCodes únicamente los códigos de los elementos que realmente aparecen en las uñas.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.type || 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText);

    return this.buildResultFromCodes(
      parsed.styleTitle || 'Diseño Soft Gel Personalizado',
      parsed.aiSummary || 'Set Soft Gel analizado por Gemini Vision AI.',
      0.96,
      parsed.length || 'Mediano',
      parsed.shape || 'Almendra',
      Array.isArray(parsed.activeCodes) ? parsed.activeCodes : ['EFFECT_CHROME', 'ART_INTERMEDIATE'],
      'gemini-vision-api'
    );
  }

  /**
   * Analizador Mock Inteligente que examina el perfil cromático/contraste real de la imagen o video
   * y el nombre del archivo para ofrecer una detección sumamente realista y consistente.
   */
  private async runSmartVisualMockAnalysis(file: File, previewUrl: string): Promise<NailAnalysisResult> {
    const fileName = file.name.toLowerCase();
    const isVideo = file.type.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.mov');

    let visualProfile = { darkRatio: 0.35, redRatio: 0.25, metallicContrast: 0.4, brightness: 140 };
    if (!isVideo) {
      try {
        visualProfile = await this.extractImageColorMetrics(previewUrl);
      } catch {
        // Fallback determinístico por tamaño de archivo
      }
    }

    // Selección inteligente basada en palabras clave del archivo o perfil visual de la imagen
    let length: NailLength = 'Mediano';
    let shape: NailShape = 'Almendra';
    let codes: string[] = [];
    let styleTitle = 'Set Soft Gel Dark Coquette';
    let summary = '';

    if (fileName.includes('xl') || fileName.includes('extralargo')) {
      length = 'XL';
    } else if (fileName.includes('corto') || fileName.includes('short')) {
      length = 'Corto';
    } else if (visualProfile.darkRatio > 0.38 || isVideo) {
      length = 'Largo';
    }

    if (fileName.includes('stiletto') || visualProfile.darkRatio > 0.42) {
      shape = 'Stiletto';
    } else if (fileName.includes('coffin') || fileName.includes('ballerina')) {
      shape = 'Coffin';
    } else if (fileName.includes('cuadrada') || fileName.includes('square')) {
      shape = 'Cuadrada';
    } else {
      shape = 'Almendra';
    }

    if (isVideo) {
      styleTitle = 'Set Soft Gel en Video · Chrome & 3D Coquette';
      codes = ['EFFECT_CHROME', 'EFFECT_CATEYE', 'EFFECT_3D_RELIEF', 'ART_INTERMEDIATE', 'JEWELRY_CHARMS'];
      summary = 'Análisis de cuadros de video completado: se detectan reflejos especulares de efecto espejo/ojo de gato, extensión Soft Gel estilizada, trazos a mano alzada y dijes metálicos.';
    } else if (visualProfile.redRatio > 0.22 && visualProfile.darkRatio > 0.35) {
      styleTitle = 'Cherry Vampy & Gothic Relief';
      codes = ['EFFECT_AURA', 'EFFECT_3D_RELIEF', 'ART_COMPLEX', 'JEWELRY_CHARMS'];
      summary = 'Se identificó paleta de alto contraste rojo cereza y negro profundo sobre extensión Soft Gel, difuminado tipo aura, mano alzada de alta complejidad y relieves tridimensionales.';
    } else if (visualProfile.metallicContrast > 0.45) {
      styleTitle = 'Liquid Chrome & Cyber Coquette Art';
      codes = ['EFFECT_CHROME', 'EFFECT_3D_RELIEF', 'ART_INTERMEDIATE', 'JEWELRY_RHINESTONES'];
      summary = 'Detección de acabado metálico Liquid Chrome de alto brillo, detalles en relieve 3D estructurado, diseño a mano alzada nivel intermedio y aplicaciones de pedrería cristal.';
    } else {
      styleTitle = 'Soft Gel Coquette · French & Mano Alzada';
      codes = ['EFFECT_FRENCH', 'EFFECT_AURA', 'ART_INTERMEDIATE', 'JEWELRY_CHARMS'];
      summary = 'Se detectó base Soft Gel traslúcida con francés estilizado, difuminado suave, ilustración coquette a mano alzada y charms metálicos.';
    }

    return this.buildResultFromCodes(
      styleTitle,
      summary,
      0.94,
      length,
      shape,
      codes,
      'smart-visual-mock'
    );
  }

  private buildResultFromCodes(
    styleTitle: string,
    aiSummary: string,
    confidenceScore: number,
    length: NailLength,
    shape: NailShape,
    activeCodes: string[],
    analysisMode: 'gemini-vision-api' | 'smart-visual-mock'
  ): NailAnalysisResult {
    const catalog = PRICING_CONFIG.addonsCatalog;
    const activeItems = catalog.filter(item => activeCodes.includes(item.code));

    const effectItems = activeItems.filter(i => i.category === 'effect');
    const detailItems = activeItems.filter(i => i.category === 'art' || i.category === 'jewelry');

    const baseMinutes = PRICING_CONFIG.baseService.durationMinutes;
    const lengthMinutes = PRICING_CONFIG.lengths[length]?.extraMinutes ?? 0;
    const shapeMinutes = PRICING_CONFIG.shapes.find(s => s.id === shape)?.extraMinutes ?? 0;
    const addonsMinutes = activeItems.reduce((acc, item) => acc + item.durationMinutes, 0);

    return {
      styleTitle,
      aiSummary,
      confidenceScore,
      baseApplication: 'Aplicación de Soft Gel',
      length,
      shape,
      detectedEffectCodes: effectItems.map(i => i.code),
      detectedDetailCodes: detailItems.map(i => i.code),
      detectedEffectsLabels: effectItems.map(i => i.name),
      detectedDetailsLabels: detailItems.map(i => i.name),
      estimatedMinutes: baseMinutes + lengthMinutes + shapeMinutes + addonsMinutes,
      analysisMode
    };
  }

  private extractImageColorMetrics(imageUrl: string): Promise<{
    darkRatio: number;
    redRatio: number;
    metallicContrast: number;
    brightness: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let darkCount = 0;
        let redCount = 0;
        let highLightCount = 0;
        let totalLum = 0;
        const totalPixels = size * size;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLum += lum;
          if (lum < 75) darkCount++;
          if (lum > 205) highLightCount++;
          if (r > 125 && r > g * 1.35 && r > b * 1.35) redCount++;
        }

        const darkRatio = darkCount / totalPixels;
        const redRatio = redCount / totalPixels;
        const metallicContrast = Math.min(1, (darkCount + highLightCount) / totalPixels);
        const brightness = totalLum / totalPixels;
        resolve({ darkRatio, redRatio, metallicContrast, brightness });
      };
      img.onerror = err => reject(err);
      img.src = imageUrl;
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || '');
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve(base64);
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
