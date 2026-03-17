from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import Session, init_db, User, Account, Transaction
from decimal import Decimal
from pydantic import BaseModel
import google as genai
import os
import json
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

# ✅ Correct Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ------------------ SCHEMAS ------------------

class CardAndPin(BaseModel):
    card_number: str
    pin: str

class AmountRequest(BaseModel):
    amount: Decimal

class CreateAccountRequest(BaseModel):
    card_number: str
    pin: str
    initial_deposit: Decimal

class AICommandRequest(BaseModel):
    account_id: int
    command: str

# ------------------ AI COMMAND ------------------

@app.post("/ai-command")
def ai_command(req: AICommandRequest, db: Session = Depends(get_db)):
    try:
        prompt = f"""
        You are a banking assistant.

        Extract action and amount from:
        "{req.command}"

        Return ONLY JSON:
        {{
            "action": "deposit or withdraw",
            "amount": number
        }}
        """

        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )

        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(text)

        action = parsed["action"].lower()
        amount = Decimal(parsed["amount"])

    except Exception as e:
        print("AI ERROR:", str(e))
        raise HTTPException(status_code=400, detail="AI parsing failed")

    # Fetch account
    account = db.query(Account).filter_by(id=req.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Perform action
    if action == "deposit":
        before = account.balance
        account.balance += amount

        transaction = Transaction(
            account_id=req.account_id,
            transaction_type="DEPOSIT",
            amount=amount,
            balance_before=before,
            balance_after=account.balance
        )

    elif action == "withdraw":
        if amount > account.balance:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        before = account.balance
        account.balance -= amount

        transaction = Transaction(
            account_id=req.account_id,
            transaction_type="WITHDRAW",
            amount=amount,
            balance_before=before,
            balance_after=account.balance
        )

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.add(transaction)
    db.commit()

    return {
        "message": f"{action} successful",
        "current_balance": float(account.balance)
    }

# ------------------ NORMAL APIs ------------------

@app.post("/accounts/create")
def create_account(request: CreateAccountRequest, db: Session = Depends(get_db)):

    if request.initial_deposit < 0:
        raise HTTPException(status_code=400, detail="Invalid deposit amount")

    existing_user = db.query(User).filter_by(card_number=request.card_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Card number already exists")

    new_user = User(card_number=request.card_number, pin=request.pin)
    new_account = Account(balance=request.initial_deposit, user=new_user)

    db.add(new_user)
    db.add(new_account)
    db.commit()

    return {"message": "Account created successfully"}


@app.post("/login")
def login(request: CardAndPin, db: Session = Depends(get_db)):

    user = db.query(User).filter_by(
        card_number=request.card_number,
        pin=request.pin
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid card number or PIN")

    return {
        "user_id": user.id,
        "account_id": user.account.id,
        "message": "Login successful"
    }


@app.get("/accounts/{account_id}/balance")
def get_balance(account_id: int, db: Session = Depends(get_db)):

    account = db.query(Account).filter_by(id=account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    return {"balance": float(account.balance)}


@app.post("/accounts/{account_id}/deposit")
def deposit(account_id: int, data: AmountRequest, db: Session = Depends(get_db)):

    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid deposit amount")

    account = db.query(Account).filter_by(id=account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    before = account.balance
    account.balance += data.amount

    transaction = Transaction(
        account_id=account_id,
        transaction_type="DEPOSIT",
        amount=data.amount,
        balance_before=before,
        balance_after=account.balance
    )

    db.add(transaction)
    db.commit()

    return {
        "message": "Amount deposited successfully",
        "current_balance": float(account.balance)
    }


@app.post("/accounts/{account_id}/withdraw")
def withdraw(account_id: int, data: AmountRequest, db: Session = Depends(get_db)):

    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid withdrawal amount")

    account = db.query(Account).filter_by(id=account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if data.amount > account.balance:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    before = account.balance
    account.balance -= data.amount

    transaction = Transaction(
        account_id=account_id,
        transaction_type="WITHDRAW",
        amount=data.amount,
        balance_before=before,
        balance_after=account.balance
    )

    db.add(transaction)
    db.commit()

    return {
        "message": "Amount withdrawn successfully",
        "current_balance": float(account.balance)
    }


@app.get("/accounts/{account_id}/transactions")
def get_transactions(account_id: int, db: Session = Depends(get_db)):

    account = db.query(Account).filter_by(id=account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    transactions = db.query(Transaction)\
        .filter_by(account_id=account_id)\
        .order_by(Transaction.created_at.desc())\
        .all()

    return [
        {
            "id": t.id,
            "type": t.transaction_type,
            "amount": float(t.amount),
            "balance_before": float(t.balance_before),
            "balance_after": float(t.balance_after),
            "timestamp": t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for t in transactions
    ]