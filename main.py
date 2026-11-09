from fastapi import FastAPI, Form, Request
from fastapi.responses import  FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# -------------------------------------------------------------------------
# How to setup
"""
- To setup environment type:
python -m venv .venv
.venv\scripts\activate

- To install requirements type:
pip install -r requirements.txt

- To start server type:
uvicorn main:app --reload

goto:
http://localhost:8000/


- To stop server
CRTL + C
"""

# -------------------------------------------------------------------------

app = FastAPI()
app.mount("/img", StaticFiles(directory="img"), name="img")
app.mount("/font", StaticFiles(directory="font"), name="font")

# SETUP FILES
@app.get("/")
async def read_index():
    return FileResponse('index.html')
@app.get("/index.html")
async def read_index():
    return FileResponse('index.html')
@app.get("/note.html")
async def read_index():
    return FileResponse('note.html')
@app.get("/crt.css")
async def read_index():
    return FileResponse('crt.css')
@app.get("/plants.js")
async def read_index():
    return FileResponse('plants.js')
@app.get("/tutorial.js")
async def read_index():
    return FileResponse('tutorial.js')
@app.get("/noteDetection.js")
async def read_index():
    return FileResponse('noteDetection.js')
# -------------------------------------------------------------------------

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000)