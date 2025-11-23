# Aegis Share
**Counter-AI Bodyguard Against Predatory Digital Lending**

Aegis Share is a browser-based, real-time defense system designed to protect low-literacy users from predatory "SpyLoan" apps and debt-shaming harassment. It utilizes multimodal AI to detect UI dark patterns, hidden fees, and dangerous permission requests in under three seconds.

## The Problem
Predatory digital lending is a growing crisis in emerging markets. Malicious apps weaponize speed and complexity against vulnerable borrowers.
* **Deceptive UI:** "0% Interest" buttons often hide exorbitant service fees in fine print.
* **Data Harvesting:** Apps require excessive permissions (Contacts, Call Logs) to enable blackmail and "debt-shaming."
* **Literacy Barrier:** Victims often cannot read complex terms or are first-time smartphone users.

The core problem is not just financial illiteracy; it is **speed**. Victims need immediate intervention before they click "Agree."

## The Solution
Aegis Share acts as a **Counter-AI Bodyguard**. It is a Progressive Web App (PWA) that provides instant risk assessment without requiring installation, maximizing accessibility for users in distress.

### Key Capabilities
1.  **Multimodal Risk Analysis:** Analyzes screenshots of loan apps to detect semantic dark patterns, such as fake urgency timers or contradictory fee structures.
2.  **Voice Guardian:** A voice-first interface designed for users with low literacy. Users can verbally describe a threat (e.g., "They want my contacts"), and the system responds with an immediate spoken warning.
3.  **Traffic Light Output:** Results are simplified into a Red/Yellow/Green risk tier, ensuring the advice is actionable and unambiguous.
4.  **Stateless Privacy:** The system is privacy-first. All image and audio data are processed in-memory and discarded immediately after analysis. No user data is stored.

## Technical Architecture
Aegis Share is built as a layered defense system, combining heuristic speed with LLM reasoning.

* **Frontend:** Next.js 14, React, Tailwind CSS (Mobile-first PWA).
* **Backend:** Python, FastAPI (Asynchronous processing).
* **AI Engine:** OpenAI GPT-4o (Vision capabilities for UI context) combined with rule-based heuristics for permission flagging.
* **Voice Integration:** Web Speech API for real-time transcription and synthesis.

## Installation and Local Setup

### Prerequisites
* Node.js (v18 or higher)
* Python (v3.9 or higher)
* OpenAI API Key

### 1. Clone the Repository
```bash
git clone [https://github.com/trunghafromvietnam/aegis-share.git](https://github.com/trunghafromvietnam/aegis-share.git)
cd aegis-share