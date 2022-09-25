import { TICK } from "./constants";

export default function wait (time = TICK) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), time);
    });
}
