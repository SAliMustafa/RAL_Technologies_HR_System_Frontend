import { useAuth } from "../../context/AuthContext"

function Dashboard({  }) {
  const {user} = useAuth()
  return (
    <div>
        <h1> Welcom admin {user.username}</h1>
    </div>
  )
}

export default Dashboard