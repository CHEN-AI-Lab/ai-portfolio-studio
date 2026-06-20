import { Component, type ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { Provider } from './stores/context'
import type { Locale } from './types'
import { getStoredLocale, setStoredLocale } from './stores/locale'

import './app.less'

interface AppState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

class App extends Component<{ children?: ReactNode }, AppState> {
  constructor(props: { children?: ReactNode }) {
    super(props)
    const initialLocale = getStoredLocale()
    this.state = {
      locale: initialLocale,
      setLocale: this.handleSetLocale,
    }
  }

  handleSetLocale = (locale: Locale) => {
    setStoredLocale(locale)
    this.setState({ locale })
  }

  componentDidMount() {
    // Set dark theme navigation bar style
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0A0A0F',
    })
  }

  render() {
    return (
      <Provider value={this.state}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App