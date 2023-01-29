// Getting access to the video element that we created in main.html
let video = document.getElementById("video");
let model;
let emotionModel;

let canvas = document.getElementById("canvas"); // Get the canvas element from html
let ctx = canvas.getContext("2d"); // Allows us to actually draw on the canvas

const accessCamera = () => {
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: { width: 500, height: 400 }
        })
        .then((stream) => {
            video.srcObject = stream;
        })
};

const detectFaces = async() => {
    const prediction = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false
    });
    // We are going to draw the predictions on the canvas
    ctx.drawImage(video, 0, 0, 500, 400);

    prediction.forEach(async(predictions) => {
        // Draw a rectangle around the predicted face
        ctx.beginPath() // Start the drawing process
        ctx.lineWidth = "4";
        ctx.strokeStyle = "red";


        const x1 = predictions.boundingBox.topLeft[0];
        const y1 = predictions.boundingBox.topLeft[1];
        const x2 = predictions.boundingBox.bottomRight[0];
        const y2 = predictions.boundingBox.bottomRight[1];
        const bWidth = x2 - x1;
        const bHeight = y2 - y1;
        ctx.rect(
            x1,
            y1,
            bWidth,
            bHeight
        );
        ctx.stroke();

        const features = [
            "noseTip",
            "leftCheek",
            "rightCheek",
            "leftEyeLower1", "leftEyeUpper1",
            "rightEyeLower1", "rightEyeUpper1",
            "leftEyebrowLower",
            "rightEyebrowLower",
            "lipsLowerInner",
            "lipsUpperInner"
        ];
        points = [];
        features.forEach(feature => {
            predictions.annotations[feature].forEach(x => {
                points.push((x[0] - x1) / bWidth);
                points.push((x[1] - y1) / bHeight);
            })
        });
        if(points) {
            // Emotion predictions
            let emotion = await predictEmotion(points);
            console.log(emotion)
        }
    })
}

accessCamera();

video.addEventListener("loadeddata", async() => {
    // model = await blazeface.load();
    // setInterval(detectFaces, 40);
    model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    emotionModel = await tf.loadLayersModel('web/model/facemo.json');
    setInterval(detectFaces, 40);
    // detectFaces();
})