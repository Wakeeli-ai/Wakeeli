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
)

def search_listings(db: Session, filters: dict):
    query = db.query(Listing).filter(Listing.is_available == True)

    if filters.get("listing_type"):
        query = query.filter(Listing.listing_type == filters["listing_type"])

    if filters.get("location"):
        location_lower = filters['location'].lower()
        if location_lower in REGION_MAP:
            neighborhoods = REGION_MAP[location_lower]
            region_conditions = []
            # Always include the raw location term itself so listings stored
            # with e.g. city="Beirut" are matched even when the REGION_MAP
            # only expands to specific neighborhood names like "Achrafieh".
            region_conditions.append(Listing.city.ilike(f"%{filters['location']}%"))
            region_conditions.append(Listing.area.ilike(f"%{filters['location']}%"))
            for neighborhood in neighborhoods:
                region_conditions.append(Listing.city.ilike(f"%{neighborhood}%"))
                region_conditions.append(Listing.area.ilike(f"%{neighborhood}%"))
            query = query.filter(or_(*region_conditions))
        else:
            query = query.filter(
                or_(
                    Listing.city.ilike(f"%{filters['location']}%"),
                    Listing.area.ilike(f"%{filters['location']}%")
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

    # Strategy 1: same location + listing_type, drop budget and bedrooms
    if location:
        filters1 = {"location": location}
        if listing_type:
            filters1["listing_type"] = listing_type
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





