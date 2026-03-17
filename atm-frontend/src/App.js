import React, { useState } from "react";

const API_BASE = "https://atm-backend-g01t.onrender.com";

function App() {

  const [page, setPage] = useState("home");
  const [accountId, setAccountId] = useState(null);

  const [card, setCard] = useState("");
  const [pin, setPin] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");

  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [aiCommand, setAiCommand] = useState("");

  const handleAICommand = async () => {
  const res = await fetch(`${API_BASE}/ai-command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      account_id: accountId,
      command: aiCommand
    })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.message);
    setBalance(data.current_balance);
    setAiCommand("");
  } else {
    alert(data.detail);
  }
};

  const handleRegister = async () => {

    const res = await fetch(`${API_BASE}/accounts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        card_number: card,
        pin: pin,
        initial_deposit: parseFloat(initialDeposit)
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Account Created Successfully!");
      setPage("login");
    } else {
      alert(data.detail);
    }
  };



  const handleLogin = async () => {

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        card_number: card,
        pin: pin
      })
    });

    const data = await res.json();

    if (res.ok) {
      setAccountId(data.account_id);
      setPage("dashboard");
    } else {
      alert(data.detail);
    }
  };



  const fetchBalance = async () => {

    const res = await fetch(`${API_BASE}/accounts/${accountId}/balance`);
    const data = await res.json();

    setBalance(data.balance);
    setActiveSection("balance");
  };



  const deposit = async () => {

    const res = await fetch(`${API_BASE}/accounts/${accountId}/deposit`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        amount: parseFloat(amount)
      })

    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setBalance(data.current_balance);
      setAmount("");
    } else {
      alert(data.detail);
    }
  };



  const withdraw = async () => {

    const res = await fetch(`${API_BASE}/accounts/${accountId}/withdraw`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        amount: parseFloat(amount)
      })

    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      setBalance(data.current_balance);
      setAmount("");
    } else {
      alert(data.detail);
    }
  };



  const fetchStatement = async () => {

    const res = await fetch(`${API_BASE}/accounts/${accountId}/transactions`);
    const data = await res.json();

    setTransactions(data);
    setActiveSection("statement");
  };



  if (page === "home") {
    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400">

        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center w-96">

          <h1 className="text-3xl font-bold mb-6 text-blue-700">
            ATM System
          </h1>

          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 hover:bg-blue-700"
            onClick={() => setPage("login")}
          >
            Login
          </button>


          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            onClick={() => setPage("register")}
          >
            Create Account
          </button>

        </div>

      </div>
    );
  }



  if (page === "register") {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400">

        <div className="bg-white p-10 rounded-2xl shadow-2xl w-96">

          <h1 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h1>


          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Card Number"
            onChange={(e) => setCard(e.target.value)}
          />


          <input
            className="w-full border p-2 rounded mb-3"
            type="password"
            placeholder="PIN"
            onChange={(e) => setPin(e.target.value)}
          />


          <input
            className="w-full border p-2 rounded mb-4"
            type="number"
            placeholder="Initial Deposit"
            onChange={(e) => setInitialDeposit(e.target.value)}
          />


          <button
            className="w-full bg-green-600 text-white py-2 rounded mb-2 hover:bg-green-700"
            onClick={handleRegister}
          >
            Create
          </button>


          <button
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            onClick={() => setPage("home")}
          >
            Back
          </button>

        </div>

      </div>

    );
  }



  if (page === "login") {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-400">

        <div className="bg-white p-10 rounded-2xl shadow-2xl w-96">

          <h1 className="text-2xl font-bold mb-6 text-center">
            Login
          </h1>


          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Card Number"
            onChange={(e) => setCard(e.target.value)}
          />


          <input
            className="w-full border p-2 rounded mb-4"
            type="password"
            placeholder="PIN"
            onChange={(e) => setPin(e.target.value)}
          />


          <button
            className="w-full bg-purple-600 text-white py-2 rounded mb-2 hover:bg-purple-700"
            onClick={handleLogin}
          >
            Login
          </button>


          <button
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            onClick={() => setPage("home")}
          >
            Back
          </button>

        </div>

      </div>

    );
  }



  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-10 flex justify-center">

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">

        <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
          ATM Dashboard
        </h1>


        <div className="flex flex-wrap justify-center gap-4 mb-8">

          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={fetchBalance}
          >
            Balance
          </button>


          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => setActiveSection("deposit")}
          >
            Deposit
          </button>


          <button
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={() => setActiveSection("withdraw")}
          >
            Withdraw
          </button>


          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={fetchStatement}
          >
            Statement
          </button>

        </div>



        {activeSection === "balance" && (

          <div className="bg-blue-50 p-6 rounded-xl text-center">

            <h2 className="text-2xl font-semibold text-blue-700">
              Current Balance
            </h2>

            <p className="text-4xl font-bold text-green-600 mt-3">
              ${balance}
            </p>

          </div>

        )}



        {activeSection === "deposit" && (

          <div className="bg-green-50 p-6 rounded-xl text-center">

            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Deposit Money
            </h2>


            <input
              className="border rounded-lg px-4 py-2 w-60 mb-4"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <br />

            <button
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={deposit}
            >
              Confirm Deposit
            </button>

          </div>

        )}



        {activeSection === "withdraw" && (

          <div className="bg-red-50 p-6 rounded-xl text-center">

            <h2 className="text-xl font-semibold mb-4 text-red-700">
              Withdraw Money
            </h2>


            <input
              className="border rounded-lg px-4 py-2 w-60 mb-4"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <br />

            <button
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={withdraw}
            >
              Confirm Withdrawal
            </button>

          </div>

        )}



        {activeSection === "statement" && (

          <div className="mt-6">

            <h2 className="text-2xl font-semibold mb-4 text-center text-purple-700">
              Transaction Statement
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full border rounded-lg">

                <thead className="bg-purple-600 text-white">

                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Before</th>
                    <th className="p-3">After</th>
                    <th className="p-3">Timestamp</th>
                  </tr>

                </thead>

                <tbody>

                  {transactions.map((t) => (

                    <tr key={t.id} className="text-center border-b hover:bg-gray-50">

                      <td className="p-3">{t.type}</td>
                      <td className="p-3">${t.amount}</td>
                      <td className="p-3">${t.balance_before}</td>
                      <td className="p-3">${t.balance_after}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {t.timestamp}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}
        <div className="bg-yellow-50 p-6 rounded-xl text-center mt-6">
  <h2 className="text-xl font-semibold mb-3 text-yellow-700">
    AI Command
  </h2>

  <input
    className="border rounded-lg px-4 py-2 w-80 mb-4"
    placeholder="Type: deposit 500 or withdraw 200"
    value={aiCommand}
    onChange={(e) => setAiCommand(e.target.value)}
  />

  <br />

  <button
    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
    onClick={handleAICommand}
  >
    Execute
  </button>
</div>


        <div className="flex justify-center mt-8">

          <button
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            onClick={() => {
              setAccountId(null);
              setPage("home");
            }}
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;