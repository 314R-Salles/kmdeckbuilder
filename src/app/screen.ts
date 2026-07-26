import {inject, Injectable} from '@angular/core';
import {BreakpointObserver} from "@angular/cdk/layout";

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  // Breakpoint utilisés sur la partie "medias"
  bPoint850px = '(min-width: 850px)';
  bPoint1050px = '(min-width: 1050px)';
  bPoint1250px = '(min-width: 1250px)';
  bPoint1600px = '(min-width: 1600px)';
  bPoint1800px = '(min-width: 1800px)';

  allBpoints = [this.bPoint850px, this.bPoint1050px, this.bPoint1250px, this.bPoint1600px, this.bPoint1800px]

  // breakpoint sur le composant "section"
// @media (max-width: 1700px) {
// .section {
//   margin: 0 auto;
//   //min() rend la transition fluide en redimensionnant l'écran | 100% jusqu'à 75% de 1700px
//   width: min(100%, 1275px) ;
// }
// }

  breakpointObserver = inject(BreakpointObserver);


  observer = this.breakpointObserver.observe(this.allBpoints)


}
