# Wakeeli Property Fields Schema

Reference document for the AI agent's property matching logic. Covers both listing types with full field definitions.

---

## Quick Reference: What's Different

| Aspect | Buying | Rental |
|---|---|---|
| Pricing field | Sale Price (one-time) | Rent Price + Duration + Deposit |
| Condition field | Yes (Ready/Under Construction/Renovation) | No |
| Move-in scheduling | No | Yes (date, min stay, notice) |
| Rules & restrictions | Special Details section | Rental Rules & Restrictions section |
| Budget matching | Buyer budget range | Renter budget range |

---

## Shared Fields (Both Listing Types)

These fields appear in both buying and rental schemas.

| Field | Type | Required | Notes |
|---|---|---|---|
| Property ID | Auto-generated text | Required | System assigned |
| Property Type | Dropdown | Required | Apartment / Villa / Duplex / Penthouse / Office / Retail / Land |
| Listing Title | Text | Required | Free text |
| Category | Dropdown | Required | Residential / Commercial / Land |
| City | Dropdown | Required | All Lebanese cities |
| Area / Neighborhood | Text | Optional | Free text |
| Building Name | Text | Optional | Free text |
| Bedrooms | Checkboxes (buying) / Number (rental) | Required | Options: 1, 2, 3, 4, 5, 6, 7, +7 |
| Bathrooms | Checkboxes (buying) / Number (rental) | Required | Options: 1, 2, 3, 4, 5, 6, 7, +7 |
| Built-Up Area (m²) | Number | Required | |
| Plot Area (m²) | Number | Optional | |
| Floor Number | Number | Optional | |
| Parking | Dropdown | Optional | None / 1 / 2 / Covered |
| Property Age | Dropdown | Optional | 1-5 years / 5-10 years / 10+ years |
| Furnishing | Dropdown | Required | Furnished / Semi-Furnished / Unfurnished |
| View | Dropdown | Optional | Sea / City / Mountain / Open |
| Utilities | Checkboxes | Required | See utilities list below |
| Unit Amenities | Checkboxes | Required | See amenities list below |
| Building Amenities | Checkboxes | Optional | See amenities list below |
| Private Amenities | Checkboxes | Optional | See amenities list below |
| Media | Media / URL | Required | Image gallery + video tour |
| Additional Details | Mixed | Optional | Negotiable (Yes/No), Viewing notice (Immediate / 24h / 48h+) |

### Utilities (shared checkboxes)
- 24/7 Electricity
- Generator
- Water Supply
- Internet Ready
- Central A/C
- Heating Type
- Water Supply

### Unit Amenities (shared checkboxes)
- Balcony
- Terrace
- Built-in Kitchen Appliances
- Built-in Wardrobes
- Walk-in Closet
- Maid's Room
- Study Room
- Storage Room
- Fireplace
- Attic / Loft
- Playroom

### Building Amenities (shared checkboxes)
- Elevator
- Covered Parking
- Security
- Concierge
- Shared Pool
- Shared Gym
- Shared Spa
- Visitor Parking

### Private Amenities (shared checkboxes)
- Private Garden
- Private Pool
- Private Gym
- Private Jacuzzi

---

## Buying-Only Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Sale Price | Number | Required | Total asking price |
| Condition | Dropdown | Required | Ready to Move In / Under Construction / Needs Renovation |
| Special Details | Mixed | Optional | See breakdown below |
| Buyer Fit | Mixed | Required | See breakdown below |

### Special Details (buying)
- Pets Allowed: Yes / No
- Nationality Restrictions: Checkbox
- Airbnb / Short-Term Allowed: Checkbox
- Furnishing Included in Price: Yes / No

### Buyer Fit (buying)
- Ideal For: Dropdown (End User / Investor / Family)
- Lifestyle Tags: Multi-select (Luxury / Quiet / Walkable / Family-Friendly / Other)
- Target Buyer Budget Range: Number
- Minimum Buyer Budget: Number

---

## Rental-Only Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Rental Pricing & Terms | Mixed | Required | See breakdown below |
| Availability & Move-In | Mixed | Optional | See breakdown below |
| Rental Rules & Restrictions | Mixed | Optional | See breakdown below |
| Renter Fit | Mixed | Optional | See breakdown below |

### Rental Pricing & Terms
- Rent Price: Number (required)
- Rental Duration: Dropdown (Daily / Monthly / Yearly)
- Security Deposit: Number
- Negotiable: Yes / No
- Minimum Acceptable Rent: Number (optional)
- Owner Flexibility Notes: Text (optional)

### Availability & Move-In
- Move-In Date: Dropdown (ASAP / In a Week / In a Month / In a Few Months)
- Minimum Stay: Text
- Viewing Notice Required: Immediate / 24h / 48h+

### Rental Rules & Restrictions
- Pets Allowed: Yes / No
- Family Only: Yes / No
- Nationality Restrictions: Text
- Short-Term Allowed: Yes / No

### Renter Fit
- Ideal For: Dropdown (End User / Investor / Family)
- Lifestyle Tags: Multi-select (Luxury / Quiet / Walkable / Family-Friendly / Other)
- Target Renter Budget Range: Number
- Minimum Renter Budget: Number

---

## AI Matching Notes

Key fields for lead qualification and property matching:

**Budget matching:** Use Sale Price (buying) or Rent Price (buying) against Buyer/Renter Budget Range and Minimum Budget fields.

**Bedroom/bathroom filtering:** Primary filter. Checkboxes allow multi-select so a lead wanting 2-3 beds matches listings with either value.

**Location matching:** City is the hard filter. Area/Neighborhood is a soft preference.

**Lifestyle alignment:** Lifestyle Tags and Ideal For fields are designed for the AI to cross-reference against lead preferences.

**Rental-specific:** Always check Rental Rules & Restrictions before matching a rental lead. Pets, family status, and nationality restrictions can be hard disqualifiers.

**Buying-specific:** Condition is a key qualifier for investors (who may accept Under Construction) vs. end users (who typically need Ready to Move In).
