// htmlCleaner.ts
export function cleanHtmlContent(htmlContent: string): string {
    // Create a new div to hold the cleaned content
    const cleanDiv = document.createElement('div');
    cleanDiv.innerHTML = htmlContent;

    // Remove script and style elements
    const scriptsAndStyles = cleanDiv.querySelectorAll('script, style');
    scriptsAndStyles.forEach(el => el.remove());

    // Remove all attributes from remaining elements except images
    const allElements = cleanDiv.getElementsByTagName('*');
    for (let el of Array.from(allElements)) {
        if (el.tagName.toLowerCase() !== 'img') {
            while (el.attributes.length > 0) {
                el.removeAttribute(el.attributes[0].name);
            }
        }
    }

    // Convert specific elements to simpler ones (retain text structure)
    const elementsToSimplify = cleanDiv.querySelectorAll('div, span, strong, em, i, b');
    elementsToSimplify.forEach(el => {
        const p = document.createElement('p');
        p.innerHTML = el.innerHTML;
        if (el.parentNode) {
            el.parentNode.replaceChild(p, el);
        }
    });

    return cleanDiv.innerHTML;
}
