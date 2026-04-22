"""
Silence logic for Wakeeli AI agent.
Determines when the bot should produce no response at all.
"""
import re
from typing import List, Dict, Any, Optional


# Off-topic keyword patterns (anything not about real estate)
OFF_TOPIC_PATTERNS = [
    # Weather
    r'\b(weather|forecast|rain|sunny|temperature|humidity|wind|storm|climate)\b',
    # Sports
    r'\b(football|soccer|basketball|baseball|tennis|cricket|sport|score|match|game|team|player|league|championship|tournament|goal|penalty)\b',
    # News and politics
    r'\b(news|headline|politics|election|president|minister|parliament|government|war|conflict|protest)\b',
    # Jokes and entertainment
    r'\b(joke|funny|laugh|comedy|movie|film|series|show|actor|singer|music|song|concert)\b',
    # Personal/philosophical questions to the bot
    r'\b(how are you|how do you feel|what do you think|do you like|favorite|favourite|your opinion|your thoughts)\b',
    r'\b(meaning of life|philosophy|religion|god|faith|spiritual)\b',
    # Food and lifestyle (not property related)
    r'\b(restaurant|food|recipe|cooking|diet|workout|gym|health tip)\b',
    # Technology unrelated to the service
    r'\b(iphone|android|app store|google play|social media|facebook|instagram|tiktok|twitter|youtube)\b',
    # Travel unrelated to property
    r'\b(flight|airline|hotel booking|tourism|vacation trip|holiday trip)\b',
]

# Bot identity patterns
BOT_IDENTITY_PATTERNS = [
    r'\b(are you (a |an )?(bot|robot|ai|machine|automated|artificial|virtual|fake|real|human|person|agent))\b',
    r'\b(am i (talking|speaking|chatting) (to|with) (a |an )?(bot|robot|ai|machine|human|person|real person|live person|actual person))\b',
    r'\b(is (this|that) (a |an )?(bot|robot|ai|automated|artificial intelligence))\b',
    r'\b(talking to (a |an )?(bot|robot|ai|machine|automated|real|human|person))\b',
    r'\b(real (person|human|agent|staff))\b',
    r'\b(not (a |an )?(bot|robot|ai|machine|automated))\b',
    r'\b(human (or|vs) (bot|ai|robot|machine))\b',
    r'\bautomated (system|response|reply|message)\b',
    r'\b(chatgpt|openai|anthropic|claude|gpt)\b',
]

# Handoff marker stored in conversation history metadata
HANDOFF_MARKER = "HANDOFF_TRIGGERED"


def _normalize(text: str) -> str:
    """Lowercase and strip text for matching."""
    return text.lower().strip()


def _matches_any(text: str, patterns: List[str]) -> bool:
    """Return True if text matches any regex pattern."""
    normalized = _normalize(text)
    for pattern in patterns:
        if re.search(pattern, normalized, re.IGNORECASE):
            return True
    return False


def is_bot_identity_question(message: str) -> bool:
    """Return True if the user is asking whether they are talking to a bot or AI."""
    return _matches_any(message, BOT_IDENTITY_PATTERNS)


def is_off_topic(message: str) -> bool:
    """Return True if the message is clearly off-topic (not about real estate)."""
    return _matches_any(message, OFF_TOPIC_PATTERNS)


def should_go_silent(
    message: str,
    conversation_history: Optional[List[Dict[str, Any]]] = None,
    entities: Optional[Dict[str, Any]] = None,
) -> bool:
    """
    Return True if the bot should produce complete silence (no response).

    Triggers on:
    - Bot identity questions (are you a bot, are you AI, etc.)
    - Clearly off-topic messages (weather, sports, news, jokes, etc.)
    """
    if is_bot_identity_question(message):
        return True
    if is_off_topic(message):
        return True
    return False


def should_stay_silent(
    conversation_history: Optional[List[Dict[str, Any]]] = None,
) -> bool:
    """
    Return True if a human handoff has already been triggered in this conversation.
    Once handoff happens, the bot never speaks again.
    """
    if not conversation_history:
        return False
    for entry in conversation_history:
        # Check various places where handoff marker might be stored
        if isinstance(entry, dict):
            # Check content field
            content = entry.get("content", "")
            if isinstance(content, str) and HANDOFF_MARKER in content:
                return True
            # Check metadata field
            metadata = entry.get("metadata", {})
            if isinstance(metadata, dict) and metadata.get("handoff_triggered"):
                return True
            # Check role/type markers
            if entry.get("handoff_triggered") or entry.get("handoff"):
                return True
            # Check for handoff in assistant messages that contain handoff signals
            role = entry.get("role", "")
            if role == "system" and "handoff" in str(content).lower():
                return True
    return False
