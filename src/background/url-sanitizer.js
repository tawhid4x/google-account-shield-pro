export function sanitizeGoogleUrlForSwitch(rawUrl, targetAuthUserIndex = 0) {
    try {
        let url = new URL(rawUrl);
        url.pathname = url.pathname.replace(/\/u\/\d+(\/|$)/g, `/u/${targetAuthUserIndex}/`);
        url.searchParams.set('authuser', targetAuthUserIndex);
        return url.href;
    } catch(e) {
        return rawUrl;
    }
}
