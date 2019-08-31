import { animationFrameScheduler, defer, interval } from "rxjs";
import { map, takeWhile } from "rxjs/operators";

export function msElapsed(scheduler = animationFrameScheduler) {
    return defer(() => {
        const start = scheduler.now();
        return interval(0, scheduler).pipe(
            map(() => scheduler.now() - start)
        );
    });
}

export function duration(time) {
    return msElapsed().pipe(
        map((ms) => ms / time),
        takeWhile((val) => val <= 1)
    );
}

export function distance(dist) {
    return (time) => dist * time;
}

// FIXME: use npm package eases from mattdesl.
export function elasticOut(t) {
    return Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0
}
export function backIn(t) {
    var s = 1.70158
    return t * t * ((s + 1) * t - s)
}
export function sineOut(t) {
    return Math.sin(t * Math.PI / 2)
}