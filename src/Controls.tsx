import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux"
import Controls from '@components/controls/controls'
import { store } from "./redux/store"
import './Controls.css'

ReactDOM.createRoot(document.getElementById('controls-root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Controls />
    </Provider>
  </React.StrictMode>,
)