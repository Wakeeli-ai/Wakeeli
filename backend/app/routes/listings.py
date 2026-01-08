from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Listing
from app.schemas import ListingCreate, Listing as ListingSchema

router = APIRouter()

@router.get("/", response_model=List[ListingSchema])
def get_listings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    listings = db.query(Listing).offset(skip).limit(limit).all()
    return listings

@router.post("/", response_model=ListingSchema)
def create_listing(listing: ListingCreate, db: Session = Depends(get_db)):
    db_listing = Listing(**listing.dict())
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
