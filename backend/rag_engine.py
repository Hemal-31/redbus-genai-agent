from __future__ import annotations

import json
import math
import os
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Tuple

import numpy as np
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

try:
    from google import genai
    from google.genai import types
except Exception:  # pragma: no cover - optional dependency for runtime
    genai = None
    types = None

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

GEMINI_LLM_MODEL = os.getenv("GEMINI_LLM_MODEL", "gemini-3.5-flash-lite")
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")

FALLBACK_GEMINI_MODELS = [
    GEMINI_LLM_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
]

api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
try:
    client = genai.Client(api_key=api_key) if genai and api_key and api_key != "your_gemini_api_key_here" else None
except Exception:
    client = None

RED_BUS_CITY_ALIASES = {
    "bangalore": "bengaluru",
    "bengaluru": "bengaluru",
    "balgore": "bengaluru",
    "banglore": "bengaluru",
    "bengalore": "bengaluru",
    "blr": "bengaluru",
    "chennai": "chennai",
    "chn": "chennai",
    "madras": "chennai",
    "hyderabad": "hyderabad",
    "hyd": "hyderabad",
    "coimbatore": "coimbatore",
    "cbe": "coimbatore",
    "kovai": "coimbatore",
    "madurai": "madurai",
    "mdu": "madurai",
    "trichy": "trichy",
    "tiruchirappalli": "trichy",
    "salem": "salem",
    "pondicherry": "pondicherry",
    "puducherry": "pondicherry",
    "vizag": "vizag",
    "visakhapatnam": "visakhapatnam",
    "vijayawada": "vijayawada",
    "mumbai": "mumbai",
    "bombay": "mumbai",
    "delhi": "delhi",
    "new delhi": "delhi",
    "pune": "pune",
    "ahmedabad": "ahmedabad",
    "jaipur": "jaipur",
    "goa": "goa",
    "kolkata": "kolkata",
    "calcutta": "kolkata",
    "kochi": "kochi",
    "cochin": "kochi",
    "mysore": "mysuru",
    "mysuru": "mysuru",
}


class BookingPlan(BaseModel):
    source_city: str = ""
    destination_city: str = ""
    travel_date: str = ""
    ac_required: bool = False
    bus_category: Literal["SLEEPER", "SEATER", "ANY"] = "ANY"
    sort_by: Literal["CHEAPEST", "TOP_RATED", "DEPARTURE"] = "CHEAPEST"
    travel_preference: Literal["CHEAPEST", "TIMING", "TOP_RATED", "BALANCED"] = "BALANCED"
    passenger_name: str = ""
    passenger_age: int = 0
    passenger_gender: str = ""
    passenger_phone: str = ""
    otp_mobile_number: str = ""
    passenger_email: str = ""
    state_name: str = ""
    boarding_point: str = ""
    dropping_point: str = ""
    seat_preference: str = "ANY"
    booking_for_women: bool = False
    candidate_coupons: List[str] = Field(default_factory=list)
    selected_bus_name: str = ""
    selected_bus_review: str = ""
    selected_bus_reason: str = ""
    agent_reply: str = ""
    needs_input: bool = False
    missing_fields: List[str] = Field(default_factory=list)
    needs_preference_choice: bool = False


def _load_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _normalize_detail(value: str) -> str:
    cleaned = _clean_text(value)
    if not cleaned:
        return ""
    parts = []
    for part in cleaned.split():
        upper = part.upper()
        if upper in {"BTM", "RTC", "A/C"}:
            parts.append(upper)
        else:
            parts.append(part.capitalize())
    return " ".join(parts)


def _normalize_city(city: str) -> str:
    cleaned = _clean_text(city).lower()
    if cleaned in RED_BUS_CITY_ALIASES:
        return RED_BUS_CITY_ALIASES[cleaned].title()
    for alias, canonical in RED_BUS_CITY_ALIASES.items():
        if alias == cleaned or cleaned.startswith(alias):
            return canonical.title()
    value = _clean_text(city).title()
    return value.replace(" And ", " and ") if value else value


def _parse_seat_preference(query: str, profile: Optional[Dict[str, Any]] = None) -> str:
    q = (query or "").lower()
    preferred = (profile or {}).get("seat_preference", "").lower() if profile else ""
    choice = preferred or q

    if any(token in choice for token in ["front seat", "front row", "front", "front-facing"]):
        return "FRONT"
    if any(token in choice for token in ["middle", "center", "centre", "middle seat", "central", "center seat"]):
        return "CENTER"
    if any(token in choice for token in ["back seat", "rear", "back", "last row", "back row"]):
        return "BACK"
    if any(token in choice for token in ["window", "window seat"]):
        return "WINDOW"
    if any(token in choice for token in ["aisle", "aisle seat"]):
        return "AISLE"
    return "ANY"


def _extract_route(query: str, profile: Optional[Dict[str, Any]] = None) -> Tuple[str, str]:
    q = (query or "").lower()

    # Match explicit "from <city> to <city>" or "<city> to <city>"
    route_match = re.search(
        r"(?:from\s+)?([a-z][a-z\s&.-]+?)\s+(?:to|->|--)\s+([a-z][a-z\s&.-]+?)(?:\s+(?:on|for|next|this|tomorrow|today|date|by|at|with|and|\d)|$)",
        q,
        re.I,
    )
    if route_match:
        source_cand = _normalize_city(route_match.group(1))
        dest_cand = _normalize_city(route_match.group(2))
        stop_words = {"bus", "ticket", "tickets", "book", "booking", "ac", "sleeper", "seater", "cheap", "me", "a", "an", "the", "please", "want"}
        source_clean = _normalize_city(" ".join([w for w in source_cand.split() if w.lower() not in stop_words]))
        dest_clean = _normalize_city(" ".join([w for w in dest_cand.split() if w.lower() not in stop_words]))
        if source_clean and dest_clean and source_clean.lower() != dest_clean.lower():
            return source_clean, dest_clean

    # Match aliases / known cities in order of occurrence in the query
    city_names: List[Tuple[int, str]] = []
    all_known_cities = sorted(set(RED_BUS_CITY_ALIASES.keys()) | set(RED_BUS_CITY_ALIASES.values()), key=len, reverse=True)
    for city in all_known_cities:
        pattern = re.compile(rf"\b{re.escape(city)}\b", re.I)
        match = pattern.search(q)
        if match:
            city_names.append((match.start(), _normalize_city(city)))

    if len(city_names) >= 2:
        city_names.sort(key=lambda item: item[0])
        source = city_names[0][1]
        destination = city_names[1][1]
        if source and destination and source.lower() != destination.lower():
            return source, destination

    # Dynamic fallback to profile only if specifically configured by the user
    source = (profile or {}).get("source_city") or ((profile or {}).get("default_route") or {}).get("source_city") or ""
    destination = (profile or {}).get("destination_city") or ((profile or {}).get("default_route") or {}).get("destination_city") or ""
    return _normalize_city(source), _normalize_city(destination)


def _next_weekday(target_weekday: int, current_date: datetime | None = None) -> date:
    current = current_date or datetime.now()
    days_until = (target_weekday - current.weekday()) % 7
    if days_until == 0:
        days_until = 7
    return (current + timedelta(days=days_until)).date()


def _resolve_relative_date(query: str, profile: Optional[Dict[str, Any]] = None) -> str:
    q = (query or "").lower().strip()
    current = datetime.now()

    # Check for direct ISO date (e.g. 2026-11-25 or 2026-12-01)
    iso_match = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", q)
    if iso_match:
        return iso_match.group(1)

    # Check for standard day-month date (e.g. 25-11-2026 or 25/11/2026)
    dmy_match = re.search(r"\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b", q)
    if dmy_match:
        try:
            parsed = datetime.strptime(f"{dmy_match.group(1)}-{dmy_match.group(2)}-{dmy_match.group(3)}", "%d-%m-%Y")
            return parsed.date().isoformat()
        except Exception:
            pass

    MONTHS_MAP = {
        "jan": 1, "january": 1,
        "feb": 2, "february": 2,
        "mar": 3, "march": 3,
        "apr": 4, "april": 4,
        "may": 5,
        "jun": 6, "june": 6,
        "jul": 7, "july": 7,
        "aug": 8, "august": 8,
        "sep": 9, "sept": 9, "september": 9,
        "oct": 10, "october": 10,
        "nov": 11, "november": 11,
        "dec": 12, "december": 12,
    }
    month_regex = r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"

    # Natural language Month-Day: "December 1st", "Dec 1", "December 1 2026", "Dec 1st, 2026"
    m_a = re.search(rf"\b{month_regex}[ ,.-]+(\d{{1,2}})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{{4}}))?\b", q, re.I)
    if m_a:
        m_str = m_a.group(1).lower()
        d_val = int(m_a.group(2))
        y_val = int(m_a.group(3)) if m_a.group(3) else None
        m_val = MONTHS_MAP.get(m_str, 0)
        if 1 <= m_val <= 12 and 1 <= d_val <= 31:
            if not y_val:
                y_val = current.year if (m_val > current.month or (m_val == current.month and d_val >= current.day)) else current.year + 1
            try:
                return datetime(y_val, m_val, d_val).date().isoformat()
            except ValueError:
                pass

    # Natural language Day-Month: "1st December", "1st of Dec", "1 Dec 2026", "1st of december"
    m_b = re.search(rf"\b(\d{{1,2}})(?:st|nd|rd|th)?[ ,.-]+(?:of\s+)?{month_regex}(?:\s*,?\s*(\d{{4}}))?\b", q, re.I)
    if m_b:
        d_val = int(m_b.group(1))
        m_str = m_b.group(2).lower()
        y_val = int(m_b.group(3)) if m_b.group(3) else None
        m_val = MONTHS_MAP.get(m_str, 0)
        if 1 <= m_val <= 12 and 1 <= d_val <= 31:
            if not y_val:
                y_val = current.year if (m_val > current.month or (m_val == current.month and d_val >= current.day)) else current.year + 1
            try:
                return datetime(y_val, m_val, d_val).date().isoformat()
            except ValueError:
                pass

    if "tomorrow" in q:
        target = current + timedelta(days=1)
    elif "day after tomorrow" in q or "day after" in q:
        target = current + timedelta(days=2)
    elif "today" in q:
        target = current
    elif "this friday" in q:
        target = datetime.combine(_next_weekday(4, current), datetime.min.time())
    elif "next friday" in q:
        current_target = _next_weekday(4, current)
        target = datetime.combine(current_target + timedelta(days=7), datetime.min.time())
    elif "this saturday" in q:
        target = datetime.combine(_next_weekday(5, current), datetime.min.time())
    elif "next saturday" in q:
        current_target = _next_weekday(5, current)
        target = datetime.combine(current_target + timedelta(days=7), datetime.min.time())
    elif "this sunday" in q:
        target = datetime.combine(_next_weekday(6, current), datetime.min.time())
    elif "next sunday" in q:
        current_target = _next_weekday(6, current)
        target = datetime.combine(current_target + timedelta(days=7), datetime.min.time())
    elif "this monday" in q:
        target = datetime.combine(_next_weekday(0, current), datetime.min.time())
    elif "next monday" in q:
        target = datetime.combine(_next_weekday(0, current) + timedelta(days=7), datetime.min.time())
    else:
        profile_date = (profile or {}).get("travel_date")
        if profile_date:
            return str(profile_date)
        target = current + timedelta(days=1)

    return target.date().isoformat()


def _keyword_score(query: str, offer: Dict[str, Any], source_city: str = "", destination_city: str = "") -> float:
    q = re.sub(r"[^a-z0-9 ]", " ", (query or "").lower())
    haystack = " ".join([
        offer.get("code", ""),
        offer.get("title", ""),
        offer.get("description", ""),
        offer.get("rules", ""),
        " ".join(offer.get("conditions", [])),
        " ".join(offer.get("routes", [])),
    ]).lower()

    score = 0.0

    # Dynamic route terms matching dynamically extracted cities
    route_terms = [c.lower() for c in [source_city, destination_city] if c]
    for term in route_terms:
        if term in haystack:
            score += 3.0

    if "ac" in q and "ac" in haystack:
        score += 3.0
    if "sleeper" in q and "sleeper" in haystack:
        score += 3.0
    if ("cheap" in q or "first" in q) and ("discount" in haystack or "first" in haystack or "off" in haystack):
        score += 2.0
    if "weekend" in q and "weekend" in haystack:
        score += 2.0
    if "card" in q and "card" in haystack:
        score += 1.5

    min_fare = float(offer.get("min_fare", 0) or 0)
    if min_fare > 0:
        score += min(min_fare / 250.0, 2.0)

    return score


def _embed_text(text: str) -> Optional[np.ndarray]:
    if not client:
        return None
    try:
        response = client.models.embed_content(model=GEMINI_EMBEDDING_MODEL, contents=text)
        embeddings = getattr(response, "embeddings", None)
        if not embeddings:
            return None
        first = embeddings[0]
        values = getattr(first, "values", None)
        if values is None and isinstance(first, dict):
            values = first.get("values")
        if values is None:
            return None
        return np.asarray(values, dtype=float)
    except Exception:
        return None


def retrieve_top_offers(
    query: str,
    offers: Optional[List[Dict[str, Any]]] = None,
    source_city: str = "",
    destination_city: str = "",
    top_n: int = 3,
) -> List[str]:
    offer_list = offers or []
    if not offer_list:
        return []

    query_vector = _embed_text(query)
    ranked: List[Tuple[float, Dict[str, Any]]] = []
    for offer in offer_list:
        score = _keyword_score(query, offer, source_city=source_city, destination_city=destination_city)
        if query_vector is not None:
            offer_text = " ".join([
                offer.get("code", ""),
                offer.get("title", ""),
                offer.get("description", ""),
                offer.get("rules", ""),
                *offer.get("conditions", []),
                *offer.get("routes", []),
            ])
            offer_vector = _embed_text(offer_text)
            if offer_vector is not None and query_vector.size and offer_vector.size:
                denom = float(np.linalg.norm(query_vector) * np.linalg.norm(offer_vector))
                if denom > 0:
                    score += float(np.dot(query_vector, offer_vector) / denom)
        ranked.append((score, offer))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return [item[1].get("code") for item in ranked[:top_n] if item[1].get("code")]


def _parse_response_json(response: Any) -> Dict[str, Any]:
    if hasattr(response, "parsed") and response.parsed is not None:
        if isinstance(response.parsed, dict):
            return response.parsed
        return response.parsed.model_dump()
    raw_text = getattr(response, "text", None)
    if not raw_text:
        return {}
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```json\s*|^```\s*|```$", "", text, flags=re.M)
    return json.loads(text)


def _normalize_coupons(codes: List[str]) -> List[str]:
    seen: set[str] = set()
    ordered: List[str] = []
    for code in codes:
        normalized = (code or "").upper().strip()
        if normalized and normalized not in seen:
            ordered.append(normalized)
            seen.add(normalized)
    return ordered[:3]


def build_booking_plan(
    query: str,
    profile: Optional[Dict[str, Any]] = None,
    offers: Optional[List[Dict[str, Any]]] = None,
) -> BookingPlan:
    user_profile = profile if profile is not None else _load_json(BASE_DIR / "data" / "user_profile.json")
    offers = offers or _load_json(BASE_DIR / "data" / "offers_kb.json").get("offers", [])

    source_city, destination_city = _extract_route(query, user_profile)
    travel_date = _resolve_relative_date(query, user_profile)
    q_lower = (query or "").lower()
    ac_required = "ac" in q_lower or bool(user_profile.get("ac_required", False))

    booking_for_women = (
        "women" in q_lower
        or "female" in q_lower
        or "ladies" in q_lower
        or str(user_profile.get("passenger_gender", "")).lower() == "female"
    )

    if "sleeper" in q_lower:
        bus_category: Literal["SLEEPER", "SEATER", "ANY"] = "SLEEPER"
    elif "seater" in q_lower:
        bus_category = "SEATER"
    else:
        bus_category = user_profile.get("bus_category", "ANY")

    if (
        "cost over timing" in q_lower
        or "cheap over timing" in q_lower
        or "cost is more important" in q_lower
        or "budget over timing" in q_lower
    ):
        travel_preference: Literal["CHEAPEST", "TIMING", "TOP_RATED", "BALANCED"] = "CHEAPEST"
    elif (
        "timing over cost" in q_lower
        or "timing is more important" in q_lower
        or "earliest departure" in q_lower
        or "early arrival" in q_lower
    ):
        travel_preference = "TIMING"
    elif "rating" in q_lower or "review" in q_lower or "best rated" in q_lower:
        travel_preference = "TOP_RATED"
    elif "cheap" in q_lower or "cost" in q_lower or "lowest fare" in q_lower or "budget" in q_lower:
        travel_preference = "CHEAPEST"
    elif "timing" in q_lower or "departure" in q_lower or "earliest" in q_lower or "early" in q_lower:
        travel_preference = "TIMING"
    else:
        travel_preference = user_profile.get("travel_preference", "BALANCED")

    if travel_preference == "CHEAPEST":
        sort_by: Literal["CHEAPEST", "TOP_RATED", "DEPARTURE"] = "CHEAPEST"
    elif travel_preference == "TIMING":
        sort_by = "DEPARTURE"
    elif travel_preference == "TOP_RATED":
        sort_by = "TOP_RATED"
    else:
        sort_by = "CHEAPEST"

    candidate_coupons = retrieve_top_offers(
        query, offers=offers, source_city=source_city, destination_city=destination_city, top_n=3
    )

    # Dynamic user details from user profile - no dummy values!
    passenger_name = str(user_profile.get("passenger_name", "")).strip()
    passenger_age = int(user_profile.get("passenger_age", 0) or 0)
    passenger_gender = str(user_profile.get("passenger_gender", "")).strip()
    passenger_phone = str(user_profile.get("passenger_phone", "")).strip()
    otp_mobile_number = str(user_profile.get("otp_mobile_number") or passenger_phone).strip()
    passenger_email = str(user_profile.get("passenger_email", "")).strip()
    boarding_point = _normalize_detail(user_profile.get("boarding_point", ""))
    dropping_point = _normalize_detail(user_profile.get("dropping_point", ""))
    state_name = _normalize_detail(user_profile.get("state_name", ""))
    seat_preference = _parse_seat_preference(query, user_profile)

    missing_fields: List[str] = []
    if not source_city:
        missing_fields.append("source_city")
    if not destination_city:
        missing_fields.append("destination_city")
    needs_input = len(missing_fields) > 0

    preferred_bus_reason = (
        "I am prioritizing the best-value bus that balances fare, rider ratings, and schedule."
    )
    if travel_preference == "CHEAPEST":
        preferred_bus_reason = "I am prioritizing the lowest fare options for your route."
    elif travel_preference == "TIMING":
        preferred_bus_reason = "I am prioritizing optimal departure timing and arrival convenience."
    elif travel_preference == "TOP_RATED":
        preferred_bus_reason = "I am prioritizing the bus with top rider reviews and cleanliness ratings."

    needs_preference_choice = False

    if needs_input:
        agent_reply = (
            f"Please specify your {' and '.join(f.replace('_', ' ') for f in missing_fields)} "
            f"so I can find and book the best bus for you (e.g., 'Book a bus from Delhi to Jaipur tomorrow')."
        )
    else:
        agent_reply = (
            f"I have planned your route from {source_city} to {destination_city} on {travel_date}. "
            f"When you launch auto-booking, I will analyze all travel operators, rank the top 5 buses, select the best option, and fill your passenger information automatically."
        )

    fallback_payload: Dict[str, Any] = {
        "source_city": source_city,
        "destination_city": destination_city,
        "travel_date": travel_date,
        "ac_required": ac_required,
        "bus_category": bus_category,
        "sort_by": sort_by,
        "travel_preference": travel_preference,
        "passenger_name": passenger_name,
        "passenger_age": passenger_age,
        "passenger_gender": passenger_gender,
        "passenger_phone": passenger_phone,
        "otp_mobile_number": otp_mobile_number,
        "passenger_email": passenger_email,
        "state_name": state_name,
        "boarding_point": boarding_point,
        "dropping_point": dropping_point,
        "seat_preference": seat_preference,
        "booking_for_women": booking_for_women,
        "candidate_coupons": candidate_coupons,
        "selected_bus_name": "Recommended Service",
        "selected_bus_review": "Top rated",
        "selected_bus_reason": preferred_bus_reason,
        "agent_reply": agent_reply,
        "needs_input": needs_input,
        "missing_fields": missing_fields,
        "needs_preference_choice": needs_preference_choice,
    }

    if not client or not os.getenv("GEMINI_API_KEY"):
        return BookingPlan.model_validate(fallback_payload)

    # Use Gemini LLM to parse and enrich, falling back across models if quota/429 occurs
    current_today_str = datetime.now().strftime("%Y-%m-%d")
    prompt = (
        "You are the RedBus autonomous booking planner. Parse the user's booking request and return valid JSON matching the schema.\n"
        f"Today's date is {current_today_str}. All travel dates must be on or after today.\n"
        "Do NOT invent or hardcode cities if they are not specified in the user query or profile.\n"
        "Do NOT ask for seat preference or boarding point choices in agent_reply; the user will select their seat and boarding points directly in the live browser.\n"
        f"User query: {query}\n"
        f"Profile: {json.dumps(user_profile, ensure_ascii=False)}\n"
        f"Candidate Offers: {json.dumps(candidate_coupons, ensure_ascii=False)}\n"
        "Required schema fields: source_city, destination_city, travel_date, ac_required, bus_category, sort_by, "
        "passenger_name, passenger_age, passenger_gender, passenger_phone, passenger_email, state_name, "
        "boarding_point, dropping_point, seat_preference, booking_for_women, candidate_coupons, agent_reply"
    )

    seen_models: set[str] = set()
    for model_name in FALLBACK_GEMINI_MODELS:
        if not model_name or model_name in seen_models:
            continue
        seen_models.add(model_name)
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=BookingPlan,
                ),
            )
            payload = _parse_response_json(response)
            if not payload:
                continue

            # Merge with our deterministically validated fallback payload
            payload = {**fallback_payload, **payload}
            payload["needs_preference_choice"] = False
            payload["candidate_coupons"] = _normalize_coupons(list(payload.get("candidate_coupons", [])) or candidate_coupons)
            payload["bus_category"] = payload.get("bus_category", bus_category).upper()
            payload["sort_by"] = payload.get("sort_by", sort_by).upper()
            payload["travel_preference"] = payload.get("travel_preference", travel_preference).upper()
            now_date = datetime.now().date()
            deterministic_date = _resolve_relative_date(query, user_profile)
            raw_date = str(payload.get("travel_date") or deterministic_date or "").strip()
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", raw_date):
                raw_date = deterministic_date
            else:
                try:
                    parsed_dt = datetime.strptime(raw_date, "%Y-%m-%d").date()
                    if parsed_dt < now_date:
                        raw_date = deterministic_date
                except Exception:
                    raw_date = deterministic_date
            payload["travel_date"] = raw_date
            payload["source_city"] = _normalize_city(payload.get("source_city") or source_city)
            payload["destination_city"] = _normalize_city(payload.get("destination_city") or destination_city)
            if not payload.get("needs_input"):
                payload["agent_reply"] = (
                    f"I have set up your trip from {payload['source_city']} to {payload['destination_city']} for {payload['travel_date']}. "
                    "I will scan and compare all travel operators on this route, rank the top 5 buses, and select the best bus for you!"
                )
            payload["passenger_name"] = payload.get("passenger_name") or passenger_name
            payload["passenger_age"] = int(payload.get("passenger_age") or passenger_age or 0)
            payload["passenger_gender"] = payload.get("passenger_gender") or passenger_gender
            payload["passenger_phone"] = str(payload.get("passenger_phone") or passenger_phone)
            payload["otp_mobile_number"] = str(payload.get("otp_mobile_number") or payload.get("passenger_phone") or otp_mobile_number)
            payload["passenger_email"] = payload.get("passenger_email") or passenger_email
            payload["state_name"] = _normalize_detail(payload.get("state_name") or state_name)
            payload["boarding_point"] = _normalize_detail(payload.get("boarding_point") or boarding_point)
            payload["dropping_point"] = _normalize_detail(payload.get("dropping_point") or dropping_point)
            payload["seat_preference"] = str(payload.get("seat_preference") or seat_preference).upper()
            payload["booking_for_women"] = bool(payload.get("booking_for_women", booking_for_women))

            cur_missing: List[str] = []
            if not payload["source_city"]:
                cur_missing.append("source_city")
            if not payload["destination_city"]:
                cur_missing.append("destination_city")
            payload["needs_input"] = len(cur_missing) > 0
            payload["missing_fields"] = cur_missing

            if payload["needs_input"]:
                payload["agent_reply"] = (
                    f"Please provide your {' and '.join(f.replace('_', ' ') for f in cur_missing)} "
                    f"to proceed with finding your bus."
                )
            else:
                payload["agent_reply"] = (
                    f"I have set up your trip from {payload['source_city']} to {payload['destination_city']} for {payload['travel_date']}. "
                    "I will scan and compare all travel operators on this route, rank the top 5 buses, and select the best bus for you!"
                )

            return BookingPlan.model_validate(payload)
        except Exception:
            continue

    return BookingPlan.model_validate(fallback_payload)


def generate_chat_reply(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    plan_context: Optional[Dict[str, Any]] = None,
    bus_context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Generates an intelligent conversational answer to user follow-up questions."""
    msg = (message or "").strip()
    msg_lower = msg.lower()

    plan = plan_context or {}
    bus = bus_context or {}

    source = plan.get("source_city") or "Chennai"
    destination = plan.get("destination_city") or "Bengaluru"
    travel_date = plan.get("travel_date") or "2026-12-01"

    operator = bus.get("operator") or "IntrCity SmartBus"
    departure = bus.get("departure") or "22:30"
    arrival = bus.get("arrival") or "05:45"
    duration = bus.get("duration") or "7h 15m"
    fare = bus.get("fare") or 749
    bus_type = bus.get("busType") or "Bharat Benz A/C Sleeper (2+1)"
    rating = bus.get("rating") or 4.9

    # Determine if user is asking for a completely new trip search
    has_route_pattern = bool(re.search(r"\bfrom\s+[a-z]+\s+to\s+[a-z]+", msg_lower) or re.search(r"\b[a-z]+\s+to\s+[a-z]+", msg_lower))
    new_search_words = ["search", "find", "book new", "another bus", "change city", "change route"]
    if has_route_pattern and any(w in msg_lower for w in ["bus", "tickets", "book", "find", "search", "go"]):
        return {"type": "new_search", "query": msg}

    # 1. Try Gemini LLM for conversational multi-turn response
    if client and os.getenv("GEMINI_API_KEY"):
        prompt = (
            "You are the Bus Booking Bot / TravelMate AI Agent assistant chatting with a traveler.\n"
            f"Current Planned Trip: From {source} to {destination} on {travel_date}.\n"
            f"Selected/Recommended Bus: {operator} ({bus_type}), Departs: {departure}, Arrives: {arrival}, Duration: {duration}, Fare: INR {fare}, Rating: {rating}/5 stars.\n"
            f"User Question: \"{msg}\"\n"
            "Instructions:\n"
            "- Answer the user's question directly, accurately, and politely.\n"
            "- Use the provided trip and bus schedule details.\n"
            "- If they ask when they will reach, state the arrival time and duration.\n"
            "- If they ask about boarding points, mention major city transit stops.\n"
            "- Keep the answer concise (2 to 4 sentences) with helpful markdown bolding.\n"
            "- Do NOT re-list the top 5 buses unless explicitly asked."
        )

        for model_name in FALLBACK_GEMINI_MODELS:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if resp and resp.text:
                    return {"type": "answer", "reply": resp.text.strip()}
            except Exception:
                continue

    # 2. Domain Knowledge Fallback Answers
    if any(w in msg_lower for w in ["reach", "arrival", "arrive", "reaching", "duration", "how long", "timing", "when"]):
        reply = (
            f"For **{operator}** departing from **{source}** at **{departure}**, you are scheduled to reach **{destination}** at **{arrival}** the next morning. "
            f"The total journey duration is approximately **{duration}**."
        )
    elif any(w in msg_lower for w in ["boarding", "pickup", "board", "start point", "where to catch"]):
        reply = (
            f"Major boarding points in **{source}** for {operator} typically include **Koyambedu (CMBT)**, **Guindy**, **Ashok Pillar**, and **Tambaram**. "
            f"You can choose your exact boarding location directly on the RedBus screen!"
        )
    elif any(w in msg_lower for w in ["dropping", "drop", "stop", "destination point"]):
        reply = (
            f"Major dropping points in **{destination}** include **Majestic**, **Electronic City**, **Silk Board**, and **Madiwala**. "
            f"You can select your preferred drop stop during booking."
        )
    elif any(w in msg_lower for w in ["toilet", "washroom", "restroom"]):
        reply = (
            f"Yes, this **{operator}** service ({bus_type}) is Primo-certified and includes an **on-board washroom/toilet**, "
            f"individual charging sockets at every berth, reading lights, and live GPS tracking."
        )
    elif any(w in msg_lower for w in ["luggage", "bag", "baggage", "weight", "carry"]):
        reply = (
            "Standard RedBus luggage allowance is up to **15 kg to 20 kg** per passenger for checked luggage in the bus boot, "
            "plus 1 small personal cabin bag/backpack."
        )
    elif any(w in msg_lower for w in ["seat", "berth", "upper", "lower", "window", "aisle"]):
        reply = (
            f"For a night sleeper journey from **{source} to {destination}**, an **Upper Berth Window** gives you maximum privacy and a quiet night's sleep. "
            f"If you prefer easy access without climbing a ladder, choose a **Lower Berth**. You can click your seat directly in the RedBus layout!"
        )
    elif any(w in msg_lower for w in ["cancel", "refund", "reschedule", "policy"]):
        reply = (
            f"Cancellations made more than 12 hours before departure typically refund 80% to 90% of the fare. "
            f"Primo services by **{operator}** also offer 1-time free date rescheduling!"
        )
    elif any(w in msg_lower for w in ["coupon", "discount", "offer", "promo"]):
        reply = (
            "You can apply promo codes like **HSBCRAIL**, **SLEEPOFF**, or **REDBUSFEST** on the payment screen to get up to ₹250 instant discount!"
        )
    else:
        reply = (
            f"I have noted your question regarding your **{source} → {destination}** trip on **{travel_date}** with **{operator}**. "
            f"Feel free to select your seat, choose boarding points, or ask anything about timings, amenities, and baggage!"
        )

    return {"type": "answer", "reply": reply}


if __name__ == "__main__":
    sample = "AC Sleeper Chennai to Bangalore tomorrow, cheapest first, apply best offer"
    plan = build_booking_plan(sample)
    print(plan.model_dump_json(indent=2))
