from sqlalchemy.orm import Session
from app.models import Listing
from sqlalchemy import or_, and_

def search_listings(db: Session, filters: dict):
    query = db.query(Listing).filter(Listing.is_available == True)

    if filters.get("listing_type"):
        query = query.filter(Listing.listing_type == filters["listing_type"])
    
    if filters.get("location"):
        # Simple case-insensitive partial match
        query = query.filter(Listing.location.ilike(f"%{filters['location']}%"))
    
    if filters.get("bedrooms"):
        query = query.filter(Listing.bedrooms == filters["bedrooms"])
    
    if filters.get("furnishing"):
        query = query.filter(Listing.furnishing.ilike(filters["furnishing"]))

    if filters.get("budget_max"):
        query = query.filter(Listing.price <= filters["budget_max"])
    
    if filters.get("budget_min"):
        query = query.filter(Listing.price >= filters["budget_min"])

    # Order by price (budget closeness) and recency
    # For MVP, just order by created_at desc
    return query.order_by(Listing.created_at.desc()).limit(5).all()

def recommend_alternatives(db: Session, requirements: dict):
    # If specific search fails, relax constraints.
    # For MVP, we'll just remove the 'bedrooms' and 'furnishing' constraints 
    # and search by location and type/budget again.
    relaxed_filters = {
        "listing_type": requirements.get("listing_type"),
        "location": requirements.get("location"),
        "budget_max": requirements.get("budget_max")
    }
    # Filter out None values
    relaxed_filters = {k: v for k, v in relaxed_filters.items() if v is not None}
    
    return search_listings(db, relaxed_filters)
