from sqlalchemy import create_engine, Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

engine = create_engine(
    "postgresql://atm_user:tpBw2E2lZAFlnIzUrJxJfrnAMja1E29V@dpg-d6nurengi27c73achbkg-a.oregon-postgres.render.com/atm_db_q6ig",
    echo=False
)

Session = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    card_number = Column(String(16), unique=True, nullable=False)
    pin = Column(String(6), nullable=False)

    account = relationship("Account", back_populates="user", uselist=False)


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Numeric(10, 2), default=0)

    user = relationship("User", back_populates="account")
    transactions = relationship("Transaction", back_populates="account")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    transaction_type = Column(String(10))
    amount = Column(Numeric(10, 2))
    balance_before = Column(Numeric(10, 2))
    balance_after = Column(Numeric(10, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")


def init_db():
    Base.metadata.create_all(engine)
    return Session()