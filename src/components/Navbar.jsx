import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();

  const { logout, user} = useAuth()
  return (
    <nav>
      <Link to='/'>{t('nav.home')}</Link>
      {user 
      ? 
      (<>
      <Link to='/attendance'>{t('nav.attendance')}</Link>
      <button onClick={logout}>{t('nav.signOut')}</button>
      </>) : 
      (<>
        <Link to='/sign-up'>{t('nav.signUp')}</Link>
        <Link to='/sign-in'>{t('nav.signIn')}</Link>
      </>)}
    {/* <LanguageSwitcher /> */}

    </nav>
  )
}

export default Navbar