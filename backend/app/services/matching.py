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

    if filters.get("bedrooms"):
        query = query.filter(Listing.bedrooms == filters["bedrooms"])

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
    # If specific search fails, relax constraints.
    # Remove bedrooms, furnishing, AND budget so we show the closest options regardless of price.
    # The user can decide if they want to stretch their budget.
    relaxed_filters = {
        "listing_type": requirements.get("listing_type"),
        "location": requirements.get("location"),
    }
    # Filter out None values
    relaxed_filters = {k: v for k, v in relaxed_filters.items() if v is not None}

    return search_listings(db, relaxed_filters)





