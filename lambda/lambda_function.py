import json
import csv
import io
import base64
from datetime import datetime

def lambda_handler(event, context):
    # 1. Decode base64 file content
    try:
        file_content = base64.b64decode(event['body'])
    except Exception as e:
        return {'statusCode': 400, 'body': json.dumps({'error': 'File decoding failed', 'details': str(e)})}

    # 2. Parse JSON or CSV
    try:
        records = json.loads(file_content)
        if isinstance(records, dict) and 'accounts' in records:
            records = records['accounts']
        elif isinstance(records, dict):
            records = [records]
        elif isinstance(records, list):
            pass  # records is already a list!
        else:
            records = []  # empty fallback
    except Exception:
        try:
            file_io = io.StringIO(file_content.decode('utf-8'))
            reader = csv.DictReader(file_io)
            records = [row for row in reader]
        except Exception as e:
            return {'statusCode': 400, 'body': json.dumps({'error': 'Unsupported file format', 'details': str(e)})}

    # 3. Initialize summary data
    categories = {}
    oldest_date = None
    year_counts = {}
    password_warnings = []
    inactive_accounts = []
    age_brackets = {"<1 year": 0, "1-3 years": 0, ">3 years": 0}

    # 4. Analyze all records
    for rec in records:
        cat = rec.get('Category') or rec.get('category')
        if cat:
            categories[cat] = categories.get(cat, 0) + 1

        signup = rec.get('SignupDate') or rec.get('signup_date')
        if signup:
            try:
                dt = datetime.strptime(signup, "%Y-%m-%d")
                if oldest_date is None or dt < oldest_date:
                    oldest_date = dt
                year_counts[dt.year] = year_counts.get(dt.year, 0) + 1
                years = (datetime.today() - dt).days / 365.25
                if years < 1:
                    age_brackets["<1 year"] += 1
                elif years <= 3:
                    age_brackets["1-3 years"] += 1
                else:
                    age_brackets[">3 years"] += 1
            except Exception:
                continue

        pwd_update = rec.get('LastPasswordUpdate') or rec.get('last_password_update')
        if pwd_update:
            try:
                pwd_dt = datetime.strptime(pwd_update, "%Y-%m-%d")
                if (datetime.today() - pwd_dt).days > 365:
                    password_warnings.append(rec.get('Service') or rec.get('service'))
            except Exception:
                continue

        last_login = rec.get('LastLogin') or rec.get('last_login')
        if last_login:
            try:
                login_dt = datetime.strptime(last_login, "%Y-%m-%d")
                if (datetime.today() - login_dt).days > 730:
                    inactive_accounts.append(rec.get('Service') or rec.get('service'))
            except Exception:
                continue

    # 5. Build summary dictionary
    summary = {
        "total_accounts": len(records),
        "accounts_by_category": categories,
        "oldest_account": oldest_date.strftime("%Y-%m-%d") if oldest_date else None,
        "accounts_per_year": year_counts,
        "password_hygiene_warnings": password_warnings,
        "inactive_accounts": inactive_accounts,
        "account_age_distribution": age_brackets
    }

    # 6. Return summary as JSON response
    return {
        'statusCode': 200,
        'body': json.dumps(summary),
        'headers': {'Content-Type': 'application/json'}
    }

