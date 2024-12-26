import machine # type: ignore
import socket
import network # type: ignore
import os
import json
import uasyncio as asyncio # type: ignore
import gc

ssid = "PICO_AP"
password = "123456789"
port = 80

# board debugger
led = machine.Pin("LED", machine.Pin.OUT)

# control pins
forward = machine.Pin(14, machine.Pin.OUT)
backward = machine.Pin(15, machine.Pin.OUT)
right = machine.Pin(4, machine.Pin.OUT)
left = machine.Pin(2, machine.Pin.OUT)
gear_speed = machine.Pin(28, machine.Pin.OUT)
toggle_mode = machine.Pin(26, machine.Pin.OUT)

def led_on():
    led.value(1)
def led_off():
    led.value(0)
def led_toggle():
    led.value(not led.value())

# init access point
def init_ap():
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=ssid, password=password)
    ap.active(True)
    while not ap.active():
        pass
    print(f"[init_ap()] access point started at: {ap.ifconfig()}")
    return ap

# init socket
def init_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('', port))
    s.listen(5)
    print(f"[init_socket()] socket listening on port: {port}")
    return s

def file_exists(path):
    try:
        os.stat(path)
        return True
    except:
        return False

def dir_exists(path):
    try:
        os.listdir(path)
        return True
    except:
        return False
    

def read_file(path):
    with open(path, "rb") as f:
        return f.read()

def get_content_type(path):
    if path.endswith(".html"):
        return "text/html"
    if path.endswith(".css"):
        return "text/css"
    if path.endswith(".js"):
        return "application/javascript"
    if path.endswith(".json"):
        return "application/json"
    if path.endswith(".svg"):
        return "image/svg+xml"
    if path.endswith(".jpg") or path.endswith(".jpeg"):
        return "image/jpeg"
    if path.endswith(".png"):
        return "image/png"
    if path.endswith(".gif"):
        return "image/gif"
    return "text/plain"

async def send_response(conn, content_type, content):
    conn.sendall("HTTP/1.1 200 OK\r\n".encode())
    conn.sendall("Access-Control-Allow-Origin: *\r\n".encode())
    conn.sendall(f"Content-Type: {content_type}\r\n".encode())
    conn.sendall(f"Content-Length: {len(content)}\r\n".encode())
    conn.sendall("\r\n".encode())
    conn.sendall(content)
    conn.close()
    gc.collect()


async def handle_request(request):
    conn, _ = request
    try:      
        request = conn.recv(1024).decode()

        try:
            request_line = request.split("\r\n")[0]
            request_type, request_path, _ = request_line.split(" ")
            print(f"[handle_request()] request: {request_type} {request_path}")
        except:
            request_path = "/"

        if request_path == "/":
            path = "static/html/index.html"
        elif "media" in request_path:
            path = request_path[1:]
        elif request_path == "/api/get/scripts":
            # returns a list of all script folder names in json format
            """
                scripts/
                    pico-rc/
                        control.py
                        ...
                    ...
            """
            scripts = os.listdir("scripts")
            response = { "scripts": scripts }
            json_content = json.dumps(response)
            await send_response(conn, "application/json", json_content.encode())
            return
        elif "/api/get/actions/" in request_path:
            script = request_path.split("/")[-1]

            # prevent directory traversal
            if ".." in script:
                await send_response(conn, "text/plain", "403 Forbidden".encode())
                return

            if not dir_exists(f"scripts/{script}"):
                await send_response(conn, "text/plain", "404 Not Found".encode())
                return

            actions = os.listdir(f"scripts/{script}")
            response = { "actions": actions }
            json_content = json.dumps(response)
            await send_response(conn, "application/json", json_content.encode())
            return
        else:
            path = f"static{request_path}"

        if file_exists(path):
            content = read_file(path)
            content_type = get_content_type(path)
            await send_response(conn, content_type, content)
        else:
            await send_response(conn, "text/plain", "404 Not Found".encode())
    except Exception as e:
        print(f"[handle_request()] exception: {e}")
        await send_response(conn, "text/plain", "500 Internal Server Error".encode())

async def main():
    ap = init_ap()
    s = init_socket()
    try:
        while True:
            try:
                request = s.accept()
                await handle_request(request)
            except Exception as e:
                print(f"[main()] [while] exception: {e}")
    except Exception as e:
        print(f"[main()] exception: {e}")
    finally:
        s.close()
        ap.active(False)
        print("[main()] socket closed and access point deactivated")

# this one implementation will re activate the access point
async def main():
    while True:
        try:
            ap = init_ap()
            s = init_socket()
            while True:
                try:
                    request = s.accept()
                    await handle_request(request)
                except Exception as e:
                    # bro just restarts the connection each time it throws an exception lmao
                    print(f"[main()] [while] exception: {e}")
                    break
        except Exception as e:
            print(f"[main()] exception: {e}")
        finally:
            s.close()
            ap.active(False)
            print("[main()] socket closed and access point deactivated")
            gc.collect()
            await asyncio.sleep(1)
            print("[main()] reactivating access point")

asyncio.run(main())