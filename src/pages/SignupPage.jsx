import { useState } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../services/authService";
import { useTranslation } from "react-i18next";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConf: "",
  });
  const [ submitting, setSubmitting ] = useState(false)

  const { username, password, passwordConf } = formData;
  const { t } = useTranslation();

  function handleChange(event){
    setError("");
    setFormData({ ...formData, [event.target.name]: event.target.value });

  }


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      await signUp(formData);
      navigate("/sign-in");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function isFormInvalid(){
    return !(username && password && password === passwordConf);
  };

  return (
    <main>
      <h1>{t('auth.signUp.title')}</h1>
      <p className="error">{error}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">{t('auth.signUp.username')}:</label>
          <input
            type="text"
            id="username"
            value={username}
            name="username"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">{t('auth.signUp.password')}:</label>
          <input
            type="password"
            id="password"
            value={password}
            name="password"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="confirm">{t('auth.signUp.confirmPassword')}:</label>
          <input
            type="password"
            id="confirm"
            value={passwordConf}
            name="passwordConf"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button >sign up</button>
          <button onClick={() => navigate("/")}>{t('auth.signUp.cancel')}</button>
        </div>
      </form>
    </main>
  );
}
export default Signup;
