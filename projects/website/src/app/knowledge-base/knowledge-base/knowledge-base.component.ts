import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { instanceInit, OGOD_CATEGORY } from '@ogod/common';
import { BehaviorSubject, from } from 'rxjs';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { OgodElementEngine } from '@ogod/element-core';
import { BubbleService } from '../../bubble/service';
import { Bubble, BubbleLabel } from '../../bubble/state';

@Component({
    selector: 'ogod-knowledge-base',
    templateUrl: './knowledge-base.component.html',
    styleUrls: ['./knowledge-base.component.scss']
})
export class KnowledgeBaseComponent implements OnInit, AfterViewInit {
    @ViewChild('sys') knowledgeSystem: ElementRef<any>;
    defaultRoot: string;
    root: string;
    bubbleList: Bubble[];
    bubbles: BehaviorSubject<{ [id: string]: BubbleLabel }>;

    constructor(private bubbleService: BubbleService, private cd: ChangeDetectorRef) {
        this.defaultRoot = 'ogod';
        this.root = '';
        this.bubbles = new BehaviorSubject({});
    }

    ngOnInit(): void {
        this.bubbles.pipe(
            debounceTime(20)
        ).subscribe(() => this.cd.detectChanges());
    }

    ngAfterViewInit(): void {
        const engine: OgodElementEngine = this.knowledgeSystem.nativeElement.engine;
        this.bubbleService.list().pipe(
            tap((bubbles) => this.bubbleList = bubbles),
            switchMap((bubbles) => from(bubbles)),
            delay(0)
        ).subscribe({
            next: (bubble) => {
                const id = 'bubble-' + bubble.id;
                engine.worker.postMessage(instanceInit({
                    id,
                    state: {
                        action: this.defaultRoot === bubble.id ? 'docs' : undefined,
                        active: true,
                        category: OGOD_CATEGORY.INSTANCE,
                        runtime: 'bubble',
                        id,
                        cameraScene: 'ogod-scene-default',
                        groups: ['ogod-instance-knowledge-base'],
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
        engine.update$.subscribe((update) => {
            if (update.state.textPosition) {
                if (!this.bubbles.value[update.id]) {
                    this.bubbles.value[update.id] = {
                        id: update.id,
                        text: this.getBubbleText(update.id)
                    };
                }
                this.bubbles.next({
                    ...this.bubbles.value,
                    [update.id]: {
                        ...this.bubbles.value[update.id],
                        x: update.state.textPosition.x,
                        y: update.state.textPosition.y
                    }
                });
            } else {
                let bubbles = this.bubbles.value;
                delete bubbles[update.id];
                this.bubbles.next(bubbles);
            }
        });
    }

    getBubbleText(id: string): string {
        return this.bubbleList.find((b) => id.endsWith(b.id)).name;
    }

}
