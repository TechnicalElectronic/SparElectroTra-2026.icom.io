const sourceCode = {

    esp32: {

        file: "ESP32_Client.ino",

        code: `#include <WiFi.h>

const char* WIFI_SSID = "RASPI";
const char* WIFI_PASSWORD = "12345678";

const char* SERVER_IP = "10.226.113.194";
const uint16_t SERVER_PORT = 5000;

const char* DEVICE_ID = "ESP32_001";

WiFiClient client;


void setup() {

    Serial.begin(115200);

    WiFi.begin(
        WIFI_SSID,
        WIFI_PASSWORD
    );

    Serial.println(
        "Connecting to Wi-Fi..."
    );

    while (
        WiFi.status() != WL_CONNECTED
    ) {

        delay(500);

        Serial.print(".");
    }

    Serial.println();
    Serial.println(
        "Wi-Fi connected"
    );

    Serial.print(
        "ESP32 IP: "
    );

    Serial.println(
        WiFi.localIP()
    );
}


void loop() {

    if (!client.connected()) {

        Serial.println(
            "Connecting to server..."
        );

        if (
            client.connect(
                SERVER_IP,
                SERVER_PORT
            )
        ) {

            Serial.println(
                "Connected to server"
            );

        } else {

            Serial.println(
                "Server connection failed"
            );

            delay(2000);

            return;
        }
    }


    String data = "{";

    data += "\\"device_id\\":\\"";
    data += DEVICE_ID;
    data += "\\",";

    data += "\\"temperature\\":31.8,";
    data += "\\"humidity\\":48.7,";
    data += "\\"light\\":192,";
    data += "\\"pressure\\":997";

    data += "}";


    client.println(data);

    Serial.println(
        "Data sent:"
    );

    Serial.println(data);


    unsigned long start =
        millis();


    while (
        client.available() == 0 &&
        millis() - start < 3000
    ) {

        delay(10);
    }


    if (client.available()) {

        String response =
            client.readStringUntil('\\n');

        Serial.print(
            "Server ACK: "
        );

        Serial.println(
            response
        );
    }


    delay(2000);
}`
    },


    server: {

        file: "server.py",

        code: `import socket
import json

SERVER_IP = "0.0.0.0"
SERVER_PORT = 5000


server = socket.socket(
    socket.AF_INET,
    socket.SOCK_STREAM
)

server.setsockopt(
    socket.SOL_SOCKET,
    socket.SO_REUSEADDR,
    1
)

server.bind(
    (SERVER_IP, SERVER_PORT)
)

server.listen(10)


print(
    f"Server listening on "
    f"port {SERVER_PORT}"
)


while True:

    client, address = (
        server.accept()
    )

    print(
        "ESP32 connected:",
        address
    )


    try:

        while True:

            data = client.recv(4096)

            if not data:
                break


            message = (
                data
                .decode()
                .strip()
            )


            print(
                "Received:",
                message
            )


            try:

                payload = json.loads(
                    message
                )

                print(
                    "Device:",
                    payload.get(
                        "device_id"
                    )
                )

            except json.JSONDecodeError:

                print(
                    "Invalid JSON"
                )


            client.sendall(
                b"ACK\\\\n"
            )


    except Exception as error:

        print(
            "Connection error:",
            error
        )


    finally:

        client.close()

        print(
            "ESP32 disconnected"
        )`
    },


    protocol: {

        file: "protocol.py",

        code: `import json


def create_packet(
    device_id,
    temperature,
    humidity,
    light,
    pressure
):

    packet = {

        "device_id":
            device_id,

        "temperature":
            temperature,

        "humidity":
            humidity,

        "light":
            light,

        "pressure":
            pressure,

        "status":
            "online"

    }


    return json.dumps(packet)


def parse_packet(data):

    try:

        return json.loads(data)

    except json.JSONDecodeError:

        return None


def create_ack():

    return "ACK"
`
    }

};


let currentCode = "esp32";


function displayCode(name) {

    const selected =
        sourceCode[name];

    if (!selected) return;


    currentCode = name;


    document.getElementById(
        "currentFile"
    ).textContent =
        selected.file;


    document.getElementById(
        "codeDisplay"
    ).textContent =
        selected.code;


    document
        .querySelectorAll(".code-tab")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.code === name
            );

        });
}


/* CODE TABS */

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


/* COPY CODE */

document
    .getElementById("copyCode")
    .addEventListener(
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

            } catch {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value = code;

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();
            }


            const message =
                document.getElementById(
                    "copyMessage"
                );


            message.classList.add(
                "show"
            );


            setTimeout(() => {

                message.classList.remove(
                    "