let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let stream = null;
let recordedBlob = null;

const videoElement = document.getElementById('video');
const startBtn = document.getElementById('start-recording');
const stopBtn = document.getElementById('stop-recording');
const downloadBtn = document.getElementById('download-recording');
const countdownElement = document.getElementById('countdown');
const countdownText = document.getElementById('countdown-text');

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
downloadBtn.addEventListener('click', downloadRecording);

async function startRecording() {
    try {
        startBtn.disabled = true;

        //screen access
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });

        //countdown
        countdownElement.style.display = 'flex';

        for (let i = 3; i > 0; i--) {
            countdownText.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        //start recording
        countdownElement.style.display = 'none';

        videoElement.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(recordedBlob);
            videoElement.src = url;
            videoElement.srcObject = null;
            videoElement.controls = true;
            downloadBtn.disabled = false;
        };

        mediaRecorder.start();
        isRecording = true;

        stopBtn.disabled = false;

    } catch (error) {
        console.error('Error starting recording:', error);
        countdownElement.style.display = 'none';
        startBtn.disabled = false;
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        isRecording = false;

        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

function downloadRecording() {
    if (recordedBlob) {
        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screen-recording-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}