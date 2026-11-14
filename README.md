 
# ⚽ FIFA 20 Player Analytics & Intelligence Platform

An interactive football analytics platform built using **Python, Machine Learning, FastAPI, and React**. Explore FIFA 20 player statistics, analyze player characteristics, compare players, and estimate player market values using a trained Gradient Boosting regression model.

## 🚀 Project Overview

The FIFA 20 Player Analytics & Intelligence Platform combines data analysis, machine learning, and full-stack development to turn football player data into meaningful insights.

The project includes:
- An interactive React dashboard.
- A FastAPI backend for data access and machine learning predictions.
- A trained Gradient Boosting Regressor for market value estimation.
- A Streamlit application for exploring the original analytics and prediction workflow.

## ✨ Key Features

### 1. Overview Dashboard
- Total player statistics.
- Average player overall rating.
- Average player age.
- Nationality statistics.
- Player distributions and visual analytics.

### 2. Players Explorer
- Search players by name.
- Filter players by position, nationality, and club.
- Sort players by overall rating, potential, age, market value, and wages.
- Paginated player data.

### 3. Market Value Prediction
- Estimate player market value in euros (€).
- Input player attributes such as age, overall rating, potential, wages, and other characteristics.
- Generate predictions using the trained Gradient Boosting model.

### 4. Player Comparison
- Compare player statistics and characteristics.
- Explore differences in player ratings, potential, and market values.

### 5. Model Performance
The application displays the evaluation metrics of the selected Gradient Boosting model.

## 🧠 Machine Learning

**Selected Model:** Gradient Boosting Regressor

**Prediction Target:** `value_eur`

The project evaluates multiple regression algorithms and selects Gradient Boosting for the application.

### Model Evaluation

| Metric | Gradient Boosting |
|---|---:|
| MAE | €194,564.71 |
| RMSE | €615,623.89 |
| R² Score | 0.9871 |

These are the recorded evaluation results for the selected model.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming Language | Python, JavaScript |
| Data Analysis | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Model Persistence | Joblib |
| Backend | FastAPI |
| Frontend | React, Vite |
| Data Visualization | Recharts, Matplotlib, Seaborn |
| API Communication | Axios |
| Interactive Application | Streamlit |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
FIFA20-Players-Analytics/
│
├── Backend/
│   └── main.py
│
├── Data/
│   └── players_20.csv
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Model/
│   ├── gradient_boosting_model.pkl
│   ├── preprocessor.pkl
│   ├── default_player.pkl
│   └── feature_columns.pkl
│
├── app.py
├── fifa20_prediction.ipynb
├── requirements.txt
└── README.md
```

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have installed:

- Python 3.10 or a compatible version.
- Node.js and npm.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/JaswanthRaj14/FIFA20-Players-Analytics.git

cd FIFA20-Players-Analytics
```

### 2. Set Up the Python Environment

```bash
python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install the project dependencies:

```bash
pip install -r requirements.txt
```

Install the backend-specific dependencies:

```bash
pip install fastapi uvicorn pydantic
```

### 3. Start the FastAPI Backend

```bash
cd Backend
python -m uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Start the React Frontend

Open another terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside the `Frontend` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

### 5. Run the Streamlit Application (Optional)

From the project root:

```bash
streamlit run app.py
```

## 🔌 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API welcome message |
| GET | `/api/health` | API health check |
| GET | `/api/model/status` | Model loading status |
| GET | `/api/model/info` | Model evaluation information |
| GET | `/api/players/summary` | Player summary statistics |
| GET | `/api/players` | Search, filter, sort, and paginate players |
| GET | `/api/players/filters` | Available player filter options |
| GET | `/api/players/distributions` | Player distribution statistics |
| POST | `/api/predict` | Predict player market value |

## 📊 Dataset

The project uses the FIFA 20 player dataset.

- Dataset file: `players_20.csv`
- Records: 18,278 players
- Original columns: 104

The dataset contains player information such as age, nationality, club, position, overall rating, potential, wages, and market value.

## 🔍 Important Prediction Note

The prediction API updates the attributes supplied by the user while retaining the remaining model features from a saved default player profile. Therefore, the prediction is an estimate based on the submitted attributes and the retained default values.

## 🎯 Project Objectives

- Apply exploratory data analysis to real-world football data.
- Understand player attributes and market value patterns.
- Build and evaluate regression models.
- Develop a REST API for machine learning inference.
- Integrate a React frontend with a Python backend.
- Build an end-to-end machine learning application.

## 👨‍💻 Author

**Jaswanth Raj**

- GitHub: [JaswanthRaj14](https://github.com/JaswanthRaj14)
- Portfolio: [Visit Portfolio](https://jaswanth-gilt.vercel.app)
- LinkedIn: [Connect on LinkedIn](https://www.linkedin.com/)

---

If you find this project interesting, consider giving the repository a ⭐.

**Built with Python, Machine Learning, and React.**
