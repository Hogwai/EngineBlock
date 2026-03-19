import { CONFIG } from './config.js';
import { logger } from './logger.js';

export function createObserver(scanFn) {
    let observer = null;
    let retryCount = 0;
    let retryTimer = null;

    function debounce(fn, delay) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(fn, delay);
        };
    }

    const debouncedScan = debounce(scanFn, CONFIG.DELAYS.DEBOUNCE);

    function attachAndScan() {
        observer = new MutationObserver((mutations) => {
            const hasAdded = mutations.some(m => m.addedNodes.length > 0);
            if (hasAdded) debouncedScan();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        logger.log('Observer attached to document.body');
        scanFn();
    }

    function waitForWrapper() {
        const wrapper = document.querySelector(CONFIG.SELECTORS.FEED_WRAPPER);
        if (wrapper) {
            attachAndScan();
            return;
        }
        retryCount++;
        if (retryCount < CONFIG.DELAYS.MAX_WRAPPER_RETRIES) {
            retryTimer = setTimeout(waitForWrapper, CONFIG.DELAYS.WRAPPER_RETRY);
        } else {
            logger.log('Feed wrapper not found after retries, attaching anyway');
            attachAndScan();
        }
    }

    return {
        start() {
            retryCount = 0;
            waitForWrapper();
        },
        stop() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (retryTimer) {
                clearTimeout(retryTimer);
                retryTimer = null;
            }
        }
    };
}
