
import os

file_path = r'd:\배달\deploy\index.html'
log_path = r'd:\배달\deploy\debug_lines.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = 4866
with open(log_path, 'w', encoding='utf-8') as log:
    for i in range(start_idx, start_idx+5):
        log.write(f"{i+1}: {repr(lines[i])}\n")
