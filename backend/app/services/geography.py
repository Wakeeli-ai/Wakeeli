"""
Lebanon administrative geography hierarchy.

Structure: Governorate -> District (Caza) -> City/Town

8 Governorates (Mohafazat):
  1. Beirut
  2. Mount Lebanon (Jabal Lubnan)
  3. North Lebanon (Liban-Nord / Shamal)
  4. South Lebanon (Liban-Sud / Janoub)
  5. Bekaa (Beqaa)
  6. Nabatieh
  7. Akkar
  8. Baalbek-Hermel
"""

# ---------------------------------------------------------------------------
# GOVERNORATE -> DISTRICTS mapping
# Keys: lowercase governorate names
# Values: list of district names (lowercase)
# ---------------------------------------------------------------------------

GOVERNORATE_MAP: dict[str, list[str]] = {
    'beirut': [
        'beirut',
    ],
    'mount lebanon': [
        'metn',
        'keserwan',
        'baabda',
        'chouf',
        'aley',
        'jbeil',
    ],
    'north lebanon': [
        'tripoli',
        'zgharta',
        'koura',
        'batroun',
        'bsharri',
        'miniyeh-danniyeh',
    ],
    'south lebanon': [
        'sidon',
        'tyre',
        'jezzine',
    ],
    'bekaa': [
        'zahle',
        'west bekaa',
        'rashaya',
    ],
    'nabatieh': [
        'nabatieh',
        'marjeyoun',
        'hasbaya',
        'bint jbeil',
    ],
    'akkar': [
        'akkar',
    ],
    'baalbek-hermel': [
        'baalbek',
        'hermel',
    ],
}

# ---------------------------------------------------------------------------
# DISTRICT -> CITIES mapping
# Keys: lowercase district names
# Values: list of cities/towns that exist in our property database
#         (other well-known towns included for completeness)
# ---------------------------------------------------------------------------

DISTRICT_MAP: dict[str, list[str]] = {

    # ---- Beirut Governorate ----
    'beirut': [
        'Achrafieh',
        'Hamra',
        'Verdun',
        'Ras Beirut',
        'Gemmayzeh',
        'Mar Mikhael',
        'Sodeco',
        'Badaro',
        'Tallet el Khayat',
    ],

    # ---- Mount Lebanon: Metn ----
    'metn': [
        'Jal el Dib',
        'Sin el Fil',
        'Antelias',
        'Naccache',
        'Bsalim',
        'Rabieh',
        'Aaoukar',
        'Dbayeh Waterfront',
        'Broumana',
        'Beit Meri',
        'Mansourieh',
        'Kornet Chehwan',
        'Mtayleb',
        'Zekrit',
        'Jdeideh',
        'Dekwane',
        'Fanar',
        'Ain Saadeh',
        'Mrouj',
        'Bikfaya',
        'Baabdat',
        'Dora',
    ],

    # ---- Mount Lebanon: Keserwan ----
    'keserwan': [
        'Jounieh',
        'Kaslik',
        'Adma',
        'Ghosta',
        'Biyada',
        'Zouk Mosbeh',
        'Zouk Mikael',
        'Bouar',
        'Sarba',
        'Haret Sakher',
        'Kfar Aabida',
    ],

    # ---- Mount Lebanon: Baabda ----
    'baabda': [
        'Baabda',
        'Hazmieh',
        'Aley',
        'Baalchmay',
        'Khalde',
        'Hadath',
        'Furn el Chebbak',
        'Chiyah',
        'Ain el Remmaneh',
        'Bchamoun',
    ],

    # ---- Mount Lebanon: Chouf ----
    'chouf': [
        'Deir el Qamar',
        'Beit ed-Dine',
        'Damour',
        'Aramoun',
        'Jiyeh',
        'Barja',
        'Kfarmatta',
    ],

    # ---- Mount Lebanon: Aley ----
    'aley': [
        'Aley',
        'Bhamdoun',
        'Souq el Gharb',
        'Shimlan',
        'Choueifat',
        'Khalde',
        'Rmeileh',
    ],

    # ---- Mount Lebanon: Jbeil (Byblos) ----
    'jbeil': [
        'Byblos (Jbeil)',
        'Zikrit',
        'Amchit',
        'Jbeil',
        'Laqlouq',
        'Afqa',
    ],

    # ---- North Lebanon: Tripoli ----
    'tripoli': [
        'Tripoli',
        'El Mina',
        'Beddawi',
    ],

    # ---- North Lebanon: Zgharta ----
    'zgharta': [
        'Zgharta',
        'Ehden',
        'Kousba',
    ],

    # ---- North Lebanon: Koura ----
    'koura': [
        'Amioun',
        'Kousba',
        'Chekka',
        'Enfeh',
    ],

    # ---- North Lebanon: Batroun ----
    'batroun': [
        'Batroun',
        'Kfaraabida',
        'Douma',
        'Tannourine',
    ],

    # ---- North Lebanon: Bsharri ----
    'bsharri': [
        'Bsharri',
        'Bcharre',
        'Qadisha Valley',
        'Deir Qadisha',
    ],

    # ---- North Lebanon: Miniyeh-Danniyeh ----
    'miniyeh-danniyeh': [
        'Minyeh',
        'Sir ed-Danniyeh',
        'Kfar Habou',
    ],

    # ---- South Lebanon: Sidon ----
    'sidon': [
        'Sidon',
        'Saida',
        'Sarafand',
        'Jiyeh',
        'Kherbet Qanafar',
    ],

    # ---- South Lebanon: Tyre ----
    'tyre': [
        'Tyre',
        'Sour',
        'Rashidiyye',
        'Qana',
        'Naqoura',
    ],

    # ---- South Lebanon: Jezzine ----
    'jezzine': [
        'Jezzine',
        'Roum',
        'Bater',
        'Kfarhoune',
    ],

    # ---- Bekaa: Zahle ----
    'zahle': [
        'Zahle',
        'Chtaura',
        'Saadnayel',
        'Taalabaya',
    ],

    # ---- Bekaa: West Bekaa ----
    'west bekaa': [
        'Joub Jannine',
        'Saghbine',
        'Yohmor',
        'Lala',
    ],

    # ---- Bekaa: Rashaya ----
    'rashaya': [
        'Rashaya',
        'Yanta',
        'Deir el Aachayer',
    ],

    # ---- Nabatieh: Nabatieh ----
    'nabatieh': [
        'Nabatieh',
        'Arnoun',
        'Kfar Rumman',
        'Yohmor',
    ],

    # ---- Nabatieh: Marjeyoun ----
    'marjeyoun': [
        'Marjeyoun',
        'Khiam',
        'Ibl es Saqi',
        'Houla',
    ],

    # ---- Nabatieh: Hasbaya ----
    'hasbaya': [
        'Hasbaya',
        'Deir Mimas',
        'Kherbet Qanafar',
    ],

    # ---- Nabatieh: Bint Jbeil ----
    'bint jbeil': [
        'Bint Jbeil',
        'Ayta ash Shab',
        'Kounine',
        'Labbouneh',
    ],

    # ---- Akkar ----
    'akkar': [
        'Halba',
        'Andaqt',
        'Akkar el Atiqa',
        'Qoubaiyat',
        'Fnaydeq',
    ],

    # ---- Baalbek-Hermel: Baalbek ----
    'baalbek': [
        'Baalbek',
        'Taalabaya',
        'Nabi Chit',
        'Yammouneh',
        'Deir el Ahmar',
    ],

    # ---- Baalbek-Hermel: Hermel ----
    'hermel': [
        'Hermel',
        'Qasr',
        'Ras Baalbek',
    ],
}

# ---------------------------------------------------------------------------
# REGION_MAP: flat combined map used by search_listings
# Every governorate key -> all cities across all its districts
# Every district key -> its cities
# ---------------------------------------------------------------------------

REGION_MAP: dict[str, list[str]] = {}

for _gov, _districts in GOVERNORATE_MAP.items():
    _all_cities: list[str] = []
    for _district in _districts:
        _all_cities.extend(DISTRICT_MAP.get(_district, []))
    REGION_MAP[_gov] = _all_cities

for _district, _cities in DISTRICT_MAP.items():
    REGION_MAP[_district] = _cities

# ---------------------------------------------------------------------------
# GOVERNORATE_NAMES: all name variants (lowercase) that map to a governorate
# ---------------------------------------------------------------------------

GOVERNORATE_NAMES: set[str] = set(GOVERNORATE_MAP.keys()) | {
    # Beirut
    'beirut city',
    # Mount Lebanon
    'jabal lubnan',
    'jabal lubnaan',
    'mount liban',
    'liban mont',
    'jbeil',          # sometimes used loosely for the region
    # North Lebanon
    'north',
    'shamal',
    'liban nord',
    'liban-nord',
    'north liban',
    # South Lebanon
    'south',
    'janoub',
    'liban sud',
    'liban-sud',
    'south liban',
    # Bekaa
    'beqaa',
    'bekka',
    'the bekaa',
    'el bekaa',
    # Nabatieh
    'nabatiye',
    'nabatiyeh',
    'al nabatiyeh',
    # Akkar
    'al akkar',
    'aakar',
    # Baalbek-Hermel
    'baalbek hermel',
    'baalbeck-hermel',
    'baalbeck',
}

# ---------------------------------------------------------------------------
# DISTRICT_NAMES: all name variants (lowercase) that map to a district
# ---------------------------------------------------------------------------

DISTRICT_NAMES: set[str] = set(DISTRICT_MAP.keys()) | {
    # Metn variants
    'el metn',
    'el matn',
    'matn',
    'al matn',
    'al metn',
    # Keserwan variants
    'kesrouan',
    'kesrewan',
    'keserwan',
    'kessrouan',
    # Baabda variants
    'baabda district',
    # Jbeil variants
    'byblos',
    'jbail',
    # Chouf variants
    'el chouf',
    'al chouf',
    # Aley variants
    'aley district',
    'aley caza',
    # Tripoli variants
    'north tripoli',
    'tarablos',
    # Sidon variants
    'saida',
    'sayda',
    # Tyre variants
    'sour',
    'es sour',
    # Zahle variants
    'zahleh',
    'el zahleh',
    # Nabatieh district
    'al nabatieh',
    # Bint Jbeil variants
    'bent jbeil',
    'bint jbail',
    # Baalbek variants
    'baalbeck',
    # Bsharri variants
    'bcharre',
    'bcharri',
}


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def get_location_type(location: str) -> tuple[str, str]:
    """
    Classify a location string into its hierarchy level.

    Returns a tuple: (type, canonical_key)
      type: 'governorate' | 'district' | 'city' | 'unknown'
      canonical_key: lowercase canonical name used in GOVERNORATE_MAP / DISTRICT_MAP
    """
    loc = location.strip().lower()

    # Check governorate match (direct keys)
    if loc in GOVERNORATE_MAP:
        return ('governorate', loc)

    # Check governorate name variants
    if loc in GOVERNORATE_NAMES:
        # Map variants back to canonical keys
        _variant_to_canonical = {
            'beirut city': 'beirut',
            'jabal lubnan': 'mount lebanon',
            'jabal lubnaan': 'mount lebanon',
            'mount liban': 'mount lebanon',
            'liban mont': 'mount lebanon',
            'jbeil': 'mount lebanon',
            'north': 'north lebanon',
            'shamal': 'north lebanon',
            'liban nord': 'north lebanon',
            'liban-nord': 'north lebanon',
            'north liban': 'north lebanon',
            'south': 'south lebanon',
            'janoub': 'south lebanon',
            'liban sud': 'south lebanon',
            'liban-sud': 'south lebanon',
            'south liban': 'south lebanon',
            'beqaa': 'bekaa',
            'bekka': 'bekaa',
            'the bekaa': 'bekaa',
            'el bekaa': 'bekaa',
            'nabatiye': 'nabatieh',
            'nabatiyeh': 'nabatieh',
            'al nabatiyeh': 'nabatieh',
            'al akkar': 'akkar',
            'aakar': 'akkar',
            'baalbek hermel': 'baalbek-hermel',
            'baalbeck-hermel': 'baalbek-hermel',
            'baalbeck': 'baalbek-hermel',
        }
        canonical = _variant_to_canonical.get(loc, loc)
        return ('governorate', canonical)

    # Check district match (direct keys)
    if loc in DISTRICT_MAP:
        return ('district', loc)

    # Check district name variants
    if loc in DISTRICT_NAMES:
        _variant_to_district = {
            'el metn': 'metn',
            'el matn': 'metn',
            'matn': 'metn',
            'al matn': 'metn',
            'al metn': 'metn',
            'kesrouan': 'keserwan',
            'kesrewan': 'keserwan',
            'kessrouan': 'keserwan',
            'baabda district': 'baabda',
            'byblos': 'jbeil',
            'jbail': 'jbeil',
            'el chouf': 'chouf',
            'al chouf': 'chouf',
            'aley district': 'aley',
            'aley caza': 'aley',
            'tarablos': 'tripoli',
            'north tripoli': 'tripoli',
            'saida': 'sidon',
            'sayda': 'sidon',
            'sour': 'tyre',
            'es sour': 'tyre',
            'zahleh': 'zahle',
            'el zahleh': 'zahle',
            'al nabatieh': 'nabatieh',
            'bent jbeil': 'bint jbeil',
            'bint jbail': 'bint jbeil',
            'baalbeck': 'baalbek',
            'bcharre': 'bsharri',
            'bcharri': 'bsharri',
        }
        canonical = _variant_to_district.get(loc, loc)
        return ('district', canonical)

    # Check if it matches any city in DISTRICT_MAP
    for _district, _cities in DISTRICT_MAP.items():
        for _city in _cities:
            if _city.lower() == loc:
                return ('city', _city)

    return ('unknown', location)


def get_area_examples(location: str, location_type: str) -> str:
    """
    Return a short string of 2-3 example sub-areas for the given location.

    If governorate: returns example district names
    If district: returns example cities from our DB
    If city: returns empty string
    """
    loc = location.strip().lower()

    if location_type == 'governorate':
        canonical = loc
        # Resolve variant to canonical if needed
        if canonical not in GOVERNORATE_MAP:
            _, canonical = get_location_type(location)
        districts = GOVERNORATE_MAP.get(canonical, [])
        examples = [d.title() for d in districts[:3]]
        return ', '.join(examples)

    elif location_type == 'district':
        canonical = loc
        if canonical not in DISTRICT_MAP:
            _, canonical = get_location_type(location)
        cities = DISTRICT_MAP.get(canonical, [])
        examples = cities[:3]
        return ', '.join(examples)

    return ''
