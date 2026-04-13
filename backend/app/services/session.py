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
        self.greeted = False
        self.rejection_count = 0
        self.listings_shown = False
        self.pending_route_message = None
        self.handed_off = False
        self.name_asked = False
        self.name_ask_count = 0
        self.budget_ask_count = 0
        self.furnished_ask_count = 0
        self.show_alternatives = False
        self.lbp_converted = {}
        # Set to True for one turn when the name was just extracted this turn
        self.name_just_set = False

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
            "budget_flexible": None,
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
            "greeted": self.greeted,
            "rejection_count": self.rejection_count,
            "listings_shown": self.listings_shown,
            "handed_off": self.handed_off,
            "name_asked": self.name_asked,
            "name_ask_count": self.name_ask_count,
            "name_just_set": self.name_just_set,
            "budget_ask_count": self.budget_ask_count,
            "furnished_ask_count": self.furnished_ask_count,
            "show_alternatives": self.show_alternatives,
            "user_info": self.user_info,
            "property_info": self.property_info
        }
    


    def update_stage(self):

        property_info = self.property_info or {}
        user_info = self.user_info or {}

        location = property_info.get("location")
        listing_type = property_info.get("listing_type")
        bedrooms = property_info.get("bedrooms")
        furnishing = property_info.get("furnishing")
        budget_min = property_info.get("budget_min")
        budget_max = property_info.get("budget_max")
        link_or_id = property_info.get("link_or_id")

        name = user_info.get("name")

        # ---------------------------
        # 1. OFF TOPIC (highest priority)
        # ---------------------------
        if self.classification == "OFF_TOPIC":
            self.stage = 4
            return

        # ---------------------------
        # 2. LISTINGS ALREADY SHOWN: always stay in process_property_request
        #    so follow-up messages (unsure, questions, booking confirmations)
        #    are handled in the right action branch, not bounced back to
        #    more_info_needed which would ask qualifying questions again.
        # ---------------------------
        if self.listings_shown:
            self.stage = 3
            return

        # ---------------------------
        # 3. PROPERTY LINK PROVIDED
        # ---------------------------
        if link_or_id:
            if not name:
                self.stage = 2  # ask for name
            else:
                self.stage = 3  # process request
            return

        # ---------------------------
        # 4. ENOUGH INFO TO SEARCH
        # Requires listing_type + at least 2 of: location, budget, bedrooms.
        # Furnished is never required to trigger listing presentation.
        # ---------------------------
        has_budget = bool(budget_min) or bool(budget_max)
        # After two asks (or one vague answer + one ask), skip budget and allow search to proceed.
        _budget_skip = not has_budget and self.budget_ask_count >= 2
        _search_score = sum([bool(location), has_budget or _budget_skip, bool(bedrooms)])

        if listing_type and _search_score >= 2:
            if not name:
                self.stage = 5
            else:
                self.stage = 3
            return

        # ---------------------------
        # 5. VAGUE PROPERTY REQUEST
        # ---------------------------
        if self.classification == "A2":
            self.stage = 2
            return

        # ---------------------------
        # 6. GENERAL CONVERSATION
        # ---------------------------
        if self.classification == "B":
            self.stage = 5
            return

        # ---------------------------
        # DEFAULT FALLBACK
        # ---------------------------
        self.stage = 2




    def update_agent_state(self, new_data):
        new_class = new_data.get("classification")
        if new_class:
            # Never downgrade classification. A hot A1 lead must not be overwritten
            # by an ambiguous B or A2 signal on a single unclear message.
            # Use -1 as the default for an unset classification so any first
            # classification always passes through.
            current_priority = CLASSIFICATION_PRIORITY.get(self.classification, -1)
            new_priority = CLASSIFICATION_PRIORITY.get(new_class, -1)
            if new_priority >= current_priority:
                self.classification = new_class

        # bare_greeting resets on every message based on current intent
        self.bare_greeting = bool(new_data.get("bare_greeting", False))

        # Reset name_just_set at the start of each turn
        self.name_just_set = False

        if "user_info" in new_data:
            new_user_info = {k: v for k, v in new_data["user_info"].items() if v is not None}
            # Detect if a name was just provided this turn (was None before, now set)
            if new_user_info.get("name") and not self.user_info.get("name"):
                self.name_just_set = True
            self.user_info.update(new_user_info)

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
