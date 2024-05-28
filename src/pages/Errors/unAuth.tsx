import { useNavigate } from "react-router-dom"

function unAuth() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('./');
  }
  return (
    <div className='bg-white dark:bg-gray-800 min-h-screen w-full flex items-center justify-center text-center flex-col'>
      <p className='text-red-500 text-[40px] mx-auto'>UnAuth</p>
      <button className='bg-blue-500 text-white px-4 py-2 rounded-md mt-4' onClick={handleGoBack}>Go back</button>
    </div>
  )
}

export default unAuth
