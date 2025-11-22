import base64
import os
from typing import Any, Dict

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image
from pydantic import BaseModel
import io
import json

load_dotenv()

app = FastAPI(title="Aegis Share Backend")

# Allow frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

RISK_SCHEMA = {
    "risk_level": "RED | YELLOW | GREEN",
    "confidence": 0.0,
    "red_flags": [
        {"type": "HIDDEN_APR", "evidence": "string"},
        {"type": "CONTACTS_PERMISSION", "evidence": "string"}
    ],
    "one_sentence_warning": "string",
    "safe_actions": ["string"]
}

SYSTEM_PROMPT = (
    "You are a mobile security expert specializing in predatory digital lending "
    "(SpyLoan) and dark-pattern UI. You must protect low-literacy users."
)

class VoiceReq(BaseModel):
    transcript: str

def build_voice_prompt(transcript: str) -> str:
    return f"""
    You will receive a very short spoken complaint from a low-literacy user about a loan app or debt SMS.

    User said:
    \"\"\"{transcript}\"\"\"

    Tasks:
    1) Decide if this is likely a predatory loan / SpyLoan / debt-shaming harassment.
    2) Return ONLY valid JSON following this schema:
    {json.dumps(RISK_SCHEMA, ensure_ascii=False)}

    Rules:
    - Return all text strictly in ENGLISH.
    - Be decisive and fast. If the transcript implies threats, contact-harvesting, upfront fees, or shame tactics → risk_level="RED".
    - If uncertain → "YELLOW" with lower confidence.
    - one_sentence_warning must be 1 short sentence, easy for low-literacy users.
    - safe_actions must be 2–3 ultra-simple steps.
    """

def build_user_prompt() -> str:
    return f"""
Analyze this screenshot of a loan/finance app.

Tasks:
1) Detect dark patterns, hidden APR/fees, coercive language, or deceptive button layouts.
2) Detect dangerous permissions (Contacts, SMS, Photos, Accessibility, etc.).
3) Return ONLY valid JSON following this schema:
{json.dumps(RISK_SCHEMA, ensure_ascii=False)}

Rules:
- Return all text strictly in ENGLISH.
- If you see strong signs of predatory lending / SpyLoan → risk_level="RED".
- If mixed / unsure → "YELLOW" with lower confidence.
- Keep one_sentence_warning extremely simple for low-literacy users.
- safe_actions must be short, actionable steps.
"""

def image_to_base64(file_bytes: bytes) -> str:
    # Ensure it's a standard image
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)) -> Dict[str, Any]:
    file_bytes = await file.read()
    b64 = image_to_base64(file_bytes)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": build_user_prompt()},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                ],
            },
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content
    return json.loads(content)

@app.post("/voice-guardian")
def voice_guardian(req: VoiceReq) -> Dict[str, Any]:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_voice_prompt(req.transcript)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content
    return json.loads(content)
