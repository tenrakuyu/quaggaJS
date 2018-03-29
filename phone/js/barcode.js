let startTime;
let name;

initCamera = function () {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
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
            if ("Security" in err) {
                alert("need https")
            }
            else {
                alert(err);
            }
            return;
        }
        console.log("using camera" + camera_list[cameraIndex]);
        Quagga.start();
        console.log("Initialization finished. Ready to start");
    });
};

let startDetect = function () {
    startTime = (new Date()).getTime();

    document.getElementById("ret-barcode").textContent = "";
    document.getElementById("scan-holder").style.display = "none";

    document.getElementById("interactive").style.display = null;
    document.getElementById("camera-switch").style.display = null;
    initCamera();
};

let stopDetect = function () {

    Quagga.stop();
    document.getElementById("interactive").style.display = "none";
    document.getElementById("camera-switch").style.display = "none";

    document.getElementById("scan-holder").style.display = null;
};

let checkBarcode = function (barcode) {
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

let getCameras = function () {

    let c_list = [];

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

let setCookie = function (cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

let getCookie = function (cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
};

let checkName = function () {
    if (getCookie("name") === "") {
        name = "tianle";
        setCookie("name", name, "365");
        document.getElementById("name").textContent = name;
    }
};

let saveBorrowStatus = function (barcode) {
    document.getElementById("barcode").textContent = barcode;
};

let camera_list = getCameras();
let cameraIndex = 0;

Quagga.onDetected(function (data) {
    setLoginPage();
    let barcode = data.codeResult.code;
    if (checkBarcode(barcode)) {
        stopDetect();
        checkName();
        // todo save borrow status
        saveBorrowStatus(barcode);
    }
    else {
        // continue detecting
    }
});

Quagga.onProcessed(function () {
    if ((new Date()).getTime() - startTime > 10000) {
        // todo 优化展示
        stopDetect();
        console.log("调整一下姿势再试试？");
    }
});

setScanPage = function () {
    document.body.style.backgroundColor = "#333333";
    document.getElementById("login-user").style.display = "none";
    document.getElementById("scan-container").style.display = null;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("ret-container").style.display = "none";
    document.getElementById("scan-holder").style.display = "none";
};

setLoginPage = function () {
    document.body.style.backgroundColor = "#ffffff";
    document.getElementById("login-user").style.display = null;
    document.getElementById("scan-container").style.display = "none";
    document.getElementById("login-container").style.display = null;
    document.getElementById("ret-container").style.display = "none";
    document.getElementById("scan-holder").style.display = "none";

};

setRetPage = function () {
    document.body.style.backgroundColor = "#ffffff";
    document.getElementById("login-user").style.display = "none";
    document.getElementById("scan-container").style.display = "none";
    document.getElementById("login-container").style.display = "none";
    document.getElementById("ret-container").style.display = null;
    document.getElementById("scan-holder").style.display = null;
};

$(function () {

    setScanPage();

    name = getCookie("name");
    document.getElementById("name").textContent = (name === "") ? "未登录" : name;

    document.getElementById("scan-holder").addEventListener('click', function () {
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
});