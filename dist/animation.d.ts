export declare function msElapsed(scheduler?: import("rxjs/internal/scheduler/AnimationFrameScheduler").AnimationFrameScheduler): import("rxjs").Observable<number>;
export declare function duration(time: any): import("rxjs").Observable<number>;
export declare function distance(dist: any): (time: any) => number;
export declare function elasticOut(t: any): number;
export declare function backIn(t: any): number;
export declare function sineOut(t: any): number;
