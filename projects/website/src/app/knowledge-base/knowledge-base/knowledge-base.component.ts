import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { instanceInit, OGOD_CATEGORY } from '@ogod/common';
import { from } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { BubbleService } from '../../bubble/service';
import { Bubble } from '../../bubble/state';

@Component({
    selector: 'ogod-knowledge-base',
    templateUrl: './knowledge-base.component.html',
    styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit, AfterViewInit {
    @ViewChild('sys') knowledgeSystem: ElementRef<any>;
    defaultRoot: string;
    root: string;

    constructor(private bubbleService: BubbleService) {
        this.defaultRoot = 'ogod';
        this.root = '';
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        const worker = this.knowledgeSystem.nativeElement.engine.worker;
        this.bubbleService.list().pipe(
            switchMap((bubbles) => from(bubbles)),
            delay(0)
        ).subscribe({
            next: (bubble) => {
                const id = 'bubble-' + bubble.id;
                worker.postMessage(instanceInit({
                    id,
                    state: {
                        active: true,
                        category: OGOD_CATEGORY.INSTANCE,
                        runtime: 'bubble',
                        id,
                        scenes: ['ogod-scene-default'],
                        tick: true,
                        reflects: ['textPosition'],
                        updates: [],
                        watches: [],
                        bubble,
                        geometry: {
                            type: 'Sphere',
                            buffered: true,
                            args: [0, 32, 32]
                        },
                        material: {
                            type: 'MeshPhong',
                            args: [{ color: 0xF4A259 }]
                        },
                        textPosition: null
                    } as any
                }));
            },
            complete: () => this.root = this.defaultRoot
        });
    }

}
