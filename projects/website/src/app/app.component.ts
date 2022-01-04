import { Component } from '@angular/core';
import { NgxMatColorPickerInputEvent } from '@angular-material-components/color-picker';
import { Router } from '@angular/router';
import { FocusService } from './focus.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'ogod-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    bgColor: string;
    scene: boolean;
    ball: boolean;
    lightA: boolean;
    lightP: boolean;
    lightS: boolean;
    docActive: boolean;
    translatorActive: boolean;
    focus: Observable<boolean>;

    constructor(private router: Router, private focusService: FocusService) {
        this.bgColor = '#5B8E7D';
        this.scene = true;
        this.ball = false;
        this.lightA = false;
        this.lightP = true;
        this.lightS = true;
        this.docActive = location.href.endsWith('/docs');
        this.translatorActive = location.href.endsWith('/translate');
        this.focus = this.focusService.state;
    }

    refreshColor(color: NgxMatColorPickerInputEvent) {
        if (color?.value) {
            this.bgColor = '#' + color.value.hex;
        } else {
            this.bgColor = null;
        }
    }

    toggleTranslator() {
        this.translatorActive = !this.translatorActive;
        if (this.translatorActive) {
            this.router.navigate(['translate']);
        } else {
            this.router.navigate(['/'])
        }
    }

    toggleDocs() {
        this.docActive = !this.docActive;
        if (this.docActive) {
            this.router.navigate(['docs']);
        } else {
            this.router.navigate(['/']);
        }
    }

    debugState(engine) {
        console.log(engine.state$.value);
    }
}
