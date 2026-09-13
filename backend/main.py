from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import pandas as pd

app = FastAPI()

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentData(BaseModel):
    study_hours_per_day: float
    attendance_percentage: float
    previous_exam_score: float
    daily_screen_time: float
    sleep_hours: float
    gender: str
    education_level: str

# Load model and metrics at module level
try:
    model = joblib.load("model.joblib")
except Exception as e:
    print(f"Warning: Model not loaded correctly. {e}")
    model = None
    
try:
    with open("metrics.json", "r") as f:
        metrics = json.load(f)
except:
    metrics = {"accuracy": "N/A"}

@app.post("/predict")
def predict(data: StudentData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Train the model first.")
    
    df = pd.DataFrame([data.dict()])
    
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0].tolist()
    
    return {
        "pass_status": "Pass" if prediction == 1 else "Fail",
        "confidence": max(probability)
    }

@app.get("/metrics")
def get_metrics():
    return metrics
