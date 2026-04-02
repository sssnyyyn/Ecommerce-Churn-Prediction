import streamlit as st
import pandas as pd
import numpy as np
import joblib

@st.cache_resource
def load_artifacts():
    model = joblib.load("data/ecommerce_randomforest_model.pkl")
    encoders = joblib.load("data/ecommerce_labelencoders.pkl")

    model_features = model.feature_names_in_

    return model, encoders, model_features

model, encoders, model_features = load_artifacts()

st.set_page_config(page_title="E-Commerce Churn Analytics", layout="wide")

st.title("🛍️ 이커머스 고객 이탈 예측 및 매니지먼트 시스템")
st.markdown("""
이 대시보드는 **가입 기간, 불만 접수, 주문 패턴** 등 고객 행동 데이터를 기반으로 이탈 위험도를 실시간으로 분석합니다.
""")

st.sidebar.header("👤 고객 행동 데이터 입력")

with st.sidebar:
    st.subheader("⏳ 가입 및 이용 정보")
    tenure = st.number_input("가입 기간 (Tenure)", 0, 100, 10)
    day_since_last_order = st.number_input("마지막 주문 후 경과일", 0, 100, 5)

    st.divider()
    st.subheader("🗣️ 서비스 상호작용")
    complain = st.radio("고객 불만 접수 여부", options=[0, 1], format_func=lambda x: "있음(1)" if x==1 else "없음(0)")
    satisfaction_score = st.slider("서비스 만족도 점수", 1, 5, 3)

    st.divider()
    st.subheader("💰 소비 및 프로모션")
    cashback_amount = st.number_input("평균 캐시백 금액", 0.0, 500.0, 150.0)
    order_count = st.number_input("총 주문 횟수", 1, 100, 2)
    coupon_used = st.number_input("쿠폰 사용 횟수", 0, 100, 1)

    st.divider()
    st.subheader("📋 고객 프로필")
    marital_status = st.selectbox("결혼 여부", encoders['MaritalStatus'].classes_)
    prefered_order_cat = st.selectbox("선호 주문 카테고리", encoders['PreferedOrderCat'].classes_)

if st.sidebar.button("이탈 위험도 분석 실행"):

    input_df = pd.DataFrame(columns=model_features)

    encoded_marital = encoders['MaritalStatus'].transform([marital_status])[0]
    encoded_cat = encoders['PreferedOrderCat'].transform([prefered_order_cat])[0]

    input_data = {
        'Tenure': tenure,
        'DaySinceLastOrder': day_since_last_order,
        'Complain': complain,
        'SatisfactionScore': satisfaction_score,
        'CashbackAmount': cashback_amount,
        'OrderCount': order_count,
        'CouponUsed': coupon_used,
        'MaritalStatus': encoded_marital,
        'PreferedOrderCat': encoded_cat
    }

    input_row = []
    for col in model_features:
        input_row.append(input_data.get(col, 0))

    input_df.loc[0] = input_row

    churn_proba = model.predict_proba(input_df)[0][1]
    is_churn = 1 if churn_proba >= 0.3 else 0

    st.divider()
    col1, col2 = st.columns([1, 1.5])

    with col1:
        st.subheader("🔍 분석 결과")
        st.metric(label="이탈 예측 확률", value=f"{churn_proba*100:.1f}%")

        if is_churn == 1:
            st.error(f"⚠️ 결과: **이탈 위험 고객군**")
            st.progress(float(churn_proba))
        else:
            st.success(f"✅ 결과: **유지 안정 고객군**")
            st.progress(float(churn_proba))

    with col2:
        st.subheader("💡 추천 비즈니스 액션")
        if is_churn == 1:
            if complain == 1:
                st.warning("📍 **불만 고객 집중 케어**: 고객 불만이 접수된 상태입니다. 즉시 해피콜을 실시하고 보상 쿠폰(Cashback) 지급을 검토하세요.")
            if tenure < 5:
                st.warning("📍 **신규 고객 이탈 방지**: 가입 초기 고객의 이탈 징후입니다. 서비스 사용 가이드를 제공하고 리텐션 이벤트를 진행하세요.")
            if day_since_last_order > 20:
                st.info("📍 **재구매 유도**: 주문 공백기가 길어지고 있습니다. 장바구니 상품 할인 알림이나 개인화 큐레이션 메일을 발송하세요.")
        else:
            st.info("📍 **로열티 강화**: 현재 서비스에 만족하고 있는 고객입니다. 친구 초대 포인트나 신규 카테고리 교차 판매(Cross-selling)를 시도하세요.")

else:
    st.info("왼쪽 사이드바에서 고객 데이터를 입력한 후 '이탈 위험도 분석 실행' 버튼을 눌러주세요.")
