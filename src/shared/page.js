export function isListingPage(url = window.location.href) {
    try {
        const path = new URL(url).pathname;
        return path.startsWith('/listing');
    } catch {
        return false;
    }
}

export function createPageManager(observer) {
    let wasOnListing = false;

    return {
        handleUrlChange(url) {
            const isListing = isListingPage(url);
            if (isListing && !wasOnListing) {
                observer.start();
            } else if (!isListing && wasOnListing) {
                observer.stop();
            }
            wasOnListing = isListing;
        },
        isOnListing() {
            return wasOnListing;
        }
    };
}
