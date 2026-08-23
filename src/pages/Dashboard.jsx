import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next";

function Dashboard({  }) {
  const { t } = useTranslation()
  const {user} = useAuth()
  return (
    <div>
        <h1>{t('dashboard.welcomeMessage')} {user.username}</h1>
    </div>
  )
}

export default Dashboard