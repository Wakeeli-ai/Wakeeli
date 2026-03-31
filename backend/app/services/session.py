CLASSIFICATION_PRIORITY = {
                "OFF_TOPIC": 0,
                "B": 1,
                "A2": 2,
                "A1": 3
            }

STAGES = {
    1: "intent_detection",
    2: "collect_property_info",
    3: "process_property_request",
    4: "handoff_or_finish",
    5: "more_info_needed"
}

class SessionState:

    def __init__(self):
        self.stage = 1
        self.classification = None
        self.bare_greeting = False
        self.rejection_count = 0
        self.listings_shown = False
        self.pending_route_message = None

        self.user_info = {
            "name": None,
            "not_link_or_id": False
        }

        self.property_info = {
            "link_or_id": None,
            "listing_type": None,
            "location": None,
            "budget_min": None,
            "budget_max": None,
            "bedrooms": None,
            "bathrooms": None,
            "property_type": None,
            "furnishing": None,
            "timeline": None
        }

    def getter(self):
        return {
            "stage": self.stage,
            "classification": self.classification,
            "bare_greeting": self.bare_greeting,
            "rejection_count": self.rejection_count,
            "listings_shown": self.listings_shown,
            "user_info": self.user_info,
            "property_info": self.property_info
        }
    


    def update_stage(self):

        property_info = self.property_info or {}
        user_info = self.user_info or {}

        location = property_info.get("location")
        bedrooms = property_info.get("bedrooms")
        furnishing = property_info.get("furnishing")
        budget_min = property_info.get("budget_min")
        budget_max = property_info.get("budget_max")
        link_or_id = property_info.get("link_or_id")

        name = user_info.get("name")

        # ---------------------------
        # 1️⃣ OFF TOPIC (highest priority)
        # ---------------------------
        if self.classification == "OFF_TOPIC":
            self.stage = 4
            return

        # ---------------------------
        # 2️⃣ PROPERTY LINK PROVIDED
        # ---------------------------
        if link_or_id:
            if not name:
                self.stage = 2  # ask for name
            else:
                self.stage = 3  # process request
            return

        # ---------------------------
        # 3️⃣ ENOUGH INFO TO SEARCH (location + budget required)
        # ---------------------------
        has_budget = budget_min or budget_max

        if location and has_budget:
            self.stage = 3
            return

        # ---------------------------
        # 4️⃣ VAGUE PROPERTY REQUEST
        # ---------------------------
        if self.classification == "A2":
            self.stage = 2
            return

        # ---------------------------
        # 5️⃣ GENERAL CONVERSATION
        # ---------------------------
        if self.classification == "B":
            self.stage = 5
            return

        # ---------------------------
        # DEFAULT FALLBACK
        # ---------------------------
        self.stage = 2




    def update_agent_state(self, new_data):
        incoming = new_data.get("classification")
        if incoming:
            self.classification = incoming

        # bare_greeting resets on every message based on current intent
        self.bare_greeting = bool(new_data.get("bare_greeting", False))

        if "user_info" in new_data:
            self.user_info.update(
                {k: v for k, v in new_data["user_info"].items() if v is not None}
            )

        if "property_info" in new_data:
            self.property_info.update(
                {k: v for k, v in new_data["property_info"].items() if v is not None}
            )



    def missing_fields(self):

        missing = []

        if not self.user_info["name"]:
            missing.append("name")

        if not self.property_info["link_or_id"]:
            missing.append("property")

        if self.classification == "OFF_TOPIC":
            missing.append("off_topic")

        return missing