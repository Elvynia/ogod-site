import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FocusService {
    private state$: BehaviorSubject<boolean>;

    get state(): Observable<boolean> {
        return this.state$.asObservable();
    }

    constructor() {
        this.state$ = new BehaviorSubject(false);
    }

    changeState(state: boolean) {
        this.state$.next(state);
    }
}
