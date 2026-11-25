import {
  NailLength,
  NailShape,
  PortfolioPreset,
  PueblaNeighborhoodPreset,
  QuoteItem
} from '../models/nail-quote.model';

/**
 * ARCHIVO CENTRALIZADO DE CONFIGURACIÓN — XCHERRY NAIL STUDIO (Puebla, Pue.)
 * Precios ajustados al 50% y WhatsApp oficial vinculado al 2213900561.
 */
export const PRICING_CONFIG = {
  studioInfo: {
    name: 'XCHERRY NAIL STUDIO',
    slogan: 'Cherry soul, dark heart',
    specialty: 'Uñitas Soft Gel a domicilio',
    city: 'Puebla, Pue.',
    instagramHandle: '@xcherry.nails',
    whatsappNumber: '522213900561', // Número oficial de WhatsApp: 221 390 0561 (+52)
    whatsappDisplay: '221 390 0561',
    currency: 'MXN',
    minAdvanceDays: 2, // Mínimo 2 días de anticipación (bloquea hoy y mañana)
    baseLocation: {
      label: 'Punto Base XCHERRY · Centro Histórico / Paseo Bravo, Puebla, Pue.',
      lat: 19.0437,
      lng: -98.2062
    }
  },

  /**
   * 1. Aplicación Base Obligatoria (Soft Gel) — Precio reducido a la mitad
   */
  baseService: {
    id: 'base-soft-gel',
    code: 'BASE_SOFT_GEL',
    name: 'Aplicación Base Soft Gel (Gel-X System)',
    category: 'base' as const,
    description: 'Manicura rusa combinada, preparación química de placa ungueal, extensión con tip 100% gel orgánico y nivelación.',
    processDetail: 'Limpieza profunda de cutícula + adherencia sin daño + extensión Soft Gel.',
    price: 160,
    durationMinutes: 65,
    included: true,
    mandatory: true,
    badge: 'Base Incluida'
  },

  /**
   * 2. Precios y tiempos adicionales según el Largo (Reducidos al 50%)
   */
  lengths: {
    Corto: {
      label: 'Corto (#1 - #2)',
      extraPrice: 0,
      extraMinutes: 0,
      description: 'Largo natural y cómodo al ras o ligeramente estilizado.'
    },
    Mediano: {
      label: 'Mediano (#3 - #4)',
      extraPrice: 22,
      extraMinutes: 10,
      description: 'Equilibrio ideal para lucir arte coquette, aura o francés.'
    },
    Largo: {
      label: 'Largo (#5 - #6)',
      extraPrice: 42,
      extraMinutes: 20,
      description: 'Estilizado dramático con refuerzo estructural en ápice.'
    },
    XL: {
      label: 'XL Editorial (#7+)',
      extraPrice: 70,
      extraMinutes: 30,
      description: 'Máximo impacto visual tipo pasarela con doble sellado estructural.'
    }
  } as Record<NailLength, { label: string; extraPrice: number; extraMinutes: number; description: string }>,

  /**
   * 3. Formas de uña disponibles (Precios reducidos al 50%)
   */
  shapes: [
    {
      id: 'Almendra' as NailShape,
      label: 'Almendra',
      extraPrice: 0,
      extraMinutes: 0,
      description: 'Punta suavemente ovalada que estiliza los dedos.'
    },
    {
      id: 'Stiletto' as NailShape,
      label: 'Stiletto',
      extraPrice: 12,
      extraMinutes: 10,
      description: 'Punta afilada de estética dark coquette / vampy.'
    },
    {
      id: 'Coffin' as NailShape,
      label: 'Coffin / Ballerina',
      extraPrice: 10,
      extraMinutes: 5,
      description: 'Laterales cónicos con punta recta definida.'
    },
    {
      id: 'Cuadrada' as NailShape,
      label: 'Cuadrada',
      extraPrice: 0,
      extraMinutes: 0,
      description: 'Bordes rectos y simétricos de corte clásico.'
    }
  ],

  /**
   * 4. Catálogo de Estilos, Efectos, Mano Alzada y Pedrería/Charms (Precios reducidos al 50%)
   */
  addonsCatalog: [
    // ESTILO / EFECTOS
    {
      id: 'effect-chrome',
      code: 'EFFECT_CHROME',
      name: 'Efecto Espejo / Liquid Chrome',
      category: 'effect',
      description: 'Pigmento metálico espejo (plata líquida, oro viejo o cherry chrome) sellado con top coat de alta retención.',
      processDetail: 'Aplicación de pigmento bruñido sobre capa sin inhibición y doble encapsulado en punta.',
      price: 40,
      durationMinutes: 20,
      included: false,
      badge: 'Tendencia'
    },
    {
      id: 'effect-aura',
      code: 'EFFECT_AURA',
      name: 'Efecto Aura / Airbrush Difuminado',
      category: 'effect',
      description: 'Halo central degradado estilo aerógrafo en tonos cereza, negro humo o blush.',
      processDetail: 'Difuminado por capas con pigmento/aerógrafo y sellado aterciopelado o brillante.',
      price: 38,
      durationMinutes: 20,
      included: false,
      badge: 'Coquette'
    },
    {
      id: 'effect-cateye',
      code: 'EFFECT_CATEYE',
      name: 'Efecto Ojo de Gato (Velvet / Glass Cat Eye)',
      category: 'effect',
      description: 'Gel magnético con partículas multidimensionales moldeadas con imán de neodimio.',
      processDetail: 'Activación magnética perimetral para reflejo cristalino profundo.',
      price: 35,
      durationMinutes: 15,
      included: false
    },
    {
      id: 'effect-french',
      code: 'EFFECT_FRENCH',
      name: 'Francés Estilizado / Micro-French',
      category: 'effect',
      description: 'Sonrisa definida con liner de alta precisión (clásico, gótico en punta o invertido).',
      processDetail: 'Trazo simétrico con pincel liner 7mm en las 10 uñas.',
      price: 32,
      durationMinutes: 20,
      included: false
    },
    {
      id: 'effect-encapsulated',
      code: 'EFFECT_ENCAPSULATED',
      name: 'Encapsulado / Transparencia Jelly',
      category: 'effect',
      description: 'Elementos orgánicos, glitter fino, hoja metálica o velos traslúcidos tipo vidrio.',
      processDetail: 'Construcción de ventana cristalina con gel constructor de alta pureza.',
      price: 35,
      durationMinutes: 20,
      included: false
    },
    {
      id: 'effect-3d-relief',
      code: 'EFFECT_3D_RELIEF',
      name: 'Relieve 3D / Metal Líquido Moldeado',
      category: 'effect',
      description: 'Texturas tridimensionales en gel sólido esculpido (gotas, marcos góticos, ondas cromadas).',
      processDetail: 'Esculpido con gel plastilina/builder 3D y cromado localizado.',
      price: 48,
      durationMinutes: 25,
      included: false,
      badge: 'Signature'
    },

    // DETALLES Y DIBUJO (MANO ALZADA)
    {
      id: 'art-basic',
      code: 'ART_BASIC',
      name: 'Mano Alzada Básico (2 a 4 uñas)',
      category: 'art',
      description: 'Destellos, estrellas de 4 puntas, corazones minimalistas o líneas orgánicas finas.',
      processDetail: 'Micro-pintura en gel paint de alta pigmentación curado por trazo.',
      price: 28,
      durationMinutes: 15,
      included: false
    },
    {
      id: 'art-intermediate',
      code: 'ART_INTERMEDIATE',
      name: 'Mano Alzada Intermedio (4 a 6 uñas)',
      category: 'art',
      description: 'Cerezas dark coquette, encajes, flamas góticas, rosas estilizadas o tribales cyber-sigilism.',
      processDetail: 'Ilustración detallada a dos o tres tonos con sombreado y delineado fino.',
      price: 55,
      durationMinutes: 30,
      included: false,
      badge: 'Más Pedido'
    },
    {
      id: 'art-complex',
      code: 'ART_COMPLEX',
      name: 'Mano Alzada Complejo / Set Editorial (8 a 10 uñas)',
      category: 'art',
      description: 'Arte completo personalizado en cada uña: marmoleado vampy, filigrana barroca o ilustración micro-realista.',
      processDetail: 'Diseño de autor capa por capa con técnica mixta y sellado de galería.',
      price: 92,
      durationMinutes: 45,
      included: false,
      badge: 'Arte de Autor'
    },

    // PEDRERÍA, CHARMS Y RELIEVES METÁLICOS
    {
      id: 'jewelry-rhinestones',
      code: 'JEWELRY_RHINESTONES',
      name: 'Pedrería Cristal & Balines Metálicos',
      category: 'jewelry',
      description: 'Cristales facetados de alto brillo y micro-balines de acero inoxidable que no pierden color.',
      processDetail: 'Engarzado con gel de joyería de alta densidad para duración de +3 semanas.',
      price: 30,
      durationMinutes: 15,
      included: false
    },
    {
      id: 'jewelry-charms',
      code: 'JEWELRY_CHARMS',
      name: 'Charms Coquette / Góticos & Dijes Metálicos',
      category: 'jewelry',
      description: 'Dijes de cerezas, cruces góticas, moños coquette, corazones anatómicos o cadenas colgantes.',
      processDetail: 'Fijación anatómica a la curvatura de la uña y sellado perimetral anti-enganches.',
      price: 42,
      durationMinutes: 15,
      included: false,
      badge: 'Cherry Icon'
    }
  ] as Omit<QuoteItem, 'detectedConfidence'>[],

  /**
   * 5. Tarifas de Traslado a Domicilio en Puebla, Puebla (Reducidas al 50%)
   */
  distancePricing: {
    baseRadiusKm: 3.0,          // Hasta 3 km desde el punto base
    baseFeeUpToRadius: 25,      // Tarifa base de traslado ($25 MXN hasta 3 km)
    extraKmRate: 7,             // +$7 MXN por cada km adicional después de 3 km
    maxServiceRadiusKm: 28,     // Cobertura máxima zona metropolitana Puebla / Cholula
    averageSpeedKmPerHour: 24,  // Velocidad promedio urbana para estimar tiempo de traslado
    setupBufferMinutes: 15      // Margen de instalación de mesa/lámparas a domicilio
  },

  /**
   * 6. Horarios de Atención y Configuración de Agenda
   */
  schedule: {
    openDaysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
    openingHour: '10:00',
    closingHour: '20:00',
    slotIntervalMinutes: 60,
    cleanupBufferMinutes: 15,
    minAdvanceDays: 2                   // Mínimo 2 días de anticipación (no hoy ni mañana)
  }
};

/**
 * Zonas y colonias frecuentes en Puebla, Puebla para centrar rápido el mapa real
 */
export const PUEBLA_NEIGHBORHOODS: PueblaNeighborhoodPreset[] = [
  {
    id: 'centro-paseo-bravo',
    name: 'Centro Histórico / Paseo Bravo',
    zone: 'Zona Centro (Hasta 3 km)',
    lat: 19.0453,
    lng: -98.2035,
    sampleAddress: 'Av. Reforma 708, Centro Histórico, Puebla, Pue.'
  },
  {
    id: 'la-paz-juarez',
    name: 'La Paz / Av. Juárez',
    zone: 'Zona Esmeralda (~2.4 km)',
    lat: 19.0514,
    lng: -98.2238,
    sampleAddress: 'Teziutlán Sur 45, Col. La Paz, Puebla, Pue.'
  },
  {
    id: 'huexotitla-anzures',
    name: 'Huexotitla / Anzures',
    zone: 'Zona Sur-Centro (~3.1 km)',
    lat: 19.0268,
    lng: -98.2041,
    sampleAddress: '43 Oriente 1014, Col. Huexotitla, Puebla, Pue.'
  },
  {
    id: 'angelopolis-sonata',
    name: 'Angelópolis / Reserva Territorial',
    zone: 'Zona Angelópolis (~5.8 km)',
    lat: 19.0315,
    lng: -98.2485,
    sampleAddress: 'Blvd. del Niño Poblano 2510, Reserva Territorial Atlixcáyotl, Puebla, Pue.'
  },
  {
    id: 'zavaleta-santa-cruz',
    name: 'Calzada Zavaleta / Sta. Cruz Buenavista',
    zone: 'Zona Poniente (~6.4 km)',
    lat: 19.0548,
    lng: -98.2572,
    sampleAddress: 'Calzada Zavaleta 3918, Sta. Cruz Buenavista, Puebla, Pue.'
  },
  {
    id: 'buap-san-manuel',
    name: 'Jardines de San Manuel / C.U. BUAP',
    zone: 'Zona Universitaria (~6.2 km)',
    lat: 19.0079,
    lng: -98.1984,
    sampleAddress: 'Av. San Francisco 1420, Jardines de San Manuel, Puebla, Pue.'
  },
  {
    id: 'cholula-udlap',
    name: 'San Andrés / San Pedro Cholula',
    zone: 'Zona Cholula (~9.8 km)',
    lat: 19.0571,
    lng: -98.2948,
    sampleAddress: '14 Oriente 804, San Andrés Cholula, Pue.'
  },
  {
    id: 'lomas-angelopolis',
    name: 'Lomas de Angelópolis (Sonata / Cascatta)',
    zone: 'Zona Lomas (~11.4 km)',
    lat: 18.9835,
    lng: -98.2764,
    sampleAddress: 'Paseo Sinfonía, Distrito Sonata, Lomas de Angelópolis, Pue.'
  }
];

/**
 * Diseños reales inspirados en el feed de @xcherry.nails para prueba con 1 clic
 */
export const XCHERRY_PORTFOLIO_PRESETS: PortfolioPreset[] = [
  {
    id: 'dark-vampy-stiletto',
    title: 'Dark Cherry Vampy Stiletto',
    subtitle: 'Stiletto Largo · Marmoleado Cherry & Negro + Relieve 3D',
    imageUrl: 'assets/sample-dark-vampy.jpg',
    length: 'Largo',
    shape: 'Stiletto',
    activeItemCodes: ['EFFECT_AURA', 'EFFECT_3D_RELIEF', 'ART_COMPLEX'],
    aiSummary: 'Detectado set Soft Gel en punta Stiletto larga con arte dark coquette: base rojo cereza intenso y negro profundo, trazos orgánicos a mano alzada en las 10 uñas y relieve 3D.'
  },
  {
    id: 'chrome-goth-metal',
    title: 'Liquid Silver Gothic Armor',
    subtitle: 'Almendra Largo · Efecto Espejo Cromo + Relieve Metálico 3D',
    imageUrl: 'assets/sample-chrome-goth.jpg',
    length: 'Largo',
    shape: 'Almendra',
    activeItemCodes: ['EFFECT_CHROME', 'EFFECT_3D_RELIEF', 'ART_INTERMEDIATE'],
    aiSummary: 'Detectado set Soft Gel forma Almendra larga con cobertura Liquid Chrome plata espejo, ventanas en rojo cereza y anillos/relieves 3D esculpidos.'
  },
  {
    id: 'cherry-bloom-gold',
    title: 'Coquette Gold Bloom 3D',
    subtitle: 'Almendra Mediano · Flores en Relieve + Delineado Chrome Dorado',
    imageUrl: 'assets/sample-cherry-bloom.jpg',
    length: 'Mediano',
    shape: 'Almendra',
    activeItemCodes: ['EFFECT_CHROME', 'EFFECT_3D_RELIEF', 'ART_INTERMEDIATE', 'JEWELRY_RHINESTONES'],
    aiSummary: 'Detectado set Soft Gel en base milky blush con pétalos florales esculpidos en relieve 3D, perfilado metálico dorado a mano alzada y micro-cristales.'
  },
  {
    id: 'celestial-royal-blue',
    title: 'Celestial Heart & French Gold',
    subtitle: 'Almendra Mediano · Francés Azul Rey + Corazones Cromados',
    imageUrl: 'assets/sample-celestial.jpg',
    length: 'Mediano',
    shape: 'Almendra',
    activeItemCodes: ['EFFECT_FRENCH', 'EFFECT_CHROME', 'ART_INTERMEDIATE', 'JEWELRY_CHARMS'],
    aiSummary: 'Detectado set Soft Gel almendra mediano con francés estilizado azul cobalto, estrellas blancas a mano alzada y corazones en relieve cromado dorado.'
  },
  {
    id: 'rose-cat-eye-gold',
    title: 'Velvet Rose Cat-Eye & Gold Line',
    subtitle: 'Almendra Corto · Ojo de Gato Rosa + Francés Metálico',
    imageUrl: 'assets/sample-coquette-gold.jpg',
    length: 'Corto',
    shape: 'Almendra',
    activeItemCodes: ['EFFECT_CATEYE', 'EFFECT_FRENCH', 'EFFECT_CHROME'],
    aiSummary: 'Detectado set Soft Gel almendra corto con efecto magnético Cat-Eye velvet rosado y línea de sonrisa francés en cromo dorado.'
  }
];
