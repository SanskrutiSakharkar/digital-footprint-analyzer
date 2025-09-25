import json, csv, io, base64
from datetime import datetime

CATEGORY_RULES = {
    "Social Media": ["facebook","instagram","twitter","x.com","snapchat","tiktok","pinterest","reddit","discord","yahoo"],
    "E-Commerce": ["amazon","flipkart","ebay","etsy","shopify","aliexpress","myntra"],
    "Banking": ["bank","chase","hdfc","sbi","icici","barclays","boa","capitalone","wellsfargo","kotak"],
    "Professional": ["linkedin","github","gitlab","bitbucket","slack","zoom","notion","asana","jira"],
    "Google Services": ["google","gmail","youtube","drive","workspace","g suite"],
    "Streaming": ["netflix","primevideo","hotstar","disney","hulu","spotify","apple music"],
    "Education": ["coursera","udemy","edx","khan","byjus","unacademy"]
}

def classify_service(service):
    if not service: return "Uncategorized"
    s = service.strip().lower()
    for cat, needles in CATEGORY_RULES.items():
        for n in needles:
            if n in s:
                return cat
    return "Uncategorized"

def parse_date(s):
    for fmt in ("%Y-%m-%d","%d/%m/%Y","%m/%d/%Y"):
        try: return datetime.strptime(s,fmt)
        except: pass
    return None

def risk_score(created_dt, pwd_dt, last_login_dt, now):
    score, notes = 0, []
    if created_dt and (now - created_dt).days > 365*5:
        score+=2; notes.append("Old account >5y")
    if pwd_dt and (now - pwd_dt).days > 365*2:
        score+=3; notes.append("Password stale >2y")
    if last_login_dt and (now - last_login_dt).days > 365*2:
        score+=2; notes.append("Inactive >2y")
    return score, notes

def lambda_handler(event, context):
    try:
        body = event.get("body","")
        if event.get("isBase64Encoded"):
            body = base64.b64decode(body).decode("utf-8")
        else:
            if isinstance(body, (bytes,bytearray)): body = body.decode("utf-8")
        text = body.strip()
    except Exception as e:
        return {"statusCode":400,"body":json.dumps({"error":"Decoding failed","details":str(e)}),
                "headers":{"Access-Control-Allow-Origin":"*"}}

    # try JSON
    records = []
    try:
        data = json.loads(text)
        if isinstance(data,dict) and "accounts" in data: records=data["accounts"]
        elif isinstance(data,dict): records=[data]
        elif isinstance(data,list): records=data
    except:
        try:
            reader = csv.DictReader(io.StringIO(text))
            records = [row for row in reader]
        except Exception as e:
            return {"statusCode":400,"body":json.dumps({"error":"Unsupported format","details":str(e)}),
                    "headers":{"Access-Control-Allow-Origin":"*"}}

    categories, year_counts = {}, {}
    password_warnings, inactive_accounts = [], []
    age_brackets = {"<1 year":0,"1-3 years":0,">3 years":0}
    enriched_accounts, risk_buckets = [], {"Low":0,"Medium":0,"High":0}
    oldest_date, now = None, datetime.today()

    for rec in records:
        service = rec.get("Service") or rec.get("service")
        cat = rec.get("Category") or rec.get("category") or classify_service(service)
        categories[cat] = categories.get(cat,0)+1

        signup = rec.get("SignupDate") or rec.get("signup_date") or rec.get("created")
        dt = parse_date(signup) if signup else None
        if dt:
            if not oldest_date or dt<oldest_date: oldest_date=dt
            year_counts[dt.year]=year_counts.get(dt.year,0)+1
            years=(now-dt).days/365.25
            if years<1: age_brackets["<1 year"]+=1
            elif years<=3: age_brackets["1-3 years"]+=1
            else: age_brackets[">3 years"]+=1

        pwd_update = rec.get("LastPasswordUpdate") or rec.get("last_password_update")
        pdt=parse_date(pwd_update) if pwd_update else None
        if pdt and (now-pdt).days>365: password_warnings.append(service)

        last_login = rec.get("LastLogin") or rec.get("last_login")
        ldt=parse_date(last_login) if last_login else None
        if ldt and (now-ldt).days>730: inactive_accounts.append(service)

        score, notes = risk_score(dt,pdt,ldt,now)
        level="Low"
        if score>=5: level="High"
        elif score>=2: level="Medium"
        risk_buckets[level]+=1

        enriched_accounts.append({
            "service": service or "",
            "category": cat,
            "created": signup or "",
            "last_password_update": pwd_update or "",
            "last_login": last_login or "",
            "risk_score": score,
            "risk_level": level,
            "risk_notes": notes
        })

    insights=[]
    if risk_buckets["High"]>0: insights.append(f"{risk_buckets['High']} high-risk account(s) found.")
    if password_warnings: insights.append("Some accounts need password updates.")
    if inactive_accounts: insights.append("Inactive accounts detected; review for deletion.")

    summary={
        "total_accounts":len(records),
        "accounts_by_category":categories,
        "oldest_account":oldest_date.strftime("%Y-%m-%d") if oldest_date else None,
        "accounts_per_year":year_counts,
        "password_hygiene_warnings":password_warnings,
        "inactive_accounts":inactive_accounts,
        "account_age_distribution":age_brackets,
        "enriched_accounts":enriched_accounts,
        "risk_breakdown":risk_buckets,
        "risk_average": round(sum(a["risk_score"] for a in enriched_accounts)/len(enriched_accounts),2) if enriched_accounts else 0.0,
        "insights":insights
    }

    return {"statusCode":200,"body":json.dumps(summary),
            "headers":{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*","Access-Control-Allow-Methods":"OPTIONS,POST"}}
