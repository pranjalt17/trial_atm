from decimal import Decimal

def show_main_menu():
    print("\n1. Create Account\n2. Login\n3. Exit")
    return input("Select: ")

def show_atm_menu():
    print("\n1. Balance\n2. Withdraw\n3. Deposit\n4. Statement\n5. Exit")
    return input("Choose: ")

def get_card_number():
    return input("Enter card number: ")

def get_pin():
    return input("Set PIN: ")

def get_card_and_pin():
    card = input("Card number: ")
    pin = input("PIN: ")
    return card, pin

def get_deposit_amount():
    return Decimal(input("Initial deposit: "))

def get_withdraw_amount():
    return Decimal(input("Withdraw amount: "))

def get_deposit_amount_operation():
    return Decimal(input("Deposit amount: "))

def show_balance(balance):
    print("Balance:", balance)

def show_statement_header():
    print("\n--- Statement ---")

def show_transaction(t):
    print(f"{t.created_at} | {t.transaction_type} | {t.amount} | Before: {t.balance_before} | After: {t.balance_after}")

def show_account_created():
    print(" Account created")

def show_deposit_success():
    print(" Deposited")

def show_withdraw_success():
    print(" Withdrawn")

def show_invalid_amount():
    print("Invalid amount")

def show_insufficient_balance():
    print(" Insufficient balance")

def show_invalid_credentials():
    print("Invalid credentials")

def show_invalid_choice():
    print("Invalid choice")