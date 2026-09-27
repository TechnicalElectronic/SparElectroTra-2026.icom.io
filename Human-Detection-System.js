/* =========================================================
   HUMAN DETECTION SYSTEM
   ========================================================= */


/* ================= SOURCE CODE ================= */

const sourceCode = {

    detection: {

        file: "human_detection.py",

        code: `import cv2
import mediapipe as mp


class HumanDetector:

    def __init__(self):

        self.mp_pose = mp.solutions.pose

        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        self.mp_draw = mp.solutions.drawing_utils


    def detect(self, frame):

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        results = self.pose.process(
            rgb_frame
        )

        human_detected = (
            results.pose_landmarks
            is not None
        )

        if human_detected:

            self.mp_draw.draw_landmarks(
                frame,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS
            )

            cv2.putText(
                frame,
                "HUMAN DETECTED",
                (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

        else:

            cv2.putText(
                frame,
                "NO HUMAN",
                (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

        return frame, human_detected


    def close(self):

        self.pose.close()` 
    },


    camera: {

        file: "esp32_camera.py",

        code: `import cv2


class ESP32Camera:

    def __init__(
        self,
        stream_url
    ):

        self.stream_url = stream_url

        self.capture = cv2.VideoCapture(
            stream_url
        )


    def read(self):

        if not self.capture.isOpened():

            return False, None

        success, frame = (
            self.capture.read()
        )

        return success, frame


    def release(self):

        if self.capture:

            self.capture.release()


    def reconnect(self):

        self.release()

        self.capture = cv2.VideoCapture(
            self.stream_url
        )`
    },


    main: {

        file: "main.py",

        code: `import cv2

from esp32_camera import (
    ESP32Camera
)

from human_detection import (
    HumanDetector
)


ESP32_STREAM = (
    "http://192.168.4.1/stream"
)


def main():

    camera = ESP32Camera(
        ESP32_STREAM
    )

    detector = HumanDetector()


    while True:

        success, frame = (
            camera.read()
        )

        if not success:

            print(
                "Camera connection failed"
            )

            break


        frame, detected = (
            detector.detect(frame)
        )


        cv2.imshow(
            "Human Detection - ESP32-CAM",
            frame
        )


        key = cv2.waitKey(1) & 0xFF


        if key == ord("q"):

            break


    camera.release()

    detector.close()

    cv2.destroyAllWindows()


if __name__ == "__main__":

    main()`
    },


    buildozer: {

        file: "buildozer.spec",

        code: `# Human Detection Android App

[app]

title = Human Detection - ESP32-CAM

package.name = humandetection

package.domain = org.example

source.include_exts =
    py,png,jpg,jpeg,kv,atlas

requirements =
    python3,
    kivy,
    opencv

orientation = landscape

fullscreen = 0

android.permissions =
    INTERNET,
    CAMERA

android.api = 33

android.minapi = 21

android.archs =
    arm64-v8a

[buildozer]

log_level = 2

warn_on_root = 1`
    }

};


/* ================= CURRENT CODE ================= */

let currentCode = "detection";


/* ================= DISPLAY CODE ================= */

function displayCode(codeName)
{
    const codeDisplay =
        document.getElementById(
            "codeDisplay"
        );

    const currentFile =
        document.getElementById(
            "currentFile"
        );


    if (
        !codeDisplay ||
        !currentFile
    ) {
        return;
    }


    const selected =
        sourceCode[codeName];


    if (!selected) {
        return;
    }


    currentCode = codeName;


    currentFile.textContent =
        selected.file;


    codeDisplay.textContent =
        selected.code;


    document
        .querySelectorAll(".code-tab")
        .forEach(button =>
        {

            button.classList.toggle(
                "active",
                button.dataset.code ===
                codeName
            );

        });
}


/* ================= CODE TABS ================= */

document
    .querySelectorAll(".code-tab")
    .forEach(button =>
    {

        button.addEventListener(
            "click",
            () =>
            {
                displayCode(
                    button.dataset.code
                );
            }
        );

    });


/* ================= COPY CODE ================= */

const copyButton =
    document.getElementById(
        "copyButton"
    );

const copyMessage =
    document.getElementById(
        "copyMessage"
    );


if (copyButton)
{

    copyButton.addEventListener(
        "click",
        async () =>
        {

            const code =
                sourceCode[
                    currentCode
                ].code;


            try
            {

                await navigator
                    .clipboard
                    .writeText(code);


                showCopyMessage();

            }
            catch (error)
            {

                fallbackCopy(code);

            }

        }
    );

}


/* ================= FALLBACK COPY ================= */

function fallbackCopy(text)
{

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value = text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    document.execCommand(
        "copy"
    );


    textarea.remove();


    showCopyMessage();
}


/* ================= COPY MESSAGE ================= */

function showCopyMessage()
{

    if (!copyMessage)
        return;


    copyMessage.classList.add(
        "show"
    );


    setTimeout(
        () =>
        {

            copyMessage.classList.remove(
                "show"
            );

        },
        2000
    );
}


/* ================= DEMO STATUS ================= */

let humanDetected = true;


const toggleButton =
    document.getElementById(
        "toggleDetection"
    );


const statusLight =
    document.getElementById(
        "statusLight"
    );


const statusText =
    document.getElementById(
        "statusText"
    );


const statusDescription =
    document.getElementById(
        "statusDescription"
    );


if (toggleButton)
{

    toggleButton.addEventListener(
        "click",
        () =>
        {

            humanDetected =
                !humanDetected;


            updateDetectionStatus();

        }
    );

}


/* ================= UPDATE STATUS ================= */

function updateDetectionStatus()
{

    if (
        !statusLight ||
        !statusText ||
        !statusDescription
    ) {
        return;
    }


    if (humanDetected)
    {

        statusLight.classList.remove(
            "off"
        );


        statusText.textContent =
            "HUMAN DETECTED";


        statusDescription.textContent =
            "Human body landmarks detected in the camera frame.";

    }
    else
    {

        statusLight.classList.add(
            "off"
        );


        statusText.textContent =
            "NO HUMAN";


        statusDescription.textContent =
            "No human body landmarks detected in the camera frame.";

    }

}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    () =>
    {

        displayCode(
            "detection"
        );


        updateDetectionStatus();

    }
);