"""
Lebanon administrative geography hierarchy, plus US metro area support.

Structure (Lebanon): Governorate -> District (Caza) -> City/Town

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

from typing import Optional

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
        'Yarze',
        'Hadath',
        'Furn el Chebbak',
        'Ain el Remmaneh',
        'Chiyah',
        'Bchamoun',
        'Khalde',
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


# ---------------------------------------------------------------------------
# US SERVICE AREA: 10 STATES ONLY
# Florida, Texas, North Carolina, Georgia, Arizona,
# Ohio, Pennsylvania, Michigan, Alabama, South Carolina
#
# US_REGION_MAP keys: canonical metro name (title case)
# Values: list of city/neighborhood/suburb keywords (all lowercase)
# ---------------------------------------------------------------------------

US_REGION_MAP: dict[str, list[str]] = {

    # ---- Florida: Miami ----
    'Miami': [
        'miami', 'miami beach', 'south beach', 'brickell', 'wynwood',
        'coconut grove', 'coral gables', 'downtown miami', 'midtown miami',
        'edgewater', 'little havana', 'design district miami',
        'doral', 'hialeah', 'miami lakes', 'north miami', 'miami gardens',
        'aventura', 'sunny isles beach', 'bal harbour', 'surfside fl',
        'homestead fl', 'kendall', 'cutler bay', 'palmetto bay', 'pinecrest',
        'key biscayne', 'opa locka', 'medley', 'sweetwater fl',
    ],

    # ---- Florida: Fort Lauderdale ----
    'Fort Lauderdale': [
        'fort lauderdale', 'las olas', 'wilton manors', 'victoria park',
        'pompano beach', 'deerfield beach', 'hallandale beach',
        'hollywood fl', 'hollywood florida', 'oakland park',
        'plantation fl', 'plantation florida', 'davie fl', 'miramar',
        'pembroke pines', 'cooper city', 'weston fl',
        'coral springs', 'margate fl', 'tamarac', 'lauderhill', 'sunrise fl',
        'lauderdale lakes', 'north lauderdale', 'coconut creek fl',
        'southwest ranches', 'parkland fl',
    ],

    # ---- Florida: Tampa ----
    'Tampa': [
        'tampa', 'south tampa', 'hyde park tampa', 'ybor city',
        'seminole heights', 'carrollwood', 'westchase', 'new tampa',
        'temple terrace', 'brandon fl', 'riverview fl', 'apollo beach',
        'seffner', 'valrico', 'land o lakes', 'lutz fl', 'wesley chapel',
        'zephyrhills', 'plant city',
        'st pete', 'st. pete', 'saint pete', 'saint petersburg fl',
        'st petersburg', 'st. petersburg', 'gulfport fl', 'pinellas park',
        'clearwater', 'largo fl', 'dunedin fl', 'safety harbor',
        'tarpon springs', 'palm harbor', 'treasure island fl', 'st pete beach',
        'kenwood', 'old northeast', 'downtown st pete',
    ],

    # ---- Florida: Orlando ----
    'Orlando': [
        'orlando', 'downtown orlando', 'college park orlando', 'dr phillips',
        'lake nona', 'winter park fl', 'winter park florida',
        'kissimmee', 'windermere fl', 'celebration fl', 'champions gate',
        'altamonte springs', 'maitland fl', 'casselberry', 'oviedo fl',
        'sanford fl', 'apopka', 'clermont fl', 'davenport fl',
        'longwood fl', 'lake mary', 'winter garden fl', 'reunion fl',
    ],

    # ---- Texas: Austin ----
    'Austin': [
        'austin', 'east austin', 'south congress', 'domain austin',
        'downtown austin', 'travis heights', 'bouldin creek',
        'mueller austin', 'tarrytown austin', 'clarksville austin',
        'round rock', 'cedar park tx', 'pflugerville', 'georgetown tx',
        'buda tx', 'kyle tx', 'leander tx', 'liberty hill tx',
        'lakeway tx', 'westlake hills', 'dripping springs', 'bee cave tx',
    ],

    # ---- Texas: Dallas ----
    'Dallas': [
        'dallas', 'uptown dallas', 'knox henderson', 'deep ellum',
        'bishop arts', 'oak cliff', 'lake highlands', 'preston hollow',
        'lower greenville', 'east dallas', 'north dallas', 'far north dallas',
        'frisco tx', 'plano tx', 'allen tx', 'mckinney tx', 'prosper tx',
        'irving tx', 'arlington tx', 'grand prairie tx', 'carrollton tx',
        'garland tx', 'mesquite tx', 'addison tx', 'richardson tx',
        'lewisville tx', 'flower mound', 'southlake tx', 'grapevine tx',
        'coppell tx', 'cedar hill tx', 'desoto tx',
    ],

    # ---- Texas: Fort Worth ----
    'Fort Worth': [
        'fort worth', 'cultural district fort worth', 'downtown fort worth',
        'near southside fort worth', 'west 7th fort worth',
        'weatherford tx', 'burleson tx', 'mansfield tx', 'crowley tx',
        'hurst tx', 'euless tx', 'bedford tx', 'colleyville tx',
        'keller tx', 'north richland hills', 'haltom city', 'saginaw tx',
    ],

    # ---- Texas: Houston ----
    'Houston': [
        'houston', 'midtown houston', 'montrose', 'the heights houston',
        'river oaks houston', 'galleria houston', 'medical center houston',
        'uptown houston', 'museum district houston', 'east end houston',
        'katy tx', 'sugar land', 'the woodlands', 'pearland tx',
        'spring tx', 'conroe tx', 'cypress tx', 'missouri city tx',
        'friendswood', 'league city', 'clear lake tx', 'deer park tx',
        'pasadena tx', 'baytown tx', 'humble tx', 'kingwood tx',
        'tomball', 'stafford tx', 'richmond tx',
    ],

    # ---- North Carolina: Charlotte ----
    'Charlotte': [
        'charlotte', 'south end charlotte', 'noda charlotte',
        'dilworth charlotte', 'myers park charlotte', 'ballantyne',
        'plaza midwood', 'uptown charlotte', 'university city charlotte',
        'steele creek', 'huntersville nc', 'cornelius nc', 'davidson nc',
        'mooresville nc', 'concord nc', 'kannapolis nc',
        'gastonia', 'matthews nc', 'mint hill nc', 'pineville nc',
        'indian trail nc', 'monroe nc', 'harrisburg nc',
    ],

    # ---- North Carolina: Raleigh ----
    'Raleigh': [
        'raleigh', 'downtown raleigh', 'north hills raleigh',
        'five points raleigh', 'glenwood south', 'brier creek',
        'north raleigh', 'midtown raleigh',
        'cary nc', 'apex nc', 'morrisville nc', 'wake forest nc',
        'garner nc', 'holly springs nc', 'fuquay varina',
        'knightdale', 'wendell nc', 'zebulon nc',
        'durham nc', 'chapel hill nc', 'carrboro', 'hillsborough nc',
    ],

    # ---- Georgia: Atlanta ----
    'Atlanta': [
        'atlanta', 'buckhead', 'midtown atlanta', 'old fourth ward',
        'grant park atlanta', 'inman park', 'little five points atlanta',
        'kirkwood atlanta', 'east atlanta', 'west end atlanta',
        'downtown atlanta', 'virginia highland', 'poncey highland',
        'decatur ga', 'dunwoody ga', 'sandy springs ga', 'roswell ga',
        'alpharetta ga', 'marietta ga', 'smyrna ga', 'kennesaw ga',
        'brookhaven ga', 'chamblee ga', 'doraville', 'tucker ga',
        'stonecrest', 'lithonia', 'conyers ga', 'covington ga',
        'norcross ga', 'duluth ga', 'suwanee ga', 'johns creek ga',
        'peachtree city', 'newnan ga', 'mcdonough ga', 'woodstock ga',
        'canton ga', 'cumming ga',
    ],

    # ---- Arizona: Phoenix ----
    'Phoenix': [
        'phoenix', 'downtown phoenix', 'arcadia phoenix', 'midtown phoenix',
        'north phoenix', 'ahwatukee', 'camelback east phoenix',
        'tempe az', 'mesa az', 'chandler az', 'gilbert az',
        'glendale az', 'peoria az', 'surprise az', 'goodyear az',
        'avondale az', 'queen creek az', 'maricopa az', 'el mirage az',
        'cave creek az', 'carefree az', 'tolleson az', 'litchfield park',
        'sun city az', 'sun city west',
    ],

    # ---- Arizona: Scottsdale ----
    'Scottsdale': [
        'scottsdale', 'old town scottsdale', 'north scottsdale',
        'south scottsdale', 'scottsdale quarter', 'dc ranch scottsdale',
        'mccormick ranch', 'gainey ranch', 'paradise valley az',
        'fountain hills az', 'rio verde az',
    ],

    # ---- Ohio: Columbus ----
    'Columbus': [
        'columbus ohio', 'columbus oh', 'columbus',
        'short north', 'german village', 'franklinton',
        'clintonville', 'bexley oh', 'grandview heights',
        'upper arlington', 'worthington oh', 'westerville oh',
        'gahanna oh', 'new albany oh', 'pickerington oh', 'reynoldsburg',
        'grove city oh', 'hilliard oh', 'dublin ohio', 'powell oh',
        'lewis center', 'canal winchester', 'grove city ohio',
    ],

    # ---- Ohio: Cleveland ----
    'Cleveland': [
        'cleveland ohio', 'cleveland oh', 'cleveland',
        'ohio city cleveland', 'tremont cleveland', 'university circle',
        'little italy cleveland', 'detroit shoreway', 'west park cleveland',
        'lakewood ohio', 'beachwood oh', 'solon oh', 'strongsville oh',
        'westlake ohio', 'shaker heights', 'parma oh', 'north olmsted',
        'brunswick oh', 'mentor oh', 'willoughby oh', 'euclid oh',
        'garfield heights', 'maple heights oh', 'independence oh',
        'rocky river oh', 'bay village oh',
    ],

    # ---- Pennsylvania: Philadelphia ----
    'Philadelphia': [
        'philadelphia', 'philly', 'center city philly',
        'center city philadelphia', 'rittenhouse square',
        'fishtown', 'old city philly', 'manayunk',
        'south philly', 'north philly', 'east passyunk',
        'fairmount philadelphia', 'graduate hospital',
        'point breeze', 'west philly', 'germantown philadelphia',
        'mount airy philadelphia', 'chestnut hill philadelphia',
        'cherry hill nj', 'cherry hill', 'moorestown nj',
        'king of prussia', 'conshohocken pa', 'plymouth meeting',
        'blue bell pa', 'horsham pa', 'bensalem pa',
        'northeast philadelphia', 'mount laurel nj',
        'haddonfield nj', 'voorhees nj',
        'wilmington de', 'wilmington delaware',
    ],

    # ---- Michigan: Detroit ----
    'Detroit': [
        'detroit', 'midtown detroit', 'new center detroit', 'corktown',
        'downtown detroit', 'rivertown detroit', 'eastern market detroit',
        'birmingham mi', 'bloomfield hills mi', 'troy mi',
        'sterling heights mi', 'warren mi', 'dearborn mi',
        'livonia mi', 'westland mi', 'taylor mi', 'allen park mi',
        'lincoln park mi', 'royal oak mi', 'ferndale mi',
        'hazel park mi', 'madison heights mi',
        'novi mi', 'wixom mi', 'southfield mi', 'oak park mi',
        'farmington hills mi', 'redford mi', 'garden city mi',
    ],

    # ---- Michigan: Ann Arbor ----
    'Ann Arbor': [
        'ann arbor', 'downtown ann arbor', 'kerrytown',
        'burns park ann arbor', 'ypsilanti', 'saline mi',
        'dexter mi', 'canton township mi', 'canton mi',
        'plymouth mi', 'northville mi',
    ],

    # ---- Alabama: Birmingham ----
    'Birmingham': [
        'birmingham al', 'birmingham alabama', 'birmingham',
        'downtown birmingham al', 'homewood al', 'hoover al',
        'mountain brook al', 'vestavia hills al', 'irondale al',
        'trussville al', 'pell city al', 'alabaster al',
        'pelham al', 'chelsea al', 'calera al', 'gardendale al',
        'center point al', 'moody al',
    ],

    # ---- Alabama: Huntsville ----
    'Huntsville': [
        'huntsville al', 'huntsville alabama', 'huntsville',
        'downtown huntsville al', 'research park huntsville',
        'monte sano huntsville',
        'madison al', 'madison alabama', 'harvest al',
        'meridianville al', 'hampton cove al', 'jones valley al',
        'owens cross roads al', 'gurley al',
    ],

    # ---- South Carolina: Charleston ----
    'Charleston': [
        'charleston sc', 'charleston south carolina', 'charleston',
        'downtown charleston sc', 'south of broad charleston',
        'harleston village', 'wagener terrace charleston',
        'west ashley', 'james island sc', 'johns island sc',
        'mount pleasant sc', 'north charleston sc',
        'summerville sc', 'goose creek sc', 'hanahan sc',
        'moncks corner', 'folly beach sc', 'isle of palms sc',
        'daniel island sc', 'ladson sc',
    ],

    # ---- South Carolina: Columbia ----
    'Columbia': [
        'columbia sc', 'columbia south carolina', 'columbia',
        'downtown columbia sc', 'five points columbia sc', 'shandon',
        'forest acres sc', 'lexington sc', 'irmo sc', 'cayce sc',
        'west columbia sc', 'springdale sc', 'blythewood sc',
        'chapin sc', 'gaston sc',
    ],
}

# Example neighborhoods per metro shown when asking the lead to narrow down.
# Keep to 3-4 recognizable names per market.
US_METRO_NEIGHBORHOODS: dict[str, list[str]] = {
    'Miami':           ['Brickell', 'Coral Gables', 'Wynwood', 'South Beach'],
    'Fort Lauderdale': ['Las Olas', 'Victoria Park', 'Pompano Beach', 'Weston'],
    'Tampa':           ['South Tampa', 'Hyde Park', 'Carrollwood', 'Brandon'],
    'Orlando':         ['Lake Nona', 'Winter Park', 'Dr. Phillips', 'College Park'],
    'Austin':          ['South Congress', 'East Austin', 'Domain', 'Round Rock'],
    'Dallas':          ['Uptown', 'Knox Henderson', 'Bishop Arts', 'Frisco'],
    'Fort Worth':      ['Cultural District', 'Near Southside', 'Keller', 'Southlake'],
    'Houston':         ['Montrose', 'The Heights', 'River Oaks', 'The Woodlands'],
    'Charlotte':       ['South End', 'NoDa', 'Dilworth', 'Ballantyne'],
    'Raleigh':         ['North Hills', 'Cary', 'Apex', 'Durham'],
    'Atlanta':         ['Buckhead', 'Midtown', 'Decatur', 'Sandy Springs'],
    'Phoenix':         ['Arcadia', 'Tempe', 'Chandler', 'Gilbert'],
    'Scottsdale':      ['Old Town', 'North Scottsdale', 'DC Ranch', 'Paradise Valley'],
    'Columbus':        ['Short North', 'German Village', 'Dublin', 'Westerville'],
    'Cleveland':       ['Ohio City', 'Lakewood', 'Beachwood', 'Shaker Heights'],
    'Philadelphia':    ['Rittenhouse Square', 'Fishtown', 'Manayunk', 'Center City'],
    'Detroit':         ['Midtown Detroit', 'Corktown', 'Royal Oak', 'Birmingham'],
    'Ann Arbor':       ['Downtown Ann Arbor', 'Kerrytown', 'Ypsilanti', 'Canton'],
    'Birmingham':      ['Homewood', 'Mountain Brook', 'Vestavia Hills', 'Hoover'],
    'Huntsville':      ['Research Park', 'Downtown Huntsville', 'Madison', 'Hampton Cove'],
    'Charleston':      ['Downtown Charleston', 'Mount Pleasant', 'West Ashley', 'James Island'],
    'Columbia':        ['Forest Acres', 'Lexington', 'Irmo', 'Five Points'],
}

# Flat set of all US city/neighborhood keywords for quick membership checks
_US_CITY_KEYWORDS: set[str] = {
    kw
    for keywords in US_REGION_MAP.values()
    for kw in keywords
}

# State names and abbreviations for the 10 covered service states only.
# General US references (usa, america, us) are included so broad queries
# like "I'm looking in the US" are not blocked before the bot can ask for a city.
_US_SERVICE_STATE_KEYWORDS: set[str] = {
    'florida', 'fl',
    'texas', 'tx',
    'north carolina', 'nc',
    'georgia', 'ga',
    'arizona', 'az',
    'ohio', 'oh',
    'pennsylvania', 'pa',
    'michigan', 'mi',
    'alabama', 'al',
    'south carolina', 'sc',
}

_US_STATE_KEYWORDS: set[str] = _US_SERVICE_STATE_KEYWORDS | {
    'usa', 'united states', 'united states of america', 'america', 'us',
}

# Lowercase set of all metro key names for get_us_location_type()
_US_METRO_NAMES: set[str] = {metro.lower() for metro in US_REGION_MAP}


def is_us_location(text: str) -> bool:
    """
    Return True if the text contains any keyword from the 10 covered US states.

    Only matches cities/neighborhoods within the service area (FL, TX, NC, GA,
    AZ, OH, PA, MI, AL, SC) plus generic US country references.
    Checks are case-insensitive. Short keywords (<=2 chars) use word-boundary
    matching to avoid false positives (e.g. 'al' inside 'also').
    """
    lowered = text.lower()

    # Multi-word keywords: plain substring check
    for kw in _US_CITY_KEYWORDS | _US_STATE_KEYWORDS:
        if len(kw) > 2 and kw in lowered:
            return True

    # Short keywords (1-2 chars): require word boundary to avoid false positives
    import re as _re
    for kw in _US_CITY_KEYWORDS | _US_STATE_KEYWORDS:
        if len(kw) <= 2:
            if _re.search(r'\b' + _re.escape(kw) + r'\b', lowered):
                return True

    return False


def get_us_region(text: str) -> Optional[str]:
    """
    Return the canonical US metro name if any keyword in the text matches
    a city or neighborhood in US_REGION_MAP.

    Returns None if no match found. First match in insertion order is returned.
    """
    lowered = text.lower()
    for metro, keywords in US_REGION_MAP.items():
        for kw in keywords:
            if kw in lowered:
                return metro
    return None


def get_us_location_type(location: str) -> tuple[str, str]:
    """
    Classify a US location string into metro vs neighborhood.

    Returns (type, canonical):
      type: 'metro' | 'neighborhood' | 'unknown'
      canonical: title-case metro name or original text

    'metro' means the user named a major city that needs neighborhood niching.
    'neighborhood' means the user named a specific area that is precise enough.
    """
    loc = location.strip().lower()

    # Exact match on a metro key -> needs niching
    if loc in _US_METRO_NAMES:
        for metro in US_REGION_MAP:
            if metro.lower() == loc:
                return ('metro', metro)

    # Keyword match inside a metro's neighborhood list -> specific enough
    for metro, keywords in US_REGION_MAP.items():
        for kw in keywords:
            if kw == loc:
                return ('neighborhood', metro)

    # Partial metro name match (handles 'ft lauderdale', 'philly', etc.)
    for metro in US_REGION_MAP:
        if loc in metro.lower() or metro.lower() in loc:
            return ('metro', metro)

    return ('unknown', location)


def get_us_area_examples(metro: str) -> str:
    """
    Return a short comma-separated string of 3 example neighborhoods for
    the given metro. Used to populate the location niching question.
    """
    examples = US_METRO_NEIGHBORHOODS.get(metro, [])[:3]
    return ', '.join(examples)
