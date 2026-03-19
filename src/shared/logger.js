const BUFFER = [];
let enabled = false;
let flushScheduled = false;

function flush() {
    flushScheduled = false;
    if (BUFFER.length === 0) return;
    console.groupCollapsed(`[EngineBlock] ${BUFFER.length} log(s)`);
    BUFFER.forEach(({ method, args }) => console[method](...args));
    console.groupEnd();
    BUFFER.length = 0;
}

function scheduleFlush() {
    if (flushScheduled) return;
    flushScheduled = true;
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(flush);
    } else {
        setTimeout(flush, 100);
    }
}

export const logger = {
    setEnabled(val) { enabled = val; },
    log(...args) {
        if (!enabled) return;
        BUFFER.push({ method: 'log', args });
        scheduleFlush();
    },
    info(...args) {
        if (!enabled) return;
        BUFFER.push({ method: 'info', args });
        scheduleFlush();
    }
};
