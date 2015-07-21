export function handleInternalLink (e) {
  e.preventDefault()
  this.props.router.navigate(e.currentTarget.getAttribute('href'))
}

export function handleInputChange (e) {
  var newState = {}
  newState[e.target.name] = e.target.value
  this.setState(newState)
}
