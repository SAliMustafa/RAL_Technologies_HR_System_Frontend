import React from 'react'
import { useTranslation } from "react-i18next";


function Homepage() {
  const { t } = useTranslation()
  return (
    <div>{t('home.home')}</div>
  )
}

export default Homepage