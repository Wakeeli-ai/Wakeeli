from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import uuid
from app.database import get_db
from app.models import Listing
from app.schemas import ListingCreate, Listing as ListingSchema
from app.services.matching import search_listings

router = APIRouter()


def compute_match_score(listing: Listing, requirements: dict) -> dict:
    """
    Compute match scores between a listing and user requirements.
    Returns individual scores and overall match percentage.
    """
    scores = {
        "budget_match": 100,
        "location_match": 100,
        "property_type_match": 100,
        "bedrooms_match": 100
    }
    
    # Budget match
    budget_max = requirements.get("budget_max")
    budget_min = requirements.get("budget_min")
    listing_price = listing.sale_price if listing.listing_type == "buy" else listing.rent_price
    
    if budget_max and listing_price:
        if listing_price <= budget_max:
            # Perfect if within budget, slight penalty if close to max
            ratio = listing_price / budget_max
            scores["budget_match"] = int(100 - (ratio - 0.5) * 20) if ratio > 0.5 else 100
        else:
            # Over budget - reduce score based on how much over
            over_ratio = listing_price / budget_max
            scores["budget_match"] = max(0, int(100 - (over_ratio - 1) * 100))
    
    # Location match
    req_location = requirements.get("location", "").lower()
    if req_location:
        listing_loc = f"{listing.city} {listing.area or ''}".lower()
        if req_location in listing_loc:
            scores["location_match"] = 100
        elif any(word in listing_loc for word in req_location.split()):
            scores["location_match"] = 70
        else:
            scores["location_match"] = 30
    
    # Property type match
    req_property_type = requirements.get("property_type", "").lower()
    if req_property_type and listing.property_type:
        if req_property_type in listing.property_type.lower():
            scores["property_type_match"] = 100
        else:
            scores["property_type_match"] = 50
    
    # Bedrooms match
    req_bedrooms = requirements.get("bedrooms")
    if req_bedrooms and listing.bedrooms:
        diff = abs(listing.bedrooms - req_bedrooms)
        if diff == 0:
            scores["bedrooms_match"] = 100
        elif diff == 1:
            scores["bedrooms_match"] = 80
        else:
            scores["bedrooms_match"] = max(0, 100 - diff * 20)
    
    # Overall score (weighted average)
    weights = {"budget_match": 0.35, "location_match": 0.30, "property_type_match": 0.20, "bedrooms_match": 0.15}
    overall = sum(scores[k] * weights[k] for k in weights)
    
    return {
        "overall_match": int(overall),
        **scores
    }

@router.get("/", response_model=List[ListingSchema])
def get_listings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    listings = db.query(Listing).offset(skip).limit(limit).all()
    return listings


@router.get("/match")
def match_listings_for_lead(
    listing_type: Optional[str] = None,
    location: Optional[str] = None,
    budget_min: Optional[float] = None,
    budget_max: Optional[float] = None,
    bedrooms: Optional[int] = None,
    property_type: Optional[str] = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Find listings that match user requirements and return with match scores.
    Used for the Lead Detail panel to show matched properties.
    """
    # Build requirements dict
    requirements = {}
    if listing_type:
        requirements["listing_type"] = listing_type
    if location:
        requirements["location"] = location
    if budget_min:
        requirements["budget_min"] = budget_min
    if budget_max:
        requirements["budget_max"] = budget_max
    if bedrooms:
        requirements["bedrooms"] = bedrooms
    if property_type:
        requirements["property_type"] = property_type
    
    # Use existing search function
    listings = search_listings(db, requirements)
    
    # If no results with strict matching, try relaxed search
    if not listings:
        query = db.query(Listing).filter(Listing.is_available == True)
        if listing_type:
            query = query.filter(Listing.listing_type == listing_type)
        listings = query.limit(limit).all()
    
    # Compute match scores for each listing
    results = []
    for listing in listings[:limit]:
        scores = compute_match_score(listing, requirements)
        results.append({
            "id": listing.id,
            "title": listing.title,
            "listing_type": listing.listing_type,
            "property_type": listing.property_type,
            "city": listing.city,
            "area": listing.area,
            "bedrooms": listing.bedrooms,
            "bathrooms": listing.bathrooms,
            "built_up_area": listing.built_up_area,
            "price": listing.sale_price if listing.listing_type == "buy" else listing.rent_price,
            "furnishing": listing.furnishing,
            "match_scores": scores
        })
    
    # Sort by overall match score
    results.sort(key=lambda x: x["match_scores"]["overall_match"], reverse=True)
    
    return {"listings": results, "total": len(results)}

@router.post("/", response_model=ListingSchema)
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    data = listing.dict()
    if not data.get('property_id'):
        data['property_id'] = f"WK-{uuid.uuid4().hex[:8].upper()}"
    db_listing = Listing(**data)
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.put("/{listing_id}", response_model=ListingSchema)
def update_listing(listing_id: int, listing: ListingCreate, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    for key, value in listing.dict().items():
        setattr(db_listing, key, value)
    
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.delete("/{listing_id}")
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    db_listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    db.delete(db_listing)
    db.commit()
    return {"status": "deleted"}
