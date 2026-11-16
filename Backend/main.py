
from pathlib import Path
from fastapi import Query
import joblib
import pandas as pd
import numpy as np

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# 1. PROJECT PATHS
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent

DATA_PATH = PROJECT_DIR / "Data" / "players_20.csv"
MODEL_DIR = PROJECT_DIR / "Model"

MODEL_PATH = MODEL_DIR / "gradient_boosting_model.pkl"
PREPROCESSOR_PATH = MODEL_DIR / "preprocessor.pkl"
DEFAULT_PLAYER_PATH = MODEL_DIR / "default_player.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"


# ============================================================
# 2. FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="FIFA 20 Player Intelligence API",
    description=(
        "Backend API for FIFA 20 player analytics "
        "and market value prediction."
    ),
    version="1.0.0"
)


# ============================================================
# 3. CORS CONFIGURATION
# ============================================================
# ============================================================
# 3. CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://fifa-20-players-analytics.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# ============================================================
# 4. LOAD DATASET AND MODEL ARTIFACTS
# ============================================================

try:

    # Load dataset
    df = pd.read_csv(DATA_PATH)

    # Create primary_position if missing
    if "primary_position" not in df.columns:

        if "player_positions" in df.columns:

            df["primary_position"] = (
                df["player_positions"]
                .fillna("Unknown")
                .astype(str)
                .str.split(",")
                .str[0]
                .str.strip()
            )

        else:
            df["primary_position"] = "Unknown"

    # Load trained model
    model = joblib.load(MODEL_PATH)

    # Load preprocessing pipeline
    preprocessor = joblib.load(PREPROCESSOR_PATH)

    # Load default player
    default_player = joblib.load(DEFAULT_PLAYER_PATH)

    # Load model feature columns
    feature_columns = joblib.load(FEATURE_COLUMNS_PATH)

    if isinstance(default_player, dict):
        default_player = pd.DataFrame([default_player])

    feature_columns = list(feature_columns)

    # Validate default player features
    missing_features = [
        col for col in feature_columns
        if col not in default_player.columns
    ]

    if missing_features:
        raise ValueError(
            f"Default player is missing features: {missing_features}"
        )

    default_player = default_player[feature_columns].copy()

    print("======================================")
    print("FIFA 20 API INITIALIZED")
    print("======================================")
    print(f"Dataset records: {len(df)}")
    print(f"Model features: {len(feature_columns)}")
    print("Dataset loaded successfully")
    print("Gradient Boosting model loaded")
    print("Preprocessor loaded successfully")
    print("Default player loaded successfully")
    print("======================================")


except Exception as error:

    raise RuntimeError(
        f"Failed to load FIFA 20 project files: {error}"
    ) from error


# ============================================================
# 5. PREDICTION REQUEST SCHEMA
# ============================================================

class PlayerPredictionRequest(BaseModel):

    age: int = Field(ge=16, le=45)

    overall: int = Field(ge=40, le=99)

    potential: int = Field(ge=40, le=99)

    wage_eur: float = Field(ge=0)

    international_reputation: int = Field(
        default=1,
        ge=1,
        le=5
    )

    weak_foot: int = Field(
        default=3,
        ge=1,
        le=5
    )

    skill_moves: int = Field(
        default=3,
        ge=1,
        le=5
    )

    preferred_foot: str = "Right"

    body_type: str = "Normal"

    work_rate: str = "Medium/Medium"

    real_face: str = "No"

    primary_position: str = "ST"


# ============================================================
# 6. ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Welcome to FIFA 20 Player Intelligence API",
        "status": "running",
        "documentation": "/docs"
    }


# ============================================================
# 7. HEALTH CHECK ENDPOINT
# ============================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "success",
        "message": "FIFA 20 API is running"
    }


# ============================================================
# 8. MODEL STATUS ENDPOINT
# ============================================================

@app.get("/api/model/status")
def model_status():

    return {
        "model": "Gradient Boosting Regressor",
        "status": "loaded",
        "features": len(feature_columns)
    }


# ============================================================
# 9. PLAYER SUMMARY ENDPOINT
# ============================================================

@app.get("/api/players/summary")
def player_summary():

    return {
        "total_players": int(len(df)),

        "average_overall": round(
            float(df["overall"].mean()), 2
        ),

        "average_age": round(
            float(df["age"].mean()), 2
        ),

        "total_nationalities": int(
            df["nationality"].nunique()
        )
    }


# ============================================================
# 10. PLAYER LIST ENDPOINT
# ============================================================

from fastapi import Query


@app.get("/api/players")
def get_players(
    search: str = "",
    position: str = "All",
    nationality: str = "All",
    club: str = "All",
    min_overall: int = Query(default=40, ge=0, le=99),
    sort_by: str = "overall",
    order: str = "desc",
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):

    filtered_df = df.copy()

    # ------------------------------------------
    # 1. SEARCH BY PLAYER NAME
    # ------------------------------------------

    if search.strip():

        filtered_df = filtered_df[
            filtered_df["short_name"]
            .fillna("")
            .str.contains(
                search.strip(),
                case=False,
                regex=False
            )
        ]

    # ------------------------------------------
    # 2. FILTER BY POSITION
    # ------------------------------------------

    if position != "All":

        filtered_df = filtered_df[
            filtered_df["primary_position"].astype(str)
            == position
        ]

    # ------------------------------------------
    # 3. FILTER BY NATIONALITY
    # ------------------------------------------

    if nationality != "All":

        filtered_df = filtered_df[
            filtered_df["nationality"].astype(str)
            == nationality
        ]

    # ------------------------------------------
    # 4. FILTER BY CLUB
    # ------------------------------------------

    if club != "All":

        filtered_df = filtered_df[
            filtered_df["club"].astype(str)
            == club
        ]

    # ------------------------------------------
    # 5. FILTER BY OVERALL RATING
    # ------------------------------------------

    filtered_df = filtered_df[
        filtered_df["overall"] >= min_overall
    ]

    # ------------------------------------------
    # 6. SORT PLAYERS
    # ------------------------------------------

    allowed_sort_columns = [
        "overall",
        "potential",
        "age",
        "value_eur",
        "wage_eur"
    ]

    if sort_by not in allowed_sort_columns:

        raise HTTPException(
            status_code=400,
            detail="Invalid sorting column"
        )

    if order not in ["asc", "desc"]:

        raise HTTPException(
            status_code=400,
            detail="Order must be asc or desc"
        )

    filtered_df = filtered_df.sort_values(
        by=sort_by,
        ascending=(order == "asc"),
        na_position="last"
    )

    # ------------------------------------------
    # 7. PAGINATION
    # ------------------------------------------

    total_filtered = len(filtered_df)

    selected_columns = [
        "sofifa_id",
        "short_name",
        "age",
        "nationality",
        "club",
        "primary_position",
        "overall",
        "potential",
        "value_eur",
        "wage_eur"
    ]

    available_columns = [
        col for col in selected_columns
        if col in filtered_df.columns
    ]

    players = filtered_df[
        available_columns
    ].iloc[offset:offset + limit]

    players = players.astype(object).where(
        pd.notna(players),
        None
    )

    return {
        "total": total_filtered,
        "limit": limit,
        "offset": offset,
        "players": players.to_dict(orient="records")
    }

# ============================================================
# 11. MARKET VALUE PREDICTION ENDPOINT
# ============================================================

@app.post("/api/predict")
def predict_market_value(player: PlayerPredictionRequest):

    try:

        # Start with saved default player
        player_input = default_player.copy()

        # Convert request to dictionary
        player_data = player.model_dump()

        # Update user-provided attributes
        for column, value in player_data.items():

            if column in feature_columns:

                player_input.loc[0, column] = value

        # Update potential gap
        if "potential_gap" in feature_columns:

            player_input.loc[0, "potential_gap"] = (
                player.potential - player.overall
            )

        # Update age group
        if "age_group" in feature_columns:

            if player.age < 20:
                age_group = "Under 20"

            elif player.age < 25:
                age_group = "20-24"

            elif player.age < 30:
                age_group = "25-29"

            elif player.age < 35:
                age_group = "30-34"

            else:
                age_group = "35+"

            player_input.loc[0, "age_group"] = age_group

        # Maintain exact training feature order
        player_input = player_input[feature_columns]

        # Apply preprocessing
        processed_input = preprocessor.transform(
            player_input
        )

        # Generate prediction
        prediction = model.predict(
            processed_input
        )[0]

        prediction = max(0, float(prediction))

        return {
            "status": "success",
            "predicted_market_value_eur": round(
                prediction, 2
            ),
            "currency": "EUR",
            "model": "Gradient Boosting Regressor"
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


# ============================================================
# 12. MODEL INFORMATION ENDPOINT
# ============================================================

@app.get("/api/model/info")
def model_information():

    return {
        "model_name": "Gradient Boosting Regressor",
        "algorithm": "Gradient Boosting",
        "target": "value_eur",
        "evaluation": {
            "mae_eur": 194564.71,
            "rmse_eur": 615623.89,
            "r2_score": 0.9871
        },
        "training_dataset_records": 18278,
        "features": len(feature_columns)
    }



# ============================================================
# 13. PLAYER DISTRIBUTIONS ENDPOINT
# ============================================================

@app.get("/api/players/distributions")
def player_distributions():

    # Overall rating distribution
    overall_counts = (
        df["overall"]
        .dropna()
        .value_counts()
        .sort_index()
        .to_dict()
    )

    overall_distribution = [
        {"rating": int(k), "count": int(v)}
        for k, v in overall_counts.items()
    ]

    # Age distribution
    age_counts = (
        df["age"]
        .dropna()
        .value_counts()
        .sort_index()
        .to_dict()
    )

    age_distribution = [
        {"age": int(k), "count": int(v)}
        for k, v in age_counts.items()
    ]

    # Position distribution
    position_counts = (
        df["primary_position"]
        .dropna()
        .value_counts()
        .to_dict()
    )

    position_distribution = [
        {"position": str(k), "count": int(v)}
        for k, v in position_counts.items()
    ]

    # Market value distribution (binned)
    value_col = df["value_eur"].dropna()

    bins = [
        0, 100_000, 500_000, 1_000_000,
        5_000_000, 10_000_000, 50_000_000,
        100_000_000, float("inf")
    ]

    labels = [
        "<100K", "100K-500K", "500K-1M",
        "1M-5M", "5M-10M", "10M-50M",
        "50M-100M", "100M+"
    ]

    value_binned = pd.cut(
        value_col,
        bins=bins,
        labels=labels,
        right=False
    )

    value_counts = (
        value_binned
        .value_counts()
        .reindex(labels, fill_value=0)
        .to_dict()
    )

    value_distribution = [
        {"range": str(k), "count": int(v)}
        for k, v in value_counts.items()
    ]

    return {
        "overall_distribution": overall_distribution,
        "age_distribution": age_distribution,
        "position_distribution": position_distribution,
        "value_distribution": value_distribution
    }


# ============================================================
# 14. PLAYER FILTERS ENDPOINT
# ============================================================

@app.get("/api/players/filters")
def player_filters():

    positions = sorted(
        df["primary_position"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    nationalities = sorted(
        df["nationality"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    clubs = sorted(
        df["club"]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )

    return {
        "positions": positions,
        "nationalities": nationalities,
        "clubs": clubs
    }
