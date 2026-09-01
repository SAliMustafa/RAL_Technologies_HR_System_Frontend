// src/components/SignInForm/SignInForm.jsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router";

import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "../components/css/SignInForm.css";

const SignInForm = ({}) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { t } = useTranslation();
  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const signedInUser = await signIn(formData);

      setUser(signedInUser);
      console.log(signedInUser.role);

      if (signedInUser.role === "employee") {
        navigate("/dashboard-employee");
      } else if (signedInUser.role === "hr_admin") {
        navigate("/dashboard-admin");
      } else if (signedInUser.role === "manager") {
        navigate("/dashboard-manager");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log(`Error: ${err}`);
      setError(err?.response?.data?.message);
    }
  }

  return (
    <main className="signin-page">
      <section className="signin-card">
        <div className="signin-header">
          <h1>{t("auth.signIn.title")}</h1>
          <p className="signin-subtitle">Sign in to access the RAL HR System</p>
        </div>

        {error && <p className="error">⚠ {error}</p>}

        <form
          className="signin-form"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="username">{t("auth.signIn.username")}</label>

            <input
              type="text"
              autoComplete="off"
              id="username"
              value={formData.username}
              name="username"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("auth.signIn.password")}</label>

            <input
              type="password"
              autoComplete="off"
              id="password"
              value={formData.password}
              name="password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="signin-actions">
            <button type="submit" className="signin-btn">
              {t("auth.signIn.submit")}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/")}
            >
              {t("auth.signIn.cancel")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SignInForm;
