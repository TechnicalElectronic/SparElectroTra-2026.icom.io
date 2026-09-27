/* =========================================================
   EMBEDDED TEST SYSTEM
   ========================================================= */


/* ================= SOURCE CODE ================= */

const sourceCode = {

    serial: {

        file: "serial_handler.py",

        code: `import serial
import serial.tools.list_ports


class SerialHandler:

    def __init__(self):

        self.connection = None


    def get_ports(self):

        ports = serial.tools.list_ports.comports()

        return [
            port.device
            for port in ports
        ]


    def connect(
        self,
        port,
        baudrate=115200
    ):

        try:

            self.connection = serial.Serial(
                port,
                baudrate,
                timeout=1
            )

            return True

        except serial.SerialException:

            return False


    def send(self, command):

        if not self.connection:
            return None

        self.connection.write(
            (command + "\\\\r\\\\n").encode()
        )


    def read(self):

        if not self.connection:
            return None

        return (
            self.connection
            .readline()
            .decode(
                errors="ignore"
            )
            .strip()
        )


    def close(self):

        if self.connection:

            self.connection.close()

            self.connection = None`
    },


    test: {

        file: "test_screen.py",

        code: `class EmbeddedTest:

    LIMITS = {

        "INPUT": 35,

        "GPS": 5,

        "DMC": 5,

        "DAY": 5,

        "TI": 12,

        "PTU": 5

    }


    def check_value(
        self,
        parameter,
        value
    ):

        limit = self.LIMITS.get(
            parameter
        )


        if limit is None:

            return False


        return value <= limit


    def run_test(
        self,
        measurements
    ):

        results = {}


        for parameter, value in (
            measurements.items()
        ):

            results[parameter] = (
                self.check_value(
                    parameter,
                    value
                )
            )


        return results


    def overall_result(
        self,
        results
    ):

        return all(
            results.values()
        )`
    },


    report: {

        file: "report_generator.py",

        code: `from datetime import datetime


def generate_report(
    device_name,
    part_number,
    results
):

    report = []

    report.append(
        "EMBEDDED TEST REPORT"
    )

    report.append(
        "===================="
    )

    report.append(
        f"Device: {device_name}"
    )

    report.append(
        f"Part Number: {part_number}"
    )

    report.append(
        f"Date: {datetime.now()}"
    )

    report.append("")

    for parameter, status in (
        results.items()
    ):

        result = (
            "PASS"
            if status
            else "FAIL"
        )

        report.append(
            f"{parameter}: {result}"
        )


    overall = (
        all(results.values())
    )


    report.append("")

    report.append(
        "OVERALL RESULT: "
        + (
            "PASS"
            if overall
            else "FAIL"
        )
    )


    return "\\\\n".join(report)`
    },


    main: {

        file: "main.py",

        code: `import tkinter as tk

from serial_handler import (
    SerialHandler
)

from test_screen import (
    EmbeddedTest
)


class TestApplication:

    def __init__(self, root):

        self.root = root

        self.root.title(
            "Embedded Test System"
        )

        self.root.geometry(
            "1000x650"
        )


        self.serial =
            SerialHandler()


        self.test_engine =
            EmbeddedTest()


    def start_test(self):

        measurements = {

            "INPUT": 35,

            "GPS": 5,

            "DMC": 5,

            "DAY": 5,

            "TI": 12,

            "PTU": 5

        }


        results = (
            self.test_engine
            .run_test(
                measurements
            )
        )


        if self.test_engine.overall_result(
            results
        ):

            print(
                "TEST RESULT: PASS"
            )

        else:

            print(
                "TEST RESULT: FAIL"
            )


def main():

    root = tk.Tk()

    app = TestApplication(
        root
    )

    root.mainloop()


if __name__ == "__main__":

    main()`
    }

};


/* ================= CURRENT CODE ================= */

let currentCode = "serial";


/* ================= DISPLAY CODE ================= */

function displayCode(codeName) {

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
        .forEach(button => {

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
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                displayCode(
                    button.dataset.code
                );

            }
        );

    });


/* ================= COPY ================= */

const copyButton =
    document.getElementById(
        "copyButton"
    );

const copyMessage =
    document.getElementById(
        "copyMessage"
    );


if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            const code =
                sourceCode[
                    currentCode
                ].code;


            try {

                await navigator
                    .clipboard
                    .writeText(code);


                showCopyMessage();

            }
            catch (error) {

                fallbackCopy(code);

            }

        }
    );

}


/* ================= FALLBACK COPY ================= */

function fallbackCopy(text) {

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

function showCopyMessage() {

    if (!copyMessage)
        return;


    copyMessage.classList.add(
        "show"
    );


    setTimeout(
        () => {

            copyMessage.classList.remove(
                "show"
            );

        },
        2000
    );
}


/* ================= TEST MONITOR ================= */

const runTest =
    document.getElementById(
        "runTest"
    );

const testResult =
    document.getElementById(
        "testResult"
    );

const monitorStatus =
    document.getElementById(
        "monitorStatus"
    );


if (runTest) {

    runTest.addEventListener(
        "click",
        () => {

            runTest.textContent =
                "⏳ TESTING...";


            testResult.textContent =
                "Running embedded hardware tests...";


            monitorStatus.textContent =
                "TESTING";

            monitorStatus.style.color =
                "#d29922";


            setTimeout(
                () => {

                    runTest.textContent =
                        "✓ TEST COMPLETE";


                    testResult.textContent =
                        "OVERALL RESULT: PASS";


                    testResult.style.color =
                        "#3fb950";


                    monitorStatus.textContent =
                        "PASS";

                    monitorStatus.style.color =
                        "#3fb950";


                    setTimeout(
                        () => {

                            runTest.textContent =
                                "▶️ RUN TEST";

                        },
                        1500
                    );

                },
                1800
            );

        }
    );

}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayCode("serial");

    }
);