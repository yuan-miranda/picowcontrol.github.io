import sys
import machine # type: ignore
import socket
import network # type: ignore
import os
import json
import time
import uasyncio as asyncio # type: ignore
import gc

ssid = "PICO_AP"
password = "123456789"
port = 80

# board debugger
led = machine.Pin("LED", machine.Pin.OUT)

# control pins
forward = machine.Pin(14, machine.Pin.OUT)
backward = machine.Pin(17, machine.Pin.OUT)
right = machine.Pin(4, machine.Pin.OUT)
left = machine.Pin(2, machine.Pin.OUT)
gear_speed = machine.Pin(28, machine.Pin.OUT)
toggle_mode = machine.Pin(26, machine.Pin.OUT)

start_time = time.time()
# [days:hours:minutes:seconds] [function_name()] [category] message
# category: INFO, WARNING, ERROR, DEBUG
#           (1) INFO - general information
#           (2) WARNING - warning information
#           (3) ERROR - error information
#           (4) DEBUG - debug information
# example: [00:00:00:00] [main()] [INFO] Hello, World!
category_map = {
    1: ["INFO", "#0000FF"],
    2: ["WARNING", "#FFA500"],
    3: ["ERROR", "#FF0000"],
    4: ["DEBUG", "#00FF00"]
}
log = lambda func__name, category, msg: print(f"[{int(time.time() - start_time) // 86400:02}:{(int(time.time() - start_time) % 86400) // 3600:02}:{(int(time.time() - start_time) % 3600) // 60:02}:{int(time.time() - start_time) % 60:02}] [{func__name}()] [{category_map[category][0]}] {msg}")

# decorator to get function name because "traceback" module is not available in micropython
func__name__ = None
def get_func__name__(func):
    def wrapper(*args, **kwargs):
        global func__name__
        func__name__ = func.__name__
        return func(*args, **kwargs)
    return wrapper

# https://github.com/yuan-miranda/microfilesys/blob/main/microfilesys.py#L62
def microfilesys_rjust(string, width, fill_char=' '):
    """Returns a right-justified string."""
    if len(string) >= width:
        return string
    else:
        padding = fill_char * (width - len(string))
        return padding + string
def microfilesys_ljust(string, width, fill_char=' '):
    """Returns a left-justified string."""
    if len(string) >= width:
        return string
    else:
        padding = fill_char * (width - len(string))
        return string + padding

def led_on():
    led.value(1)
def led_off():
    led.value(0)
def led_toggle():
    led.value(not led.value())

# init access point
@get_func__name__
def init_ap():
    ap = network.WLAN(network.AP_IF)
    ap.config(essid=ssid, password=password)
    ap.active(True)
    while not ap.active():
        pass
    log(func__name__, 1, f"access point started at: {ap.ifconfig()}")
    return ap

# init socket
@get_func__name__
def init_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('', port))
    s.listen(5)
    log(func__name__, 1, f"socket listening on port: {port}")
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

@get_func__name__
async def handle_request(request):
    conn, _ = request
    try:      
        request = conn.recv(1024).decode()

        try:
            request_line = request.split("\r\n")[0]
            request_type, request_path, _ = request_line.split(" ")
            log(func__name__, 1, f"request: {request_type} {request_path}")
        except:
            request_path = "/"

        if request_path == "/":
            path = "static/html/index.html"
        elif "media" in request_path:
            path = request_path[1:]

        # NOTE: me using the term "script" is a bit ambiguous, but it refers to a folder containing
        # a list of actions from "scripts" directory which in turn, "actions" are the .py files inside
        # that folder. The "scripts" directory is located in the root directory of this project/pico.

        # sends a list of scripts in the "scripts" directory
        elif request_path == "/api/get/scripts":
            scripts = os.listdir("scripts")
            response = { "scripts": scripts }
            json_content = json.dumps(response)
            await send_response(conn, "application/json", json_content.encode())
            return
        # sends a list of actions in the specified script folder
        elif "/api/get/actions/" in request_path:
            script = request_path.split("/")[-1]

            # prevent directory traversal
            if ".." in script:
                await send_response(conn, "text/plain", "403 Forbidden".encode())
                return

            # check if script exists
            if not dir_exists(f"scripts/{script}"):
                await send_response(conn, "text/plain", "404 Not Found".encode())
                return

            actions = os.listdir(f"scripts/{script}")
            response = { "actions": actions }
            json_content = json.dumps(response)
            await send_response(conn, "application/json", json_content.encode())
            return

        # ill just place the actions here for now as I was still testing the functionality
        # /api/run/action/control/000000
        elif "/api/run/action/control/" in request_path:
            try:
                # take the string after /api/run/action/control/
                control_states = request_path.split("/api/run/action/control/")[-1]
                if len(control_states) != 6 or not control_states.isdigit():
                    raise Exception("invalid control states")

                # flags
                is_forward = control_states[0] == "1"
                is_backward = control_states[1] == "1"
                is_gear_speed = control_states[2] == "1"
                is_toggle_mode = control_states[3] == "1"
                is_right = control_states[4] == "1"
                is_left = control_states[5] == "1"

                # set values
                forward.value(is_forward)
                backward.value(is_backward)
                gear_speed.value(is_gear_speed)
                toggle_mode.value(is_toggle_mode)
                right.value(is_right)
                left.value(is_left)

                await send_response(conn, "text/plain", "200 OK".encode())
                return
            except Exception as e:
                log(func__name__, 3, f"exception: {e}")
                await send_response(conn, "text/plain", "500 Internal Server Error".encode())
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
        log(func__name__, 3, f"exception: {e}")
        await send_response(conn, "text/plain", "500 Internal Server Error".encode())

@get_func__name__
def run_script(script_name):
    try:
        with open(script_name, 'r') as file:
            script_code = file.read()
            exec(script_code)
            log(func__name__, 1, f"executed successfully: {script_name}")
    except Exception as e:
        log(func__name__, 3, f"error executing {script_name}: {e}")

@get_func__name__
async def main():
    while True:
        try:
            ap = init_ap()
            s = init_socket()
            while True:
                request = s.accept()
                await handle_request(request)
        except Exception as e:
            log(func__name__, 3, f"exception: {e}")
        finally:
            if s:
                s.close()
            if ap:
                ap.active(False)
            gc.collect()

# board ip: 192.168.4.1
asyncio.run(main())
