import {useState} from 'react'
import toast from 'react-hot-toast'

const UseSignUp = () => {
  const [loading, setloading] = useState(false)
  const signUp = async ({fullName,username,password,confirmPassword,gender}) => {
    const sucess = handleInputErrors({fullName,username,password,confirmPassword,gender})
    if(!sucess) return;

    setloading = true
    try {
      const res = await fetch("/api/auth/signup",{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({fullName,username,password,confirmPassword,gender})
      })

      const data = await res.json();
      console.log(data)

    } catch (error) {
      toast.error(error.message)
    }
    finally{
      setloading(false)
    }
  }
  return {loading,signUp};
}

export default UseSignUp

function handleInputErrors({fullName,username,password,confirmPassword,gender}) {
  if(!fullName|| !username || !password || !confirmPassword || !gender){
    toast.error("please fill in all fields")
    return false
  }
  if(password!=confirmPassword){
    toast.error("passwords do not match")
    return false
  }
  if(password.length<6){
    toast.error("password must be atleast 6")
    return false
  }
  return true
}
