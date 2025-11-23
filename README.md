# Aegis Share
**Counter-AI Bodyguard Against Predatory Digital Lending**

Aegis Share is a browser-based, real-time defense system designed to protect low-literacy and first-time smartphone users from predatory “SpyLoan” apps and debt-shaming harassment. It uses multimodal AI to detect UI dark patterns, hidden fees, and dangerous permission traps in under three seconds — then delivers a clear Red/Yellow/Green warning with a simple action plan.

---

## The Problem
Predatory digital lending is a growing crisis in emerging markets. Malicious apps weaponize speed and complexity against vulnerable borrowers.

* **Deceptive UI:** “0% interest” offers hide extreme service fees in fine print or short repayment cycles.
* **Permission Traps:** Apps request Contacts, SMS, Call Logs, or Photos to enable blackmail and “debt-shaming.”
* **Harassment Loops:** Borrowers report doxxing, threats to call bosses/family, and automated shaming campaigns.
* **Literacy Barrier:** Many victims cannot interpret complex terms or are first-time smartphone users.

The core problem is not just financial illiteracy; it is **speed**. Victims need immediate intervention before they click “Agree.”

---

## The Solution
Aegis Share acts as a **Counter-AI Bodyguard**. It is a Progressive Web App (PWA) that provides instant risk assessment without requiring installation, maximizing accessibility for users in distress.

### Key Capabilities
1. **Multimodal Risk Analysis:** Upload a screenshot of any loan app; the model understands UI context (not just text) to detect semantic dark patterns and hidden fees.
2. **Voice Guardian:** A voice-first interface for low-literacy users. Users describe a threat in one sentence; Aegis responds with a direct spoken warning.
3. **Traffic Light Output:** Results are simplified into Red / Yellow / Green risk tiers with actionable guidance.
4. **Safe Card:** Generates a shareable PNG warning card so families and communities can spread alerts without clicking unknown links.
5. **Stateless Privacy:** All screenshots and audio are processed in memory and discarded immediately after analysis. No user data is stored.

---

## Demo
* **Live App:** (add your Vercel URL here)
* **Backend Docs:** https://aegis-share-production.up.railway.app/docs
* **Devpost:** (add your Devpost link here)

---

## Technical Architecture
Aegis Share is built as a layered defense system, combining heuristic speed with LLM reasoning.

* **Frontend:** Next.js 14, React, Tailwind CSS (mobile-first PWA).
* **Backend:** Python, FastAPI (async REST API).
* **AI Engine:** OpenAI GPT-4o Vision for holistic UI understanding + rule-based heuristics for high-risk permission flagging.
* **Voice Integration:** Web Speech API (SpeechRecognition + SpeechSynthesis).
* **Safe Card Generation:** html2canvas for evidence card export.

---

## Repository Structure
```text
aegis-share/
  frontend/        # Next.js PWA UI
  backend/         # FastAPI API server
```

---

## Installation and Local Setup

### Prerequisites
* Node.js (v18 or higher)
* Python (v3.9 or higher)
* OpenAI API Key

### 1. Clone the Repository
```bash
git clone https://github.com/trunghafromvietnam/aegis-share.git
cd aegis-share
```

---

## 2. Backend Configuration
The backend handles the connection to the AI inference engine.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Set up Environment Variables
Create a `.env` file inside the `backend/` directory:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Run the backend server
```bash
uvicorn main:app --reload
```

The API will be available at:
```
http://127.0.0.1:8000
```

---

## 3. Frontend Configuration
The frontend provides the user interface and handles device inputs (camera/microphone).

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Access the application at:
```
http://localhost:3000
```

---

## Usage Guide

**Image Analysis:**  
Drag and drop (or upload) a screenshot of any loan application into the upload zone. Aegis returns a risk assessment within ~3 seconds.

**Voice Analysis:**  
Switch to the “Voice Guardian” tab. Click the microphone icon and ask a short question regarding a loan offer. Aegis analyzes the transcript for predatory intent.

**Safe Card Generation:**  
If a threat is detected, click “Generate Safe Card” to export a PNG warning image that can be shared via messaging apps.

---

## Privacy and Safety
Aegis Share is **stateless by design**.

* Images and audio are processed in memory and discarded immediately after inference.
* No personal data is stored, sold, or used for profiling.
* The system provides safety warnings, not legal or financial guarantees.

---

## Deployment

### Backend (Railway)
* **Root Directory:** `backend`
* **Start Command:**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
* **Public Docs:**
```
https://aegis-share-production.up.railway.app/docs
```

### Frontend (Vercel)
* **Root Directory:** `frontend`
* **Environment Variable:**
```env
NEXT_PUBLIC_API_BASE=https://aegis-share-production.up.railway.app
```
* Redeploy after setting env variables.

---

## Roadmap
**Phase 1 (Current):** Cloud-based MVP validating Counter-AI detection and voice-first UX.

**Phase 2 (Offline Mode):** On-device Small Language Models (SLMs) using WebLLM/WebGPU to enable offline protection in remote areas.

**Phase 3 (Community Defense):** A decentralized reporting system where confirmed threats contribute to a global blocklist of predatory apps.

---

## Contributing
Contributions are welcome. Please open an issue or submit a pull request for improvements, new scam patterns, or localization.

---

## License
This project is licensed under the MIT License.

---

## Disclaimer
Aegis Share provides safety estimations based on common predatory patterns detected in user-submitted content. It is a technical safety layer and does not constitute professional legal or financial advice.
