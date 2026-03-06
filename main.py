# main.py
import uvicorn
from controllers import app  

if __name__ == "__main__":
    print("FastAPI server starting...")
    uvicorn.run(app, host="0.0.0.0", port=8000)