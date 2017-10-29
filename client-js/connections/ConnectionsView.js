import React from 'react'
import fetchJson from '../utilities/fetch-json.js'
import Alert from 'react-s-alert'
import ConnectionList from './ConnectionList'
import ConnectionForm from './ConnectionForm'

class ConnectionsView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connections: [],
      selectedConnection: null,
      isTesting: false,
      isSaving: false
    }
    this.handleSelect = this.handleSelect.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.onNewConnectionClick = this.onNewConnectionClick.bind(this)
    this.setConnectionValue = this.setConnectionValue.bind(this)
    this.loadConnectionsFromServer = this.loadConnectionsFromServer.bind(this)
    this.testConnection = this.testConnection.bind(this)
    this.saveConnection = this.saveConnection.bind(this)
  }

  componentDidMount() {
    document.title = 'SQLPad - Connections'
    this.loadConnectionsFromServer()
  }

  handleSelect(connection) {
    this.setState({
      selectedConnection: Object.assign({}, connection)
    })
  }

  handleDelete(connection) {
    fetchJson('DELETE', '/api/connections/' + connection._id).then(json => {
      if (json.error) return Alert.error('Delete failed')
      Alert.success('Connection deleted')
      if (
        this.state.selectedConnection &&
        connection._id === this.state.selectedConnection._id
      ) {
        this.setState({ selectedConnection: null })
      }
      this.loadConnectionsFromServer()
    })
  }

  onNewConnectionClick() {
    this.setState({
      selectedConnection: {}
    })
  }

  setConnectionValue(attribute, value) {
    var selectedConnection = this.state.selectedConnection
    if (selectedConnection) {
      selectedConnection[attribute] = value
      this.setState({ selectedConnection: selectedConnection })
    }
  }

  loadConnectionsFromServer() {
    fetchJson('GET', '/api/connections').then(json => {
      if (json.error) Alert.error(json.error)
      this.setState({ connections: json.connections })
    })
  }

  testConnection() {
    this.setState({ isTesting: true })
    fetchJson(
      'POST',
      '/api/test-connection',
      this.state.selectedConnection
    ).then(json => {
      this.setState({ isTesting: false })
      if (json.error) return Alert.error('Test Failed')
      return Alert.success('Test successful')
    })
  }

  saveConnection() {
    const { selectedConnection } = this.state
    this.setState({ isSaving: true })
    if (this.state.selectedConnection._id) {
      fetchJson(
        'PUT',
        '/api/connections/' + selectedConnection._id,
        selectedConnection
      ).then(json => {
        this.setState({ isSaving: false })
        if (json.error) return Alert.error('Save failed')
        Alert.success('Connection saved')
        this.setState({ selectedConnection: null })
        this.loadConnectionsFromServer()
      })
    } else {
      fetchJson(
        'POST',
        '/api/connections',
        this.state.selectedConnection
      ).then(json => {
        this.setState({
          isSaving: false,
          selectedConnection: json.connection || this.state.selectedConnection
        })
        if (json.error) return Alert.error('Save failed')
        Alert.success('Connection saved')
        this.setState({ selectedConnection: null })
        this.loadConnectionsFromServer()
      })
    }
  }

  render() {
    return (
      <div className="flex-100">
        <ConnectionList
          connections={this.state.connections}
          selectedConnection={this.state.selectedConnection}
          handleSelect={this.handleSelect}
          handleDelete={this.handleDelete}
          onNewConnectionClick={this.onNewConnectionClick}
        />
        <ConnectionForm
          selectedConnection={this.state.selectedConnection}
          setConnectionValue={this.setConnectionValue}
          testConnection={this.testConnection}
          saveConnection={this.saveConnection}
          isTesting={this.state.isTesting}
          isSaving={this.state.isSaving}
        />
      </div>
    )
  }
}

export default ConnectionsView
