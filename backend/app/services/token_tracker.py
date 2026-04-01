"""
Token usage tracker and budget monitor for Wakeeli Anthropic API calls.

Logs each API call's token usage (cache_creation_input_tokens,
cache_read_input_tokens, input_tokens, output_tokens) to both stdout
and a JSONL log file. Tracks daily spend against a configurable limit.
"""

import json
import os
import datetime
from typing import Any

# Log file paths
_LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "logs")
_USAGE_LOG = os.path.join(_LOG_DIR, "token_usage.jsonl")
_DAILY_SPEND_FILE = os.path.join(_LOG_DIR, "daily_spend.json")

# Cost per million tokens (USD)
_PRICING: dict[str, dict[str, float]] = {
    "claude-sonnet-4-6": {
        "input": 3.00,
        "cache_read": 0.30,
        "cache_write": 3.75,
        "output": 15.00,
    },
    "claude-haiku-4-5": {
        "input": 0.80,
        "cache_read": 0.08,
        "cache_write": 1.00,
        "output": 4.00,
    },
}

# Default pricing used when model is unknown
_DEFAULT_PRICING = _PRICING["claude-sonnet-4-6"]

# Daily cost limit in USD (overridable via env var)
_DAILY_COST_LIMIT: float = float(os.environ.get("DAILY_COST_LIMIT", "10.0"))


def _ensure_log_dir() -> None:
    os.makedirs(_LOG_DIR, exist_ok=True)


def _get_pricing(model: str) -> dict[str, float]:
    for key, prices in _PRICING.items():
        if key in model:
            return prices
    return _DEFAULT_PRICING


def _compute_cost(model: str, usage: dict[str, int]) -> float:
    """Return estimated cost in USD for a single API call."""
    prices = _get_pricing(model)
    per_million = 1_000_000.0

    input_tokens = usage.get("input_tokens", 0)
    cache_read = usage.get("cache_read_input_tokens", 0)
    cache_write = usage.get("cache_creation_input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)

    cost = (
        (input_tokens / per_million) * prices["input"]
        + (cache_read / per_million) * prices["cache_read"]
        + (cache_write / per_million) * prices["cache_write"]
        + (output_tokens / per_million) * prices["output"]
    )
    return cost


def _load_daily_spend() -> dict[str, Any]:
    _ensure_log_dir()
    today = datetime.date.today().isoformat()
    if os.path.exists(_DAILY_SPEND_FILE):
        try:
            with open(_DAILY_SPEND_FILE, "r") as fh:
                data = json.load(fh)
            if data.get("date") == today:
                return data
        except (json.JSONDecodeError, OSError):
            pass
    return {"date": today, "total_cost_usd": 0.0, "call_count": 0}


def _save_daily_spend(data: dict[str, Any]) -> None:
    _ensure_log_dir()
    with open(_DAILY_SPEND_FILE, "w") as fh:
        json.dump(data, fh, indent=2)


def log_usage(model: str, usage: Any, call_label: str = "", conversation_id: int | None = None) -> None:
    """
    Log token usage for one API call.

    Parameters
    ----------
    model           Anthropic model string (e.g. 'claude-sonnet-4-6').
    usage           The usage object from response.usage (or a dict).
    call_label      Optional human-readable label for the call context.
    conversation_id Optional conversation ID for per-conversation analytics.
    """
    _ensure_log_dir()

    usage_dict: dict[str, int] = {}
    if hasattr(usage, "__dict__"):
        usage_dict = {
            "input_tokens": getattr(usage, "input_tokens", 0),
            "output_tokens": getattr(usage, "output_tokens", 0),
            "cache_creation_input_tokens": getattr(usage, "cache_creation_input_tokens", 0),
            "cache_read_input_tokens": getattr(usage, "cache_read_input_tokens", 0),
        }
    else:
        usage_dict = {
            "input_tokens": usage.get("input_tokens", 0),
            "output_tokens": usage.get("output_tokens", 0),
            "cache_creation_input_tokens": usage.get("cache_creation_input_tokens", 0),
            "cache_read_input_tokens": usage.get("cache_read_input_tokens", 0),
        }

    total_input = (
        usage_dict["input_tokens"]
        + usage_dict["cache_creation_input_tokens"]
        + usage_dict["cache_read_input_tokens"]
    )
    cost = _compute_cost(model, usage_dict)

    entry = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "model": model,
        "call_label": call_label,
        "conversation_id": conversation_id,
        "input_tokens": usage_dict["input_tokens"],
        "cache_creation_input_tokens": usage_dict["cache_creation_input_tokens"],
        "cache_read_input_tokens": usage_dict["cache_read_input_tokens"],
        "output_tokens": usage_dict["output_tokens"],
        "total_input_tokens": total_input,
        "estimated_cost_usd": round(cost, 6),
    }

    # Print to stdout
    cache_read = usage_dict["cache_read_input_tokens"]
    cache_write = usage_dict["cache_creation_input_tokens"]
    print(
        f"[TOKEN_TRACKER] {call_label or model} | "
        f"input={usage_dict['input_tokens']} "
        f"cache_write={cache_write} "
        f"cache_read={cache_read} "
        f"output={usage_dict['output_tokens']} "
        f"cost=${cost:.6f}"
    )

    # Append to JSONL log
    try:
        with open(_USAGE_LOG, "a") as fh:
            fh.write(json.dumps(entry) + "\n")
    except OSError as exc:
        print(f"[TOKEN_TRACKER] WARNING: could not write log: {exc}")

    # Update daily spend
    daily = _load_daily_spend()
    daily["total_cost_usd"] = round(daily["total_cost_usd"] + cost, 6)
    daily["call_count"] = daily.get("call_count", 0) + 1
    _save_daily_spend(daily)

    # Check daily limit
    if daily["total_cost_usd"] >= _DAILY_COST_LIMIT:
        print(
            f"[TOKEN_TRACKER] CRITICAL: daily spend ${daily['total_cost_usd']:.4f} "
            f"has reached or exceeded limit of ${_DAILY_COST_LIMIT:.2f}"
        )


def check_token_budget(estimated_tokens: int, model: str) -> None:
    """
    Log a warning if estimated_tokens exceeds 50,000 before a call.

    Parameters
    ----------
    estimated_tokens    Rough token count estimate for the upcoming request.
    model               Model name string.
    """
    if estimated_tokens > 50_000:
        print(
            f"[TOKEN_TRACKER] WARNING: estimated request size {estimated_tokens} tokens "
            f"for model {model} exceeds 50,000 token threshold"
        )


def get_cache_stats() -> dict[str, Any]:
    """
    Return aggregate cache statistics from the JSONL log for today.

    Returns a dict with keys:
        total_calls, total_input_tokens, total_cache_read_tokens,
        total_cache_write_tokens, total_output_tokens,
        total_estimated_cost_usd, cache_hit_rate
    """
    _ensure_log_dir()
    today = datetime.date.today().isoformat()

    stats: dict[str, Any] = {
        "date": today,
        "total_calls": 0,
        "total_input_tokens": 0,
        "total_cache_read_tokens": 0,
        "total_cache_write_tokens": 0,
        "total_output_tokens": 0,
        "total_estimated_cost_usd": 0.0,
        "cache_hit_rate": 0.0,
    }

    if not os.path.exists(_USAGE_LOG):
        return stats

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
                # Filter to today's entries
                if not entry.get("timestamp", "").startswith(today):
                    continue
                stats["total_calls"] += 1
                stats["total_input_tokens"] += entry.get("input_tokens", 0)
                stats["total_cache_read_tokens"] += entry.get("cache_read_input_tokens", 0)
                stats["total_cache_write_tokens"] += entry.get("cache_creation_input_tokens", 0)
                stats["total_output_tokens"] += entry.get("output_tokens", 0)
                stats["total_estimated_cost_usd"] += entry.get("estimated_cost_usd", 0.0)
    except OSError as exc:
        print(f"[TOKEN_TRACKER] WARNING: could not read log: {exc}")
        return stats

    stats["total_estimated_cost_usd"] = round(stats["total_estimated_cost_usd"], 6)

    total_served = stats["total_cache_read_tokens"] + stats["total_cache_write_tokens"] + stats["total_input_tokens"]
    if total_served > 0:
        stats["cache_hit_rate"] = round(
            stats["total_cache_read_tokens"] / total_served, 4
        )

    return stats
