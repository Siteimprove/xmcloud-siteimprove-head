var si = window._si || [];

function SiteImprovePush(url, token) {
    si.push(["input", url, token, SiteImprovePushCallBack]);
}

function SiteImproveDomain(domain, token) {
    si.push(["domain", domain, token, SiteImproveDomainCallBack]);
}

function SiteImproveRecheck(url, token) {
    si.push(["recheck", url, token, SiteImproveRecheckCallBack]);
}

var siteImproveContentCheckHtml;
function SiteImproveContentCheck(previewUrl, liveurl, token) {

    fetch(previewUrl, {
        credentials: 'same-origin'
    }).then(function (response) {
        return response.text();
    }).then(function (htmlResult) {
        si.push([
            'onHighlight',
            hightlightExperienceEditor
        ]);

        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(htmlResult, 'text/html');
        let htmlFrontend = htmlDoc.body.children.__next;
        var sitecoreEditorElement = htmlDoc.body.firstChild;
        sitecoreEditorElement.parentNode.removeChild(sitecoreEditorElement);

        var sitecoreFormElement = htmlDoc.body.firstChild;
        sitecoreFormElement.parentNode.removeChild(sitecoreFormElement);
        siteImproveContentCheckHtml = htmlDoc.documentElement.outerHTML;


        fetch("?sc_mode=edit", {
            credentials: 'same-origin'
        });


        si.push([
            'contentcheck',
            siteImproveContentCheckHtml,
            liveurl,
            token,
            function (contentId) {
                drawContentCheckDialog("Content check preview")
            }
        ]);

        drawContentCheckDialog("Content check preview");
        var iframe = document.getElementById("sidialogiframe");
        iframe.contentWindow.document.write("<html><body></body></html>");
        iframe.contentWindow.document.documentElement.innerHTML = siteImproveContentCheckHtml;
        iframe.contentWindow.document.body.appendChild(htmlFrontend);

    }).catch(function (error) {
        console.log("Error in function SiteImproveContentCheck: " + error);
    });

};

function SiteImproveRecheckCallBack() {
    //console.log("SiteImproveRecheckCallBack");
}

function SiteImproveDomainCallBack() {
    //console.log("SiteImproveDomainCallBack");
}

function SiteImprovePushCallBack() {
    //console.log("SiteImprovePushCallBack");
}


function hightlightExperienceEditor(highlightInfo) {


    // Highlight is running again before previous highlight was cleaned up. Clean it up now!
    if (window.siteimproveHighlightCleanupFunction) {
        window.siteimproveHighlightCleanupFunction();
    }


    drawContentCheckDialog("Content check");
    var iframe = document.getElementById("sidialogiframe");

    iframe.contentWindow.document.documentElement.innerHTML = "";
    iframe.contentWindow.document.documentElement.innerHTML = siteImproveContentCheckHtml;

    // Add styling to iFrame
    var stylingId = 'siteimprove-styling';
    var styling = iframe.contentWindow.document.documentElement.getElementsByClassName(stylingId)[0];
    if (!styling) {
        iframe.contentWindow.document.documentElement.insertAdjacentHTML(
            'beforeend',
            `
            <style type="text/css" id="${stylingId}">
                .siteimprove-highlight {
                animation: siteimprove-pulse 0.5s;
                animation-iteration-count: 8;
                outline: 5px solid transparent;
                outline-offset: -3px;
                }
                .siteimprove-highlight-inner {
                animation: siteimprove-pulse 0.5s;
                animation-iteration-count: 8;
                outline: 5px solid transparent;
                outline-offset: -5px;
                }
                @keyframes siteimprove-pulse {
                from { outline-color: transparent; }
                50% { outline-color: #ffc107; }
                to { outline-color: transparent; }
                }
            </style>
        `
        );
    }

    // Highlight classes
    var highlightClass = 'siteimprove-highlight';
    var highlightClassInner = 'siteimprove-highlight-inner';

    // Add highlight
    highlightInfo.highlights.forEach((info, index) => {
        // If error is inside the HEAD tag. Then Highlight the body
        if (info.selector.startsWith('HEAD')) {
            info.selector = 'BODY';
            info.offset = null;
        }

        var element = iframe.contentWindow.document.documentElement.querySelector(info.selector);

        if (element) {
            // Scroll into view (add eventlistener)
            if (index === 0) {
                //idocument.body.setAttribute("onload", "javascript:alert('check');alert('check2');");
                element.scrollIntoView({
                    block: "center",
                    behavior: "smooth"
                });
            }

            // Cleanup after adding highlight
            var cleanup = (callback) => {
                window.siteimproveHighlightCleanupFunction = () => {
                    callback();
                    window.clearTimeout(
                        window.siteimproveHighlightCleanupTimer
                    );
                    window.siteimproveHighlightCleanupTimer = null;
                    window.siteimproveHighlightCleanupFunction = null;
                };
                window.siteimproveHighlightCleanupTimer = setTimeout(() => {
                    window.siteimproveHighlightCleanupFunction();
                }, 4000);
            };

            // Highlight text
            if (info.offset) {
                var originalHTML = element.innerHTML;
                var errorChild = element.childNodes[info.offset.child];
                var errorText = errorChild.textContent;
                var start = info.offset.start;
                var end = info.offset.start + info.offset.length;

                var beforeWord = errorText.slice(0, start);
                var beforeNode = document.createTextNode(beforeWord);
                element.insertBefore(beforeNode, errorChild);

                var errorWord = errorText.slice(start, end);
                var errorNode = document.createElement('span');
                errorNode.innerText = errorWord;
                errorNode.classList.add(highlightClass);
                element.insertBefore(errorNode, errorChild);

                var afterWord = errorText.slice(end);
                var afterNode = document.createTextNode(afterWord);
                element.insertBefore(afterNode, errorChild);

                element.removeChild(errorChild);

                cleanup(() => {
                    element.innerHTML = originalHTML;
                });
            } else {
                // Highlight body
                if (element.tagName === 'BODY') {
                    element.classList.add(highlightClassInner);

                    cleanup(() => {
                        element.classList.remove(highlightClassInner);
                    });
                } else {
                    // Highlight other tag types
                    element.classList.add(highlightClass);

                    cleanup(() => {
                        element.classList.remove(highlightClass);
                    });
                }
            }
        }
    });

}

// returns a handle to a dialogwindow
function drawContentCheckDialog(dialogtitle) {

    if (document.getElementById("sidialog") != null) {
        document.getElementById("sidialogtitle").innerHTML = dialogtitle;
        return document.getElementById("sidialog");
    }

    const w = 1024;
    const h = 768;
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft
    const top = (height - h) / 2 / systemZoom + dualScreenTop


    var dialogElement = document.createElement("div");
    dialogElement.id = "sidialog";
    //dialogElement.setAttribute("style", "z-index:90000;position:absolute;width:" + w + "px;height:" + h +"px;background-color:#fafafa;top:" + top + "px;left:" + left +"px;box-shadow:0 2px 4px rgba(40,49,66,0.12),0 1px 16px rgba(40,49,66,0.02);border-radius:5px;border: 1px solid #bbb;");
    dialogElement.setAttribute("style", "position:fixed;left: 50%;top: 50%;transform: translate(-50%, -50%);display: flex;justify-content: center;align-items: center;z-index:90000;background-color:#fafafa;box-shadow:0 2px 4px rgba(40,49,66,0.12),0 1px 16px rgba(40,49,66,0.02);border-radius:5px;border: 1px solid #bbb;");

    dialogHeaderElement = document.createElement("div");
    dialogHeaderElement.id = "sidialogheader"
    dialogHeaderElement.setAttribute("style", "padding: 0;margin: 0;border: 0;position: fixed;top: 0;width: 100%;");

    dialogTitleElement = document.createElement("div");
    dialogTitleElement.id = "sidialogtitle"
    dialogTitleElement.setAttribute("style", "height:35px;padding-top:15px;background-color:#2c384b;border-top-left-radius:4px;border-top-right-radius:4px;border:0;display:flex;justify-content:center;font-family: Roboto, arial, sans-serif; font-size: 16px; color:#ffffff;");
    dialogTitleElement.innerHTML = dialogtitle;

    dialogCloseButton = document.createElement("div");
    dialogCloseButton.setAttribute("style", "position: absolute;top:15px;right:15px;height:35px;font-family: Roboto, arial, sans-serif; font-size: 20px; color:#ffffff;cursor:pointer;");
    dialogCloseButton.setAttribute("onclick", "closeDialog();");
    dialogCloseButton.setAttribute("title", "close");
    dialogCloseButton.innerHTML = "X";


    dialogBodyElement = document.createElement("div");
    dialogBodyElement.id = "sidialogbody"

    dialogIframeElement = document.createElement("iframe");
    dialogIframeElement.setAttribute("style", "width:" + w + "px;height:" + (h - 60) + "px;border:0;overflow:scroll");
    dialogIframeElement.id = "sidialogiframe"

    dialogHeaderElement.appendChild(dialogTitleElement);
    dialogHeaderElement.appendChild(dialogCloseButton);

    dialogElement.appendChild(dialogHeaderElement);
    dialogBodyElement.appendChild(dialogIframeElement)
    dialogElement.appendChild(dialogBodyElement);

    document.body.appendChild(dialogElement);

    dragElement(document.getElementById("sidialog"));

    return dialogElement;
}

function closeDialog() {

    if (document.getElementById("sidialog") != null) {
        document.getElementById("sidialog").remove();
    }
}

// Make the DIV element draggable: (w3schools)
//dragElement(document.getElementById("sidialog"));


function dragElement(element) {
    var dialog = document.querySelector("#sidialog");
    var titlebar = document.querySelector("#sidialogtitle");

    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = (dialog.clientWidth / 2) * -1;
    var yOffset = (dialog.clientHeight / 2) * -1;

    document.addEventListener("touchstart", dragStart, false);
    document.addEventListener("touchend", dragEnd, false);
    document.addEventListener("touchmove", drag, false);

    document.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === titlebar) {
            active = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        active = false;
    }

    function drag(e) {
        if (active) {

            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
                if (e.touches[0].clientY < 20 || e.touches[0].clientY > (document.innerHeight - 30)) {
                    return;
                }
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                if (e.clientY < 0 || e.clientY > (window.innerHeight - 30)) {
                    return;
                }
            }

            xOffset = currentX;
            yOffset = currentY;


            setTranslate(currentX, currentY, dialog);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
}



