import { Component } from '@angular/core';
import { PRICING_CONFIG } from '../../../core/config/pricing.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-[#111111] text-white border-t-2 border-[#B8001F] mt-16 pb-24 sm:pb-12">
      <div class="max-w-5xl mx-auto px-4 py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <!-- Logo & Tagline -->
          <div class="flex items-center gap-4">
            <img
              src="assets/logo-xcherry.png"
              alt="XCHERRY NAIL STUDIO"
              class="w-16 h-16 rounded-full bg-white p-0.5 border border-[#B8001F] shrink-0"
            />
            <div>
              <h3 class="font-serif text-xl font-bold tracking-wide text-white">
                {{ studio.name }}
              </h3>
              <p class="font-serif italic text-[#D00024] text-base">
                "{{ studio.slogan }} 🍒"
              </p>
              <p class="text-xs text-white/60 mt-1">
                {{ studio.specialty }} · {{ studio.city }}
              </p>
            </div>
          </div>

          <!-- Guarantee & Hygiene -->
          <div class="text-xs text-white/75 space-y-1.5 border-l border-white/15 pl-4">
            <div class="font-semibold uppercase tracking-widest text-[#FFF0F3]">Estándar Boutique Soft Gel</div>
            <p>• Material 100% gel orgánico hipoalergénico e instrumental esterilizado.</p>
            <p>• Servicio a domicilio equipado con lámpara profesional, extractor e iluminación en Puebla y Cholula.</p>
          </div>

          <!-- Social & Direct Contact -->
          <div class="flex flex-col sm:items-end gap-2">
            <a
              href="https://instagram.com/xcherry.nails"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 bg-white/10 hover:bg-[#B8001F] text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <span>Síguenos en Instagram {{ studio.instagramHandle }}</span>
            </a>
            <span class="text-[11px] text-white/50">
              Configuración de precios centralizada en <code class="text-white/80">pricing.config.ts</code>
            </span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  readonly studio = PRICING_CONFIG.studioInfo;
}
