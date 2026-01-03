"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
// 1. IMPORT YOUR LOADING COMPONENT
import Loading from "../../loading/page"; 

export default function Login() {
  const [users, setUsers] = useState([]); 
  const [inputPhone, setInputPhone] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const router = useRouter();

  useEffect(() => {
    
    const loggedInUser = localStorage.getItem("userId");
    const loginTime = localStorage.getItem("loginTimestamp");

    if (loggedInUser && loginTime) {
        const currentTime = new Date().getTime();
        const oneDayInMs = 1 * 24 * 60 * 60 * 1000;

        // CHANGED: Now comparing against oneDayInMs instead of sevenDays
        if (currentTime - loginTime < oneDayInMs) {
            window.location.href = "/orderspage";
            return; 
        } else {
            // Optional: Clear storage if the 1 day has passed
            localStorage.removeItem("userId");
            localStorage.removeItem("loginTimestamp");
        }
    }

    
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/deliveryboy/login"); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
            setUsers(data);
        } else {
            console.error("API did not return an array:", data);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to fetch users");
      } finally {
        setIsLoading(false); // Stop loading after fetch
      }
    };

    fetchUsers();

    const storedId = localStorage.getItem("userId");
    if (storedId) setLoggedInUserId(storedId);
  }, []);

  const handleLogin = () => {
    if (!inputPhone || !inputPassword) {
      alert("Please enter phone and password");
      return;
    }

    const matchedUser = users.find(
      (user) => user.phone === inputPhone && user.password === inputPassword
    );

    if (matchedUser) {
      localStorage.setItem("userId", matchedUser._id);
      localStorage.setItem("loginTimestamp", new Date().getTime().toString());
      
      setLoggedInUserId(matchedUser._id);
      alert("Login successful!");
      window.location.href = "/orderspage";
    } else {
      alert("Incorrect phone or password");
    }
  };

  // 2. DISPLAY LOADING COMPONENT
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h2>Delivery Boy Login (Old Method)</h2>

      <input
        type="text"
        placeholder="Phone"
        value={inputPhone}
        onChange={(e) => setInputPhone(e.target.value)}
        style={{ width: "100%", margin: "8px 0", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={inputPassword}
        onChange={(e) => setInputPassword(e.target.value)}
        style={{ width: "100%", margin: "8px 0", padding: "8px" }}
      />

      <button
        onClick={handleLogin}
        style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
      >
        Login
      </button>
      <button
        onClick={() => window.location.href = "/deliveryboy/signup"}
        style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
      >
       signup
      </button>

      {loggedInUserId && (
        <div style={{ marginTop: "20px" }}>
          <h3>Logged-in User ID:</h3>
          <p>{loggedInUserId}</p>
        </div>
      )}
    </div>
  );
}