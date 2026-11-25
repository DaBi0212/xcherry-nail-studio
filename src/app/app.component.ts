import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ReferenceAnalyzerComponent } from './features/quoter/reference-analyzer.component';
import { InteractiveQuoterComponent } from './features/quoter/interactive-quoter.component';
import { DistanceCalculatorComponent } from './features/quoter/distance-calculator.component';
import { WeeklySchedulerComponent } from './features/scheduler/weekly-scheduler.component';
import { ClientCheckoutComponent } from './features/scheduler/client-checkout.component';
import { QuoteStateService } from './core/services/quote-state.service';
import { PRICING_CONFIG } from './core/config/pricing.config';
import { WizardStep } from './core/models/nail-quote.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ReferenceAnalyzerComponent,
    InteractiveQuoterComponent,
    DistanceCalculatorComponent,
    WeeklySchedulerComponent,
    ClientCheckoutComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly quoteState = inject(QuoteStateService);
  readonly studio = PRICING_CONFIG.studioInfo;

  readonly steps: { step: WizardStep; shortTitle: string; subtitle: string }[] = [
    { step: 1, shortTitle: '1. Referencia', subtitle: 'Sube foto o video' },
    { step: 2, shortTitle: '2. Personalizar', subtitle: 'Largo, forma y efectos' },
    { step: 3, shortTitle: '3. Domicilio', subtitle: 'Mapa real Puebla' },
    { step: 4, shortTitle: '4. Fecha y Hora', subtitle: 'Mín. 2 días antes' },
    { step: 5, shortTitle: '5. Datos y Ticket', subtitle: 'Descarga y WhatsApp' }
  ];

  goToStep(step: WizardStep): void {
    this.quoteState.goToStep(step);
  }
}
