/**
 * Converts an image to a dataURL
 * @param  {String}   src          The src of the image
 * @param  {Function} callback
 * @param  {String}   outputFormat [outputFormat='image/png']
 * @url   https://gist.github.com/HaNdTriX/7704632/
 * @docs  https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement#Methods
 * @author HaNdTriX
 * @example
 *
 *   toDataUrl('http://goo.gl/AOxHAL', function(base64Img){
 *     console.log('IMAGE:',base64Img);
 *   })
 *
 */
export const fileToBase64String = (
    file: File,
    outputType: "image/png" | "image/jpg" | "image/webp"
): Promise<any> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = (e) => {
            toDataUrl(
                reader.result as string,
                (url) => {
                    console.log("made it to callback 2");
                    console.log("url is " + url);
                    resolve(url);
                },
                outputType
            );
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsDataURL(file);
    }).catch((e) => {
        throw e;
    });
};

export function toDataUrl(
    src: string,
    callback: (dataUrl: string) => void,
    outputFormat: "image/png" | "image/jpg" | "image/webp"
) {
    // Create an Image object
    const img = new Image();
    // Add CORS approval to prevent a tainted canvas
    img.crossOrigin = "Anonymous";
    img.onload = function () {
        console.log("made it to image onload");
        // Create an html canvas element
        let canvas = document.createElement("CANVAS");
        // Create a 2d context
        const ctx = (canvas as any).getContext("2d");
        // Resize the canavas to the original image dimensions
        (canvas as any).height = (this as any).naturalHeight;
        (canvas as any).width = (this as any).naturalWidth;
        // Draw the image to a canvas
        ctx.drawImage(this, 0, 0);
        // Convert the canvas to a data url
        const dataURL = (canvas as any).toDataURL(outputFormat);
        // Return the data url via callback
        callback(dataURL);
        // Mark the canvas to be ready for garbage
        // collection
        (canvas as any) = null;
    };
    img.onerror = function (error) {
        console.error(error);
    };
    // Load the image
    img.src = src;
    // make sure the load event fires for cached images too
    if (img.complete || img.complete === undefined) {
        // Flush cache
        img.src =
            "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        // Try again
        img.src = src;
    }
}
