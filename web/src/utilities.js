export function handleInternalLink (e) {
  e.preventDefault()
  var router = this.props.router || this.router
  if (!router) {
    throw new Error('Missing router for handling internal link!')
  }
  router.navigate(e.target.getAttribute('href'))
}

export function handleInputChange (e) {
  var newState = {}
  newState[e.target.name] = e.target.value
  this.setState(newState)
}
