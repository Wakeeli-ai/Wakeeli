import re
from typing import Literal

Language = Literal['arabizi', 'arabic', 'french', 'english']

# Metn/Beirut Arabizi dialect word list (Fox-verified real dialect words)
_ARABIZI_WORDS: set = {
    'nabesh', 'she2a', 'esta2jer', 'hawela', 'ghereften', 'gherfet',
    'mafrouch', '3afesh', 'bshufa', 'hayalla', 'bfadel', 'habet',
    'ghale', 'boukra', 'doher', 'wehde', 'shu', 'shi', 'ma', 'msh',
    'hayk', 'wlo', 'bas', 'kamen', 'ktir', 'ya3ne', 'hek', '3lek',
    '3ndi', '3a', 'la2', 'mesh', 'ajar', 'nom', 'akbar',
}

# Arabic Unicode block (U+0600 to U+06FF)
_ARABIC_SCRIPT_RE = re.compile(r'[\u0600-\u06FF]')

# French accented characters (covers common French diacritics)
_FRENCH_ACCENTED_RE = re.compile(r'[éèêëàâùûüîïôçœæ]', re.IGNORECASE)

# High-frequency French vocabulary
_FRENCH_WORDS: set = {
    'bonjour', 'merci', 'oui', 'non', 'je', 'vous', 'appartement',
    'chambre', 'louer', 'acheter', 'prix', 'quartier',
}


def _arabizi_numeric_count(text: str) -> int:
    """Count word tokens that mix Latin letters with Arabizi numeric substitutes.

    Arabizi uses 2, 3, 5, 7 to represent Arabic letters (hamza, ain, kha, ha).
    A qualifying token must contain at least one digit from that set AND at
    least one Latin letter, e.g. '3ala', 'la2', 'ista2jar', '7abib'.
    """
    tokens = re.findall(r'\b[a-zA-Z0-9]+\b', text)
    count = 0
    for token in tokens:
        has_arabizi_num = any(c in token for c in '2357')
        has_alpha = any(c.isalpha() for c in token)
        if has_arabizi_num and has_alpha:
            count += 1
    return count


def detect_language(text: str) -> Language:
    """Detect the language of a user message.

    Priority order: arabic > arabizi > french > english (default).

    Detection thresholds:
    - arabic:  3+ native Arabic script characters (U+0600-U+06FF)
    - arabizi: 2+ numeric-substitute tokens OR 2+ known dialect words
    - french:  any accented character OR 1+ high-frequency French word
    - english: default fallback

    Returns one of: 'arabizi', 'arabic', 'french', 'english'.
    """
    if not text or not text.strip():
        return 'english'

    # 1. Native Arabic script takes priority over romanized forms
    if len(_ARABIC_SCRIPT_RE.findall(text)) >= 3:
        return 'arabic'

    lower = text.lower()
    word_tokens = re.findall(r'\b[a-z0-9]+\b', lower)

    # 2. Arabizi: numeric substitutes signal (e.g. 3ala, la2, ya3ne)
    if _arabizi_numeric_count(text) >= 2:
        return 'arabizi'

    # 2b. Arabizi: known Metn/Beirut dialect vocabulary
    known_matches = sum(1 for w in word_tokens if w in _ARABIZI_WORDS)
    if known_matches >= 2:
        return 'arabizi'

    # 3. French: accented characters are unambiguous
    if _FRENCH_ACCENTED_RE.search(text):
        return 'french'

    # 3b. French: high-frequency vocabulary match
    if sum(1 for w in word_tokens if w in _FRENCH_WORDS) >= 1:
        return 'french'

    # 4. Default: English
    return 'english'
