import React from 'react'
import xhr from 'xhr'
import { handleInternalLink, handleInputChange } from '../utilities'

export default class SignIn extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.handleInternalLink = handleInternalLink.bind(this)
    this.handleInputChange = handleInputChange.bind(this)
  }
  handleSubmit = e => {
    e.preventDefault()

    xhr({
      method: 'POST',
      uri: '/api/accounts/me/tokens',
      json: {
        email: this.state.email,
        password: this.state.password
      }
    }, (err, resp, body) => {
      if (err) throw err

      if (resp.statusCode === 200) {
        this.setState({ error: null, email: null, password: null })
        this.props.onToken(body.token)
      } else {
        this.setState({ error: body.error })
      }
    })
  }
  componentDidMount () {
    document.title = 'Sign In'
  }
  render () {
    return (
      <div className='signup'>
        <form onSubmit={this.handleSubmit}>
          <h1>Sign in to Your Account</h1>

          <label htmlFor='email'>Email</label>
          { (this.state.error && this.state.error.path === 'email') ? <span className='error'>{this.state.error.message}</span> : null }
          <input required id='email' type='email' placeholder='e.g. alexander.gugel@gmail.com' name='email' value={this.state.email} onChange={this.handleInputChange} />

          <label htmlFor='password'>Password</label>
          { (this.state.error && this.state.error.path === 'password') ? <span className='error'>{this.state.error.message}</span> : null }
          <input required id='password' type='password' placeholder='e.g. bratwurst123' name='password' value={this.state.password} onChange={this.handleInputChange} />

          <button type='submit'>Sign In!</button>

          <div className='subtle'>
            You don't have an account? - <a href='/signup' onClick={this.handleInternalLink}>Sign up now!</a>
          </div>
        </form>
      </div>
    )
  }
}
