export const joinUrls = function (...urls: string[]): string {
    return urls.map((url, index) => {
        if (index !== 0 && url.startsWith('/')) {
            return url.slice(1);
        }
        if (index !== urls.length - 1 && url.endsWith('/')) {
            return url.slice(0, -1);
        }
        return url;
    }).join('/');
}
