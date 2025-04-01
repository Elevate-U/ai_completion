import os
import json

def get_file_list(directory):
    file_list = []
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            file_list.append(filename)
    return file_list

if __name__ == "__main__":
    directory = "/Users/evergreenwu/ai_tools_resource/data"
    file_list = get_file_list(directory)
    print(json.dumps(file_list))