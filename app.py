
import os
import joblib
import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


# ============================================================
# 1. PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="FIFA 20 Player Intelligence",
    page_icon="⚽",
    layout="wide"
)


# ============================================================
# 2. PROJECT PATHS
# app.py is in the FiFa 20 root folder
# ============================================================

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(PROJECT_DIR, "Data")
MODEL_DIR = os.path.join(PROJECT_DIR, "Model")

DATASET_PATH = os.path.join(DATA_DIR, "players_20.csv")

MODEL_PATH = os.path.join(
    MODEL_DIR, "gradient_boosting_model.pkl"
)

PREPROCESSOR_PATH = os.path.join(
    MODEL_DIR, "preprocessor.pkl"
)

DEFAULT_PLAYER_PATH = os.path.join(
    MODEL_DIR, "default_player.pkl"
)

FEATURE_COLUMNS_PATH = os.path.join(
    MODEL_DIR, "feature_columns.pkl"
)


# ============================================================
# 3. LOAD MODEL ARTIFACTS
# ============================================================

@st.cache_resource
def load_model_artifacts():

    required_files = [
        MODEL_PATH,
        PREPROCESSOR_PATH,
        DEFAULT_PLAYER_PATH,
        FEATURE_COLUMNS_PATH
    ]

    missing_files = [
        path for path in required_files
        if not os.path.isfile(path)
    ]

    if missing_files:
        raise FileNotFoundError(
            "Missing model artifacts:\n"
            + "\n".join(missing_files)
        )

    model = joblib.load(MODEL_PATH)
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    default_player = joblib.load(DEFAULT_PLAYER_PATH)
    feature_columns = joblib.load(FEATURE_COLUMNS_PATH)

    return (
        model,
        preprocessor,
        default_player,
        feature_columns
    )


# ============================================================
# 4. LOAD DATASET
# ============================================================

@st.cache_data
def load_dataset():

    if not os.path.isfile(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    # Create primary_position
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

    # Create potential_gap
    if (
        "potential_gap" not in df.columns
        and "potential" in df.columns
        and "overall" in df.columns
    ):

        df["potential_gap"] = (
            df["potential"] - df["overall"]
        )

    # Create age_group
    if (
        "age_group" not in df.columns
        and "age" in df.columns
    ):

        df["age_group"] = pd.cut(
            df["age"],
            bins=[0, 20, 25, 30, 35, 100],
            labels=[
                "Under 20",
                "20-24",
                "25-29",
                "30-34",
                "35+"
            ],
            right=False
        ).astype("object")

    return df


# ============================================================
# 5. LOAD PROJECT FILES
# ============================================================

try:

    model, preprocessor, default_player, feature_columns = (
        load_model_artifacts()
    )

    df = load_dataset()

except Exception as e:

    st.error("Unable to load project files.")
    st.exception(e)
    st.stop()


# ============================================================
# 6. PREPARE DEFAULT PLAYER
# ============================================================

if isinstance(default_player, dict):
    default_player = pd.DataFrame([default_player])

default_player = default_player.copy()

feature_columns = list(feature_columns)

missing_features = [
    col for col in feature_columns
    if col not in default_player.columns
]

if missing_features:

    st.error(
        "The saved default_player.pkl is missing model features: "
        + ", ".join(missing_features)
    )

    st.stop()

default_player = default_player[feature_columns]


# ============================================================
# 7. HELPER FUNCTIONS
# ============================================================

def format_euros(value):
    return f"€{value:,.0f}"


def get_options(column):

    if column not in df.columns:
        return []

    return sorted(
        df[column]
        .dropna()
        .astype(str)
        .unique()
        .tolist()
    )


def get_default_value(column, fallback):

    if column not in default_player.columns:
        return fallback

    value = default_player.iloc[0][column]

    if pd.isna(value):
        return fallback

    return value


# ============================================================
# 8. SIDEBAR NAVIGATION
# ============================================================

st.sidebar.title("⚽ FIFA 20 Intelligence")

page = st.sidebar.radio(
    "Navigation",
    [
        "Home",
        "Market Value Prediction",
        "Player Analytics",

    ]
)

st.sidebar.markdown("---")

st.sidebar.caption(
    "FIFA 20 Player Analytics & Intelligence Platform"
)


# ============================================================
# 9. HOME PAGE
# ============================================================

if page == "Home":

    st.title("⚽ FIFA 20 Player Intelligence")

    st.markdown(
        "Explore FIFA 20 player statistics, analyze market values, "
        "and predict player valuations using Machine Learning."
    )

    st.divider()

    total_players = len(df)

    average_overall = df["overall"].mean()
    average_age = df["age"].mean()
    total_nationalities = df["nationality"].nunique()

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Total Players", f"{total_players:,}")
    col2.metric("Average Overall", f"{average_overall:.1f}")
    col3.metric("Average Age", f"{average_age:.1f}")
    col4.metric("Nationalities", f"{total_nationalities:,}")

    st.divider()

    left, right = st.columns(2)

    with left:

        st.subheader("Top 10 Players")

        display_columns = [
            col for col in [
                "short_name",
                "overall",
                "potential",
                "age",
                "club",
                "value_eur"
            ]
            if col in df.columns
        ]

        top_players = (
            df.sort_values(
                by="overall",
                ascending=False
            )[display_columns]
            .head(10)
        )

        st.dataframe(
            top_players,
            use_container_width=True,
            hide_index=True
        )

    with right:

        st.subheader("Player Age Distribution")

        fig, ax = plt.subplots()

        ax.hist(
            df["age"].dropna(),
            bins=20
        )

        ax.set_xlabel("Age")
        ax.set_ylabel("Number of Players")
        ax.set_title("Age Distribution")

        st.pyplot(fig)
        plt.close(fig)


# ============================================================
# 10. MARKET VALUE PREDICTION
# ============================================================

elif page == "Market Value Prediction":

    st.title("Market Value Prediction")

    st.markdown(
        "Adjust player attributes to estimate their market value."
    )

    st.info(
        "The prediction uses the selected attributes and retains "
        "the other features from the saved default player profile."
    )

    player_input = default_player.copy()

    col1, col2 = st.columns(2)

    # Age
    if "age" in feature_columns:

        with col1:

            age_default = int(get_default_value("age", 25))

            age = st.slider(
                "Age",
                16,
                45,
                max(16, min(45, age_default))
            )

            player_input.loc[0, "age"] = age

    # Overall
    if "overall" in feature_columns:

        with col2:

            overall_default = int(
                get_default_value("overall", 70)
            )

            overall = st.slider(
                "Overall Rating",
                40,
                99,
                max(40, min(99, overall_default))
            )

            player_input.loc[0, "overall"] = overall

    col3, col4 = st.columns(2)

    # Potential
    if "potential" in feature_columns:

        with col3:

            potential_default = int(
                get_default_value("potential", 75)
            )

            potential = st.slider(
                "Potential",
                40,
                99,
                max(40, min(99, potential_default))
            )

            player_input.loc[0, "potential"] = potential

    # Wage
    if "wage_eur" in feature_columns:

        with col4:

            wage_default = int(
                get_default_value("wage_eur", 10000)
            )

            wage = st.number_input(
                "Weekly Wage (€)",
                min_value=0,
                max_value=1000000,
                value=max(0, wage_default),
                step=1000
            )

            player_input.loc[0, "wage_eur"] = wage

    # International reputation
    if "international_reputation" in feature_columns:

        reputation_default = int(
            get_default_value("international_reputation", 1)
        )

        reputation = st.slider(
            "International Reputation",
            1,
            5,
            max(1, min(5, reputation_default))
        )

        player_input.loc[
            0, "international_reputation"
        ] = reputation

    # Weak foot
    if "weak_foot" in feature_columns:

        weak_default = int(
            get_default_value("weak_foot", 3)
        )

        weak_foot = st.slider(
            "Weak Foot",
            1,
            5,
            max(1, min(5, weak_default))
        )

        player_input.loc[0, "weak_foot"] = weak_foot

    # Skill moves
    if "skill_moves" in feature_columns:

        skill_default = int(
            get_default_value("skill_moves", 3)
        )

        skill_moves = st.slider(
            "Skill Moves",
            1,
            5,
            max(1, min(5, skill_default))
        )

        player_input.loc[0, "skill_moves"] = skill_moves

    # Preferred foot
    if "preferred_foot" in feature_columns:

        foot_options = get_options("preferred_foot")

        if foot_options:

            foot_default = str(
                get_default_value(
                    "preferred_foot",
                    foot_options[0]
                )
            )

            foot_index = (
                foot_options.index(foot_default)
                if foot_default in foot_options else 0
            )

            preferred_foot = st.selectbox(
                "Preferred Foot",
                foot_options,
                index=foot_index
            )

            player_input.loc[
                0, "preferred_foot"
            ] = preferred_foot

    # Body type
    if "body_type" in feature_columns:

        body_options = get_options("body_type")

        if body_options:

            body_default = str(
                get_default_value(
                    "body_type",
                    body_options[0]
                )
            )

            body_index = (
                body_options.index(body_default)
                if body_default in body_options else 0
            )

            body_type = st.selectbox(
                "Body Type",
                body_options,
                index=body_index
            )

            player_input.loc[0, "body_type"] = body_type

    # Work rate
    if "work_rate" in feature_columns:

        work_options = get_options("work_rate")

        if work_options:

            work_default = str(
                get_default_value(
                    "work_rate",
                    work_options[0]
                )
            )

            work_index = (
                work_options.index(work_default)
                if work_default in work_options else 0
            )

            work_rate = st.selectbox(
                "Work Rate",
                work_options,
                index=work_index
            )

            player_input.loc[0, "work_rate"] = work_rate

    # Real face
    if "real_face" in feature_columns:

        face_options = get_options("real_face")

        if face_options:

            face_default = str(
                get_default_value(
                    "real_face",
                    face_options[0]
                )
            )

            face_index = (
                face_options.index(face_default)
                if face_default in face_options else 0
            )

            real_face = st.selectbox(
                "Real Face",
                face_options,
                index=face_index
            )

            player_input.loc[0, "real_face"] = real_face

    # Primary position
    if "primary_position" in feature_columns:

        position_options = get_options("primary_position")

        if position_options:

            position_default = str(
                get_default_value(
                    "primary_position",
                    position_options[0]
                )
            )

            position_index = (
                position_options.index(position_default)
                if position_default in position_options else 0
            )

            primary_position = st.selectbox(
                "Primary Position",
                position_options,
                index=position_index
            )

            player_input.loc[
                0, "primary_position"
            ] = primary_position

    # Update potential gap
    if (
        "potential_gap" in feature_columns
        and "potential" in player_input.columns
        and "overall" in player_input.columns
    ):

        player_input.loc[0, "potential_gap"] = (
            player_input.loc[0, "potential"]
            - player_input.loc[0, "overall"]
        )

    # Update age group
    if "age_group" in feature_columns:

        age_value = player_input.loc[0, "age"]

        if age_value < 20:
            age_group = "Under 20"
        elif age_value < 25:
            age_group = "20-24"
        elif age_value < 30:
            age_group = "25-29"
        elif age_value < 35:
            age_group = "30-34"
        else:
            age_group = "35+"

        player_input.loc[0, "age_group"] = age_group

    st.divider()

    if st.button(
        "Predict Market Value",
        type="primary",
        use_container_width=True
    ):

        try:

            player_input = player_input[feature_columns]

            processed_input = preprocessor.transform(
                player_input
            )

            prediction = model.predict(
                processed_input
            )[0]

            prediction = max(0, float(prediction))

            st.success("Prediction completed!")

            st.subheader("Estimated Market Value")

            st.metric(
                "Predicted Player Value",
                format_euros(prediction)
            )

            st.caption(
                "This is a model estimate based on FIFA 20 data, "
                "not an official player valuation."
            )

        except Exception as e:

            st.error("Prediction failed.")
            st.exception(e)


# ============================================================
# 11. PLAYER ANALYTICS
# ============================================================

elif page == "Player Analytics":

    st.title("Player Analytics")

    st.markdown(
        "Explore FIFA 20 players using different filters."
    )

    filtered_df = df.copy()

    col1, col2, col3 = st.columns(3)

    with col1:

        position_options = ["All"] + get_options(
            "primary_position"
        )

        selected_position = st.selectbox(
            "Position",
            position_options
        )

    with col2:

        minimum_overall = st.slider(
            "Minimum Overall Rating",
            40,
            99,
            60
        )

    with col3:

        nationality_options = ["All"] + get_options(
            "nationality"
        )

        selected_nationality = st.selectbox(
            "Nationality",
            nationality_options
        )

    if selected_position != "All":

        filtered_df = filtered_df[
            filtered_df["primary_position"].astype(str)
            == selected_position
        ]

    filtered_df = filtered_df[
        filtered_df["overall"] >= minimum_overall
    ]

    if (
        selected_nationality != "All"
        and "nationality" in filtered_df.columns
    ):

        filtered_df = filtered_df[
            filtered_df["nationality"].astype(str)
            == selected_nationality
        ]

    st.divider()

    st.subheader(
        f"Players Found: {len(filtered_df):,}"
    )

    display_columns = [
        col for col in [
            "short_name",
            "age",
            "nationality",
            "club",
            "primary_position",
            "overall",
            "potential",
            "wage_eur",
            "value_eur"
        ]
        if col in filtered_df.columns
    ]

    st.dataframe(
        filtered_df[display_columns],
        use_container_width=True,
        hide_index=True
    )

    st.subheader("Overall Rating vs Market Value")

    fig, ax = plt.subplots()

    ax.scatter(
        filtered_df["overall"],
        filtered_df["value_eur"],
        alpha=0.5
    )

    ax.set_xlabel("Overall Rating")
    ax.set_ylabel("Market Value (€)")
    ax.set_title("Overall Rating vs Market Value")

    st.pyplot(fig)
    plt.close(fig)


# ============================================================
# 12. FOOTER
# ============================================================

st.divider()

st.caption(
    "FIFA 20 Player Analytics & Intelligence Platform | "
    "Machine Learning Project"
)
