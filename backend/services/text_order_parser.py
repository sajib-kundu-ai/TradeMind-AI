import re


DEFAULT_ORDER = {
    "order_id": "CHAT-PREDICT",
    "product_name": "Chat Order",
    "product_category": "General",
    "payment_type": "Prepaid",
    "shipping_speed": "Standard",
    "amount": 0,
    "quantity": 1,
    "customer_type": "New",
    "phone_verified": "Yes",
    "email_verified": "Yes",
    "address_complete": "Yes",
    "distance_km": 10,
    "previous_orders": 0,
    "previous_returns": 0,
    "order_hour": 14,
    "coupon_used": "No",
    "account_age_days": 30,
    "current_stock": 20,
    "avg_daily_sales": 2,
    "discount_amount": 0,
}

IMPORTANT_FIELDS = [
    "payment_type",
    "amount",
    "phone_verified",
    "address_complete",
    "distance_km",
    "previous_returns",
    "order_hour",
    "customer_type",
]

BANGLA_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


def normalize_text(message: str) -> str:
    text = str(message or "").lower().strip()
    text = text.translate(BANGLA_DIGITS)
    text = re.sub(r"(?<=\d),(?=\d)", "", text)
    replacements = {
        "৳": " tk ",
        "টাকায়": " taka ",
        "টাকা।": " taka ",
        "টাকা": " taka ",
        "কিমি": " km ",
        "কিলোমিটার": " kilometer ",
        "টা": " ta ",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"[^\w\s./:-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _has_any(text, patterns):
    return any(re.search(pattern, text, re.UNICODE) for pattern in patterns)


def _add_detected(detected, field):
    if field not in detected:
        detected.append(field)


def _to_number(value):
    try:
        number = float(str(value).strip())
    except (TypeError, ValueError):
        return None
    return int(number) if number.is_integer() else number


def _k_amount(value):
    try:
        return int(float(value) * 1000)
    except (TypeError, ValueError):
        return None


def _find_first_number(text):
    match = re.search(r"\b(\d+(?:\.\d+)?)\b", text)
    return _to_number(match.group(1)) if match else None


def _detect_payment(text, order, detected):
    cod_patterns = [
        r"\bcod\b",
        r"\bcash on delivery\b",
        r"\bcash delivery\b",
        r"\bpay on delivery\b",
        r"\bdelivery te payment\b",
        r"\bdelivery payment\b",
        r"ক্যাশ অন ডেলিভারি",
        r"ক্যাশে?",
    ]
    prepaid_patterns = [
        r"\bprepaid\b",
        r"\bpre paid\b",
        r"\balready paid\b",
        r"\badvance(?: payment)?\b",
        r"\bbkash paid\b",
        r"\bnagad paid\b",
        r"\bcard paid\b",
        r"\bonline paid\b",
        r"\bpayment done\b",
        r"\bpaid\b",
        r"পেমেন্ট করা",
        r"আগে পেমেন্ট",
        r"অগ্রিম",
    ]
    matches = []
    for pattern in cod_patterns:
        for match in re.finditer(pattern, text, re.UNICODE):
            matches.append((match.start(), "COD", pattern == r"\bcod\b"))
    for pattern in prepaid_patterns:
        for match in re.finditer(pattern, text, re.UNICODE):
            matches.append((match.start(), "Prepaid", False))
    if not matches:
        return
    exact_cod = [item for item in matches if item[2]]
    selected = max(exact_cod or matches, key=lambda item: item[0])
    order["payment_type"] = selected[1]
    _add_detected(detected, "payment_type")


def _detect_amount(text, order, detected):
    patterns = [
        r"\b(?:amount|price|value|total|order value)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\s*k\b",
        r"\b(?:tk|taka)\s*(\d+(?:\.\d+)?)\s*k?\b",
        r"\b(\d+(?:\.\d+)?)\s*k\s*(?:tk|taka)?\b",
        r"\b(\d+(?:\.\d+)?)\s*(?:tk|taka)\b",
        r"\b(\d+(?:\.\d+)?)\s*/-",
        r"\b(?:amount|price|value|total|order value)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            value = match.group(1)
            amount = _k_amount(value) if re.search(r"\bk\b", match.group(0)) else _to_number(value)
            if amount is not None:
                order["amount"] = amount
                _add_detected(detected, "amount")
                return
    large_numbers = []
    for match in re.finditer(r"\b(\d+(?:\.\d+)?)\b", text):
        value = _to_number(match.group(1))
        if value is None or value <= 300:
            continue
        after = text[match.end() : match.end() + 12]
        before = text[max(0, match.start() - 12) : match.start()]
        if re.search(r"^\s*(?:km|kilometer|kilometre)", after) or re.search(r"distance\s*$", before):
            continue
        large_numbers.append(value)
    if len(large_numbers) == 1:
        order["amount"] = large_numbers[0]
        _add_detected(detected, "amount")


def _detect_verification(text, order, detected):
    phone_no = [
        r"\bphone not verified\b",
        r"\bphone unverified\b",
        r"\bphone verify na\b",
        r"\bphone verified na\b",
        r"\bmobile verify na\b",
        r"\bnumber verify na\b",
        r"\bphone invalid\b",
        r"\binvalid phone\b",
        r"\bphone off\b",
        r"\bphone unreachable\b",
        r"ফোন ভেরিফাই না",
        r"মোবাইল ভেরিফাই না",
        r"ফোন বন্ধ",
    ]
    phone_yes = [
        r"\bphone verified\b",
        r"\bverified phone\b",
        r"\bmobile verified\b",
        r"\bnumber verified\b",
        r"\bvalid phone\b",
        r"ফোন ভেরিফাইড",
    ]
    if _has_any(text, phone_no):
        order["phone_verified"] = "No"
        _add_detected(detected, "phone_verified")
    elif _has_any(text, phone_yes):
        order["phone_verified"] = "Yes"
        _add_detected(detected, "phone_verified")

    email_no = [
        r"\bemail not verified\b",
        r"\bemail unverified\b",
        r"\bemail verify na\b",
        r"\bfake email\b",
        r"\binvalid email\b",
    ]
    email_yes = [r"\bemail verified\b", r"\bvalid email\b"]
    if _has_any(text, email_no):
        order["email_verified"] = "No"
        _add_detected(detected, "email_verified")
    elif _has_any(text, email_yes):
        order["email_verified"] = "Yes"
        _add_detected(detected, "email_verified")


def _detect_address(text, order, detected):
    no_patterns = [
        r"\baddress not complete\b",
        r"\baddress incomplete\b",
        r"\bincomplete address\b",
        r"\baddress missing\b",
        r"\bmissing address\b",
        r"\baddress nai\b",
        r"\bthikana nai\b",
        r"\bthikana incomplete\b",
        r"\bwrong address\b",
        r"\bvague address\b",
        r"\bpartial address\b",
        r"\bhalf address\b",
        r"ঠিকানা নাই",
        r"ঠিকানা অসম্পূর্ণ",
        r"ভুল ঠিকানা",
    ]
    yes_patterns = [
        r"\baddress complete\b",
        r"\bfull address\b",
        r"\bverified address\b",
        r"\bcorrect address\b",
        r"\bcomplete address\b",
        r"ঠিকানা ঠিক আছে",
        r"ঠিকানা সম্পূর্ণ",
    ]
    if _has_any(text, no_patterns):
        order["address_complete"] = "No"
        _add_detected(detected, "address_complete")
    elif _has_any(text, yes_patterns):
        order["address_complete"] = "Yes"
        _add_detected(detected, "address_complete")


def _detect_distance(text, order, detected):
    patterns = [
        r"\b(\d+(?:\.\d+)?)\s*(?:km|kilometer|kilometers|kilometre|kilometres)\b",
        r"\b(?:distance|delivery distance)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            order["distance_km"] = _to_number(match.group(1))
            _add_detected(detected, "distance_km")
            return
    if _has_any(text, [r"\blong distance\b", r"\bfar delivery\b", r"\bfar away\b", r"\bonek dure\b", r"অনেক দূর"]):
        order["distance_km"] = 60
        _add_detected(detected, "distance_km")
    elif _has_any(text, [r"\bnearby\b", r"\bnear\b", r"\bclose\b", r"\bkache\b", r"কাছে"]):
        order["distance_km"] = 8
        _add_detected(detected, "distance_km")


def _detect_history(text, order, detected):
    no_return = [
        r"\bno previous returns?\b",
        r"\bno return history\b",
        r"\bnever returned\b",
        r"আগে return করে নাই",
    ]
    return_patterns = [
        r"\bprevious returns?\s*(\d+)?",
        r"\breturn history\s*(\d+)?",
        r"\breturned before\b",
        r"\bbefore return\b",
        r"\bage return korse\b",
        r"\bageo return korse\b",
        r"\bpreviously returned\b",
        r"আগেও return করেছে",
        r"আগে রিটার্ন করেছে",
        r"\breturn history ache\b",
    ]
    if _has_any(text, no_return):
        order["previous_returns"] = 0
        _add_detected(detected, "previous_returns")
    else:
        for pattern in return_patterns:
            match = re.search(pattern, text, re.UNICODE)
            if match:
                number = _find_first_number(match.group(0))
                order["previous_returns"] = int(number if number is not None else 1)
                _add_detected(detected, "previous_returns")
                break

    order_patterns = [
        r"\bprevious orders?\s*(\d+)",
        r"\bordered before\s*(\d+)?",
        r"\b(\d+)\s*previous orders?\b",
        r"\bold customer\s*(\d+)?\s*orders?\b",
        r"\bregular customer\s*(\d+)?\s*orders?\b",
    ]
    for pattern in order_patterns:
        match = re.search(pattern, text)
        if match:
            number = _find_first_number(match.group(0))
            order["previous_orders"] = int(number if number is not None else 3)
            _add_detected(detected, "previous_orders")
            break


def _detect_order_hour(text, order, detected):
    match = re.search(r"\b(\d{1,2})(?::\d{2})?\s*(am|pm)\b", text)
    if match:
        hour = int(match.group(1))
        period = match.group(2)
        if period == "am":
            hour = 0 if hour == 12 else hour
        else:
            hour = 12 if hour == 12 else hour + 12
        order["order_hour"] = hour % 24
        _add_detected(detected, "order_hour")
        return
    match = re.search(r"\b(?:order at|ordered at|time)\s*(\d{1,2})(?::\d{2})?\b", text)
    if match:
        order["order_hour"] = int(match.group(1)) % 24
        _add_detected(detected, "order_hour")
        return
    match = re.search(r"\b([01]?\d|2[0-3]):\d{2}\b", text)
    if match:
        order["order_hour"] = int(match.group(1))
        _add_detected(detected, "order_hour")
        return
    bangla_night = re.search(r"রাত\s*(\d{1,2})\s*ta", text)
    if bangla_night:
        hour = int(bangla_night.group(1))
        order["order_hour"] = 0 if hour == 12 else (hour + 12 if hour < 12 else hour)
        _add_detected(detected, "order_hour")
        return
    time_words = [
        (r"\blate night\b", 23),
        (r"\bnight\b", 23),
        (r"\bmidnight\b", 0),
        (r"\bmorning\b", 10),
        (r"\bafternoon\b", 15),
        (r"\bevening\b", 19),
    ]
    for pattern, hour in time_words:
        if re.search(pattern, text):
            order["order_hour"] = hour
            _add_detected(detected, "order_hour")
            return


def _detect_customer(text, order, detected):
    new_patterns = [
        r"\bnew customer\b",
        r"\bnew user\b",
        r"\bfirst order\b",
        r"\bfirst time\b",
        r"\bnot ordered before\b",
        r"নতুন customer",
        r"নতুন কাস্টমার",
    ]
    returning_patterns = [
        r"\breturning customer\b",
        r"\bold customer\b",
        r"\bregular customer\b",
        r"\bloyal customer\b",
        r"\bordered before\b",
        r"\brepeat customer\b",
        r"পুরনো customer",
        r"রেগুলার customer",
    ]
    if _has_any(text, returning_patterns):
        order["customer_type"] = "Returning"
        _add_detected(detected, "customer_type")
    elif _has_any(text, new_patterns):
        order["customer_type"] = "New"
        _add_detected(detected, "customer_type")


def _detect_coupon(text, order, detected):
    coupon_patterns = [r"\bcoupon\b", r"\bdiscount\b", r"\bvoucher\b", r"\bpromo\b", r"\boffer\b", r"ছাড়", r"ডিসকাউন্ট"]
    if not _has_any(text, coupon_patterns):
        return
    order["coupon_used"] = "Yes"
    _add_detected(detected, "coupon_used")
    match = re.search(r"\b(?:discount|coupon)\s*(?:is|=|:)?\s*(\d+(?:\.\d+)?)\b|\b(\d+(?:\.\d+)?)\s*(?:tk|taka)?\s*discount\b", text)
    amount = _to_number(next((group for group in match.groups() if group), None)) if match else None
    order["discount_amount"] = amount if amount is not None else 100
    _add_detected(detected, "discount_amount")


def _detect_product(text, order, detected):
    categories = [
        (r"\belectronics?\b", "Electronics"),
        (r"\bfashion\b|\bclothing\b|\bclothes\b", "Fashion"),
        (r"\bbeauty\b|\bcosmetic\b", "Beauty"),
        (r"\bhome\b", "Home"),
        (r"\bfurniture\b", "Furniture"),
        (r"\baccessories\b", "Accessories"),
        (r"\bappliances?\b", "Appliances"),
        (r"\bgrocery\b", "Grocery"),
        (r"\bbooks\b", "Books"),
        (r"\btoy\b|\bkids\b", "Toys"),
    ]
    for pattern, category in categories:
        if re.search(pattern, text):
            order["product_category"] = category
            _add_detected(detected, "product_category")
            break
    match = re.search(r"\b(?:product is|item is|selling|order for)\s+([^.,;]{2,50})", text)
    if match:
        name = match.group(1).strip()
        if name:
            order["product_name"] = name.title()
            _add_detected(detected, "product_name")


def _detect_quantity(text, order, detected):
    patterns = [
        r"\b(?:qty|quantity)\s*(\d{1,2})\b",
        r"\b(\d{1,2})\s*(?:pcs|pieces|ta)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            quantity = int(match.group(1))
            if 1 <= quantity <= 20:
                order["quantity"] = quantity
                _add_detected(detected, "quantity")
                return


def _detect_account_age(text, order, detected):
    match = re.search(r"\baccount age\s*(\d+)\s*(days?|months?|years?)\b|\baccount\s*(\d+)\s*(days?|months?|years?)\s*old\b|\b(?:new|old) account\s*(\d+)?\s*(days?|months?|years?)?\b", text)
    if match:
        groups = [group for group in match.groups() if group]
        number = next((int(group) for group in groups if group.isdigit()), None)
        unit = next((group for group in groups if not group.isdigit()), "days")
        if number is None:
            number = 5 if "new account" in match.group(0) else 180
            unit = "days"
        multiplier = 365 if unit.startswith("year") else 30 if unit.startswith("month") else 1
        order["account_age_days"] = number * multiplier
        _add_detected(detected, "account_age_days")


def _detect_stock_sales(text, order, detected):
    stock_patterns = [
        r"\b(?:current stock|stock)\s*(\d+)\b",
        r"\b(\d+)\s*stock left\b",
        r"\bonly\s*(\d+)\s*left\b",
    ]
    for pattern in stock_patterns:
        match = re.search(pattern, text)
        if match:
            order["current_stock"] = int(match.group(1))
            _add_detected(detected, "current_stock")
            break
    sales_patterns = [
        r"\b(?:daily sales|avg daily sales)\s*(\d+)\b",
        r"\bsells\s*(\d+)\s*per day\b",
        r"\b(\d+)\s*/\s*day\b",
    ]
    for pattern in sales_patterns:
        match = re.search(pattern, text)
        if match:
            order["avg_daily_sales"] = int(match.group(1))
            _add_detected(detected, "avg_daily_sales")
            break


def parse_order_text(message: str) -> dict:
    text = normalize_text(message)
    order = DEFAULT_ORDER.copy()
    detected_fields = []

    try:
        _detect_payment(text, order, detected_fields)
        _detect_distance(text, order, detected_fields)
        _detect_amount(text, order, detected_fields)
        _detect_verification(text, order, detected_fields)
        _detect_address(text, order, detected_fields)
        _detect_history(text, order, detected_fields)
        _detect_order_hour(text, order, detected_fields)
        _detect_customer(text, order, detected_fields)
        _detect_coupon(text, order, detected_fields)
        _detect_product(text, order, detected_fields)
        _detect_quantity(text, order, detected_fields)
        _detect_account_age(text, order, detected_fields)
        _detect_stock_sales(text, order, detected_fields)
    except (TypeError, ValueError, AttributeError, re.error) as exc:
        return {
            "parsed_order": order,
            "detected_fields": detected_fields,
            "missing_fields": [field for field in IMPORTANT_FIELDS if field not in detected_fields],
            "parser_confidence": "low",
            "parser_notes": [f"Parser used safe defaults because some text could not be parsed: {exc}"],
        }

    important_count = len([field for field in IMPORTANT_FIELDS if field in detected_fields])
    if important_count >= 5:
        confidence = "high"
    elif important_count >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    missing_fields = [field for field in IMPORTANT_FIELDS if field not in detected_fields]
    parser_notes = []
    if confidence == "low":
        parser_notes.append(
            "For better accuracy, add amount, payment type, phone/address status, distance, previous return, and order time."
        )
    if "amount" in missing_fields:
        parser_notes.append("Amount was not detected, so 0 was used as default.")
    if "payment_type" in missing_fields:
        parser_notes.append("Payment type was not detected, so Prepaid was used as default.")

    return {
        "parsed_order": order,
        "detected_fields": detected_fields,
        "missing_fields": missing_fields,
        "parser_confidence": confidence,
        "parser_notes": parser_notes,
    }
