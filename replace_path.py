# script to convert all the relative path of "static" folder to absolute path and vice versa
# because I run the page in RPI Pico which using relative path is complicated, reference "main.py" for more information
import os
import re
import sys

def replace_relative_path(file_path):
    """
        /html       -> ../html
        /css        -> ../css
        /js         -> ../js
        /media      -> ../../media
        <../html>   -> </html>
        from "/     -> from "./
    """
    with open(file_path, "r") as f:
        content = f.read()
        content = re.sub(r"(?<!\.\.)/html", "../html", content)
        content = re.sub(r"(?<!\.\.)/css", "../css", content)
        content = re.sub(r"(?<!\.\.)/js", "../js", content)
        content = re.sub(r"(?<!\.\.)/media", "../../media", content)

        # <../html> replace to </html>
        content = content.replace("<../html>", "</html>")
    with open(file_path, "w") as f:
        f.write(content)

def replace_absolute_path(file_path):
    """
        ../html     -> /html
        ../css      -> /css
        ../js       -> /js
        /media      -> /media
        from "./    -> from "/
    """
    with open(file_path, "r") as f:
        content = f.read()
        content = re.sub(r"\.\./html", "/html", content)
        content = re.sub(r"\.\./css", "/css", content)
        content = re.sub(r"\.\./js", "/js", content)
        content = re.sub(r"\.\./\.\./media", "/media", content)
    with open(file_path, "w") as f:
        f.write(content)

def main():
    for root, _, files in os.walk("static"):
        for file in files:
            file_path = os.path.join(root, file)

            if len(sys.argv) < 2:
                print("usage: python replace_path.py <relative|absolute>")
                sys.exit(1)

            input_args = sys.argv[1:]
            if input_args[0] == "relative":
                replace_relative_path(file_path)
            elif input_args[0] == "absolute":
                replace_absolute_path(file_path)
            else:
                print("usage: python replace_path.py <relative|absolute>")
                sys.exit(1)

if __name__ == "__main__":
    main()