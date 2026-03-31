"""
seed_data.py - Seeds the Wakeeli database with test listings and agents.
Idempotent: clears existing test data before inserting.
Run: python3 seed_data.py
"""

import os
import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:JthhQqNHClcjGUGKJomBjpflMctPuarN@mainline.proxy.rlwy.net:34094/railway"
)

TEST_LISTING_PREFIX = "WK-TEST-"
TEST_AGENT_MARKER = "__TEST__"

AGENTS = [
    {
        "name": f"Rafic Khoury{TEST_AGENT_MARKER}",
        "phone": "+961 70 123 456",
        "email": "rafic@wakeeli.com",
        "territories": '["Beirut", "Achrafieh", "Hamra", "Verdun", "Ras Beirut"]',
        "specialties": '["rent", "buy"]',
        "priority": 1,
        "is_active": True,
    },
    {
        "name": f"Rami Haddad{TEST_AGENT_MARKER}",
        "phone": "+961 71 234 567",
        "email": "rami@wakeeli.com",
        "territories": '["Jounieh", "Kaslik", "Dbayeh", "Jdeideh"]',
        "specialties": '["buy", "rent"]',
        "priority": 2,
        "is_active": True,
    },
    {
        "name": f"Mary Rizk{TEST_AGENT_MARKER}",
        "phone": "+961 76 345 678",
        "email": "mary@wakeeli.com",
        "territories": '["Broummana", "Beit Mery", "Bhamdoun", "Aley"]',
        "specialties": '["buy"]',
        "priority": 2,
        "is_active": True,
    },
    {
        "name": f"Clara Nassar{TEST_AGENT_MARKER}",
        "phone": "+961 78 456 789",
        "email": "clara@wakeeli.com",
        "territories": '["Batroun", "Jbeil", "Byblos", "Enfeh"]',
        "specialties": '["rent", "buy"]',
        "priority": 3,
        "is_active": True,
    },
]


LISTINGS = [
    # ---- BEIRUT RENTALS ----
    {
        "property_id": "WK-TEST-001",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Modern 2BR Apartment in Achrafieh",
        "category": "Residential",
        "city": "Beirut",
        "area": "Achrafieh",
        "bedrooms": 2,
        "bathrooms": 1,
        "built_up_area": 110.0,
        "furnishing": "Furnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 1200.0,
        "rental_duration": "Yearly",
        "security_deposit": 1200.0,
        "negotiable": True,
        "is_available": True,
        "description": "Bright 2-bedroom apartment on the 4th floor in the heart of Achrafieh. Fully furnished with modern kitchen, balcony with city view, and 24h generator. Walking distance to Mar Mikhael and Gemmayzeh.",
    },
    {
        "property_id": "WK-TEST-002",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Cozy 1BR Studio in Hamra",
        "category": "Residential",
        "city": "Beirut",
        "area": "Hamra",
        "bedrooms": 1,
        "bathrooms": 1,
        "built_up_area": 70.0,
        "furnishing": "Furnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 750.0,
        "rental_duration": "Yearly",
        "security_deposit": 750.0,
        "negotiable": False,
        "is_available": True,
        "description": "Charming furnished studio in vibrant Hamra. Recently renovated with new appliances, high-speed internet ready, and building generator. Close to AUB and all amenities.",
    },
    {
        "property_id": "WK-TEST-003",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Spacious 3BR in Verdun",
        "category": "Residential",
        "city": "Beirut",
        "area": "Verdun",
        "bedrooms": 3,
        "bathrooms": 2,
        "built_up_area": 180.0,
        "furnishing": "Unfurnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 1800.0,
        "rental_duration": "Yearly",
        "security_deposit": 1800.0,
        "negotiable": True,
        "is_available": True,
        "description": "Large unfurnished 3-bedroom apartment in upscale Verdun. High ceilings, marble floors, underground parking, building concierge, and 24h generator. Perfect for families.",
    },
    {
        "property_id": "WK-TEST-004",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "1BR Apartment in Ras Beirut",
        "category": "Residential",
        "city": "Beirut",
        "area": "Ras Beirut",
        "bedrooms": 1,
        "bathrooms": 1,
        "built_up_area": 80.0,
        "furnishing": "Semi-Furnished",
        "view": "Sea",
        "condition": "Ready",
        "rent_price": 900.0,
        "rental_duration": "Yearly",
        "security_deposit": 900.0,
        "negotiable": True,
        "is_available": True,
        "description": "Semi-furnished 1-bedroom with partial sea view in Ras Beirut. Modern building with elevator and generator. Walking distance to the Corniche and supermarkets.",
    },
    {
        "property_id": "WK-TEST-005",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Luxury 2BR in Achrafieh with Parking",
        "category": "Residential",
        "city": "Beirut",
        "area": "Achrafieh",
        "bedrooms": 2,
        "bathrooms": 2,
        "built_up_area": 140.0,
        "furnishing": "Furnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 1600.0,
        "rental_duration": "Yearly",
        "security_deposit": 1600.0,
        "negotiable": False,
        "is_available": True,
        "description": "High-end furnished 2-bedroom in Sioufi, Achrafieh. New building, smart home features, covered parking, rooftop terrace access, full generator and water tank.",
    },
    {
        "property_id": "WK-TEST-006",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Budget 1BR in Hamra",
        "category": "Residential",
        "city": "Beirut",
        "area": "Hamra",
        "bedrooms": 1,
        "bathrooms": 1,
        "built_up_area": 65.0,
        "furnishing": "Unfurnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 550.0,
        "rental_duration": "Yearly",
        "security_deposit": 550.0,
        "negotiable": True,
        "is_available": True,
        "description": "Affordable unfurnished 1-bedroom in Hamra. Clean building with elevator and generator. Ideal for young professionals. Close to banks, cafes and public transport.",
    },
    # ---- MOUNT LEBANON RENTALS ----
    {
        "property_id": "WK-TEST-007",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "2BR Sea-View Apartment in Jounieh",
        "category": "Residential",
        "city": "Jounieh",
        "area": "Kaslik",
        "bedrooms": 2,
        "bathrooms": 2,
        "built_up_area": 120.0,
        "furnishing": "Furnished",
        "view": "Sea",
        "condition": "Ready",
        "rent_price": 1100.0,
        "rental_duration": "Yearly",
        "security_deposit": 1100.0,
        "negotiable": True,
        "is_available": True,
        "description": "Beautiful furnished 2-bedroom with stunning sea view in Kaslik, Jounieh. Modern decor, balcony, underground parking, full generator. Steps from Kaslik waterfront promenade.",
    },
    {
        "property_id": "WK-TEST-008",
        "listing_type": "rent",
        "property_type": "Chalet",
        "title": "Mountain Chalet in Broummana",
        "category": "Residential",
        "city": "Broummana",
        "area": "Broummana",
        "bedrooms": 3,
        "bathrooms": 2,
        "built_up_area": 160.0,
        "furnishing": "Furnished",
        "view": "Mountain",
        "condition": "Ready",
        "rent_price": 1400.0,
        "rental_duration": "Yearly",
        "security_deposit": 1400.0,
        "negotiable": True,
        "is_available": True,
        "description": "Cozy furnished mountain chalet in Broummana with panoramic views. Wood fireplace, private garden, covered parking. Perfect for families seeking cool mountain living.",
    },
    # ---- BEIRUT FOR SALE ----
    {
        "property_id": "WK-TEST-009",
        "listing_type": "buy",
        "property_type": "Apartment",
        "title": "3BR Apartment for Sale in Achrafieh",
        "category": "Residential",
        "city": "Beirut",
        "area": "Achrafieh",
        "bedrooms": 3,
        "bathrooms": 2,
        "built_up_area": 200.0,
        "furnishing": "Unfurnished",
        "view": "City",
        "condition": "Ready",
        "sale_price": 320000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Elegant 3-bedroom apartment in old Achrafieh. Classic stone-facade building, high ceilings, hardwood floors, covered parking. A rare find in one of Beirut's most sought-after neighborhoods.",
    },
    {
        "property_id": "WK-TEST-010",
        "listing_type": "buy",
        "property_type": "Apartment",
        "title": "2BR for Sale in Hamra",
        "category": "Residential",
        "city": "Beirut",
        "area": "Hamra",
        "bedrooms": 2,
        "bathrooms": 1,
        "built_up_area": 115.0,
        "furnishing": "Unfurnished",
        "view": "City",
        "condition": "Ready",
        "sale_price": 185000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Well-priced 2-bedroom apartment in Hamra. Solid concrete construction, renovated kitchen and bathrooms, building generator. Great investment opportunity in the heart of West Beirut.",
    },
    {
        "property_id": "WK-TEST-011",
        "listing_type": "buy",
        "property_type": "Apartment",
        "title": "Luxury 4BR Penthouse in Verdun",
        "category": "Residential",
        "city": "Beirut",
        "area": "Verdun",
        "bedrooms": 4,
        "bathrooms": 3,
        "built_up_area": 350.0,
        "furnishing": "Furnished",
        "view": "Sea",
        "condition": "Ready",
        "sale_price": 750000.0,
        "negotiable": False,
        "is_available": True,
        "description": "Stunning furnished penthouse in Verdun with panoramic sea views. Private roof terrace, smart home automation, 2 parking spaces, concierge service. The pinnacle of Beirut luxury living.",
    },
    # ---- MOUNT LEBANON FOR SALE ----
    {
        "property_id": "WK-TEST-012",
        "listing_type": "buy",
        "property_type": "Villa",
        "title": "Private Villa for Sale in Beit Mery",
        "category": "Residential",
        "city": "Beit Mery",
        "area": "Beit Mery",
        "bedrooms": 4,
        "bathrooms": 3,
        "built_up_area": 300.0,
        "plot_area": 600.0,
        "furnishing": "Unfurnished",
        "view": "Mountain",
        "condition": "Ready",
        "sale_price": 580000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Impressive standalone villa in Beit Mery with mountain views and private garden. 4 bedrooms, large living area, covered garage for 2 cars, solar panels installed. Close to international schools.",
    },
    {
        "property_id": "WK-TEST-013",
        "listing_type": "buy",
        "property_type": "Apartment",
        "title": "2BR Apartment for Sale in Jounieh",
        "category": "Residential",
        "city": "Jounieh",
        "area": "Jounieh",
        "bedrooms": 2,
        "bathrooms": 2,
        "built_up_area": 130.0,
        "furnishing": "Semi-Furnished",
        "view": "Sea",
        "condition": "Ready",
        "sale_price": 210000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Sea-view 2-bedroom apartment for sale in central Jounieh. Semi-furnished with kitchen appliances, private parking, new building with full amenities. Great value with breathtaking bay views.",
    },
    # ---- NORTH LEBANON ----
    {
        "property_id": "WK-TEST-014",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Beachfront 2BR in Batroun",
        "category": "Residential",
        "city": "Batroun",
        "area": "Batroun",
        "bedrooms": 2,
        "bathrooms": 1,
        "built_up_area": 100.0,
        "furnishing": "Furnished",
        "view": "Sea",
        "condition": "Ready",
        "rent_price": 800.0,
        "rental_duration": "Yearly",
        "security_deposit": 800.0,
        "negotiable": True,
        "is_available": True,
        "description": "Fully furnished beachfront apartment in Batroun town. Steps from the sea, old town walls, and the best restaurants in North Lebanon. Generator and water tank included.",
    },
    {
        "property_id": "WK-TEST-015",
        "listing_type": "buy",
        "property_type": "Apartment",
        "title": "Old Town Apartment for Sale in Jbeil",
        "category": "Residential",
        "city": "Jbeil",
        "area": "Byblos Old Town",
        "bedrooms": 2,
        "bathrooms": 1,
        "built_up_area": 95.0,
        "furnishing": "Unfurnished",
        "view": "Sea",
        "condition": "Ready",
        "sale_price": 160000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Charming 2-bedroom apartment in historic Byblos (Jbeil) old town. Stone walls, wooden beam ceilings, sea views, original tile floors. A unique piece of Lebanese heritage. Walking distance to port and souks.",
    },
    {
        "property_id": "WK-TEST-016",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "3BR Family Apartment in Jbeil",
        "category": "Residential",
        "city": "Jbeil",
        "area": "Jbeil",
        "bedrooms": 3,
        "bathrooms": 2,
        "built_up_area": 150.0,
        "furnishing": "Unfurnished",
        "view": "Mountain",
        "condition": "Ready",
        "rent_price": 950.0,
        "rental_duration": "Yearly",
        "security_deposit": 950.0,
        "negotiable": True,
        "is_available": True,
        "description": "Spacious 3-bedroom family apartment in a quiet residential street in Jbeil. Unfurnished interior ready for your touch, parking included, generator and solar water heater.",
    },
    {
        "property_id": "WK-TEST-017",
        "listing_type": "buy",
        "property_type": "Villa",
        "title": "Hilltop Villa with Sea View in Batroun",
        "category": "Residential",
        "city": "Batroun",
        "area": "Kfar Aabida",
        "bedrooms": 3,
        "bathrooms": 2,
        "built_up_area": 220.0,
        "plot_area": 400.0,
        "furnishing": "Unfurnished",
        "view": "Sea",
        "condition": "Ready",
        "sale_price": 280000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Standalone hilltop villa near Batroun with spectacular sea views. 3 bedrooms, large terrace, private garden, covered parking. Ready to move in. Solar panels and water tanks installed.",
    },
    {
        "property_id": "WK-TEST-018",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "Studio in Hamra Near AUB",
        "category": "Residential",
        "city": "Beirut",
        "area": "Hamra",
        "bedrooms": 1,
        "bathrooms": 1,
        "built_up_area": 55.0,
        "furnishing": "Furnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 650.0,
        "rental_duration": "Yearly",
        "security_deposit": 650.0,
        "negotiable": False,
        "is_available": True,
        "description": "Compact furnished studio right near AUB main gate. Perfect for students and young professionals. All utilities included except electricity. Generator and internet ready.",
    },
    {
        "property_id": "WK-TEST-019",
        "listing_type": "buy",
        "property_type": "Apartment",
        "title": "Renovated 2BR in Ras Beirut",
        "category": "Residential",
        "city": "Beirut",
        "area": "Ras Beirut",
        "bedrooms": 2,
        "bathrooms": 2,
        "built_up_area": 130.0,
        "furnishing": "Unfurnished",
        "view": "Sea",
        "condition": "Ready",
        "sale_price": 240000.0,
        "negotiable": True,
        "is_available": True,
        "description": "Fully renovated 2-bedroom in Ras Beirut with partial sea view. New plumbing and electrical, open plan kitchen, 2 covered parking spaces. Ideal for end-users or investors.",
    },
    {
        "property_id": "WK-TEST-020",
        "listing_type": "rent",
        "property_type": "Apartment",
        "title": "4BR Family Home in Verdun",
        "category": "Residential",
        "city": "Beirut",
        "area": "Verdun",
        "bedrooms": 4,
        "bathrooms": 3,
        "built_up_area": 250.0,
        "furnishing": "Unfurnished",
        "view": "City",
        "condition": "Ready",
        "rent_price": 2800.0,
        "rental_duration": "Yearly",
        "security_deposit": 2800.0,
        "negotiable": True,
        "is_available": True,
        "description": "Premium 4-bedroom family apartment in the prestigious Verdun district. Floor-to-ceiling windows, 2 covered parking spots, private storage room, 24h concierge, full generator. Schools and embassies nearby.",
    },
]


def seed():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        print("Clearing existing test data...")

        cur.execute("DELETE FROM listings WHERE property_id LIKE %s", (f"{TEST_LISTING_PREFIX}%",))
        listings_deleted = cur.rowcount

        cur.execute("DELETE FROM agents WHERE name LIKE %s", (f"%{TEST_AGENT_MARKER}%",))
        agents_deleted = cur.rowcount

        conn.commit()
        print(f"Cleared {agents_deleted} agents and {listings_deleted} listings.")

        print("Inserting test agents...")
        for a in AGENTS:
            cur.execute(
                """
                INSERT INTO agents (name, phone, email, territories, specialties, priority, is_active)
                VALUES (%s, %s, %s, %s::jsonb, %s::jsonb, %s, %s)
                """,
                (a["name"], a["phone"], a["email"], a["territories"], a["specialties"], a["priority"], a["is_active"])
            )
        conn.commit()
        print(f"Inserted {len(AGENTS)} agents.")

        print("Inserting test listings...")
        for l in LISTINGS:
            cur.execute(
                """
                INSERT INTO listings (
                    property_id, listing_type, property_type, title, category,
                    city, area, bedrooms, bathrooms, built_up_area, plot_area,
                    furnishing, view, condition,
                    sale_price, rent_price, rental_duration, security_deposit, negotiable,
                    is_available, description
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s
                )
                """,
                (
                    l["property_id"], l["listing_type"], l["property_type"], l["title"], l["category"],
                    l["city"], l.get("area"), l.get("bedrooms"), l.get("bathrooms"), l.get("built_up_area"), l.get("plot_area"),
                    l.get("furnishing"), l.get("view"), l.get("condition"),
                    l.get("sale_price"), l.get("rent_price"), l.get("rental_duration"), l.get("security_deposit"), l.get("negotiable"),
                    l.get("is_available", True), l.get("description")
                )
            )
        conn.commit()
        print(f"Inserted {len(LISTINGS)} listings.")

        rentals = [l for l in LISTINGS if l["listing_type"] == "rent"]
        sales = [l for l in LISTINGS if l["listing_type"] == "buy"]

        print("\nSeed complete!")
        print(f"  Agents: {len(AGENTS)}")
        print(f"  Listings: {len(LISTINGS)} (Rentals: {len(rentals)}, For Sale: {len(sales)})")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed()
