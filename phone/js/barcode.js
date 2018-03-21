let shouldStartDetect = false;

initCamera = function () {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scan-barcode'),
            constraints: {
                width: {
                    min: 640
                },
                height: {
                    min: 480
                },
                facingMode: "environment",
                aspectRatio: {
                    min: 1,
                    max: 2
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers: [
                    {
                        format: "code_128_reader",
                        config: {}
                    }
                ]
            },
            locate: true
        },
        locator: {},
        decoder: {
            readers: ["code_128_reader"]
        }
    }, function (err) {
        if (err) {
            // todo 换成图片
            alert("iPhone请在safari浏览器打开，安卓推荐在Chrome打开");
            return
        }
        if (shouldStartDetect) {
            Quagga.start();
        } else {
            Quagga.stop();
            document.getElementById("scan-barcode").style.display = "none";
        }
        console.log("Initialization finished. Ready to start");
    });
};

startDetect = function () {
    shouldStartDetect = true;

    document.getElementById("scan-barcode").style.display = null;
    initCamera();
};

stopDetect = function () {
    shouldStartDetect = false;

    Quagga.stop();
    document.getElementById("scan-barcode").style.display = "none";
};

checkBarcode = function (barcode) {
    if (typeof barcode !== "string") {
        return false;
    }
    // should use rex
    return barcode.startsWith("SQ-YD-")
        || barcode.startsWith("SQ-SJ-")
        || barcode.startsWith("JG-YD-")
        || barcode.startsWith("JG-SJ-")
        || barcode.startsWith("PR-IV-")
};

Quagga.onDetected(function (data) {
    let barcode = data.codeResult.code;
    if (checkBarcode(barcode)) {
        stopDetect();
        // save borrow status
        document.getElementById("barcode").textContent = barcode;
    }
    else {
        // continue detecting
    }
});

$(function () {

    initCamera(); // check environment

    document.getElementById("scan").addEventListener('click', function () {
        startDetect();
    });

    document.getElementById("scan-barcode").style.display = "none";
});

