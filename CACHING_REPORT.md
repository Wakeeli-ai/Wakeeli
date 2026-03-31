# Wakeeli Prompt Caching Report

Version: 1.0
Date: 2026-03-31

---

## Summary

Anthropic prompt caching was added to both Anthropic API calls in the Wakeeli
backend. The change reduces costs by storing the large static portions of
system prompts in Anthropic's cache tier and re-reading them on subsequent
turns instead of re-sending and re-billing the full token count.

---

## API Calls Modified

### 1. `extract_entities` in `backend/app/services/agent.py`

- File: `/backend/app/services/agent.py`
- Function: `extract_entities(message, history)`
- Model used: `claude-haiku-4-5` (short messages) or `claude-sonnet-4-6` (messages over 30 words)

### 2. `_generate_reply_inner` in `backend/app/services/agent.py`

- File: `/backend/app/services/agent.py`
- Function: `_generate_reply_inner(action, user_message, ...)`
- Model used: `claude-sonnet-4-6`

---

## Changes Made

### `backend/app/services/prompt.py`

The monolithic `get_reply_system_prompt(custom_message)` function (approx. 4,400 tokens) was
split into three parts:

**Before:**
```python
def get_reply_system_prompt(custom_message: str) -> str:
    return f"""
You are Karen, a friendly and sharp real estate assistant for Wakeeli ...
[~250 lines of static rules]
...
ACTION BEHAVIOR

{custom_message}
"""
```

**After:**
```python
_STATIC_SYSTEM_PROMPT = """You are Karen, ...
[~250 lines of static rules]
..."""


def get_static_system_prompt() -> str:
    """Returns the large static V2 DM Scripts framework. Eligible for caching."""
    return _STATIC_SYSTEM_PROMPT


def get_dynamic_action_prompt(custom_message: str) -> str:
    """Returns only the action-specific instruction. Changes every turn. Not cached."""
    return f"\nACTION BEHAVIOR\n\n{custom_message}\n"


def get_reply_system_prompt(custom_message: str) -> str:
    """Backward-compatible combined prompt. Still works for any existing callers."""
    return f"{_STATIC_SYSTEM_PROMPT}\n\nACTION BEHAVIOR\n\n{custom_message}\n"
```

The original `get_reply_system_prompt` is preserved so nothing breaks.

---

### `backend/app/services/agent.py` — `_generate_reply_inner`

**Before:**
```python
system_prompt = get_reply_system_prompt(message)
combined_system = f"{system_prompt}\n\nCurrent session state: {state}"

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=combined_system,
    messages=[{"role": "user", "content": user_message}]
)
```

**After:**
```python
static_prompt = get_static_system_prompt()
dynamic_prompt = get_dynamic_action_prompt(message)
session_state_text = f"\nCurrent session state: {state}"

system_blocks = [
    {
        "type": "text",
        "text": static_prompt,
        "cache_control": {"type": "ephemeral"},   # CACHED
    },
    {
        "type": "text",
        "text": dynamic_prompt + session_state_text,  # NOT cached (changes each turn)
    },
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=system_blocks,
    messages=[{"role": "user", "content": user_message}],
    extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
)
log_usage("claude-sonnet-4-6", response.usage, call_label="generate_reply")
```

---

### `backend/app/services/agent.py` — `extract_entities`

**Before:**
```python
messages = [
    *history,
    {"role": "user", "content": message}
]

response = client.messages.create(
    model=extraction_model,
    max_tokens=1024,
    system=intent_detection_prompt,
    messages=messages
)
```

**After:**
```python
# Build messages: cache_control on last history message for incremental caching
messages = []
if history:
    for hist_msg in history[:-1]:
        messages.append({"role": hist_msg["role"], "content": hist_msg["content"]})
    last_hist = history[-1]
    messages.append({
        "role": last_hist["role"],
        "content": [
            {
                "type": "text",
                "text": last_hist["content"],
                "cache_control": {"type": "ephemeral"},   # CACHED
            }
        ],
    })
messages.append({"role": "user", "content": message})

system_blocks = [
    {
        "type": "text",
        "text": intent_detection_prompt,
        "cache_control": {"type": "ephemeral"},   # CACHED (static 2,100-token prompt)
    }
]

response = client.messages.create(
    model=extraction_model,
    max_tokens=1024,
    system=system_blocks,
    messages=messages,
    extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
)
log_usage(extraction_model, response.usage, call_label="extract_entities")
```

---

### New file: `backend/app/services/token_tracker.py`

Handles all usage logging and budget monitoring:

- `log_usage(model, usage, call_label)` — logs every call to stdout and
  `backend/logs/token_usage.jsonl`
- `check_token_budget(estimated_tokens, model)` — warns when a request is
  estimated to exceed 50,000 tokens
- `get_cache_stats()` — returns aggregate stats for today from the JSONL log
- Daily spend tracked in `backend/logs/daily_spend.json`
- `DAILY_COST_LIMIT` env var controls the threshold (default $10)

---

## Which Calls Benefit Most From Caching

| Call | What gets cached | Estimated tokens cached | Benefit |
|------|-----------------|------------------------|---------|
| `extract_entities` system | `intent_detection_prompt` (static classification rules) | ~2,100 tokens | HIGH. Called on every single user message. |
| `extract_entities` messages | Last message in history | ~20-200 tokens | MEDIUM. Grows as conversation continues. |
| `_generate_reply_inner` system | V2 DM Scripts static framework | ~4,400 tokens | HIGH. Called on every non-route turn. |

The `intent_detection_prompt` is the biggest win because it is sent on every
message and is 100% static. At scale, caching it saves re-billing ~2,100 tokens
of input per extraction call.

---

## Estimated Savings Calculation

Assumptions:
- Average conversation: 10 turns
- Per turn: 1 `extract_entities` call + 1 `_generate_reply_inner` call
- 1,000 conversations per month

### Without caching (all tokens billed at input rate)

| Call | Tokens/call | Model | Rate ($/MTok) | Monthly cost (1k convs, 10 turns) |
|------|------------|-------|--------------|-----------------------------------|
| `extract_entities` (haiku) | 2,100 system + 300 messages = 2,400 | haiku | $0.80 | 1,000 x 10 x 2,400 / 1M x $0.80 = **$19.20** |
| `_generate_reply_inner` (sonnet) | 4,400 system + 500 messages = 4,900 | sonnet | $3.00 | 1,000 x 10 x 4,900 / 1M x $3.00 = **$147.00** |
| **Total** | | | | **$166.20/month** |

### With caching (cached tokens billed at cache_read rate after first write)

Cache hit assumed from turn 2 onward (9 out of 10 turns are cache reads).

| Call | Cache write (1st turn) | Cache read (turns 2-10) | Monthly cost |
|------|----------------------|------------------------|--------------|
| `extract_entities` system (haiku) | 1,000 x 2,100 / 1M x $1.00 = $2.10 | 1,000 x 9 x 2,100 / 1M x $0.08 = $1.51 | **$3.61** |
| `_generate_reply_inner` system (sonnet) | 1,000 x 4,400 / 1M x $3.75 = $16.50 | 1,000 x 9 x 4,400 / 1M x $0.30 = $11.88 | **$28.38** |
| Uncached tokens (messages, dynamic) | billed at standard input rate | | ~$20.00 |
| **Total** | | | **~$51.99/month** |

**Estimated savings: ~$114/month (~69% reduction) at 1,000 conversations/month.**

The savings scale linearly with conversation volume. For 10,000 conversations/month
the saving would be approximately $1,140/month.

---

## Files Changed

- `backend/app/services/agent.py` — updated both `client.messages.create` calls
- `backend/app/services/prompt.py` — split into static/dynamic sections, added
  `get_static_system_prompt()` and `get_dynamic_action_prompt()`
- `backend/app/services/token_tracker.py` — new file
- `backend/logs/` — new directory (log files written at runtime)
