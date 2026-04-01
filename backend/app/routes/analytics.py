"""
Cost analytics API for Wakeeli.

GET /api/analytics/costs
  Query params:
    days (int, default 30) - number of past days to include

Returns:
  summary, daily_breakdown, per_conversation, model_split

Data source: PostgreSQL token_usage table (primary).
Falls back to JSONL file if DB query fails or returns no data.
"""

import json
import os
import datetime
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Query

from app.services.token_tracker import _USAGE_LOG

router = APIRouter()


def _query_db(days: int) -> list[dict]:
    """Query token usage from PostgreSQL for the past N days."""
    try:
        from app.database import SessionLocal
        from app.models import TokenUsage

        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days - 1)
        db = SessionLocal()
        try:
            records = db.query(TokenUsage).filter(TokenUsage.timestamp >= cutoff).all()
            entries = []
            for r in records:
                ts = r.timestamp.isoformat() + "Z" if r.timestamp else ""
                entries.append({
                    "timestamp": ts,
                    "model": r.model or "",
                    "call_label": r.call_label or "",
                    "conversation_id": r.conversation_id,
                    "input_tokens": r.input_tokens or 0,
                    "cache_creation_input_tokens": r.cache_creation_input_tokens or 0,
                    "cache_read_input_tokens": r.cache_read_input_tokens or 0,
                    "output_tokens": r.output_tokens or 0,
                    "total_input_tokens": r.total_input_tokens or 0,
                    "estimated_cost_usd": r.estimated_cost_usd or 0.0,
                })
            return entries
        finally:
            db.close()
    except Exception as exc:
        print(f"[ANALYTICS] WARNING: could not query DB: {exc}")
        return []


def _parse_log(days: int) -> list[dict]:
    """Read the JSONL log and return entries within the requested date window (fallback)."""
    entries: list[dict] = []
    if not os.path.exists(_USAGE_LOG):
        return entries

    cutoff = datetime.date.today() - datetime.timedelta(days=days - 1)
    cutoff_str = cutoff.isoformat()

    try:
        with open(_USAGE_LOG, "r") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                ts = entry.get("timestamp", "")
                if ts[:10] >= cutoff_str:
                    entries.append(entry)
    except OSError:
        pass

    return entries


def _get_entries(days: int) -> list[dict]:
    """Return token usage entries, preferring DB over JSONL."""
    entries = _query_db(days)
    if not entries:
        entries = _parse_log(days)
    return entries


@router.get("/costs")
def get_costs(days: int = Query(default=30, ge=1, le=365)) -> dict[str, Any]:
    """
    Return aggregated cost analytics for the past N days.
    """
    entries = _get_entries(days)

    total_spend = 0.0
    total_calls = len(entries)
    total_cache_read = 0
    total_input_all = 0

    daily: dict[str, dict[str, Any]] = defaultdict(lambda: {
        "cost_usd": 0.0,
        "calls": 0,
        "cache_read": 0,
        "total_input": 0,
    })

    conversations: dict[Any, dict[str, Any]] = defaultdict(lambda: {
        "total_cost_usd": 0.0,
        "call_count": 0,
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_tokens": 0,
        "first_call": None,
        "last_call": None,
    })

    models: dict[str, dict[str, Any]] = defaultdict(lambda: {"cost_usd": 0.0, "calls": 0})

    conversation_ids: set = set()

    for entry in entries:
        cost = entry.get("estimated_cost_usd", 0.0)
        model = entry.get("model", "unknown")
        ts = entry.get("timestamp", "")
        date_str = ts[:10] if ts else "unknown"
        conv_id = entry.get("conversation_id")
        cache_read = entry.get("cache_read_input_tokens", 0)
        cache_write = entry.get("cache_creation_input_tokens", 0)
        input_tok = entry.get("input_tokens", 0)
        output_tok = entry.get("output_tokens", 0)
        total_input = entry.get("total_input_tokens", input_tok + cache_read + cache_write)

        total_spend += cost
        total_cache_read += cache_read
        total_input_all += total_input

        day = daily[date_str]
        day["cost_usd"] += cost
        day["calls"] += 1
        day["cache_read"] += cache_read
        day["total_input"] += total_input

        models[model]["cost_usd"] += cost
        models[model]["calls"] += 1

        if conv_id is not None:
            conversation_ids.add(conv_id)
            conv = conversations[conv_id]
            conv["total_cost_usd"] += cost
            conv["call_count"] += 1
            conv["input_tokens"] += input_tok
            conv["output_tokens"] += output_tok
            conv["cache_read_tokens"] += cache_read
            if conv["first_call"] is None or ts < conv["first_call"]:
                conv["first_call"] = ts
            if conv["last_call"] is None or ts > conv["last_call"]:
                conv["last_call"] = ts

    total_conversations = len(conversation_ids)
    avg_cost_per_conversation = (
        round(total_spend / total_conversations, 6) if total_conversations > 0 else 0.0
    )
    cache_hit_rate = (
        round(total_cache_read / total_input_all, 4) if total_input_all > 0 else 0.0
    )

    daily_breakdown = []
    for date_str in sorted(daily.keys()):
        d = daily[date_str]
        d_cache_hit = (
            round(d["cache_read"] / d["total_input"], 4)
            if d["total_input"] > 0
            else 0.0
        )
        daily_breakdown.append({
            "date": date_str,
            "cost_usd": round(d["cost_usd"], 6),
            "calls": d["calls"],
            "cache_hit_rate": d_cache_hit,
        })

    per_conversation = sorted(
        [
            {
                "conversation_id": conv_id,
                "total_cost_usd": round(data["total_cost_usd"], 6),
                "call_count": data["call_count"],
                "input_tokens": data["input_tokens"],
                "output_tokens": data["output_tokens"],
                "cache_read_tokens": data["cache_read_tokens"],
                "first_call": data["first_call"],
                "last_call": data["last_call"],
            }
            for conv_id, data in conversations.items()
        ],
        key=lambda x: x["total_cost_usd"],
        reverse=True,
    )

    model_split = {
        model: {
            "cost_usd": round(data["cost_usd"], 6),
            "calls": data["calls"],
        }
        for model, data in models.items()
    }

    return {
        "summary": {
            "total_spend_usd": round(total_spend, 6),
            "total_calls": total_calls,
            "total_conversations": total_conversations,
            "avg_cost_per_conversation": avg_cost_per_conversation,
            "cache_hit_rate": cache_hit_rate,
        },
        "daily_breakdown": daily_breakdown,
        "per_conversation": per_conversation,
        "model_split": model_split,
    }
