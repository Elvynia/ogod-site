import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from 'rxjs/operators';
import { Bubble } from "./state";

@Injectable({
    providedIn: 'root'
})
export class BubbleService {
    apiUrl: string;
    headers: HttpHeaders;

    constructor(private httpClient: HttpClient) {
        this.apiUrl = '/api/bubble';
        this.headers = new HttpHeaders().append('Access-Control-Allow-Origin', '*');
    }

    list(): Observable<Bubble[]> {
        // return this.httpClient.get<Bubble[]>(this.apiUrl);
        return of([{
            id: 'ogod',
            name: 'ogod',
            tags: []
        }, {
            id: 'projects',
            name: 'projects',
            tags: ['ogod']
        }, {
            id: 'docs',
            name: 'docs',
            tags: ['ogod']
        }, {
            id: 'common',
            name: 'common',
            tags: ['projects']
        }, {
            id: 'runtime',
            name: 'runtime',
            tags: ['projects']
        }, {
            id: 'element',
            name: 'element',
            tags: ['projects']
        }, {
            id: 'd2',
            name: 'd2',
            tags: ['runtime', 'element']
        }, {
            id: 'hybrids',
            name: 'hybrids',
            tags: ['ogod']
        }, {
            id: 'angular',
            name: 'angular',
            tags: ['ogod']
        }
    ]).pipe(delay(0));
    }
}
