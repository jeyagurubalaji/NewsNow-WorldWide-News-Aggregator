import streamlit as st
from ml_engine import RealFakeClassifier
from claim_verifier import extract_claims

# Page Configuration
st.set_page_config(
    page_title="True Detective — AI Fake News Detector",
    layout="wide",
    page_icon="🕵️‍♂️"
)

# 1. Cache the heavy ML model resource so it loads ONCE in RAM
@st.cache_resource
def get_classifier():
    return RealFakeClassifier()

# 2. Retrieve cached classifier instance
classifier = get_classifier()

# Main Title & Description
st.title("🕵️‍♂️ True Detective — Global AI Fake News Detector")
st.caption("Universal Real-Time Fact-Checking & Verification Engine")

st.markdown("---")

# Instant Manual Verification Interface
st.header("⚡ Instant Article Verification")
st.write("Enter any news headline, article excerpt, historical claim, or event statement below to verify its accuracy.")

# Text Area Input
input_text = st.text_area(
    label="Paste news text or article statement to verify:",
    height=150,
    placeholder="e.g., Jane Doe alleges sexual assault at Cornell University fraternity..."
)

# Execution Button
if st.button("Check Article Now", type="primary"):
    if not input_text.strip():
        st.warning("Please paste some text or a statement before checking.")
    else:
        with st.spinner("Verifying claim against global news sources and knowledge bases..."):
            # Run Semantic Analysis & Claim Extraction
            res = classifier.analyze("Instant Check", input_text)
            claims = extract_claims(input_text)

        st.markdown("---")

        # Display Result Assessment
        status = res.get("status", "UNVERIFIED")
        confidence = res.get("confidence", 50.0)
        explanation = res.get("explanation", "")

        # Dynamic Color Styling Based on Output
        if status == "LIKELY TRUE":
            st.success(f"### Assessment: {status}")
        elif status == "LIKELY FALSE":
            st.error(f"### Assessment: {status}")
        else:
            st.warning(f"### Assessment: {status}")

        # Metrics Display
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Model Confidence", f"{confidence}%")
        with col2:
            st.metric("Status Signal", status)

        if explanation:
            st.info(f"**Verification Details:** {explanation}")

        # Display Extracted Claims
        if claims:
            st.subheader("Extracted Claims:")
            for claim in claims:
                st.write(f"• {claim}")