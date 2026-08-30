
import api from './api'

async function signUp({username, password}){
    const response = await api.post('/auth/sign-up',{username, password})
}

async function signIn(formData){
    const response = await api.post('/auth/sign-in',{username, passsword})
    localStorage.setItem('token', response.data.accessToken);
    return response.data.user
}


async function getCurrentUser(){

    const response = await api.get(
        "/auth/me"
    );


    return response.data;

}



function logout(){

    localStorage.removeItem("token");

}

export {
  signUp,
  signIn,
  getCurrentUser,
  logout
};

