import {Directive, DestroyRef, ElementRef, inject} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';

// Décore MatTooltip (host directive) au lieu d'en hériter : on réutilise tout son
// comportement d'affichage et on ajoute uniquement la règle d'activation conditionnelle.
@Directive({
  selector: '[appTooltipIfTruncated]',
  hostDirectives: [{
    directive: MatTooltip,
    inputs: ['matTooltip: appTooltipIfTruncated']
  }]
})
export class TooltipIfTruncated {
  private elementRef = inject(ElementRef<HTMLElement>);
  private matTooltip = inject(MatTooltip);

  constructor() {
    const resizeObserver = new ResizeObserver(() => this.updateDisabledState());
    resizeObserver.observe(this.elementRef.nativeElement);
    inject(DestroyRef).onDestroy(() => resizeObserver.disconnect());
  }

  private updateDisabledState(): void {
    const element = this.elementRef.nativeElement;
    this.matTooltip.disabled = element.scrollWidth <= element.clientWidth;
  }
}
