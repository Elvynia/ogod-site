import { Component } from '@angular/core';
import { NgxMatColorPickerInputEvent } from '@angular-material-components/color-picker';

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

    constructor() {
        this.bgColor = '#5B8E7D';
        this.scene = true;
        this.ball = false;
        this.lightA = false;
        this.lightP = true;
        this.lightS = true;
    }

    refreshColor(color: NgxMatColorPickerInputEvent) {
        if (color?.value) {
            this.bgColor = '#' + color.value.hex;
        } else {
            this.bgColor = null;
        }
    }

    debugState(engine) {
        console.log(engine.state$.value);
    }
}
