import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appConfig, getAppDocumentTitle } from './config/appConfig'
import { router } from './app/router'

function App() {
  useEffect(() => {
    document.title = getAppDocumentTitle()

    const descriptionTag = document.querySelector('meta[name="description"]')
    if (descriptionTag) {
      descriptionTag.setAttribute('content', appConfig.description)
    }
  }, [])

  return <RouterProvider router={router} />
}

export default App
