from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    from backend.browser_agent import execute_redbus_booking, get_telemetry, get_top_buses, get_selected_bus_reason, get_execution_status, clear_booking_session
    from backend.rag_engine import BookingPlan, build_booking_plan, generate_chat_reply
except ImportError:  # pragma: no cover - fallback for running as a script in backend/
    from browser_agent import execute_redbus_booking, get_telemetry, get_top_buses, get_selected_bus_reason, get_execution_status, clear_booking_session
    from rag_engine import BookingPlan, build_booking_plan, generate_chat_reply

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RedBus Autonomous AI Booking Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

EXECUTION_TASKS: Dict[str, asyncio.Task[Any]] = {}


class PlanRequest(BaseModel):
    query: str
    profile: Optional[Dict[str, Any]] = None


class ExecuteRequest(BaseModel):
    query: str = ""
    plan: Optional[Dict[str, Any]] = None
    profile: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    plan: Optional[Dict[str, Any]] = None
    selected_bus: Optional[Dict[str, Any]] = None


@app.get("/")
def home() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.post("/api/chat")
def chat_reply(payload: ChatRequest):
    return generate_chat_reply(
        message=payload.message,
        history=payload.history,
        plan_context=payload.plan,
        bus_context=payload.selected_bus,
    )
    return FileResponse(FRONTEND_DIR / "index.html")


@app.post("/api/plan")
def create_plan(payload: PlanRequest):
    plan = build_booking_plan(payload.query, profile=payload.profile)
    if plan.needs_input or not plan.source_city or not plan.destination_city:
        missing = plan.missing_fields or []
        if not plan.source_city and "source_city" not in missing:
            missing.append("source_city")
        if not plan.destination_city and "destination_city" not in missing:
            missing.append("destination_city")
        return {
            "status": "needs_input",
            "missing_fields": missing,
            "message": (
                f"Please provide your {' and '.join(m.replace('_', ' ') for m in missing)} "
                f"(e.g. 'Bus from Delhi to Jaipur tomorrow')."
            ),
            "plan": plan.model_dump(),
        }
    return {"status": "ok", "plan": plan.model_dump()}


async def _run_background_booking(query: str, plan_payload: Optional[Dict[str, Any]] = None, profile: Optional[Dict[str, Any]] = None) -> None:
    try:
        if plan_payload:
            try:
                plan = BookingPlan.model_validate(plan_payload)
            except Exception:
                plan = await asyncio.to_thread(build_booking_plan, query, profile=profile)
        else:
            plan = await asyncio.to_thread(build_booking_plan, query, profile=profile)
        await execute_redbus_booking(plan)
    except Exception as exc:  # pragma: no cover - defensive safety net
        try:
            from backend.browser_agent import append_telemetry
        except ImportError:  # pragma: no cover - fallback for running as a script in backend/
            from browser_agent import append_telemetry

        append_telemetry(f"Background execution failed before browser launch: {exc}", "STEP_1_OPEN_RED_BUS")


@app.post("/api/execute")
async def execute_booking(payload: ExecuteRequest):
    old_task = EXECUTION_TASKS.get("latest")
    if old_task is not None and not old_task.done():
        old_task.cancel()

    target_plan = None
    if payload.plan:
        try:
            target_plan = BookingPlan.model_validate(payload.plan)
        except Exception:
            pass

    if target_plan is None and payload.query:
        target_plan = await asyncio.to_thread(build_booking_plan, payload.query, profile=payload.profile)

    if target_plan is None or not target_plan.source_city or not target_plan.destination_city:
        return {
            "status": "error",
            "error": "Missing route information (source_city and destination_city are required). Please ask the user to specify their trip.",
        }

    clear_booking_session()
    task = asyncio.create_task(execute_redbus_booking(target_plan))
    EXECUTION_TASKS["latest"] = task
    return {
        "status": "queued",
        "message": f"Auto-booking for {target_plan.source_city} → {target_plan.destination_city} started in the background. Telemetry is polling live execution progress.",
    }


@app.get("/api/telemetry")
def telemetry():
    return {
        "telemetry": get_telemetry(),
        "top_buses": get_top_buses(),
        "selected_bus_reason": get_selected_bus_reason(),
        "status": get_execution_status(),
    }


@app.get("/api/inspect-images")
async def inspect_images():
    try:
        from backend.browser_agent import ACTIVE_PAGE
        if not ACTIVE_PAGE or ACTIVE_PAGE.is_closed():
            return {"status": "no_page"}
        imgs = await ACTIVE_PAGE.evaluate('''() => {
            return Array.from(document.querySelectorAll('img')).map(i => ({
                src: i.src,
                alt: i.alt || '',
                className: i.className || '',
                naturalWidth: i.naturalWidth,
                naturalHeight: i.naturalHeight,
                parentClass: i.parentElement ? i.parentElement.className : ''
            })).filter(i => i.src && (i.src.includes('jpg') || i.src.includes('jpeg') || i.src.includes('png') || i.src.includes('webp') || i.src.includes('bus') || i.naturalWidth > 50));
        }''')
        return {"status": "ok", "images": imgs}
    except Exception as e:
        return {"status": "error", "error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
