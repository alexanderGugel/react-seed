import React from 'react'
import SignIn from './SignIn'
import SignUp from './SignUp'
import Settings from './Settings'
import Router from 'ampersand-router'
import { handleInternalLink } from '../utilities'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      token: localStorage.getItem('token')
    }
    this.handleInternalLink = handleInternalLink.bind(this)
  }
  componentWillMount () {
    this.router = new (Router.extend({
      routes: {
        '': 'root',
        'signin': 'signin',
        'signup': 'signup',
        'signout': 'signout',
        'settings': 'settings'
      },
      root: () => this.setState({ route: 'root' }),
      signin: () => {
        if (this.state.token) return this.router.navigate('/')
        this.setState({ route: 'signin' })
      },
      signup: () => {
        if (this.state.token) return this.router.navigate('/')
        this.setState({ route: 'signup' })
      },
      settings: () => {
        if (!this.state.token) return this.router.navigate('/signin')
        this.setState({ route: 'settings' })
      },
      signout: () => {
        localStorage.removeItem('token')
        this.setState({ token: null })
        this.router.navigate('/')
      }
    }))
    this.router.history.start({ pushState: true })
  }
  onToken = token => {
    this.setState({ token: token })
    localStorage.setItem('token', token)
    this.router.navigate('/')
  }
  render () {
    switch (this.state.route) {
      case 'signin':
        return <SignIn router={this.router} onToken={this.onToken} />
      case 'signup':
        return <SignUp router={this.router} onToken={this.onToken} />
      case 'settings':
        return <Settings router={this.router} />
      case 'root':
        return (
          <div>
            <h1>Hello { this.state.token || 'Unknown' }!</h1>
            {
              this.state.token ? (
                <ul>
                  <li><a href='/signout' onClick={this.handleInternalLink}>Sign Out</a></li>
                  <li><a href='/settings' onClick={this.handleInternalLink}>Settings</a></li>
                </ul>
              ) : (
                <ul>
                  <li><a href='/signin' onClick={this.handleInternalLink}>Sign In</a></li>
                  <li><a href='/signup' onClick={this.handleInternalLink}>Sign Up</a></li>
                </ul>
              )
            }
          </div>
        )
    }
  }
}
