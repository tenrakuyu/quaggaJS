let startTime = 0;
let name = "";
let barcode = "";
let success_flag = true;

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
    document.getElementById("login-user").style.display = "none";
    document.getElementById("scan-container").style.display = "none";
    document.getElementById("login-container").style.display = null;
    document.getElementById("ret-container").style.display = "none";
    document.getElementById("scan-holder").style.display = "none";

};

setLoadingPage = function () {
// todo
};

setRetPage = function () {
    document.body.style.backgroundColor = "#ffffff";
    document.getElementById("login-user").style.display = null;
    document.getElementById("scan-container").style.display = "none";
    document.getElementById("login-container").style.display = "none";
    document.getElementById("ret-container").style.display = null;
    document.getElementById("scan-holder").style.display = null;
};

let startDetect = function () {
    setScanPage();
    startTime = (new Date()).getTime();

    // document.getElementById("ret-barcode").textContent = "";
    // document.getElementById("scan-holder").style.display = "none";
    //
    // document.getElementById("interactive").style.display = null;
    // document.getElementById("camera-switch").style.display = null;
    initCamera();
};

let stopDetect = function () {

    Quagga.stop();
    // document.getElementById("interactive").style.display = "none";
    // document.getElementById("camera-switch").style.display = "none";
    //
    // document.getElementById("scan-holder").style.display = null;
};

let checkBarcode = function () {
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
    // if (getCookie("name") === "") {
    //     name = "tianle";
    //     setCookie("name", name, "365");
    //     document.getElementById("name").textContent = name;
    // }

    return getCookie("name") === "" ? false : true;
};

let changeName = function () {
    // todo 要为修改用户名单独做一个按钮和setpage
    setLoginPage();
};

let saveBorrowStatus = function () {
    if (document.getElementById("input-name").value !== "") {
        name = document.getElementById("input-name").value;
        setCookie("name", name, 365);
        document.getElementById("name").textContent = name;
    }
    setRetPage();
    document.getElementById("ret-msg").textContent = "借用成功";
    document.getElementById("ret-img").src = "res/drawable/success.png";
};


let camera_list = getCameras();
let cameraIndex = 0;

Quagga.onDetected(function (data) {
    setLoginPage();
    barcode = data.codeResult.code;
    if (checkBarcode(barcode)) {
        stopDetect();
        document.getElementById("asset-barcode").textContent = barcode;
        if (checkName()) {
            saveBorrowStatus();
            setRetPage();
        } else {
            setLoginPage();
        }
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


$(function () {

    document.getElementById("load-holder").style.display = "none";

    name = getCookie("name");
    document.getElementById("name").textContent = (name === "") ? "未登录" : name;

    document.getElementById("camera-switch").addEventListener('click', function () {
        if (cameraIndex < camera_list.length - 1) {
            cameraIndex++;
        } else {
            cameraIndex = 0;
        }
        stopDetect();
        startDetect();
    });

    document.getElementById("confirm").addEventListener('click', saveBorrowStatus);

    document.getElementById("re-scan").addEventListener('click', startDetect);
    document.getElementById("scan-holder").addEventListener('click', startDetect);

    document.getElementById("name").addEventListener('click', changeName);
    startDetect();
});