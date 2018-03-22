$(function () {

    initCamera = function () {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#interactive'),
                constraints: {
                    width: {
                        min: 600,
                        max: 1080
                    },
                    height: {
                        min: 600,
                        max: 1080
                    },
                    deviceId: camera_list[cameraIndex],
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
                return;
            }
            console.log("using camera" + camera_list[cameraIndex]);
            Quagga.start();
            console.log("Initialization finished. Ready to start");
        });
    };

    startDetect = function () {
        document.getElementById("scan").style.display = "none";

        // let interactive = document.getElementById("interactive");
        // interactive.style.position = 'relative';
        // interactive.style.left = (document.body.offsetWidth - interactive.clientWidth) / 2 + 'px';
        // interactive.style.top = (interactive.offsetHeight - document.body.offsetTop) / 2 + 'px';

        document.getElementById("interactive").style.display = null;
        document.getElementById("camera-switch").style.display = null;
        initCamera();
    };

    stopDetect = function () {

        Quagga.stop();
        document.getElementById("interactive").style.display = "none";
        document.getElementById("camera-switch").style.display = "none";

        document.getElementById("scan").style.display = null;
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
            || barcode.startsWith("PR-IV-");
    };

    getCameras = function () {

        var c_list = [];

        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log("enumerateDevices() not supported.");
            return;
        }

// List cameras and microphones.

        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                // document.getElementById("device-list").textContent = JSON.stringify(devices);
                devices.forEach(function (device) {
                    if (device.kind === "videoinput") {
                        c_list.push(device.deviceId);
                        // document.getElementById("device-list").textContent = document.getElementById("device-list").textContent + " id: " + device.deviceId
                    }
                });
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });

        return c_list;
    };

    let camera_list = getCameras();
    let cameraIndex = 0;

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

    document.getElementById("scan").addEventListener('click', function () {
        startDetect();
    });

    document.getElementById("camera-switch").addEventListener('click', function () {
        if (cameraIndex < camera_list.length - 1) {
            cameraIndex++;
        } else {
            cameraIndex = 0;
        }
        stopDetect();
        startDetect();
    });

    startDetect();

    // TODO 支持花名输入和整个界面
});