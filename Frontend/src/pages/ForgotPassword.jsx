import React from 'react'

const ForgotPassword = () => {
  return (
    <div>
      <h1>FORGOTPASSWORD</h1>
      <form action="">
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default ForgotPassword
