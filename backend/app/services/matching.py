from sqlalchemy.orm import Session
from app.models import Listing
from sqlalchemy import or_, and_
import re
from urllib.parse import urlparse
from app.services.geography import (
    GOVERNORATE_MAP,
    DISTRICT_MAP,
    REGION_MAP,
    GOVERNORATE_NAMES,
    DISTRICT_NAMES,
    US_REGION_MAP,
    is_us_location,
    get_us_region,
)

def search_listings(db: Session, filters: dict):
    query = db.query(Listing).filter(Listing.is_available == True)

    if filters.get("listing_type"):
        query = query.filter(Listing.listing_type == filters["listing_type"])

    if filters.get("location"):
        location_text = filters['location']
        location_lower = location_text.lower()

        if location_lower in REGION_MAP:
            # Standard Lebanon REGION_MAP path
            neighborhoods = REGION_MAP[location_lower]
            region_conditions = []
            # Always include the raw location term itself so listings stored
            # with e.g. city="Beirut" are matched even when the REGION_MAP
            # only expands to specific neighborhood names like "Achrafieh".
            region_conditions.append(Listing.city.ilike(f"%{location_text}%"))
            region_conditions.append(Listing.area.ilike(f"%{location_text}%"))
            for neighborhood in neighborhoods:
                region_conditions.append(Listing.city.ilike(f"%{neighborhood}%"))
                region_conditions.append(Listing.area.ilike(f"%{neighborhood}%"))
            query = query.filter(or_(*region_conditions))

        elif is_us_location(location_text):
            # US location path - search city and governorate fields directly.
            # Also expand to all city/neighborhood keywords for the detected metro.
            us_metro = get_us_region(location_text)
            us_conditions = []
            # Always match on the raw location text itself (covers full metro names
            # like "New York" stored directly in city/governorate fields)
            us_conditions.append(Listing.city.ilike(f"%{location_text}%"))
            us_conditions.append(Listing.area.ilike(f"%{location_text}%"))
            if hasattr(Listing, 'governorate'):
                us_conditions.append(Listing.governorate.ilike(f"%{location_text}%"))
            if us_metro and us_metro in US_REGION_MAP:
                # Expand to all city/neighborhood terms for this metro
                for city_kw in US_REGION_MAP[us_metro]:
                    us_conditions.append(Listing.city.ilike(f"%{city_kw}%"))
                    us_conditions.append(Listing.area.ilike(f"%{city_kw}%"))
                    if hasattr(Listing, 'governorate'):
                        us_conditions.append(Listing.governorate.ilike(f"%{city_kw}%"))
            query = query.filter(or_(*us_conditions))

        else:
            # Generic fallback - direct ILIKE on city and area columns
            query = query.filter(
                or_(
                    Listing.city.ilike(f"%{location_text}%"),
                    Listing.area.ilike(f"%{location_text}%")
                )
            )

    if filters.get("bedrooms") is not None and filters["bedrooms"] != [] and filters["bedrooms"] != "":
        bedrooms_val = filters["bedrooms"]
        if isinstance(bedrooms_val, list):
            # User specified multiple types e.g. "studio or 1-bedroom" -> [0, 1]
            query = query.filter(Listing.bedrooms.in_(bedrooms_val))
        else:
            query = query.filter(Listing.bedrooms == bedrooms_val)

    if filters.get("furnishing"):
        query = query.filter(Listing.furnishing.ilike(f"%{filters['furnishing']}%"))

    listing_type = filters.get("listing_type")
    budget_max = filters.get("budget_max")
    budget_min = filters.get("budget_min")

    if listing_type == "buy":
        if budget_max is not None:
            query = query.filter(Listing.sale_price <= budget_max)
        if budget_min is not None:
            query = query.filter(Listing.sale_price >= budget_min)
    elif listing_type == "rent":
        if budget_max is not None:
            query = query.filter(Listing.rent_price <= budget_max)
        if budget_min is not None:
            query = query.filter(Listing.rent_price >= budget_min)
    else:
        # If listing_type isn't provided, match either sale or rent price
        if budget_max is not None:
            query = query.filter(
                or_(
                    Listing.sale_price <= budget_max,
                    Listing.rent_price <= budget_max
                )
            )
        if budget_min is not None:
            query = query.filter(
                or_(
                    Listing.sale_price >= budget_min,
                    Listing.rent_price >= budget_min
                )
            )

    # Order by price (budget closeness) and recency
    # For MVP, just order by created_at desc
    return query.order_by(Listing.created_at.desc()).limit(5).all()





def recommend_alternatives(db: Session, requirements: dict):
    # If specific search fails, relax constraints progressively.
    listing_type = requirements.get("listing_type")
    location = requirements.get("location")
    bedrooms = requirements.get("bedrooms")

    # Strategy 1: same location + listing_type, drop budget and bedrooms.
    # Exception: studio requests (bedrooms == 0) must keep the bedrooms filter
    # so we never return a 1BR or 2BR as an "alternative" to a studio.
    if location:
        filters1 = {"location": location}
        if listing_type:
            filters1["listing_type"] = listing_type
        _prop_type = (requirements.get("property_type") or "").lower()
        _is_studio_req = (bedrooms == 0) or (_prop_type == "studio")
        if _is_studio_req:
            filters1["bedrooms"] = 0
        results = search_listings(db, filters1)
        if results:
            return results

    # Strategy 2: same listing_type + bedrooms, drop location and budget
    if bedrooms is not None and bedrooms != [] and bedrooms != "":
        filters2 = {"bedrooms": bedrooms}
        if listing_type:
            filters2["listing_type"] = listing_type
        results = search_listings(db, filters2)
        if results:
            return results

    # Strategy 3: just listing_type as last resort
    if listing_type:
        results = search_listings(db, {"listing_type": listing_type})
        if results:
            return results

    return []





