from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


@app.get("/")
def greeting():
    return {"message": "Hello, World!"}
