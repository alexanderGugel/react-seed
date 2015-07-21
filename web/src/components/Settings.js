import React from 'react'
import xhr from 'xhr'
import { handleInternalLink, handleInputChange } from '../utilities'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.handleInternalLink = handleInternalLink.bind(this)
    this.handleInputChange = handleInputChange.bind(this)
  }
  handleSubmit = e => {
    e.preventDefault()

    xhr({
      method: 'PUT',
      uri: '/api/accounts/me',
      json: { email: this.state.email, name: this.state.name },
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }, (err, resp, body) => {
      if (err) throw err

      if (resp.statusCode === 200) {
        this.setState(body)
      } else {
        this.setState({ error: body.error })
      }
    })
  }
  componentDidMount = () => {
    document.title = 'Settings'

    xhr({
      uri: '/api/accounts/me',
      json: true,
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }, (err, resp, body) => {
      if (err) throw err

      if (resp.statusCode === 200) {
        this.setState(body)
      } else {
        this.setState({ error: body.error })
      }
    })
  }
  render () {
    return (
      <div className='settings'>
        <form onSubmit={this.handleSubmit}>
          <h1>Settings</h1>

          <label htmlFor='name'>Name</label>
          { (this.state.error && this.state.error.path === 'name') ? <span className='error'>{this.state.error.message}</span> : null }
          <input required id='name' type='text' placeholder='e.g. Alexander Gugel' name='name' value={this.state.name} onChange={this.handleInputChange} />

          <label htmlFor='email'>Email</label>
          { (this.state.error && this.state.error.path === 'email') ? <span className='error'>{this.state.error.message}</span> : null }
          <input required id='email' type='email' placeholder='e.g. alexander.gugel@gmail.com' name='email' value={this.state.email} onChange={this.handleInputChange} />

          <label htmlFor='password'>Password</label>
          { (this.state.error && this.state.error.path === 'password') ? <span className='error'>{this.state.error.message}</span> : null }
          <input id='password' type='password' placeholder='make it strong' name='password' value={this.state.password} onChange={this.handleInputChange} />

          <button type='submit'>Update Settings!</button>
        </form>
      </div>
    )
  }
}
