import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, filter, pluck, switchMap } from 'rxjs/operators';
import { FocusService } from '../focus.service';

@Component({
    selector: 'ogod-translator-view',
    templateUrl: './translator-view.component.html',
    styleUrls: ['./translator-view.component.scss']
})
export class TranslatorViewComponent implements OnInit {
    control: FormControl;
    result: string;

    constructor(private httpClient: HttpClient, private fromBuilder: FormBuilder,
        public focusService: FocusService) {
        this.control = this.fromBuilder.control('');
    }

    ngOnInit(): void {
        this.control.valueChanges.pipe(
            debounceTime(1200),
            filter((value) => !!value),
            switchMap((value) => this.translate(value, 'fr', 'en'))
        ).subscribe((value: any) => {
            this.result = value;
        });
    }

    translate(q: string, source: string, target: string) {
        return this.httpClient.post('https://libretranslate.de/translate', { q, source, target }).pipe(
            pluck('translatedText')
        );
    }

}
