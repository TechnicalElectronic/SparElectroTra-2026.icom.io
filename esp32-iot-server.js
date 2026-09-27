/* =========================================================
   ESP32 IoT SERVER PROJECT PAGE
   ========================================================= */


/* ================= SOURCE CODE ================= */

const sourceCode = {

    esp32: {
        file: "esp32_client.ino",

        code: `#include <WiFi.h>

const char* WIFI_SSID = "RASPI";
const char* WIFI_PASSWORD = "12345678";

// Python server computer IP
const char* SERVER_IP = "10.226.113.194";

// Python server port
const uint16_t SERVER_PORT = 5000;

// Device identification
const char* DEVICE_ID = "23456789";

WiFiClient client;

void connectWiFi()
{
    Serial.println();
    Serial.print("Connecting to Wi-Fi: ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("Wi-Fi connected");

    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());
}


void connectServer()
{
    Serial.print("Connecting to Python server... ");

    if (client.connect(SERVER_IP, SERVER_PORT))
    {
        Serial.println("CONNECTED");
    }
    else
    {
        Serial.println("FAILED");
    }
}


void sendSensorData()
{
    float temperature = random(250, 350) / 10.0;
    float humidity = random(400, 700) / 10.0;
    int light = random(100, 500);
    int pressure = random(980, 1020);

    String json = "{";
    json += "\\"device_id\\":\\"" + String(DEVICE_ID) + "\\",";
    json += "\\"temperature\\":" + String(temperature, 1) + ",";
    json += "\\"humidity\\":" + String(humidity, 1) + ",";
    json += "\\"light\\":" + String(light) + ",";
    json += "\\"pressure\\":" + String(pressure);
    json += "}";

    Serial.println("Sending:");
    Serial.println(json);

    client.println(json);
}


void setup()
{
    Serial.begin(115200);

    delay(1000);

    connectWiFi();
    connectServer();
}


void loop()
{
    if (!client.connected())
    {
        Serial.println("Server disconnected.");

        client.stop();

        delay(2000);

        connectServer();
    }

    if (client.connected())
    {
        sendSensorData();
    }

    delay(5000);
}`
    },


    server: {
        file: "server.py",

        code: `import socket
import json
from datetime import datetime

HOST = "0.0.0.0"
PORT = 5000


def start_server():

    server = socket.socket(
        socket.AF_INET,
        socket.SOCK_STREAM
    )

    server.setsockopt(
        socket.SOL_SOCKET,
        socket.SO_REUSEADDR,
        1
    )

    server.bind((HOST, PORT))

    server.listen(10)

    print("=" * 50)
    print("ESP32 IoT Python Server")
    print("=" * 50)

    print(f"Server running on port {PORT}")
    print("Waiting for ESP32 devices...")

    while True:

        client, address = server.accept()

        print()
        print("Device connected:", address)

        try:

            while True:

                data = client.recv(4096)

                if not data:
                    break

                message = data.decode(
                    "utf-8"
                ).strip()

                try:

                    sensor_data = json.loads(
                        message
                    )

                    sensor_data["received_at"] = (
                        datetime.now().isoformat()
                    )

                    print(
                        "Received:",
                        sensor_data
                    )

                except json.JSONDecodeError:

                    print(
                        "Invalid JSON:",
                        message
                    )

        except Exception as error:

            print(
                "Connection error:",
                error
            )

        finally:

            client.close()

            print(
                "Device disconnected:",
                address
            )


if __name__ == "__main__":
    start_server()`
    },


    api: {
        file: "api.py",

        code: `from flask import Flask, request, jsonify

app = Flask(__name__)

devices = {}


@app.route("/api/device/data", methods=["POST"])
def receive_device_data():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No JSON data received"
        }), 400

    device_id = data.get("device_id")

    if not device_id:
        return jsonify({
            "success": False,
            "message": "Device ID required"
        }), 400

    devices[device_id] = data

    return jsonify({
        "success": True,
        "device_id": device_id,
        "message": "Data received"
    })


@app.route("/api/devices", methods=["GET"])
def get_devices():

    return jsonify({
        "devices": devices
    })


@app.route("/api/device/<device_id>", methods=["GET"])
def get_device(device_id):

    device = devices.get(device_id)

    if device is None:

        return jsonify({
            "success": False,
            "message": "Device not found"
        }), 404

    return jsonify({
        "success": True,
        "device": device
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )`
    },


    dashboard: {
        file: "dashboard.js",

        code: `const SERVER_URL =
    "http://127.0.0.1:5000";


async function loadDevices()
{
    try
    {
        const response =
            await fetch(
                SERVER_URL + "/api/devices"
            );

        if (!response.ok)
        {
            throw new Error(
                "Server response error"
            );
        }

        const result =
            await response.json();

        displayDevices(
            result.devices
        );
    }
    catch (error)
    {
        console.error(
            "Connection failed:",
            error
        );
    }
}


function displayDevices(devices)
{
    const container =
        document.getElementById(
            "devices"
        );

    if (!container)
        return;

    container.innerHTML = "";

    Object.keys(devices).forEach(
        deviceId =>
        {
            const device =
                devices[deviceId];

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "device-card";

            card.innerHTML = \`
                <h3>ESP32 Device</h3>

                <p>
                    Device ID:
                    <strong>\${