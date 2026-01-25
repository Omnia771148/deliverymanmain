"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Italianno } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure bootstrap is here too if needed, or rely on layout
// 1. IMPORT YOUR LOADING COMPONENT
import Loading from "../../loading/page";
import "./login.css";

const italianno = Italianno({
  weight: "400",
  subsets: ["latin"]
});

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
      localStorage.setItem("deliveryBoyName", matchedUser.name);
      localStorage.setItem("deliveryBoyPhone", matchedUser.phone);
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
    <div className="login-container">
      {/* Split Background */}
      <div className="split-background">
        <div className="left-pane"></div>
        <div className="right-pane"></div>
      </div>

      {/* Main Content Container */}
      <div className="content-wrapper">

        {/* Hello Header */}
        <div className="header-card">
          <h1 className={`hello-text ${italianno.className}`}>
            Hello
          </h1>
        </div>

        {/* Inputs Container */}
        <div className="inputs-container">

          {/* Mobile Input */}
          <div className="input-wrapper">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Mobile number"
              className="input-field"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="input-wrapper">
            <div className="icon icon-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Password"
              className="input-field input-field-red-placeholder"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
            />
          </div>

          {/* Forget Password */}
          <div className="forgot-password-container">
            <button className="forgot-password-button">
              Forget password ?
            </button>
          </div>

        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="login-button"
        >
          Login
        </button>

        {/* Footer */}
        <div className="footer">
          <span>Don&rsquo;t have account? </span>
          <button
            onClick={() => window.location.href = "/deliveryboy/signup"}
            className="create-account-button"
          >
            create
          </button>
        </div>

        {/* Debug Info */}
        {loggedInUserId && (
          <div className="debug-info">
            ID: {loggedInUserId}
          </div>
        )}

      </div>
    </div>
  );
}