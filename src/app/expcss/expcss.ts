import {AfterViewInit, Component} from '@angular/core';
import {Section} from "../base/section/section";
import {gsap} from 'gsap';
import { Draggable } from 'gsap/dist/Draggable'; // sus
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-expcss',
  imports: [
    Section,
    MatIcon,
  ],
  templateUrl: './expcss.html',
  styleUrl: './expcss.scss'
})
export class Expcss implements AfterViewInit {
  tlError
  tlSuccess
  tlWindow

  ngAfterViewInit() {

    this.draggable()

    let duration = 0.8

    this.tlError = gsap.timeline()
      .to('.container', {
        x: 100
      })
      .addLabel("start", ">")
      .to('.container', {
        duration: 0.2 * duration,
        opacity: '1',
      }, 'start')
      .to('.container', {
        duration: 0.4 * duration,
        x: 0
      }, 'start')
      .addLabel("postTranslation", ">")
      .to('.box1', {
        duration,
        // opacity: '1',
        width: '35px',
        ease: "power4.out",
      }, "postTranslation-=0.1")
      .to('.box2', {
        duration,
        display: 'flex',
        // opacity: '1',
        width: '215px',
        // marginLeft: '0',
      }, 'postTranslation+=0')

      .to('.server', {
        duration,
        x: 0,
        // marginLeft: '0',
        marginTop: '-1',
        fontSize: '31px',
        fontWeight: '600',
      }, 'postTranslation+=0')
      .to('.error', {
        duration,
        x: -3,
        // marginLeft: '-3',
        marginTop: '-1',
        fontSize: '31px',
        fontWeight: '600',
      }, 'postTranslation+=0')
      .to('.warnIcon', {
        duration: duration * 0.5,
        opacity: '1',
      }, 'postTranslation+=0.2')
      .set('.container', {
        filter: "brightness(1)",
      }, 'postTranslation+=1.0')
      .to('.container', {
        duration: 0.3 * duration,
        filter: "brightness(1.2)",
        repeat: 3,
        yoyo: true,
      }, 'postTranslation+=1.1')
      .to('.container', {
        duration: 0.1 * duration,
        opacity: 0.2,
        repeat: 4,
        yoyo: true,
      })
      .set('.container', {
        opacity: 0,
      })


    this.tlSuccess = gsap.timeline()
      .to('.containerS', {x: 100})
      .addLabel("start", ">")
      .to('.containerS', {
        duration: 0.2 * duration, opacity: '1',
      }, 'start')
      .to('.containerS', {
        duration: 0.4 * duration, x: 0
      }, 'start')
      .addLabel("postTranslation", ">")
      .to('.box1S', {
        duration, width: '35px', ease: "power4.out",
      }, "postTranslation-=0.1")
      .to('.box2S', {
        duration, display: 'flex', width: '280px'
      }, 'postTranslation+=0')
      .to('.content', {
        duration, x: 0, marginTop: '-1', fontSize: '31px', fontWeight: '600',
      }, 'postTranslation+=0')
      .to('.updated', {
        duration, x: -3, marginTop: '-1', fontSize: '31px', fontWeight: '600',
      }, 'postTranslation+=0')
      .to('.saveIcon', {
        duration: duration * 0.5, opacity: '1'
      }, 'postTranslation+=0.2')
      .set('.containerS', {
        filter: "brightness(1)",
      }, 'postTranslation+=1.0')
      .to('.containerS', {
        duration: 0.3 * duration, filter: "brightness(1.2)", repeat: 3, yoyo: true
      }, 'postTranslation+=1.1')
      .to('.containerS', {
        duration: 0.1 * duration, opacity: 0.2, repeat: 4, yoyo: true
      })
      .set('.containerS', {
        opacity: 0,
      })


    let windowDuration = 0.35
    this.tlWindow = gsap.timeline()
      .addLabel("start", ">")
      .to('.window', {height: 300, y: 0, duration: windowDuration}, "start")
      .to('.containerWindowU', {height: 100, duration: windowDuration}, "start")
      .to('.containerWindowL', {height: 100, duration: windowDuration}, "start")

  }


  draggable() {
    gsap.registerPlugin(Draggable);
    Draggable.create('#dragid', {
      type: 'rotation',
      bounds: document.getElementById('container'),
      inertia: true,
      onClick: function () {
        console.log('clicked');
      },
      onDragEnd: function () {
        console.log('drag ended');
      }
    });
  }

}

